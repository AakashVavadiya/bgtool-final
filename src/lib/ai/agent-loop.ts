import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { type ToolExecutionContext } from "./tool-registry";
import { extractDocumentContext, type ExtractedDocumentContext } from "./document-context";
import { executeLocalAgent } from "./local-engine";
import { executeNativeKarudiModel } from "./local";

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

  // 4. Primary: Run Real Native Karudi Local LLM Model
  try {
    const localResult = await executeNativeKarudiModel(
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
            await new Promise((r) => setTimeout(r, 10));
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
  } catch (localErr: any) {
    console.warn("[AgentLoop] Native local model runtime notice:", localErr?.message);
    // If local runtime model is initializing, use local autonomous fallback
    const fallbackResult = await executeLocalAgent(
      { messages, isThinking, tier },
      toolContext
    );

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: messages,
        async execute({ writer }) {
          const textId = "karudi_fallback_" + Date.now();
          writer.write({ type: "text-start", id: textId });

          const words = fallbackResult.reply.split(" ");
          for (let i = 0; i < words.length; i++) {
            writer.write({
              type: "text-delta",
              id: textId,
              delta: words[i] + (i === words.length - 1 ? "" : " "),
            });
            await new Promise((r) => setTimeout(r, 12));
          }

          writer.write({ type: "text-end", id: textId });

          if (fallbackResult.toolExecuted) {
            writer.write({
              type: "custom",
              kind: "karudi.toolResult",
              providerMetadata: {
                karudi: {
                  toolInvocation: {
                    state: "result",
                    toolName: fallbackResult.toolExecuted.toolName,
                    result: fallbackResult.toolExecuted.result,
                  },
                },
              },
            });
          }
        },
      }),
    });
  }
}

