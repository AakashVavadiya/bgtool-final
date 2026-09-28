import { localModelRuntime } from "./local-runtime";
import { getLocalModelConfig } from "./local-config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LocalInferenceOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
  stream?: boolean;
}

export interface LocalInferenceChunk {
  delta: string;
  finishReason?: string | null;
}

export class LocalInferenceService {
  private static instance: LocalInferenceService;

  private constructor() {}

  public static getInstance(): LocalInferenceService {
    if (!LocalInferenceService.instance) {
      LocalInferenceService.instance = new LocalInferenceService();
    }
    return LocalInferenceService.instance;
  }

  public async isAvailable(): Promise<boolean> {
    return localModelRuntime.isAvailable();
  }

  public async ensureReady(): Promise<boolean> {
    return localModelRuntime.ensureRunning();
  }

  public async streamChat(
    options: LocalInferenceOptions,
    onChunk: (chunk: LocalInferenceChunk) => void
  ): Promise<string> {
    const isReady = await this.ensureReady();
    if (!isReady) {
      throw new Error("Karudi Local Model Runtime is unavailable.");
    }

    const config = getLocalModelConfig();
    const url = `${localModelRuntime.getBaseUrl()}/chat/completions`;

    const payload = {
      messages: options.messages,
      temperature: options.temperature ?? config.temperature,
      max_tokens: options.maxTokens ?? 512,
      presence_penalty: 0.3,
      frequency_penalty: 0.5,
      stream: true,
      stop: options.stop || ["<|im_end|>", "<|endoftext|>", "\nUser:", "\nHuman:"],
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => "Unknown error");
      throw new Error(`Local inference server returned status ${res.status}: ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          if (trimmed === "data: [DONE]") break;

          try {
            const json = JSON.parse(trimmed.slice(5).trim());
            const delta = json.choices?.[0]?.delta?.content || "";
            if (delta) {
              fullText += delta;
              onChunk({ delta, finishReason: json.choices?.[0]?.finish_reason });
            }
          } catch {
            // ignore partial JSON parse errors
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }

  public async completeChat(options: LocalInferenceOptions): Promise<string> {
    let result = "";
    await this.streamChat(options, (chunk) => {
      result += chunk.delta;
    });
    return result;
  }
}

export const localInference = LocalInferenceService.getInstance();
