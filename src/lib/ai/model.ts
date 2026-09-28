import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import { getAIConfig } from "./config";

export interface GetModelOptions {
  isThinking?: boolean;
  tier?: string;
}

export function getLanguageModel(options: GetModelOptions = {}): {
  model: any;
  provider: string;
  modelName: string;
  isConfigured: boolean;
} {
  const config = getAIConfig();
  const isThinking = !!options.isThinking;

  let modelName = isThinking && config.thinkModel ? config.thinkModel : config.model;

  // Tier overrides if specifically requested
  if (options.tier === "saraswati-deep" && config.thinkModel) {
    modelName = config.thinkModel;
  }

  if (config.provider === "google") {
    const google = createGoogleGenerativeAI({
      apiKey: config.apiKey,
    });
    return {
      model: google(modelName),
      provider: "google",
      modelName,
      isConfigured: config.isConfigured,
    };
  }

  if (config.provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: config.apiKey,
    });
    return {
      model: anthropic(modelName),
      provider: "anthropic",
      modelName,
      isConfigured: config.isConfigured,
    };
  }

  // Default to OpenAI / OpenAI-compatible (Self-Hosted on VPS via Ollama, vLLM, etc.)
  const openai = createOpenAI({
    apiKey: config.apiKey || "self-hosted-token",
    ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
  });

  return {
    model: openai(modelName),
    provider: config.provider === "custom" ? "custom" : "openai",
    modelName,
    isConfigured: config.isConfigured,
  };
}
