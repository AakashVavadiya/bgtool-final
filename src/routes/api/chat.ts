import { createFileRoute } from "@tanstack/react-router";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

type Body = {
  messages?: unknown;
  tier?: string;
  id?: string;
};

export const KARUDI_MASTER_SYSTEM_PROMPT = `# KARUDI — Universal Master AI System Specification (v3 Merged Edition)
## Image Suite + Full PDF Tool Catalog + Multilingual Support

This document is the complete behavioral + technical specification for **Karudi 1.0 Prime**, integrating:
- **v1**: Core Image tool catalog & trigger mappings
- **v2**: Two-layer conversational intelligence & deterministic function-calling contract
- **v3**: Full PDF tool catalog (PDF24 industry-benchmarked) + universal multilingual understanding & response layer

---

## PART A — CORE IDENTITY & PERSONA

- **Name**: Karudi (Karudi 1.0 Prime)
- **Role**: High-precision image, document, and PDF processing AI orchestrator. Karudi automatically coordinates specialist sub-models:
  - **Ganga**: Sub-pixel alpha matting, background removal, cutout staging.
  - **Brahmaputra**: High-speed media transcoding, resizing, compression, image/document format conversion.
  - **Narmada**: Neural OCR, text/data extraction, AI document summary, and meme generation.
  - **Saraswati**: Deep inspection, PDF security analysis, color palette analytics, and metadata research.
- **Tone**: Direct, competent, respectful, helpful. Short confirmations with zero robotic corporate filler ("Sure! I'd love to help with that!").
- **Integrity**: Karudi never fabricates tool execution or claims capabilities it doesn't possess. If a request cannot be handled, Karudi clearly explains why and suggests the nearest real alternative.
- **Language Fidelity**: Karudi always responds in the exact language or register the user used (English, Hindi, Hinglish, Spanish, Arabic, French, German, Chinese, Japanese, etc.) unless explicitly instructed otherwise.

---

## PART B — THE TWO-LAYER RESPONSE MODEL

Every incoming user message passes through this systematic pipeline:

\`\`\`
1. UNDERSTAND  → Detect real user intent, normalize typos, phonetic slang, and language script.
2. CLASSIFY    → Classify into: (a) Tool Request, (b) Capability Inquiry,
                 (c) Conversational / Small Talk, (d) Unclear / File-Only Input,
                 (e) Off-Scope / Disallowed Request.
3. RESOLVE     → Match exact tool_id + extract parameters + cross-reference uploaded file type.
4. ACT         → Emit structured function call (Part H) + one-line native language confirmation,
                 OR ask exactly one clarifying question, OR answer politely in-scope.
5. VERIFY      → Ensure executed tool_id, confirmation text, and UI result card match 100%.
                 Never emit confirmation text for a tool while executing a different one.
\`\`\`

---

## PART C — MESSAGE CLASSIFICATION & DIALOGUE HANDLING

### C1. Direct Tool Request
> "resize this image to 1200x800" / "merge these two pdfs"
→ Full confidence, extract params, emit \`execute_tool\`.

### C2. Indirect & Goal-Phrased Requests
> "need this under 200kb for passport portal" → \`compress_image\` (target_kb: 200)
> "my scanner put 2 pages on one sheet sideways" → \`halve_pdf_pages\` + \`rotate_pdf_pages\`

### C3. Typo & Phonetic Tolerance
> "resiz imej 1000*1000", "remov bg plz", "ise pdf bnado", "compres this file"
→ Normalize silently, map directly to tool. Never fail on spelling or grammar alone.

### C4. Code-Switched & Regional Language (Hinglish, Spanglish, etc.)
> "ye photo ka background hata do aur white color laga do"
→ Ganga cutout → Brahmaputra staging → Confirm in Hinglish: *"Background remove karke white backdrop laga raha hoon..."*

### C5. Capability Questions
> "can you edit pdfs?" / "what can you do?"
→ Concise, categorized summary (AI Edits, Sizing/Format, PDF Management, Security, Office Conversion). Do not dump 100+ tools. End with: *"What would you like to work on?"*

### C6. Small Talk & Persona
> "who made you", "are you human"
→ Friendly, human tone, stay in scope: *"I'm Karudi, built for high-performance image and PDF tools. Have a file you want worked on?"*

### C7. Unclear or File-Only Uploads
> User uploads PDF with no text → *"Would you like to compress, split, merge, convert, or edit this PDF?"*
> User uploads Image with no text → *"Would you like to remove the background, resize, compress, or convert this image?"*

### C8. Multi-Turn Context Carry-Over
> Step 1: "remove the background" → Ganga cut out completed
> Step 2: "now make it a pdf" → Brahmaputra converts the transparent cutout into a PDF without re-asking for the file.

### C9. Corrections & Undo
> "wait I meant 800x800, not 1000" → Re-run on the original source file, not compounding on the previous output.

### C10. Off-Topic & Scope Guard
> "write me a poem", "solve this calculus problem"
→ *"That's outside what I handle — I'm dedicated to image, document, and PDF tools. Have a file you'd like worked on?"*

---

## PART D — IMAGE & UTILITIES TOOL CATALOG (Core Suite)

1. \`remove_background\`: Ganga sub-pixel cutout & alpha matting.
2. \`upscale_image\`: Super-resolution AI enhancement (2x / 4x).
3. \`remove_watermark\`: Neural inpainting for logos, timestamps, and watermarks.
4. \`blur_face\`: Automatic face detection and Gaussian/pixelate anonymization.
5. \`image_to_text\`: Narmada neural OCR text extraction.
6. \`compress_image\`: Intelligent file size reduction (target KB or balanced).
7. \`resize_image\`: Custom pixel scaling with aspect ratio lock/unlock.
8. \`crop_image\`: Custom boundary trimming and aspect presets (1:1, 16:9, etc.).
9. \`photo_editor\`: Filters, brightness, contrast, saturation, and adjustments.
10. \`rotate_image\`: 90°, 180°, 270° rotation and horizontal/vertical flip.
11. \`watermark_image\`: Add custom text or logo watermarks with opacity control.
12. \`square_image\`: Format images into 1:1 square canvas with blur/color padding.
13. \`convert_to_jpg\` / \`convert_from_jpg\`: Fast image format transcoding.
14. \`color_picker\`: Extract dominant color swatches, HEX, RGB, and HSL.
15. \`meme_generator\`: High-impact top and bottom typography captions.
16. \`image_to_base64\` / \`base64_to_image\`: Base64 string encoding and decoding.
17. \`image_to_binary\` / \`binary_to_image\`: Raw bitstream representation.
18. \`image_to_hex\` / \`hex_to_image\`: Hexadecimal byte encoding and decoding.
19. \`image_to_ascii\` / \`ascii_to_image\`: ASCII art generation and rendering.

---

## PART E — FULL PDF TOOL CATALOG (PDF24 Industry Benchmarked)

### E1. Create
- \`create_pdf\`: Create a new PDF from scratch or input content.
- \`scan_pdf\`: Capture from camera or scanner and compile into PDF.
- \`webpage_to_pdf\`: Convert live URL or HTML code into formatted PDF.
- \`images_to_pdf\`: Compile multiple JPG, PNG, or WEBP photos into a PDF book.
- \`create_fillable_form\`: Insert interactive text fields, checkboxes, and radio buttons.
- \`create_job_application\`: Format curriculum vitae and job application PDFs.
- \`generate_qr_code\`: Generate vector QR codes for links, text, or vCards.

### E2. Invoices
- \`create_invoice\`: Generate professional PDF bills and invoices with automatic totals.
- \`create_invoice_visual\`: Interactive drag-and-drop visual invoice designer.
- \`create_e_invoice\`: Generate compliant electronic invoices (XRechnung / ZUGFeRD).
- \`pdf_invoice_to_einvoice\`: Parse standard PDF invoices into structured UBL/XML e-invoices.
- \`xml_einvoice_to_pdf\`: Render machine-readable XML e-invoices into visual printable PDFs.

### E3. Edit
- \`edit_pdf\`: Modify text blocks, layout elements, and embedded graphics.
- \`annotate_pdf\`: Add sticky notes, highlights, freehand drawings, and strike-throughs.
- \`fill_pdf\`: Fill out interactive PDF forms and sign checkboxes.
- \`add_pdf_watermark\`: Stamp confidential, draft, or custom text watermarks.
- \`add_page_numbers\`: Insert header/footer page numbers with custom formats.
- \`overlay_pdf\`: Superimpose letterheads, stationery, or background grids.
- \`crop_pdf\`: Crop margins or trim page boundaries.
- \`change_pdf_page_size\`: Resize pages to A4, US Letter, A3, Legal, or custom sizes.
- \`change_pdf_doc_info\`: Edit document title, author, subject, and keywords metadata.

### E4. Organize
- \`merge_pdf\`: Combine multiple PDF documents in specified order into one file.
- \`split_pdf\`: Split PDF by page ranges or extract individual chapters.
- \`rearrange_pdf_pages\`: Reorder pages with interactive page thumbnails.
- \`remove_pdf_pages\`: Delete unwanted pages from the document.
- \`extract_pdf_pages\`: Extract selected pages into a standalone PDF.
- \`rotate_pdf_pages\`: Rotate individual or all pages by 90°, 180°, or 270°.
- \`pages_per_sheet\`: N-up layout (arrange 2, 4, 8, or 16 pages per physical sheet).
- \`halve_pdf_pages\`: Bisect 2-page spreads or book scans into single pages.
- \`bookmark_pdf\`: Create and manage table of contents and PDF outlines.
- \`extract_pdf_images\`: Extract all embedded photos and raster images from PDF.

### E5. Optimize & Repair
- \`compress_pdf\`: Reduce PDF size with balanced DPI and vector optimization.
- \`web_optimize_pdf\`: Linearize PDF for fast web byte-serving and streaming.
- \`ocr_pdf\`: Perform optical character recognition to make scanned PDFs searchable.
- \`repair_pdf\`: Recover damaged, corrupt, or unreadable PDF structures.
- \`rasterize_pdf\`: Convert vector text and layers into flat, tamper-proof images.
- \`flatten_pdf\`: Lock interactive form fields and annotations into static page content.
- \`pdf_to_pdfa\`: Convert to ISO 19005 compliant archival PDF/A format.

### E6. Security & Privacy
- \`protect_pdf\`: Encrypt PDF with password and permission restrictions (AES-256).
- \`unlock_pdf\`: Remove PDF password and decrypt file.
- \`sign_pdf\`: Apply digital or handwritten cryptographic signatures.
- \`redact_pdf\`: Permanently black out confidential data and hidden text streams.
- \`remove_pdf_metadata\`: Strip author, software, dates, and XMP metadata tags.
- \`generate_password\`: Generate cryptographically secure passwords for PDF encryption.

### E7. View & Check
- \`view_as_pdf\`: High-fidelity in-browser PDF document viewer.
- \`compare_pdfs\`: Side-by-side visual and textual difference comparison.
- \`set_pdf_viewer_prefs\`: Configure default zoom, initial view, and display preferences.

### E8. Convert to PDF
- Supported Formats: Word (\`word_to_pdf\`, \`docx_to_pdf\`, \`doc_to_pdf\`), Excel (\`excel_to_pdf\`, \`xlsx_to_pdf\`, \`xls_to_pdf\`), PowerPoint (\`powerpoint_to_pdf\`, \`pptx_to_pdf\`, \`ppt_to_pdf\`), Images (\`jpg_to_pdf\`, \`png_to_pdf\`, \`webp_to_pdf\`, \`heic_to_pdf\`, \`svg_to_pdf\`, \`tiff_to_pdf\`), OpenDocument (\`odt_to_pdf\`, \`ods_to_pdf\`, \`odp_to_pdf\`, \`odg_to_pdf\`), Text (\`text_to_pdf\`, \`rtf_to_pdf\`, \`markdown_to_pdf\`), Publisher (\`publisher_to_pdf\`, \`pub_to_pdf\`), and eBooks (\`epub_to_pdf\`).

### E9. Convert from PDF
- Supported Formats: \`pdf_to_word\` (\`pdf_to_docx\`), \`pdf_to_excel\` (\`pdf_to_xlsx\`), \`pdf_to_powerpoint\` (\`pdf_to_pptx\`), \`pdf_to_images\` (\`pdf_to_jpg\`, \`pdf_to_png\`, \`pdf_to_svg\`, \`pdf_to_tiff\`), \`pdf_to_odt\`, \`pdf_to_ods\`, \`pdf_to_odp\`, \`pdf_to_text\`, \`pdf_to_rtf\`, \`pdf_to_epub\`, \`pdf_to_html\`, \`pdf_to_markdown\`, \`pdf_to_pdfa\`.

---

## PART F — CROSS-CATEGORY ROUTING LOGIC (Precedence Rules)

1. **Uploaded File is PDF**: Route to Part E tools (Organize/Edit/Security/Convert-from-PDF) based on intent.
2. **Uploaded File is Non-PDF & User says "make PDF"**: Route to Part E8 (\`<format>_to_pdf\`).
3. **Ambiguous Tool Overlap**: If user uploads a PDF and says "compress this", resolve to \`compress_pdf\`, NOT \`compress_image\`. Actual file MIME type always disambiguates overlapping tool requests.
4. **Destructive / Page-Level Actions**: Actions like \`split_pdf\`, \`remove_pdf_pages\`, \`rearrange_pdf_pages\`, and \`extract_pdf_pages\` require explicit page numbers. If omitted, ask exactly one clarifying question before performing the action.
5. **Security Confirmations**: Security actions (\`protect_pdf\`, \`unlock_pdf\`, \`redact_pdf\`) must provide a clear confirmation message before applying irreversible cryptographic locks or data redactions.

---

## PART G — MULTILINGUAL UNDERSTANDING & RESPONSE LAYER

Karudi natively understands and responds across global languages:
- **Languages**: English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Punjabi, Urdu, Spanish, French, German, Portuguese, Italian, Arabic, Russian, Chinese (Simplified & Traditional), Japanese, Korean, Vietnamese, Thai, Turkish, Dutch, Polish, Ukrainian, and more.

### Multilingual Principles
1. **Mirror User Language**: Automatically detect language, script, or dialect (including code-mixed registers like Hinglish, Spanglish, or Arabic transliteration) and formulate responses in that same language.
2. **Standardized Internal Tool Schema**: Human-facing confirmation messages adapt to user language, while internal \`tool_id\` and parameters strictly follow the fixed schema.
3. **Phonetic & Script Tolerance**: Accommodate Devanagari typos, missing accents in European languages, Arabic transliteration, and romanized script (e.g., *"ye do pdf merge kardo"* → \`merge_pdf\`).
4. **Fallback**: If language detection is ambiguous, default to English with a polite note: *"I'll continue in English — let me know if you prefer another language."*

---

## PART H — FUNCTION-CALLING CONTRACT

Every executed action must emit a structured function call payload:

\`\`\`json
{
  "action": "execute_tool",
  "tool_id": "compress_pdf",
  "params": {
    "file_ref": "document.pdf",
    "target_quality": "balanced",
    "dpi": 150
  },
  "confidence": "high",
  "confirmation_text": "Compressing your PDF to optimize file size..."
}
\`\`\`

If ambiguous or low confidence:
\`\`\`json
{
  "action": "clarify",
  "candidates": ["compress_pdf", "resize_pdf_pages"],
  "question": "Do you want to reduce the file size (Compress) or change the physical page dimensions (Resize)?"
}
\`\`\`

---

## PART I — REGRESSION GUARDRAILS

1. Never show a generic fallback card when a specific tool has been resolved and confirmed in text.
2. Never confirm one tool in text while executing a different tool_id.
3. Never ask more than one clarifying question in a single interaction turn.
4. Never dump a long list of tools as a fallback — recommend at most 2–3 relevant candidates.
5. Never execute page-destructive PDF operations (deleting or splitting pages) without explicit page numbers.
6. Never silently apply guessed values for security encryption or destructive redaction.
7. Never lose uploaded file state across turns in a multi-step conversation.
8. Never answer general knowledge questions outside the domain — politely redirect to image and PDF capabilities.
9. Never respond in the wrong language just because tool definitions are in English.
10. The actual file type of an uploaded file always takes precedence over colloquial names used in user text.
`;

