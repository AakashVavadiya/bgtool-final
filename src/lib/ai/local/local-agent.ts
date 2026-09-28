/**
 * Karudi Local Tool Call Parser & Execution Loop
 * Intercepts LLM tool-calling responses, validates parameters against whitelist,
 * executes real local tool engines, and sends results back to the model.
 */

import { KARUDI_TOOL_REGISTRY, createAiSdkTools, type ToolExecutionContext } from "../tool-registry";
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
  public parseToolCalls(modelOutput: string): ToolCallSpec[] {
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

    // 1. Build Local System Prompt with tool definitions and document context
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

    // 2. Prepare conversation history for the local LLM
    const modelMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    for (const m of userMessages) {
      let content = "";
      if (typeof m.content === "string") {
        content = m.content;
      } else if (m.parts) {
        const textPart = m.parts.find((p) => p.type === "text");
        if (textPart && textPart.text) content = textPart.text;
      }
      if (content) {
        modelMessages.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content,
        });
      }
    }

    // 3. Multi-Step Execution Loop
    let currentIteration = 0;
    let lastToolResult: any = null;
    let finalAssistantReply = "";

    while (currentIteration < maxSteps) {
      currentIteration++;

      // Request inference from the local model
      const modelOutput = await localInference.completeChat({
        messages: modelMessages,
        temperature: config.temperature,
        maxTokens: Math.min(config.maxTokens, 512),
      });

      // Check if model emitted tool calls
      const toolCalls = this.parseToolCalls(modelOutput);

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
        } catch (e: any) {
          const errRes = { success: false, error: e?.message || "Tool execution failed" };
          steps[steps.length - 1]!.result = errRes;
          modelMessages.push({
            role: "user",
            content: `Tool Execution Error:\n${JSON.stringify(errRes)}`,
          });
        }
      }
    }

    if (!finalAssistantReply) {
      if (lastToolResult && lastToolResult.success !== false) {
        finalAssistantReply = lastToolResult.message || "Done — the requested operation was completed successfully.";
      } else {
        finalAssistantReply = "Processing completed.";
      }
    }

    return {
      reply: finalAssistantReply,
      steps,
      toolExecuted: lastToolResult
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
