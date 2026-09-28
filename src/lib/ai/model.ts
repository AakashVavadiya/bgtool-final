/**
 * Karudi Model Abstraction
 * Configured for 100% Local Inference via llama-server runtime
 */
import { localModelRuntime } from "./local/local-runtime";
import { getLocalModelConfig } from "./local/local-config";

export interface GetModelOptions {
  isThinking?: boolean;
  tier?: string;
}

export function getLanguageModel(options: GetModelOptions = {}) {
  const config = getLocalModelConfig();
  return {
    provider: "karudi-local",
    modelName: "karudi-instruct-q4_k_m.gguf",
    endpoint: localModelRuntime.getBaseUrl(),
    isConfigured: localModelRuntime.isAvailable(),
  };
}