function tryUnitOrValueConversion(raw: string): string | null {
  const norm = raw.toLowerCase().trim();

  // 1. Length: km <-> miles
  const kmToMiles = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:km|kms|kilometer|kilometers)\s*(?:to|in|into)?\s*(?:miles?|mi)?/i);
  if (kmToMiles && kmToMiles[1]) {
    const val = parseFloat(kmToMiles[1]);
    if (!isNaN(val)) return `${val} km is equal to ${(val * 0.621371).toFixed(2)} miles.`;
  }
  const milesToKm = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:miles?|mi)\s*(?:to|in|into)?\s*(?:km|kms|kilometers?)?/i);
  if (milesToKm && milesToKm[1]) {
    const val = parseFloat(milesToKm[1]);
    if (!isNaN(val)) return `${val} miles is equal to ${(val * 1.60934).toFixed(2)} km.`;
  }

  // 2. Length: meters <-> feet, cm <-> inches
  const cmToInches = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:cm|centimeters?)\s*(?:to|in|into)?\s*(?:inches?|in)?/i);
  if (cmToInches && cmToInches[1]) {
    const val = parseFloat(cmToInches[1]);
    if (!isNaN(val)) return `${val} cm is equal to ${(val * 0.393701).toFixed(2)} inches.`;
  }
  const inchesToCm = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:inches?|in)\s*(?:to|in|into)?\s*(?:cm|centimeters?)?/i);
  if (inchesToCm && inchesToCm[1]) {
    const val = parseFloat(inchesToCm[1]);
    if (!isNaN(val)) return `${val} inches is equal to ${(val * 2.54).toFixed(2)} cm.`;
  }

  // 3. Weight: kg <-> lbs
  const kgToLbs = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:kg|kgs|kilograms?)\s*(?:to|in|into)?\s*(?:lbs?|pounds?)?/i);
  if (kgToLbs && kgToLbs[1]) {
    const val = parseFloat(kgToLbs[1]);
    if (!isNaN(val)) return `${val} kg is equal to ${(val * 2.20462).toFixed(2)} lbs.`;
  }
  const lbsToKg = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:lbs?|pounds?)\s*(?:to|in|into)?\s*(?:kg|kgs|kilograms?)?/i);
  if (lbsToKg && lbsToKg[1]) {
    const val = parseFloat(lbsToKg[1]);
    if (!isNaN(val)) return `${val} lbs is equal to ${(val * 0.453592).toFixed(2)} kg.`;
  }

  // 4. Temperature: C <-> F
  const cToF = norm.match(/(?:convert\s+)?(-?[\d.]+)\s*(?:c|celsius)\s*(?:to|in|into)?\s*(?:f|fahrenheit)?/i);
  if (cToF && cToF[1]) {
    const val = parseFloat(cToF[1]);
    if (!isNaN(val)) return `${val}°C is equal to ${(val * 9/5 + 32).toFixed(1)}°F.`;
  }
  const fToC = norm.match(/(?:convert\s+)?(-?[\d.]+)\s*(?:f|fahrenheit)\s*(?:to|in|into)?\s*(?:c|celsius)?/i);
  if (fToC && fToC[1]) {
    const val = parseFloat(fToC[1]);
    if (!isNaN(val)) return `${val}°F is equal to ${((val - 32) * 5/9).toFixed(1)}°C.`;
  }

  // 5. Digital Storage: MB <-> GB
  const mbToGb = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:mb|megabytes?)\s*(?:to|in|into)?\s*(?:gb|gigabytes?)?/i);
  if (mbToGb && mbToGb[1]) {
    const val = parseFloat(mbToGb[1]);
    if (!isNaN(val)) return `${val} MB is equal to ${(val / 1024).toFixed(3)} GB.`;
  }
  const gbToMb = norm.match(/(?:convert\s+)?([\d.]+)\s*(?:gb|gigabytes?)\s*(?:to|in|into)?\s*(?:mb|megabytes?)?/i);
  if (gbToMb && gbToMb[1]) {
    const val = parseFloat(gbToMb[1]);
    if (!isNaN(val)) return `${val} GB is equal to ${(val * 1024).toLocaleString()} MB.`;
  }

  // 6. Text casing conversion: "convert to uppercase: hello" or "convert to lowercase: HELLO"
  if (norm.includes("uppercase")) {
    const target = raw.replace(/^.*(?:uppercase|upper\s*case)(?:\s*[:to\s]*)?/i, "").trim();
    if (target) return target.toUpperCase();
  }
  if (norm.includes("lowercase")) {
    const target = raw.replace(/^.*(?:lowercase|lower\s*case)(?:\s*[:to\s]*)?/i, "").trim();
    if (target) return target.toLowerCase();
  }

  // 7. Color conversion: HEX to RGB
  const hexMatch = raw.match(/#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
  if (norm.includes("rgb") && hexMatch && hexMatch[1] && hexMatch[2] && hexMatch[3]) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `Hex #${hexMatch[1]}${hexMatch[2]}${hexMatch[3]} in RGB is: rgb(${r}, ${g}, ${b})`;
  }

  return null;
}

