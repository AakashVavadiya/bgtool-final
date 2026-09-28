/**
 * Karudi Native Autonomous AI Agent Engine
 * 100% Local · Zero External API Keys · Zero Third-Party Cloud Services
 * Runs completely on your local machine / server.
 *
 * Capabilities:
 * - Natural Language Understanding (typos, informal phrases, Hindi/Gujarati/Hinglish/English)
 * - Automatic Tool Discovery & Selection
 * - Multi-Step Chaining (e.g. Remove Background -> Square -> Convert)
 * - Document Intelligence (PDF Q&A, Page text extraction, Structured Analysis)
 * - Web Search when requested (via DuckDuckGo / Wikipedia without any API key)
 */

import { KARUDI_TOOL_REGISTRY, createAiSdkTools, type ToolExecutionContext } from "./tool-registry";
import { extractDocumentContext, type ExtractedDocumentContext } from "./document-context";
import { performWebSearch } from "./web-research";

export interface LocalAgentRequest {
  messages: Array<{
    id?: string;
    role: string;
    parts?: Array<any>;
    content?: string;
  }>;
  isThinking?: boolean;
  tier?: string;
}

export interface LocalAgentStep {
  thought: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: any;
}

export interface LocalAgentResponse {
  reply: string;
  steps: LocalAgentStep[];
  toolExecuted?: {
    toolName: string;
    action: string;
    result: any;
  };
}

// Typo normalizer
function normalizePrompt(raw: string): string {
  let text = raw.toLowerCase().trim();
  const typoMap: [RegExp, string][] = [
    [/\b(exel|excle|ecxel|exl|escel|xcel|excl|excell|exell|exle|ecxl|xcl)\b/g, "excel"],
    [/\b(pdff|pdfd)\b/g, "pdf"],
    [/\b(imgae|iamge|imej|imag|imagge)\b/g, "image"],
    [/\b(convet|conert|covnert|cnvrt|cnvt|cnvert|covnert)\b/g, "convert"],
    [/\b(backgroud|backgorund|bkg|back ground)\b/g, "background"],
    [/\b(remov|rmv|remve|eraz)\b/g, "remove"],
    [/\b(compres|comprss|compresss)\b/g, "compress"],
    [/\b(resiz|resizee)\b/g, "resize"],
    [/\b(wod|wrd)\b/g, "word"],
    [/\b(docxx|dooc)\b/g, "docx"],
  ];
  for (const [re, rep] of typoMap) {
    text = text.replace(re, rep);
  }
  return text;
}

/**
 * Native Local Karudi Autonomous AI Engine
 */
