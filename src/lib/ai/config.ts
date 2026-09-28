import fs from "fs";
import path from "path";

// Attempt to load .env / .env.local if not already loaded
function loadEnvSafely() {
  try {
    if (typeof process.loadEnvFile === "function") {
      const rootEnv = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(rootEnv)) {
        process.loadEnvFile(rootEnv);
      }
      const localEnv = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(localEnv)) {
        process.loadEnvFile(localEnv);
      }
    }
  } catch {
    // Process might already have env vars or custom environment
  }

  // Fallback simple line-by-line loader if process.loadEnvFile is absent
  try {
    const envPaths = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), ".env.local"),
    ];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
          const [key, ...rest] = trimmed.split("=");
          const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
          if (key && !(key.trim() in process.env)) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  } catch {
    /* ignore fallback errors */
  }
}

loadEnvSafely();

export type SupportedAIProvider = "google" | "openai" | "anthropic" | "custom";

export interface AIConfig {
  provider: SupportedAIProvider;
  model: string;
  thinkModel?: string | undefined;
  apiKey: string;
  baseUrl?: string | undefined;
  isConfigured: boolean;
}

export function getAIConfig(): AIConfig {
  loadEnvSafely();

  const explicitProvider = (process.env["AI_PROVIDER"] || "").toLowerCase().trim() as SupportedAIProvider;
  const genericKey = process.env["AI_API_KEY"] || "";
  const geminiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_GENERATIVE_AI_API_KEY"] || genericKey;
  const openaiKey = process.env["OPENAI_API_KEY"] || genericKey;
  const anthropicKey = process.env["ANTHROPIC_API_KEY"] || genericKey;

  // Default to custom self-hosted provider for Karudi
  let provider: SupportedAIProvider = "custom";
  if (explicitProvider && ["custom", "openai", "google", "anthropic"].includes(explicitProvider)) {
    provider = explicitProvider;
  }

  let apiKey = process.env["AI_API_KEY"] || "";
  let defaultModel = process.env["AI_MODEL"] || "qwen2.5:7b-instruct";
  let thinkModel = process.env["AI_THINK_MODEL"] || defaultModel;

  switch (provider) {
    case "custom":
    case "openai":
      apiKey = process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"] || "";
      defaultModel = process.env["AI_MODEL"] || "qwen2.5:7b-instruct";
      thinkModel = process.env["AI_THINK_MODEL"] || defaultModel;
      break;
    case "google":
      apiKey = geminiKey;
      defaultModel = process.env["AI_MODEL"] || "gemini-2.0-flash";
      thinkModel = process.env["AI_THINK_MODEL"] || "gemini-2.0-flash";
      break;
    case "anthropic":
      apiKey = anthropicKey;
      defaultModel = process.env["AI_MODEL"] || "claude-3-5-haiku-20241022";
      thinkModel = process.env["AI_THINK_MODEL"] || "claude-3-5-sonnet-20241022";
      break;
  }

  return {
    provider,
    model: defaultModel,
    thinkModel,
    apiKey,
    baseUrl: process.env["AI_BASE_URL"] || process.env["OPENAI_BASE_URL"] || undefined,
    isConfigured: Boolean(apiKey || (provider === "custom" && process.env["AI_BASE_URL"])),
  };
}
