import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { getLanguageModel } from "./model";
import { buildSystemPrompt } from "./prompts";
import { createAiSdkTools, type ToolExecutionContext } from "./tool-registry";
import { extractDocumentContext, type ExtractedDocumentContext } from "./document-context";
import { getAIConfig } from "./config";
import { executeLocalAgent } from "./local-engine";

export interface AgentRequestOptions {
  messages: UIMessage[];
  tier?: string | undefined;
  isThinking?: boolean | undefined;
  threadId?: string | undefined;
}

export async function runAgentChat(options: AgentRequestOptions): Promise<Response> {
  const { messages, tier = "prime-1.0", isThinking = false } = options;

  // 1. Gather all attached files from the message history (especially recent turns)
  const attachedFiles: Array<{ name: string; dataUrl: string; mediaType?: string }> = [];
  for (const msg of messages) {
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      if (part.type === "file" && (part as any).url) {
        attachedFiles.push({
          name: (part as any).filename || "uploaded_file",
          dataUrl: (part as any).url,
          mediaType: (part as any).mediaType,
        });
      }
    }
  }

  // Active file is the most recently uploaded file
  const activeFile = attachedFiles.length > 0 ? attachedFiles[attachedFiles.length - 1] : undefined;

  // 2. Perform server-side document extraction if a PDF or text file is uploaded
  let documentContext: ExtractedDocumentContext | undefined;
  if (activeFile) {
    const isDocOrPdf =
      activeFile.name.toLowerCase().endsWith(".pdf") ||
      activeFile.name.toLowerCase().endsWith(".txt") ||
      activeFile.dataUrl.startsWith("data:application/pdf") ||
      activeFile.dataUrl.startsWith("data:text/");

    if (isDocOrPdf) {
      try {
        documentContext = await extractDocumentContext(activeFile.dataUrl, activeFile.name);
      } catch (docErr) {
        console.warn("[Agent] Document extraction warning:", docErr);
      }
    }
  }

  // 3. Create Execution Context
  const toolContext: ToolExecutionContext = {
    activeFile,
    attachedFiles,
    documentContext,
  };

  // 4. Check if external custom model endpoint is configured in .env
  const aiConfig = getAIConfig();
  if (!aiConfig.isConfigured) {
    // RUN 100% LOCALLY: Native Karudi Autonomous AI Engine
    // Zero external APIs, zero third-party cloud services, 100% local on user PC
    const localResult = await executeLocalAgent(
      { messages, isThinking, tier },
      toolContext
    );

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: messages,
        async execute({ writer }) {
          const textId = "karudi_local_" + Date.now();
          writer.write({ type: "text-start", id: textId });

          // Stream real-time local model response
          const words = localResult.reply.split(" ");
          for (let i = 0; i < words.length; i++) {
            writer.write({
              type: "text-delta",
              id: textId,
              delta: words[i] + (i === words.length - 1 ? "" : " "),
            });
            await new Promise((r) => setTimeout(r, 12));
          }

          writer.write({ type: "text-end", id: textId });

          // If local agent executed a real tool, stream custom event so UI renders preview/downloads
          if (localResult.toolExecuted) {
            writer.write({
              type: "custom",
              kind: "karudi.toolResult",
              providerMetadata: {
                karudi: {
                  toolInvocation: {
                    state: "result",
                    toolName: localResult.toolExecuted.toolName,
                    result: localResult.toolExecuted.result,
                  },
                },
              },
            });
          }
        },
      }),
    });
  }

  // 4. Resolve Model and System Prompt
  const modelInfo = getLanguageModel({ isThinking, tier });

  const promptFiles = [];
  if (documentContext && documentContext.fullText) {
    promptFiles.push({
      name: documentContext.filename,
      mediaType: documentContext.fileType === "pdf" ? "application/pdf" : "text/plain",
      extractedText: documentContext.fullText,
      structureInfo: documentContext.structureSummary,
    });
  } else if (activeFile) {
    promptFiles.push({
      name: activeFile.name,
      mediaType: activeFile.mediaType,
    });
  }

  const systemPrompt = buildSystemPrompt({
    uploadedFiles: promptFiles,
    activeFilename: activeFile?.name,
    isThinking,
    tier,
  });

  // 5. Create AI SDK Tools
  const tools = createAiSdkTools(toolContext);

  // 6. Convert UI messages to model messages
  // To protect context window and avoid provider payload limits with huge base64 strings,
  // we filter out massive raw base64 dataUrls from the message payload since the extracted
  // text and tools already have direct access to the files.
  const cleanedMessages = messages.map((m) => {
    if (!m.parts) return m;
    const cleanedParts = m.parts.map((p) => {
      if (p.type === "file") {
        const filePart = p as any;
        const isSmallImage =
          filePart.mediaType?.startsWith("image/") &&
          typeof filePart.url === "string" &&
          filePart.url.length < 500_000;

        if (isSmallImage) {
          return p;
        }
        // Replace huge raw dataUrl with descriptive reference for the LLM
        return {
          type: "text",
          text: `[Attached File: "${filePart.filename || "file"}" (${filePart.mediaType || "application/octet-stream"})]`,
        };
      }
      return p;
    });
    return {
      ...m,
      parts: cleanedParts,
    };
  });

  const modelMessages = await convertToModelMessages(cleanedMessages as UIMessage[], {
    ignoreIncompleteToolCalls: true,
  });

  try {
    // 7. Execute Real LLM Tool-Calling Stream
    const streamResult = streamText({
      model: modelInfo.model,
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5), // Multi-step tool calls up to 5 steps
      maxRetries: 2,
    });

    return streamResult.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (err: any) {
    console.error("[AgentLoop Error]:", err);

    // Friendly error fallback stream without leaking stack trace
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: messages,
        async execute({ writer }) {
          const textId = "err_" + Date.now();
          writer.write({ type: "text-start", id: textId });
          writer.write({
            type: "text-delta",
            id: textId,
            delta: `I encountered an unexpected issue while processing your request with ${modelInfo.provider}. Please verify your file format or try again in a few moments.`,
          });
          writer.write({ type: "text-end", id: textId });
        },
      }),
    });
  }
}