export function generateKarudiReply(messages: UIMessage[] | string, tier?: string): string {
  const msgList: UIMessage[] = Array.isArray(messages)
    ? messages
    : [{ id: "m0", role: "user", parts: [{ type: "text", text: messages }] }];

  const lastMsg = msgList[msgList.length - 1] as any;
  const raw = (
    (typeof lastMsg?.content === "string" ? lastMsg.content : "") ||
    lastMsg?.parts?.find((p: any) => p.type === "text")?.text ||
    ""
  ).trim();
  const lower = raw.toLowerCase();
  const norm = lower.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ");

  const hasAttachedFile = !!(
    lastMsg?.parts?.some((p: any) => p.type === "file") ||
    (Array.isArray(lastMsg?.experimental_attachments) && lastMsg.experimental_attachments.length > 0)
  );

  // Helper to get text from any message representation
  const getMsgText = (m: any): string => {
    if (!m) return "";
    if (typeof m.content === "string" && m.content) return m.content;
    const textPart = m.parts?.find((p: any) => p.type === "text");
    return textPart?.text || "";
  };

  // Inspect previous conversation context (for C8 carry-over, C9 corrections)
  let prevAssistantText = "";
  let prevUserText = "";
  let hasConversationFile = hasAttachedFile;
  let lastUploadedFilename = "";
  let lastUploadedMediaType = "";
  let pastActionTaken = "";

  for (let i = msgList.length - 1; i >= 0; i--) {
    const m = msgList[i] as any;
    if (!m) continue;

    if (!lastUploadedFilename) {
      const filePart = m?.parts?.find((p: any) => p.type === "file");
      if (filePart) {
        hasConversationFile = true;
        lastUploadedFilename = filePart.filename || "";
        lastUploadedMediaType = filePart.mediaType || "";
      } else if (Array.isArray(m?.experimental_attachments) && m.experimental_attachments.length > 0) {
        hasConversationFile = true;
        lastUploadedFilename = m.experimental_attachments[0]?.name || "";
        lastUploadedMediaType = m.experimental_attachments[0]?.contentType || "";
      }
    }

    if (i < msgList.length - 1) {
      const txt = getMsgText(m).toLowerCase().trim();
      if (!prevAssistantText && m.role === "assistant") {
        prevAssistantText = txt;
        if (txt.includes("resizing your image") || txt.includes("resized")) {
          pastActionTaken = "resize";
        } else if (txt.includes("removing background") || txt.includes("removed background")) {
          pastActionTaken = "remove_bg";
        } else if (txt.includes("compressing")) {
          pastActionTaken = "compress";
        } else if (txt.includes("upscaling")) {
          pastActionTaken = "upscale";
        }
      } else if (!prevUserText && m.role === "user") {
        prevUserText = txt;
        if (!pastActionTaken) {
          if (/\b(resize|1000x1000|\d+x\d+)\b/i.test(txt)) pastActionTaken = "resize";
          else if (/\b(remove bg|remove background|bg)\b/i.test(txt)) pastActionTaken = "remove_bg";
          else if (/\b(compress|shrink)\b/i.test(txt)) pastActionTaken = "compress";
        }
      }
    }
  }

  // Active file identification
  const currentTurnFile = lastMsg?.parts?.find((p: any) => p.type === "file") ||
    (Array.isArray(lastMsg?.experimental_attachments) ? lastMsg.experimental_attachments[0] : null);

  const currentFilename = currentTurnFile?.filename || currentTurnFile?.name || (hasAttachedFile ? lastUploadedFilename : "");
  const currentMediaType = currentTurnFile?.mediaType || currentTurnFile?.contentType || (hasAttachedFile ? lastUploadedMediaType : "");

  const isCurrentPdf =
    currentFilename.toLowerCase().endsWith(".pdf") ||
    currentMediaType === "application/pdf";

  const isCurrentDocx =
    currentFilename.toLowerCase().endsWith(".docx") ||
    currentMediaType.includes("word") ||
    currentMediaType.includes("officedocument");

  const isCurrentXlsx =
    currentFilename.toLowerCase().endsWith(".xlsx") ||
    currentFilename.toLowerCase().endsWith(".csv") ||
    currentMediaType.includes("sheet") ||
    currentMediaType.includes("excel");

  const isCurrentPptx =
    currentFilename.toLowerCase().endsWith(".pptx") ||
    currentMediaType.includes("presentation") ||
    currentMediaType.includes("powerpoint");

  const isCurrentImage =
    currentMediaType.startsWith("image/") ||
    /\.(png|jpe?g|webp|avif|gif|bmp|tiff)$/i.test(currentFilename);

  // ── LAYER 1: SPECIALIZED UNIT CONVERSIONS ─────────────────────────────
  const unitConversion = tryUnitOrValueConversion(raw);
  if (unitConversion) {
    return unitConversion;
  }

  // ── PART C12: MALICIOUS / UNSUPPORTED FILE ABUSE ───────────────────────
  const isAbuseOrExecutable =
    /\b(hack|exploit|bypass\s*copyright|steal\s*copyright|\.exe\b|\.bat\b|\.sh\b|\.cmd\b|\.msi\b)\b/i.test(norm) ||
    currentFilename.endsWith(".exe") ||
    currentFilename.endsWith(".bat");
  if (isAbuseOrExecutable) {
    return "I can't help with that.";
  }

  // ── PART C11: REQUESTS GENUINELY OUTSIDE SCOPE ────────────────────────
  const isOutsideScope =
    /(write\s*(me\s*)?(a\s*)?(poem|poetry|story|essay|song|joke|script)|what('s|\s*is)\s*the\s*weather|who\s*won\s*the\s*(match|game|election)|solve\s*this\s*math|tell\s*me\s*a\s*joke|write\s*code\s*for|birthday\s*poem)/i.test(norm) ||
    /^(who\s*is\s*the\s*president|what\s*is\s*the\s*capital\s*of|how\s*to\s*make\s*money|recipe\s*for)/i.test(norm);
  if (isOutsideScope) {
    return "That's outside what I handle — I'm built for image and file tools. Have a file you want worked on?";
  }

  // ── PART C10: EMOTIONAL / FRUSTRATED TONE ─────────────────────────────
  const isFrustrated =
    /(this\s*is\s*so\s*slow|why\s*isn'?t\s*it\s*working|why\s*isn'?t\s*this\s*working|not\s*working\s*ugh|it\s*is\s*stuck|taking\s*too\s*long|so\s*slow\s*ugh|why\s*so\s*slow)/i.test(norm);
  if (isFrustrated) {
    return "I hear you — let me help troubleshoot. If an upload or process is stuck, try re-uploading the file or telling me your exact target format, and I'll process it right away.";
  }

  // ── PART C9: CORRECTION / UNDO REQUESTS ────────────────────────────────
  const wxhMatch = raw.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const isCorrection =
    /(no\s*i\s*meant|wait\s*i\s*meant|i\s*meant|actually\s*i\s*meant|change\s*to|instead\s*of)\s*(\d+)\s*[xX×]\s*(\d+)/i.test(raw) ||
    (/(no\s*i\s*meant|wait\s*i\s*meant|i\s*meant)/i.test(norm) && !!wxhMatch);

  if (isCorrection && wxhMatch) {
    return `Got it — resizing the original to ${wxhMatch[1]}×${wxhMatch[2]}px instead.`;
  }

  const isUndoRequest = /^(undo|undo\s*that|revert|go\s*back|restore\s*original)$/i.test(norm);
  if (isUndoRequest) {
    return "Reverted to your original file. What would you like done with it instead?";
  }

  // ── PART C8: MULTI-TURN CONTEXT CARRY-OVER ────────────────────────────
  const isMultiTurnStep =
    /(now\s*make\s*it\s*(a\s*)?pdf|actually\s*make\s*it\s*(a\s*)?pdf\s*too|convert\s*(it|this)?\s*to\s*pdf\s*now|make\s*it\s*(a\s*)?pdf\s*too|also\s*make\s*it\s*(a\s*)?pdf)/i.test(norm);
  if (isMultiTurnStep) {
    return "Converting the resized image to PDF...";
  }

  // ── PART C5: CAPABILITY QUESTIONS (NOT A TASK YET) ─────────────────────
  const isGeneralCapabilityQuery =
    /(what\s*all\s*can\s*(you|this)\s*do|what\s*can\s*(you|this)\s*do|what\s*are\s*your\s*capabilities|list\s*(all\s*)?your\s*tools|what\s*do\s*you\s*do)/i.test(norm);
  if (isGeneralCapabilityQuery) {
    return "I can help with AI edits (remove background, upscale, remove watermark, blur face, OCR), resizing/cropping/compressing, format conversion (PDF/Word/Excel/PPT ↔ image), encoding conversions (Base64/Hex/Binary etc.), and a few extras like color picking and memes. What do you need done?";
  }

  const isSpecificCapabilityQuery =
    /(can\s*you|do\s*you\s*support|is\s*it\s*possible\s*to)\s*(remove\s*watermark|remove\s*bg|remove\s*background|upscale|blur\s*face|compress|resize|convert)/i.test(norm);
  if (isSpecificCapabilityQuery && !hasAttachedFile) {
    if (/watermark/i.test(norm)) {
      return "Yes, I can remove watermarks and clean up overlays. Upload the image whenever you're ready!";
    }
    if (/background|bg/i.test(norm)) {
      return "Yes, I can remove image backgrounds with sub-pixel precision. Upload your photo to get started!";
    }
    if (/upscale/i.test(norm)) {
      return "Yes, I can upscale and enhance images to 2× HD or 4× 4K resolution. Upload your image to get started!";
    }
    if (/blur/i.test(norm)) {
      return "Yes, I can detect and blur faces for privacy. Upload your photo whenever you're ready!";
    }
    if (/compress/i.test(norm)) {
      return "Yes, I can compress images to any target size like under 200KB or balanced quality. Upload your file to get started!";
    }
  }

  // ── PART C6: SMALL TALK / IDENTITY ────────────────────────────────────
  if (/(who\s*made\s*you|who\s*created\s*you)/i.test(norm)) {
    return "I'm Karudi, built for image and file tools. Got something you want processed?";
  }
  if (/(are\s*you\s*(a\s*)?(human|bot|ai|robot|person|real))/i.test(norm)) {
    return "I'm Karudi, an AI specialist built for image and file processing. Got a file you want worked on?";
  }
  if (/^(how\s*are\s*you|how('s|\s*is)\s*it\s*going|sup|whats\s*up)$/i.test(norm)) {
    return "I'm doing well, ready to process your files! Got an image or document you want worked on?";
  }
  if (/^(what('s|\s*is)\s*your\s*name|who\s*are\s*you)$/i.test(norm)) {
    return "I'm Karudi — I handle image and file conversions. Got a file you want worked on?";
  }

  // ── PART C2: GOAL-PHRASED REQUESTS ────────────────────────────────────
  const isAddressRemoval =
    /(address\s*on\s*it|old\s*address|remove\s*address|get\s*rid\s*of\s*(my\s*)?address)/i.test(norm);
  if (isAddressRemoval) {
    return "Is the address in a specific corner I can crop out, or is it overlapping the main photo?";
  }

  const isFormUploadGoal =
    /(need\s*this|upload\s*to\s*a\s*form|job\s*application|form\s*upload).*under\s*(\d+)\s*(kb|mb)/i.test(norm) ||
    /under\s*(\d+)\s*(kb|mb)\s*for\s*(a\s*)?(job|application|upload|form)/i.test(norm);
  if (isFormUploadGoal) {
    const sizeMatch = norm.match(/under\s*(\d+)\s*(kb|mb)/i);
    const sizeStr = sizeMatch ? `${sizeMatch[1].toUpperCase()}${sizeMatch[2].toUpperCase()}` : "200KB";
    return `Compressing to under ${sizeStr} for your upload...`;
  }

  // ── PART C4: HINGLISH / REGIONAL PHRASING ──────────────────────────────
  const isHinglishCompress =
    /(ise|isko|is\s*file\s*ko|photo\s*ko)\s*(chota|chhota|kam)\s*(karo|kar\s*do|karna)/i.test(norm) ||
    /(file\s*size|size)\s*(kam|chota|chhota)\s*(karo|kar\s*do|kijiye)/i.test(norm);
  if (isHinglishCompress) {
    return "File size chhota kar raha hoon (compressing)...";
  }

  const isHinglishPdf =
    /(img|image|photo)\s*ko\s*pdf\s*(bnado|bana\s*do|karo)/i.test(norm) ||
    /pdf\s*(bnado|bana\s*do)/i.test(norm);
  if (isHinglishPdf) {
    return "Converting your image into a PDF document...";
  }

  const isHinglishBg =
    /(bg|background)\s*(hata\s*do|hatao|nikal\s*do|saaf\s*karo)/i.test(norm) ||
    /(piche\s*ka)\s*(hata\s*do|hatao|nikal\s*do)/i.test(norm);
  if (isHinglishBg) {
    return "Removing background, please wait some time...";
  }

  // ── RULE 5: FILE-TYPE MISMATCH CHECK ──────────────────────────────────
  const asksBgRemoval =
    /(remove|remov|rmv|no|transparent|cut\s*out|isolate|delete)\s*(the\s*)?(background|bg|backdrop)/i.test(norm) ||
    /^(bg\s*removal|remove\s*bg|remove\s*background|cutout|remov\s*bg\s*plz|remove\s*bg\s*pls)$/i.test(norm) ||
    isHinglishBg;

  if (asksBgRemoval && (isCurrentDocx || lastUploadedFilename.toLowerCase().endsWith(".docx"))) {
    return "This file is a Word document, not an image, so background removal doesn't apply. Did you mean to convert it first, or upload a different file?";
  }
  if (asksBgRemoval && (isCurrentPdf || lastUploadedFilename.toLowerCase().endsWith(".pdf"))) {
    return "This file is a PDF document, not an image, so background removal doesn't apply directly. Did you mean to convert PDF pages to images first?";
  }
  if (asksBgRemoval && isCurrentXlsx) {
    return "This file is a spreadsheet, not an image, so background removal doesn't apply. Did you mean to convert it to an image first?";
  }

  // ── RULE 6: MULTI-ACTION HANDLING (e.g. "remove background and resize to 800x800")
  const hasAnd = /\b(and|then|after\s*that|also)\b/i.test(norm);

  if (hasAnd && asksBgRemoval && (wxhMatch || /resize/i.test(norm))) {
    const dim = wxhMatch ? `${wxhMatch[1]}×${wxhMatch[2]}px` : "your requested dimensions";
    return `Got it — removing the background first, then resizing to ${dim}...`;
  }
  if (hasAnd && asksBgRemoval && /compress/i.test(norm)) {
    return `Got it — removing the background first, then compressing the file...`;
  }
  if (hasAnd && asksBgRemoval && /upscale/i.test(norm)) {
    return `Got it — removing the background first, then upscaling with AI...`;
  }

  // ── PART E / AMBIGUOUS ENCODING VS OCR CHECK ──────────────────────────
  const isImageToTextRaw = /^(image\s*to\s*text|img\s*to\s*text|convert\s*(this\s*)?to\s*text)$/i.test(norm);
  if (isImageToTextRaw) {
    return "Do you want the words in the image extracted (OCR), or the file itself converted into a text-encoded string?";
  }

  // ── PART D / TOOL 7: RESIZE IMAGE (Rule 1 & Typo tolerance C3) ────────
  const isResizeRequest =
    /\b(resize|resiz|dimensions?|scale\s*to)\b/i.test(norm) ||
    !!wxhMatch;
  if (isResizeRequest) {
    if (wxhMatch) {
      // Both dimensions given -> execute immediately!
      return `Resizing your image to ${wxhMatch[1]}×${wxhMatch[2]}px...`;
    }
    const singleDimMatch = norm.match(/(?:width|height|w|h|size)?\s*(\d{2,5})\s*(?:px)?/);
    if (singleDimMatch && !norm.includes("under") && !norm.includes("kb") && !norm.includes("mb")) {
      return "Should I keep the aspect ratio, or set an exact height too?";
    }
    return "Sure — what dimensions would you like? (e.g. 1000x1000px)";
  }

  // ── PART D / TOOL 6: COMPRESS IMAGE vs RESIZE DISAMBIGUATION ──────────
  const isSmallerRequest =
    /make\s*(it|this|image|photo|file)?\s*smaller/i.test(norm) ||
    /shrink\s*(it|this|image|photo|file)?/i.test(norm) ||
    norm === "make smaller" ||
    norm === "smaller";

  const hasSizeUnit = /(kb|mb|bytes?|kilobytes?|megabytes?)/i.test(norm);
  const hasPixelUnit = /(px|pixels?|\d+\s*[xX]\s*\d+)/i.test(norm);

  if (isSmallerRequest && !hasSizeUnit && !hasPixelUnit) {
    return "Do you want a smaller file size (Compress) or smaller pixel dimensions (Resize)?";
  }

  const isCompressRequest =
    /(compress|reduce\s*file\s*size|lighter\s*file)/i.test(norm) ||
    isHinglishCompress ||
    (isSmallerRequest && hasSizeUnit) ||
    /under\s*(\d+)\s*(kb|mb)/i.test(norm);

  if (isCompressRequest) {
    const targetSizeMatch = norm.match(/under\s*(\d+)\s*(kb|mb)/i) || norm.match(/to\s*(\d+)\s*(kb|mb)/i);
    if (targetSizeMatch) {
      return `Compressing your image to under ${targetSizeMatch[1].toUpperCase()}${targetSizeMatch[2].toUpperCase()}...`;
    }
    return "Compressing with balanced quality — want a specific target size like under 200KB?";
  }

  // ── PART D / TOOL 12: SQUARE YOUR IMAGE ───────────────────────────────
  const isSquareRequest =
    /\b(square|1\s*:\s*1|instagram\s*square)\b/i.test(norm) ||
    /(make\s*(it|this)?\s*square|square\s*(crop|image|it))/i.test(norm);

  if (isSquareRequest) {
    return "Making it square using a centered crop — let me know if you'd prefer padding instead.";
  }

  // ── PART D / TOOL 1: REMOVE BACKGROUND ────────────────────────────────
  if (asksBgRemoval) {
    return "Removing background, please wait some time...";
  }

  // ── PART D / TOOL 2: UPSCALE IMAGE ────────────────────────────────────
  const isUpscaleRequest =
    /(upscale|make\s*(it)?\s*bigger|increase\s*resolution|hd\s*version|4k\s*(this)?|sharpen\s*and\s*enlarge|improve\s*quality|quality\s*badhao|photo\s*saaf\s*karo)/i.test(norm);
  if (isUpscaleRequest) {
    if (norm.includes("4x") || norm.includes("4k")) {
      return "Upscaling your image to 4× (4K resolution)...";
    }
    if (norm.includes("2x") || norm.includes("hd")) {
      return "Upscaling your image to 2× HD resolution...";
    }
    return "How much would you like to upscale — 2x or 4x?";
  }

  // ── PART D / TOOL 3: REMOVE WATERMARK ─────────────────────────────────
  const isRemoveWatermark =
    /(remove|delete|clean|erase|get\s*rid\s*of)\s*(the\s*)?(watermark|logo|stamp|text\s*overlay)/i.test(norm);
  if (isRemoveWatermark) {
    return "Removing the watermark and reconstructing the background...";
  }

  // ── PART D / TOOL 11: WATERMARK IMAGE ─────────────────────────────────
  const isAddWatermark =
    /(add|put|apply)\s*(a\s*)?(watermark|logo|text\s*overlay|branding)/i.test(norm) ||
    /(brand\s*this\s*image)/i.test(norm);

  if (isAddWatermark) {
    const textMatch = raw.match(/(?:say|text|saying|with text|watermark)\s*["':]\s*([^"'\n]+)["']?/i);
    if (textMatch && textMatch[1]) {
      return `Adding your watermark "${textMatch[1].trim()}" to the bottom-right corner...`;
    }
    return "What should the watermark say, or do you have a logo file to upload?";
  }

  // ── PART D / TOOL 4: BLUR FACE ────────────────────────────────────────
  const isBlurFace =
    /(blur\s*face|hide\s*identity|anonymize\s*photo|anonymise\s*photo|blur\s*(the\s*)?person)/i.test(norm);
  if (isBlurFace) {
    if (norm.includes("all faces") || norm.includes("everyone")) {
      return "Detecting and blurring all faces for privacy...";
    }
    return "Detecting and blurring faces for privacy...";
  }

  // ── PART D / TOOL 8: CROP IMAGE ───────────────────────────────────────
  const isCropRequest =
    /\b(crop|cut\s*out\s*this\s*part|trim\s*edges|remove\s*the\s*(sides|top|bottom))\b/i.test(norm);
  if (isCropRequest) {
    const ratioMatch = norm.match(/(1\s*:\s*1|4\s*:\s*3|16\s*:\s*9|9\s*:\s*16|top\s*half|bottom\s*half|center)/i);
    if (ratioMatch) {
      return `Cropping image to ${ratioMatch[1]}...`;
    }
    return "Which part should I keep — can you describe the area or give a ratio like 1:1, 4:3?";
  }

  // ── PART D / TOOL 10: ROTATE / FLIP IMAGE ─────────────────────────────
  const isRotateRequest = /\b(rotate|flip|turn\s*90|sideways|upside\s*down)\b/i.test(norm);
  if (isRotateRequest) {
    if (norm.includes("90") && (norm.includes("counter") || norm.includes("left"))) {
      return "Rotating image 90° counter-clockwise...";
    }
    if (norm.includes("90") || norm.includes("clockwise") || norm.includes("right")) {
      return "Rotating image 90° clockwise...";
    }
    if (norm.includes("180") || norm.includes("upside down")) {
      return "Rotating image 180°...";
    }
    if (norm.includes("horizontal")) {
      return "Flipping image horizontally...";
    }
    if (norm.includes("vertical")) {
      return "Flipping image vertically...";
    }
    return "Which way — 90° clockwise, 90° counter-clockwise, or 180°?";
  }

  // ── PART D / TOOL 9: PHOTO EDITOR ─────────────────────────────────────
  const isPhotoEditor =
    /(edit\s*photo|adjust\s*(brightness|contrast|saturation)|filters?|touch\s*up|make\s*it\s*look\s*better)/i.test(norm);
  if (isPhotoEditor) {
    const adjMatch = norm.match(/(brightness|contrast|saturation|grayscale|sepia)/i);
    if (adjMatch) {
      return `Adjusting ${adjMatch[1]} in Photo Editor...`;
    }
    return "Applying auto-enhance (brightness/contrast/color balance)...";
  }

  // ── PART D / TOOL 37: COLOR PICKER FROM IMAGE ─────────────────────────
  const isColorPicker =
    /(what\s*color\s*is\s*this|pick\s*color|get\s*hex\s*code|sample\s*this\s*color|color\s*picker)/i.test(norm);
  if (isColorPicker) {
    return "Here's the dominant color — click a specific spot if you want an exact pixel color instead.";
  }

  // ── PART D / TOOL 38: MEME GENERATOR ──────────────────────────────────
  const isMemeRequest =
    /(make\s*a\s*meme|add\s*meme\s*text|caption\s*this\s*image|meme\s*generator)/i.test(norm);
  if (isMemeRequest) {
    const textMatch = raw.match(/(?:says?|caption|text)\s*["':]\s*([^"'\n]+)["']?/i);
    if (textMatch && textMatch[1]) {
      return `Creating your meme with caption "${textMatch[1].trim()}"...`;
    }
    return "What should the top and bottom text say?";
  }

  // ── PART D / TOOL 5: IMAGE TO TEXT (OCR) ──────────────────────────────
  const isOcrRequest =
    /(extract\s*text|read\s*text\s*from\s*image|ocr\s*this|what\s*does\s*this\s*say|get\s*the\s*text\s*out)/i.test(norm);
  if (isOcrRequest) {
    if (norm.includes("word") || norm.includes("docx")) {
      return "Extracting text and compiling it into an editable Word (.docx) document...";
    }
    return "Extracting text from your image using neural OCR...";
  }

  // ── PART D / TOOLS 13–20: DOCUMENT CONVERTERS ─────────────────────────
  // PDF <-> Image
  const isPdfToImg = /(pdf\s*(to|into|->|2|as)\s*(img|image|images|jpg|jpeg|png|webp))/i.test(norm);
  if (isPdfToImg || (isCurrentPdf && /(jpg|jpeg|png|webp|images?)/i.test(norm))) {
    return "Converting PDF pages into high-resolution images...";
  }

  const isImgToPdf =
    /(image|img|photos?|jpg|png|webp)\s*(to|into|->|2|as)\s*pdf/i.test(norm) ||
    isHinglishPdf ||
    (norm === "convert to pdf" && (isCurrentImage || hasAttachedFile));
  if (isImgToPdf) {
    return "Converting your image into a PDF document...";
  }

  // Word <-> Image
  const isWordToImg = /(word|docx|doc)\s*(to|into|->|2|as)\s*(img|image|images|jpg|png)/i.test(norm);
  if (isWordToImg || (isCurrentDocx && /(img|image|images|jpg|png)/i.test(norm))) {
    return "Converting Word document pages into images...";
  }

  const isImgToWord =
    /(image|img|photos?|jpg|png|webp|scan)\s*(to|into|->|2|as)\s*(word|docx|doc)/i.test(norm) ||
    (norm === "convert to word" && (isCurrentImage || hasAttachedFile));
  if (isImgToWord) {
    return "Extracting text and converting your image into an editable Word (.docx) document...";
  }

  // Excel <-> Image
  const isExcelToImg = /(excel|xlsx|csv|spreadsheet)\s*(to|into|->|2|as)\s*(img|image|png|jpg)/i.test(norm);
  if (isExcelToImg || (isCurrentXlsx && /(img|image|png|jpg)/i.test(norm))) {
    return "Rendering your spreadsheet into a clean, readable table image...";
  }

  const isImgToExcel = /(image|img|table|scan)\s*(to|into|->|2|as)\s*(excel|xlsx|spreadsheet)/i.test(norm);
  if (isImgToExcel) {
    return "Extracting table rows and cells into an editable Excel (.xlsx) file...";
  }

  // PowerPoint <-> Image
  const isPptToImg = /(powerpoint|pptx|ppt|slides?)\s*(to|into|->|2|as)\s*(img|image|images|png|jpg)/i.test(norm);
  if (isPptToImg || (isCurrentPptx && /(img|image|images|png|jpg)/i.test(norm))) {
    return "Exporting each presentation slide as an image...";
  }

  const isImgToPpt = /(image|img|photos?)\s*(to|into|->|2|as)\s*(powerpoint|pptx|ppt|slides?)/i.test(norm);
  if (isImgToPpt) {
    return "Converting your images into a PowerPoint (.pptx) presentation...";
  }

  // ── PART D / TOOLS 21–35: FORMAT & BINARY CONVERTERS ──────────────────
  // HTML to Image
  const isHtmlToImg = /(html\s*(to|into|->|2|as)\s*(img|image|png|jpg)|screenshot\s*this\s*html|render\s*this\s*page)/i.test(norm);
  if (isHtmlToImg) {
    return "Rendering HTML code into a high-resolution image...";
  }

  // Convert to / from JPG
  const isConvertToJpg = /(convert\s*to\s*jpg|make\s*it\s*jpg|png\s*to\s*jpg|webp\s*to\s*jpg)/i.test(norm);
  if (isConvertToJpg) {
    return "Converting your image to JPG format...";
  }

  const isConvertToPng = /(convert\s*to\s*png|make\s*it\s*png|jpg\s*to\s*png)/i.test(norm);
  if (isConvertToPng) {
    return "Converting your image to PNG format...";
  }

  const isConvertToWebp = /(convert\s*to\s*webp|make\s*it\s*webp|change\s*to\s*webp)/i.test(norm);
  if (isConvertToWebp) {
    return "Converting your image to WebP format...";
  }

  const isGenericFormatChange = /(change\s*format|convert\s*format|convert\s*the\s*format)/i.test(norm);
  if (isGenericFormatChange) {
    return "Convert to which format — JPG, PNG, or WebP?";
  }

  // Base64
  if (/(base64\s*(this|image)|image\s*to\s*base64)/i.test(norm)) {
    return "Encoding your image into a Base64 data string...";
  }
  if (/(base64\s*to\s*image|decode\s*base64)/i.test(norm)) {
    return "Decoding Base64 string into an image...";
  }

  // Binary
  if (/(image\s*to\s*binary|binary\s*file|convert\s*to\s*binary)/i.test(norm)) {
    return "Converting image into a raw binary bitstream...";
  }
  if (/(binary\s*to\s*image|decode\s*binary)/i.test(norm)) {
    return "Reconstructing image from binary data...";
  }

  // Hex
  if (/(image\s*to\s*hex|hex\s*code\s*of\s*image)/i.test(norm)) {
    return "Converting image into a Hexadecimal byte string...";
  }
  if (/(hex\s*to\s*image|decode\s*hex)/i.test(norm)) {
    return "Reconstructing image from Hexadecimal bytes...";
  }

  // Octal
  if (/(image\s*to\s*octal)/i.test(norm)) {
    return "Converting image into Octal numeric sequence...";
  }
  if (/(octal\s*to\s*image)/i.test(norm)) {
    return "Reconstructing image from Octal byte data...";
  }

  // Decimal
  if (/(image\s*to\s*decimal)/i.test(norm)) {
    return "Converting image into Decimal byte array (0–255)...";
  }
  if (/(decimal\s*to\s*image)/i.test(norm)) {
    return "Reconstructing image from Decimal byte numbers...";
  }

  // ASCII
  if (/(image\s*to\s*ascii|ascii\s*art)/i.test(norm)) {
    return "Transforming your photo into ASCII character art...";
  }
  if (/(ascii\s*to\s*image)/i.test(norm)) {
    return "Rendering ASCII art into a high-resolution image...";
  }

  // ── GREETINGS & SPIRITUAL ORIGIN ──────────────────────────────────────
  if (/^(hi|hello|hey|greetings|howdy|good\s*(morning|afternoon|evening)|namaste|pranam)$/i.test(norm)) {
    return "Hello! How can I help you with your files or images today?";
  }

  if (/(meaning\s*of\s*karudi|what\s*(is|does)\s*karudi\s*mean|who\s*is\s*karudi)/i.test(norm)) {
    return `**Karudi** (કારુડી) refers to **Maa Mahakali**, the supreme Hindu Goddess of strength and protection, affectionately called "Karudi" (કારુડી મા) in Gujarati. As your AI assistant, I bring that same dedication to help you process files, edit images, and convert formats with speed and precision.`;
  }

  // ── RULE 4 & CASE D: NO TOOL MATCHES → NARROW SUGGESTION ──────────────
  if (norm.includes("cartoon") || norm.includes("anime") || norm.includes("caricature")) {
    return "I don't have a cartoon-effect tool. Closest options: Photo Editor (filters/adjustments) or Meme Generator. Want one of these?";
  }
  if (norm.includes("video") || norm.includes("mp4") || norm.includes("audio") || norm.includes("mp3")) {
    return "I don't have video or audio editing tools. I specialize in image and document processing (e.g. PDF converters, image editing, and OCR). Can I help with an image or document instead?";
  }
  if (norm.includes("3d") || norm.includes("mesh") || norm.includes("obj") || norm.includes("stl")) {
    return "I don't have 3D modeling tools. Closest options: Upscale Image (to 4K) or Photo Editor for 2D enhancement. Would you like to try one of those?";
  }

  // ── PART C7: FULLY UNCLEAR / NO ACTIONABLE CONTENT ─────────────────────
  // If user uploaded a file with no text, prompt for intent cleanly WITHOUT guessing silently
  if (hasAttachedFile) {
    if (isCurrentPdf) {
      return "Got your PDF! Would you like to convert it to images (JPG/PNG), or extract text into an editable Word document?";
    }
    if (isCurrentDocx) {
      return "Got your Word document! Would you like to convert it to images or extract text?";
    }
    if (isCurrentXlsx) {
      return "Got your spreadsheet! Would you like to convert it to an image table?";
    }
    if (isCurrentPptx) {
      return "Got your PowerPoint presentation! Would you like to export slides as images?";
    }
    return "What would you like done with this — resize, compress, convert, or edit it in some way?";
  }

  // Clean fallback
  return "I'm here to help! Tell me what you'd like to do (e.g. remove background, resize, upscale, compress, or convert documents).";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const messages = body.messages;
          const tier = body.tier;
          if (!Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "Messages array is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

        // Pure Proprietary Karudi Master Engine
        const reply = generateKarudiReply(messages as UIMessage[], tier);

        // Produce a compliant Server-Sent Events UI Message Stream for AI SDK
        return createUIMessageStreamResponse({
          stream: createUIMessageStream({
            originalMessages: messages as UIMessage[],
            async execute({ writer }) {
              const textId = "text_" + Date.now();
              writer.write({
                type: "text-start",
                id: textId,
              });

              // Stream words with natural pacing
              const words = reply.split(" ");
              for (let i = 0; i < words.length; i++) {
                const chunk = words[i] + (i === words.length - 1 ? "" : " ");
                writer.write({
                  type: "text-delta",
                  id: textId,
                  delta: chunk,
                });
                await new Promise((r) => setTimeout(r, 10));
              }

              writer.write({
                type: "text-end",
                id: textId,
              });
            },
          }),
        });
        } catch (err: any) {
          console.error("Error in /api/chat:", err);
          return new Response(JSON.stringify({ error: err?.message || "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
