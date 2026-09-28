import { localAgent } from "./local-agent";
import { localModelRuntime } from "./local-runtime";
import { localInference } from "./local-inference";
import type { ToolExecutionContext } from "../tool-registry";

export interface NativeAgentRequest {
  messages: Array<{
    id?: string;
    role: string;
    parts?: any[];
    content?: string;
  }>;
  isThinking?: boolean;
  tier?: string;
}

export async function executeNativeKarudiModel(
  options: NativeAgentRequest,
  context: ToolExecutionContext
) {
  // Ensure the local model process is up and running
  const isReady = await localModelRuntime.ensureRunning();
  if (!isReady) {
    throw new Error("Karudi AI local model runtime is unavailable. Please verify the local model file.");
  }

  // Execute the autonomous LLM tool-calling agent loop
  return await localAgent.executeChat(options.messages, context, options.isThinking);
}
