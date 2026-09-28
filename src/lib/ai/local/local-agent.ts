/**
 * Karudi Local Tool Call Parser & Execution Loop
 * Intercepts LLM tool-calling responses, validates parameters against whitelist,
 * executes real local tool engines, and sends results back to the model.
 */

import { createAiSdkTools, type ToolExecutionContext } from "../tool-registry";
import { localInference, type ChatMessage } from "./local-inference";
import { buildLocalSystemPrompt } from "./local-prompt";
import { getLocalModelConfig } from "./local-config";

export interface ToolCallSpec {
  tool: string;
  arguments: Record<string, any>;
}

export interface LocalAgentStep {
  thought: string;
  tool?: string;
  arguments?: Record<string, any>;
  result?: any;
}

export interface LocalAgentExecutionResult {
  reply: string;
  steps: LocalAgentStep[];
  toolExecuted?: {
    toolName: string;
    action: string;
    result: any;
  } | undefined;
}

function normalizeUserTypos(text: string): string {
  return text
    .replace(/\brfemove\b/gi, "remove")
    .replace(/\bremov\b/gi, "remove")
    .replace(/\brmv\b/gi, "remove")
    .replace(/\bbakground\b/gi, "background")
    .replace(/\bbakgroud\b/gi, "background")
    .replace(/\bconvet\b/gi, "convert")
    .replace(/\bconert\b/gi, "convert")
    .replace(/\bresiz\b/gi, "resize")
    .replace(/\bcompres\b/gi, "compress")
    .replace(/\bcompresss\b/gi, "compress")
    .replace(/\bpdff\b/gi, "pdf");
}

export class LocalAgentOrchestrator {
  private static instance: LocalAgentOrchestrator;

  private constructor() {}

  public static getInstance(): LocalAgentOrchestrator {
    if (!LocalAgentOrchestrator.instance) {
      LocalAgentOrchestrator.instance = new LocalAgentOrchestrator();
    }
    return LocalAgentOrchestrator.instance;
  }

  /**
   * Parses JSON tool calls or multi-tool calls emitted by the local model
   */
  public parseToolCalls(
    modelOutput: string,
    userQuery?: string,
    fileAvailability?: { hasImage: boolean; hasPdf: boolean }
  ): ToolCallSpec[] {
    const specs: ToolCallSpec[] = [];

    // Search for code block with JSON: ```json { ... } ``` or raw JSON objects
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    let match: RegExpExecArray | null;

    while ((match = jsonBlockRegex.exec(modelOutput)) !== null) {
      const block = match[1]?.trim() || "";
      this.tryParseToolJson(block, specs);
    }

    if (specs.length === 0) {
      // Try searching for naked json objects { "type": "tool_call", ... }
      const objectRegex = /\{[\s\S]*?"type"\s*:\s*"(?:tool_call|multi_tool_call)"[\s\S]*?\}/g;
      while ((match = objectRegex.exec(modelOutput)) !== null) {
        this.tryParseToolJson(match[0], specs);
      }
    }

    // Semantic action recovery: ONLY when a relevant file is actually available!
    const hasImage = fileAvailability ? fileAvailability.hasImage : true;
    const hasPdf = fileAvailability ? fileAvailability.hasPdf : true;

    if (specs.length === 0 && (hasImage || hasPdf)) {
      const lower = (modelOutput + " " + (userQuery || "")).toLowerCase();
      const mentionsRemoveBg =
        lower.includes("remove the background") ||
        lower.includes("remove background") ||
        lower.includes("removing the background") ||
        lower.includes("background remove") ||
        lower.includes("bg remove") ||
        lower.includes("remove bg") ||
        lower.includes("rfemove bg") ||
        lower.includes("bg hata") ||
        lower.includes("background hata");

      const mentionsPdf =
        lower.includes("create a pdf") ||
        lower.includes("make a pdf") ||
        lower.includes("convert to pdf") ||
        lower.includes("creating a pdf") ||
        lower.includes("png to pdf") ||
        lower.includes("image to pdf");

      if (hasImage && mentionsRemoveBg && mentionsPdf) {
        specs.push({ tool: "remove_background", arguments: {} });
        specs.push({ tool: "image_to_pdf", arguments: {} });
      } else if (hasImage && mentionsRemoveBg) {
        specs.push({ tool: "remove_background", arguments: {} });
      } else if (hasImage && mentionsPdf) {
        specs.push({ tool: "image_to_pdf", arguments: {} });
      }
    }

    return specs;
  }

