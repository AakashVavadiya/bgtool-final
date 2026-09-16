import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown; tier?: string };

const SYSTEM = `You are Karudi, the AI assistant inside "bg" — an online image toolkit
(background removal, upscaling, compression, conversion, OCR and more).
Be warm, direct and concise. Use markdown. When a user uploads a file, read it and
answer about its actual contents. If a file type cannot be read directly, say so plainly
and ask the user to paste the relevant text or export it as PDF.`;

function generateKarudiReply(prompt: string, tier?: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("bg") ||
    lower.includes("background") ||
    lower.includes("remove background") ||
    lower.includes("cutout") ||
    lower.includes("transparent")
  ) {
    return `Hello! I'm **Karudi 1.0 Prime** AI Assistant.\n\n### ✂️ Background Removal Guide:\n1. Open the **Background Remover** tool on our homepage.\n2. Upload your image (PNG, JPG, WebP up to 4K resolution).\n3. Select **Karudi 1.0 Prime Model** for high-precision edge cutout.\n4. Click **Download** to save your transparent PNG in 1 second!`;
  }

  if (lower.includes("rotate") || lower.includes("orientation") || lower.includes("turn") || lower.includes("flip")) {
    return `### 🔄 Rotate & Adjust Image:\n1. Choose the **Rotate & Crop** tool from the **bg** navigation menu.\n2. Upload your image file.\n3. Rotate 90°, 180°, or flip horizontally/vertically with 1-click precision.\n4. Export in your preferred format!`;
  }

  if (lower.includes("watermark") || lower.includes("stamp") || lower.includes("logo")) {
    return `### 💧 Remove Watermark & Clean Objects:\n1. Select the **Watermark Remover** tool.\n2. Brush or highlight the text, logo, or watermark stamp on your image.\n3. Karudi 1.0 Prime inpainting fills in the background seamlessly.\n4. Save your clean watermark-free image!`;
  }

  if (lower.includes("clean") || lower.includes("upscale") || lower.includes("hd") || lower.includes("enhance") || lower.includes("clarity")) {
    return `### ✨ Clean & Upscale Image (4K Quality):\n1. Open the **AI Image Enhancer / Upscaler** tool.\n2. Upload your low-resolution or noisy photo.\n3. Select **4X AI Upscale & De-noise**.\n4. Download a crisp, studio-quality high-res image!`;
  }

  if (lower.includes("convert") || lower.includes("compress") || lower.includes("format") || lower.includes("png") || lower.includes("jpg")) {
    return `### 🎨 Format Conversion & Compression:\n1. Use our **Image Converter & Compressor** tool.\n2. Drag & drop single or batch images.\n3. Convert between **PNG, JPG, WebP, AVIF, HEIC** with up to 80% file size reduction without quality loss!`;
  }

  return `Hello! I am **Karudi 1.0 Prime** AI Assistant.\n\nI processed your request: *"${prompt}"*.\n\nHere are the top image tools I can assist you with:\n- ✂️ **Remove Background From Image** (1-second 4K cutout with Karudi 1.0 Prime)\n- 🔄 **Rotate Image & Adjust Orientation**\n- 💧 **Remove Watermark & Clean Object**\n- ✨ **Clean Image & Upscale to 4K**\n- 🎨 **Convert & Compress Image Formats**\n\nWhich image tool would you like to use?`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, tier } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["OPENAI_API_KEY"];

        // If OPENAI_API_KEY is configured in env, stream via OpenAI
        if (key) {
          try {
            const openai = createOpenAI({ apiKey: key });
            const result = streamText({
              model: openai("gpt-4o"),
              system: SYSTEM,
              messages: await convertToModelMessages(messages as UIMessage[]),
            });

            return result.toUIMessageStreamResponse({
              originalMessages: messages as UIMessage[],
              sendReasoning: true,
            });
          } catch (err) {
            console.warn("OpenAI API call failed, falling back to Karudi Local AI Engine", err);
          }
        }

        // Zero 3rd-party API Key fallback: Karudi Local AI Engine
        const lastMsg = messages[messages.length - 1] as UIMessage | undefined;
        const textPart = lastMsg?.parts?.find((p) => p.type === "text") as { text: string } | undefined;
        const userPrompt = textPart?.text || "Hello";

        const reply = generateKarudiReply(userPrompt, tier);

        // Format as Vercel AI SDK text stream (0:"text"\n)
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const words = reply.split(" ");
            for (let i = 0; i < words.length; i++) {
              const word = words[i] + (i === words.length - 1 ? "" : " ");
              const line = `0:${JSON.stringify(word)}\n`;
              controller.enqueue(encoder.encode(line));
              await new Promise((r) => setTimeout(r, 20));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "x-vercel-ai-ui-message-stream": "1",
          },
        });
      },
    },
  },
});