export async function executeLocalAgent(
  options: LocalAgentRequest,
  executionContext: ToolExecutionContext
): Promise<LocalAgentResponse> {
  const { messages, isThinking = false } = options;
  const lastMsg = messages[messages.length - 1];

  let rawUserText = "";
  if (typeof lastMsg?.content === "string") {
    rawUserText = lastMsg.content;
  } else if (lastMsg?.parts) {
    const textPart = lastMsg.parts.find((p) => p.type === "text");
    if (textPart && textPart.text) rawUserText = textPart.text;
  }
  rawUserText = rawUserText.trim();

  const norm = normalizePrompt(rawUserText);
  const activeFile = executionContext.activeFile;
  const docContext = executionContext.documentContext;
  const steps: LocalAgentStep[] = [];

  const tools = createAiSdkTools(executionContext);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. DOCUMENT & PDF QUESTION ANSWERING / SUMMARIZATION
  // ──────────────────────────────────────────────────────────────────────────
  if (docContext && docContext.fullText) {
    const isDocQuestion =
      /(what|summary|summarize|samjavo|samjhavo|explain|extract|find|invoice|gst|total|date|page|who|details|tell me)/i.test(
        norm
      );

    if (isDocQuestion) {
      const pageCount = docContext.totalPages || docContext.pages?.length || 1;
      steps.push({
        thought: `Inspecting extracted document content for "${docContext.filename}" (${pageCount} pages)…`,
      });

      // Search within doc if specific keyword mentioned
      const isGstQuery = /gst/i.test(norm);
      const isInvoiceTotal = /(total|amount|due|balance|invoice)/i.test(norm);
      const pageMatch = norm.match(/page\s*(\d+)/i);

      if (pageMatch && pageMatch[1] && docContext.pages) {
        const pageNum = parseInt(pageMatch[1], 10);
        const pageObj = docContext.pages.find((p) => p.pageNumber === pageNum);
        if (pageObj && pageObj.text.trim()) {
          return {
            reply: `Here is the extracted content from **Page ${pageNum}** of \`${docContext.filename}\`:\n\n${pageObj.text.trim()}`,
            steps,
          };
        } else {
          return {
            reply: `I inspected page ${pageNum} of \`${docContext.filename}\`, but no readable text was found on that page.`,
            steps,
          };
        }
      }

      if (isGstQuery) {
        const lines = docContext.fullText.split("\n");
        const gstLines = lines.filter((l) => /gst/i.test(l));
        if (gstLines.length > 0) {
          return {
            reply: `Found the following GST references in \`${docContext.filename}\`:\n\n${gstLines.map((l) => `- ${l.trim()}`).join("\n")}`,
            steps,
          };
        }
      }

      // Summary request
      const isSummary = /(summar|samjavo|samjhavo|short|brief|overview|points)/i.test(norm);
      const isGujarati = /(gujarati|guj|ગુજરાતી|samjavo|aapo)/i.test(norm);
      const isHindi = /(hindi|hin|हिन्दी|batao|kripya)/i.test(norm);

      if (isSummary) {
        const preview = docContext.fullText.slice(0, 1500).trim();
        if (isGujarati) {
          return {
            reply: `અહીં તમારા અપલોડ કરેલા દસ્તાવેજ \`${docContext.filename}\` નું સારાંશ છે:\n\n- **કુલ પાનાં**: ${pageCount}\n- **દસ્તાવેજ સારાંશ**:\n${preview.split("\n").filter((l) => l.trim()).slice(0, 5).map((l) => `  • ${l.trim()}`).join("\n")}`,
            steps,
          };
        }
        if (isHindi) {
          return {
            reply: `यहाँ आपके अपलोड किए गए दस्तावेज़ \`${docContext.filename}\` का सारांश है:\n\n- **कुल पृष्ठ**: ${pageCount}\n- **मुख्य बिंदु**:\n${preview.split("\n").filter((l) => l.trim()).slice(0, 5).map((l) => `  • ${l.trim()}`).join("\n")}`,
            steps,
          };
        }

        return {
          reply: `Here is the summary of the uploaded document \`${docContext.filename}\` (${pageCount} pages):\n\n${docContext.structureSummary || "Document Structure: Standard text layout"}\n\n**Key Highlights:**\n${preview.split("\n").filter((l) => l.trim()).slice(0, 6).map((l) => `- ${l.trim()}`).join("\n")}`,
          steps,
        };
      }

      // General question grounded strictly in doc
      const lines = docContext.fullText.split("\n").filter((l) => l.trim().length > 3);
      const matching = lines.filter((l) => {
        const words = norm.split(" ").filter((w) => w.length > 3);
        return words.some((w) => l.toLowerCase().includes(w));
      });

      if (matching.length > 0) {
        return {
          reply: `Based on your uploaded document \`${docContext.filename}\`:\n\n${matching.slice(0, 5).map((m) => `> ${m.trim()}`).join("\n\n")}`,
          steps,
        };
      }

      return {
        reply: `I checked the uploaded document \`${docContext.filename}\`, but I couldn't find specific information matching your question. You can ask for a summary or ask about specific page numbers.`,
        steps,
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. MULTI-STEP OPERATIONS (e.g. remove background + square + convert to webp)
  // ──────────────────────────────────────────────────────────────────────────
  const isMultiStep =
    norm.includes("and") ||
    norm.includes("then") ||
    norm.includes("pachhi") ||
    norm.includes("phir");

  // A. Background removal
  const isBgRemoval =
    /(remove\s*bg|remove\s*background|transparent|cutout|background\s*hata|bg\s*hata|bg\s*remove)/i.test(
      norm
    );

  // B. Square image
  const isSquare = /(square|1:1|square\s*image|chokor)/i.test(norm);

  // C. Resize
  const resizeMatch = norm.match(/(\d+)\s*(?:x|×|by|\*)\s*(\d+)/i) || norm.match(/(\d+)\s*px/i);
  const isResize = /(resize|dimensions?)/i.test(norm) || !!resizeMatch;

  // D. Convert image format
  const isConvertToWebp = /(webp|to\s*webp)/i.test(norm);
  const isConvertToPng = /(png|to\s*png)/i.test(norm);
  const isConvertToJpg = /(jpg|jpeg|to\s*jpg)/i.test(norm);

  // E. Compress
  const isCompress = /(compress|shrink|reduce\s*size|chota)/i.test(norm);

  // F. Rotate
  const isRotate = /(rotate|90\s*deg|180\s*deg|ghuma)/i.test(norm);

  // ──────────────────────────────────────────────────────────────────────────
  // EXECUTE TOOLS DETERMINISTICALLY
  // ──────────────────────────────────────────────────────────────────────────
  let lastResult: any = null;

  if (isBgRemoval && tools.remove_background) {
    steps.push({
      thought: "User requested background removal. Calling Ganga AI sub-pixel neural segmentation engine.",
      toolName: "remove_background",
    });
    try {
      const res = await (tools.remove_background as any).execute({});
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      return {
        reply: `I was unable to remove the background: ${e?.message || "Please upload an image first."}`,
        steps,
      };
    }
  }

  if (isSquare && tools.square_image) {
    steps.push({
      thought: "Formatting image canvas into 1:1 square.",
      toolName: "square_image",
    });
    try {
      const res = await (tools.square_image as any).execute({ background: "blur" });
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      console.warn("Square step warning:", e);
    }
  }

  if (isResize && tools.resize_image) {
    const width = resizeMatch ? parseInt(resizeMatch[1] || "1000", 10) : 1000;
    const height = resizeMatch && resizeMatch[2] ? parseInt(resizeMatch[2], 10) : width;
    steps.push({
      thought: `Resizing image to ${width}x${height}px.`,
      toolName: "resize_image",
      toolArgs: { width, height },
    });
    try {
      const res = await (tools.resize_image as any).execute({ width, height });
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      console.warn("Resize step warning:", e);
    }
  }

  if ((isConvertToWebp || isConvertToPng || isConvertToJpg) && (tools as any).convert_image_format) {
    const fmt = isConvertToWebp ? "webp" : isConvertToPng ? "png" : "jpg";
    steps.push({
      thought: `Converting image format to ${fmt.toUpperCase()}.`,
      toolName: "convert_image_format",
      toolArgs: { targetFormat: fmt },
    });
    try {
      const res = await ((tools as any).convert_image_format as any).execute({ targetFormat: fmt });
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      console.warn("Convert format step warning:", e);
    }
  }

  if (isCompress && tools.compress_image) {
    steps.push({
      thought: "Compressing image file with balanced quality.",
      toolName: "compress_image",
    });
    try {
      const res = await (tools.compress_image as any).execute({ quality: 80 });
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      console.warn("Compress step warning:", e);
    }
  }

  if (isRotate && tools.rotate_image) {
    const degrees = norm.includes("180") ? 180 : norm.includes("counter") || norm.includes("left") ? 270 : 90;
    steps.push({
      thought: `Rotating image by ${degrees}°.`,
      toolName: "rotate_image",
      toolArgs: { degrees },
    });
    try {
      const res = await (tools.rotate_image as any).execute({ degrees });
      lastResult = res;
      steps[steps.length - 1]!.toolResult = res;
      executionContext.lastToolResult = res;
    } catch (e: any) {
      console.warn("Rotate step warning:", e);
    }
  }

  // PDF Operations
  if (/(compress\s*pdf|pdf\s*compress)/i.test(norm) && tools.compress_pdf) {
    steps.push({ thought: "Compressing PDF document.", toolName: "compress_pdf" });
    const res = await (tools.compress_pdf as any).execute({ compressionLevel: "recommended" });
    lastResult = res;
    steps[steps.length - 1]!.toolResult = res;
  }

  if (/(merge\s*pdf|combine\s*pdf)/i.test(norm) && tools.merge_pdf) {
    steps.push({ thought: "Merging PDF files.", toolName: "merge_pdf" });
    const res = await (tools.merge_pdf as any).execute({});
    lastResult = res;
    steps[steps.length - 1]!.toolResult = res;
  }

  if (/(split\s*pdf)/i.test(norm) && tools.split_pdf) {
    steps.push({ thought: "Splitting PDF document.", toolName: "split_pdf" });
    const res = await (tools.split_pdf as any).execute({ pageRanges: "1" });
    lastResult = res;
    steps[steps.length - 1]!.toolResult = res;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // IF A TOOL WAS EXECUTED, RETURN SUCCESS RESULT
  // ──────────────────────────────────────────────────────────────────────────
  if (lastResult) {
    const executedTool = steps[steps.length - 1]?.toolName || "tool";
    const naturalReply = getNaturalCompletionMessage(executedTool, lastResult, norm);
    return {
      reply: naturalReply,
      steps,
      toolExecuted: {
        toolName: executedTool,
        action: lastResult.action || executedTool,
        result: lastResult,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. THINK MODE & CONDITIONAL WEB RESEARCH
  // ──────────────────────────────────────────────────────────────────────────
  const isWebQuery =
    isThinking ||
    /(what happened|current price|latest news|who is|who was|meaning of|today|weather|search)/i.test(
      norm
    );

  if (isWebQuery && norm.length > 5) {
    steps.push({
      thought: `Searching authoritative sources for "${rawUserText}"…`,
    });
    try {
      const searchRes = await performWebSearch(rawUserText);
      if (searchRes.results.length > 0) {
        const topResult = searchRes.results[0]!;
        return {
          reply: `${topResult.snippet}\n\n*Source: [${topResult.title}](${topResult.url})*`,
          steps,
        };
      }
    } catch {
      /* continue */
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. NATURAL CONVERSATIONAL RESPONSE
  // ──────────────────────────────────────────────────────────────────────────
  if (/(hi|hello|hey|kem cho|kem cho tame|namaste|pranam|halo)/i.test(norm)) {
    if (/(kem cho|gujarati)/i.test(norm)) {
      return {
        reply: "નમસ્તે! હું કરૂડી (Karudi AI) છું. હું તમારી ફાઇલો, ઈમેજ અને PDF પ્રોસેસિંગ માટે સંપૂર્ણપણે તમારા મશીન પર સ્થાનિક રીતે કામ કરું છું. હું તમારી શું મદદ કરી શકું?",
        steps,
      };
    }
    if (/(namaste|kese ho|kaise ho)/i.test(norm)) {
      return {
        reply: "नमस्ते! मैं करूडी (Karudi AI) हूँ। मैं आपकी फ़ाइलों, छवियों और PDF को प्रोसेस करने के लिए पूरी तरह से तैयार हूँ। आप क्या करना चाहते हैं?",
        steps,
      };
    }
    return {
      reply: "Hello! I am Karudi, your dedicated AI processing assistant running locally on your machine. You can upload an image to remove backgrounds, convert formats, or upload PDFs to summarize and ask questions.",
      steps,
    };
  }

  if (/(who are you|what is karudi|meaning of karudi)/i.test(norm)) {
    return {
      reply: `**Karudi** (કારુડી) refers to **Maa Mahakali**, symbolizing supreme strength and protection. As Karudi 1.0 Prime, I coordinate specialist engines (Ganga, Brahmaputra, Narmada, Saraswati) to process your images, PDFs, and documents natively without sending your data to any third-party clouds.`,
      steps,
    };
  }

  // Ambiguity / missing file check
  if (/(convert|resize|compress|crop|rotate)/i.test(norm) && !activeFile) {
    return {
      reply: `Please upload or drag-and-drop the file you would like me to process. Which format or dimensions do you need?`,
      steps,
    };
  }

  return {
    reply: `I am ready. Tell me what operation you need on your image or document (e.g. "remove background", "make it square", "convert to WebP", or "summarize this PDF").`,
    steps,
  };
}

function getNaturalCompletionMessage(toolName: string, res: any, query: string): string {
  const isGuj = /(gujarati|kem cho|karo|aapo)/i.test(query);
  const isHin = /(hindi|kardo|hatao|banao)/i.test(query);

  if (toolName === "remove_background") {
    if (isGuj) return "કામ પૂરું — મેં તમારી ઈમેજમાંથી બેકગ્રાઉન્ડ દૂર કરી દીધું છે.";
    if (isHin) return "हो गया — मैंने आपकी फ़ोटो का बैकग्राउंड हटा दिया है।";
    return "Done — I removed the background and created your transparent cutout.";
  }

  if (toolName === "square_image") {
    if (isGuj) return "કામ પૂરું — તમારી ફોટો ૧:૧ સ્ક્વેરમાં ફોર્મેટ થઈ ગઈ છે.";
    return "Done — I formatted your image into a 1:1 square canvas.";
  }

  if (toolName === "convert_format") {
    const fmt = res.format || "converted";
    if (isGuj) return `કામ પૂરું — ફાઇલને ${fmt} માં કન્વર્ટ કરી દીધી છે.`;
    return `Done — I converted your file to ${fmt}.`;
  }

  if (toolName === "resize_image") {
    return `Done — I resized your image to ${res.width}×${res.height} px.`;
  }

  if (toolName === "compress_image") {
    return "Done — I compressed your image to reduce file size.";
  }

  return res.message || "Done — processing complete.";
}