  private tryParseToolJson(raw: string, specs: ToolCallSpec[]): void {
    try {
      const data = JSON.parse(raw);
      if (data.type === "tool_call" && data.tool) {
        specs.push({
          tool: String(data.tool),
          arguments: data.arguments || {},
        });
      } else if (data.type === "multi_tool_call" && Array.isArray(data.steps)) {
        for (const step of data.steps) {
          if (step.tool) {
            specs.push({
              tool: String(step.tool),
              arguments: step.arguments || {},
            });
          }
        }
      }
    } catch {
      // not valid JSON
    }
  }

  /**
   * Main multi-step execution loop driven by the local LLM
   */
  public async executeChat(
    userMessages: Array<{ role: string; content?: string; parts?: any[] }>,
    context: ToolExecutionContext,
    isThinking = false
  ): Promise<LocalAgentExecutionResult> {
    const config = getLocalModelConfig();
    const maxSteps = config.maxToolSteps || 8;
    const steps: LocalAgentStep[] = [];
    const tools = createAiSdkTools(context);

    // 1. Detect file availability in current context
    const hasImage = Boolean(
      context.lastToolResult?.resultImageSrc ||
      context.activeFile?.dataUrl?.startsWith("data:image/") ||
      context.activeFile?.mediaType?.startsWith("image/") ||
      context.attachedFiles?.some((f) => f.mediaType?.startsWith("image/") || f.dataUrl?.startsWith("data:image/"))
    );

    const hasPdf = Boolean(
      context.lastToolResult?.resultPdfDataUrl ||
      context.activeFile?.name?.toLowerCase().endsWith(".pdf") ||
      context.activeFile?.dataUrl?.startsWith("data:application/pdf") ||
      context.attachedFiles?.some((f) => f.name?.toLowerCase().endsWith(".pdf") || f.dataUrl?.startsWith("data:application/pdf"))
    );

    const hasAnyFile = hasImage || hasPdf || Boolean(context.documentContext || context.activeFile || (context.attachedFiles && context.attachedFiles.length > 0));

    // 2. Build Local System Prompt with tool definitions and document context
    const uploadedFiles: Array<{ name: string; mediaType?: string | undefined; extractedText?: string | undefined; structureInfo?: string | undefined }> = [];
    if (context.documentContext) {
      uploadedFiles.push({
        name: context.documentContext.filename,
        mediaType: context.documentContext.fileType === "pdf" ? "application/pdf" : "text/plain",
        extractedText: context.documentContext.fullText,
        structureInfo: context.documentContext.structureSummary,
      });
    } else if (context.activeFile) {
      uploadedFiles.push({
        name: context.activeFile.name,
        mediaType: context.activeFile.mediaType,
      });
    }

    const systemPrompt = buildLocalSystemPrompt({
      uploadedFiles,
      isThinking,
    });

    // 3. Prepare conversation history for the local LLM
    const modelMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    let latestUserQuery = "";
    for (const m of userMessages) {
      let content = "";
      if (typeof m.content === "string") {
        content = m.content;
      } else if (m.parts) {
        const textPart = m.parts.find((p) => p.type === "text");
        if (textPart && textPart.text) content = textPart.text;
      }
      if (content) {
        const cleaned = m.role === "user" ? normalizeUserTypos(content) : content;
        if (m.role === "user") latestUserQuery = cleaned;
        modelMessages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: cleaned,
        });
      }
    }

    // 4. Fast Check: If user explicitly asks for file operations but NO file is uploaded, prompt for file immediately
    const lowerQuery = latestUserQuery.toLowerCase().trim();
    const queryMentionsBg =
      lowerQuery.includes("remove background") ||
      lowerQuery.includes("background remove") ||
      lowerQuery.includes("bg remove") ||
      lowerQuery.includes("remove bg") ||
      lowerQuery.includes("rfemove bg") ||
      lowerQuery.includes("cutout") ||
      lowerQuery.includes("bg hata") ||
      lowerQuery.includes("background hata");

    const queryMentionsPdf =
      lowerQuery.includes("make pdf") ||
      lowerQuery.includes("convert to pdf") ||
      lowerQuery.includes("image to pdf");

    if (!hasImage && queryMentionsBg) {
      const isGujarati = /[\u0A80-\u0AFF]|(photo|karo|kari|aapo|nathi|che)\b/i.test(latestUserQuery);
      const isHindi = /[\u0900-\u097F]|(kardo|kijiye|hatao|karna|chahiye)\b/i.test(latestUserQuery);
      const reply = isGujarati
        ? "કૃપા કરીને જે ફોટોનું બેકગ્રાઉન્ડ દૂર કરવું છે તે અપલોડ કરો."
        : isHindi
        ? "कृपया वह फोटो अपलोड करें जिसका बैकग्राउंड आप हटाना चाहते हैं।"
        : "Please upload or share the image you'd like me to remove the background from.";

      return {
        reply,
        steps: [],
        toolExecuted: undefined,
      };
    }

    if (!hasImage && !hasPdf && queryMentionsPdf) {
      return {
        reply: "Please upload or drop the image or document you would like to convert to PDF.",
        steps: [],
        toolExecuted: undefined,
      };
    }

    // 5. Multi-Step Execution Loop
    let currentIteration = 0;
    let lastToolResult: any = null;
    let finalAssistantReply = "";

    while (currentIteration < maxSteps) {
      currentIteration++;

      // Request inference from the local model
      const modelOutput = await localInference.completeChat({
        messages: modelMessages,
        temperature: config.temperature,
        maxTokens: Math.min(config.maxTokens, 384),
      });

      // Check if model emitted tool calls (only check query fallback on first iteration)
      const toolCalls = this.parseToolCalls(
        modelOutput,
        currentIteration === 1 ? latestUserQuery : undefined,
        { hasImage, hasPdf }
      );

      if (toolCalls.length === 0) {
        // Model provided final answer
        finalAssistantReply = modelOutput.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/g, "").trim();
        if (!finalAssistantReply) finalAssistantReply = modelOutput.trim();
        break;
      }

      // Execute each tool requested by the model
      for (const call of toolCalls) {
        const toolName = call.tool;
        const toolItem = (tools as any)[toolName];

        if (!toolItem || typeof toolItem.execute !== "function") {
          const errMsg = `Tool "${toolName}" is not registered in Karudi. Please use a registered tool.`;
          steps.push({
            thought: `Attempted to invoke unregistered tool "${toolName}"`,
            tool: toolName,
            result: { success: false, error: errMsg },
          });
          modelMessages.push({
            role: "assistant",
            content: `\`\`\`json\n${JSON.stringify({ type: "tool_call", tool: toolName, arguments: call.arguments })}\n\`\`\``,
          });
          modelMessages.push({
            role: "user",
            content: `Tool Execution Result:\n${JSON.stringify({ success: false, error: errMsg })}`,
          });
          continue;
        }

        steps.push({
          thought: `Executing Karudi tool "${toolName}" with parameters: ${JSON.stringify(call.arguments)}`,
          tool: toolName,
          arguments: call.arguments,
        });

        try {
          const res = await toolItem.execute(call.arguments);
          lastToolResult = res;
          steps[steps.length - 1]!.result = res;
          context.lastToolResult = res;

          modelMessages.push({
            role: "assistant",
            content: `\`\`\`json\n${JSON.stringify({ type: "tool_call", tool: toolName, arguments: call.arguments })}\n\`\`\``,
          });
          modelMessages.push({
            role: "user",
            content: `Tool Execution Result for "${toolName}":\n${JSON.stringify(res)}\nPlease review this result and provide your natural answer to the user in their requested language.`,
          });

          if (res && res.success === false && res.error) {
            finalAssistantReply = res.error;
            break;
          }
        } catch (e: any) {
          const errRes = { success: false, error: e?.message || "Tool execution failed" };
          steps[steps.length - 1]!.result = errRes;
          finalAssistantReply = errRes.error;
          modelMessages.push({
            role: "user",
            content: `Tool Execution Error:\n${JSON.stringify(errRes)}`,
          });
          break;
        }
      }

      // Fast exit: if a single tool action completed successfully, return the result immediately
      if (lastToolResult && lastToolResult.success !== false && toolCalls.length === 1) {
        finalAssistantReply = lastToolResult.message || "Done — the requested operation was completed successfully.";
        break;
      }

      if (finalAssistantReply) {
        break;
      }
    }

    if (!finalAssistantReply) {
      if (lastToolResult && lastToolResult.success !== false) {
        finalAssistantReply = lastToolResult.message || "Done — the requested operation was completed successfully.";
      } else if (lastToolResult && lastToolResult.error) {
        finalAssistantReply = lastToolResult.error;
      } else if (!hasAnyFile) {
        finalAssistantReply = "Please upload or share a file to proceed with this operation.";
      } else {
        finalAssistantReply = "I am ready. How can I assist you with your files?";
      }
    }

    const hasSuccessfulTool = lastToolResult && lastToolResult.success !== false;

    return {
      reply: finalAssistantReply,
      steps,
      toolExecuted: hasSuccessfulTool
        ? {
            toolName: steps[steps.length - 1]?.tool || "tool",
            action: lastToolResult.action || steps[steps.length - 1]?.tool || "tool",
            result: lastToolResult,
          }
        : undefined,
    };
  }
}

export const localAgent = LocalAgentOrchestrator.getInstance();
