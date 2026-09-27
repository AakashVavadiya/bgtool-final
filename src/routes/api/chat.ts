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

// ── KARUDI 1.0 PRIME: NATURAL LANGUAGE & TYPO NORMALIZER ─────────────────────
export function normalizeKarudiPrompt(text: string): {
  normalized: string;
  original: string;
  isCorrection: boolean;
  detectedTarget?: "excel" | "pdf" | "word" | "jpg" | "png" | "webp" | undefined;
  detectedOperation?: "convert" | "compress" | "resize" | "remove_bg" | "upscale" | "ocr" | undefined;
} {
  const original = text.trim();
  let lower = original.toLowerCase();

  // 1. Regional / Multi-lingual mappings (Hindi, Gujarati, Hinglish)
  lower = lower
    .replace(/\bisko\s*pdf\s*me\s*karo\b/g, "convert this to pdf")
    .replace(/\bexcel\s*me\s*chahiye\b/g, "need excel")
    .replace(/\bbackground\s*hata\s*do\b/g, "remove background")
    .replace(/\bise\s*pdf\s*bnado\b/g, "convert this to pdf")
    .replace(/\bise\s*pdf\s*banao\b/g, "convert this to pdf")
    .replace(/\baa\s*image\s*ne\s*pdf\s*ma\s*convert\s*karo\b/g, "convert this image to pdf")
    .replace(/\bmujhe\s*excel\s*file\s*joiye\b/g, "need excel file")
    .replace(/\bpdf\s*ma\s*banavo\b/g, "convert to pdf")
    .replace(/\bexcel\s*ma\s*banavo\b/g, "convert to excel")
    .replace(/\bchota\s*karo\b/g, "compress")
    .replace(/\bnanu\s*karo\b/g, "compress");

  // 2. Typo and spelling normalization
  // Excel: exel, excle, excel, ecxel, exl, exell, excl, excell, sheet, spreadsheet
  lower = lower.replace(/\b(exel|excle|ecxel|exl|exell|excl|excell|exle|ecxl|xcl)\b/g, "excel");
  // PDF: pdfd, pdff, pfd
  lower = lower.replace(/\b(pdfd|pdff|pfd)\b/g, "pdf");
  // Image: imgae, iamge, photto, fototo, fota
  lower = lower.replace(/\b(imgae|iamge|photto|fototo|fota)\b/g, "image");
  // Convert: convet, conert, covnert, cnvert
  lower = lower.replace(/\b(convet|conert|covnert|cnvert)\b/g, "convert");
  // Background: backgroud, backgorund, back ground
  lower = lower.replace(/\b(backgroud|backgorund|back\s*ground)\b/g, "background");
  // Remove bg: rem bg, rm bg
  lower = lower.replace(/\b(rem\s*bg|rm\s*bg)\b/g, "remove bg");
  // Word / Doc: docxx, docm
  lower = lower.replace(/\b(docxx|docm)\b/g, "docx");

  const clean = lower.replace(/[^\w\s×*]/g, " ").replace(/\s+/g, " ").trim();

  // Detect explicit correction
  const isCorrection =
    /^(no|wait|actually|rather|instead)\b/i.test(clean) ||
    /\b(no\s*i\s*need|no\s*i\s*want|actually\s*i\s*need|actually\s*i\s*want|instead\s*of|change\s*to)\b/i.test(clean) ||
    /^(no,?\s*|actually\s+)(excel|pdf|word|jpg|png|webp)/i.test(clean);

  let detectedTarget: "excel" | "pdf" | "word" | "jpg" | "png" | "webp" | undefined;
  if (/\b(excel|xlsx|xls|spreadsheet|sheet)\b/i.test(clean)) detectedTarget = "excel";
  else if (/\bpdf\b/i.test(clean)) detectedTarget = "pdf";
  else if (/\b(word|docx|doc)\b/i.test(clean)) detectedTarget = "word";
  else if (/\b(jpg|jpeg)\b/i.test(clean)) detectedTarget = "jpg";
  else if (/\bpng\b/i.test(clean)) detectedTarget = "png";
  else if (/\bwebp\b/i.test(clean)) detectedTarget = "webp";

  let detectedOperation: "convert" | "compress" | "resize" | "remove_bg" | "upscale" | "ocr" | undefined;
  if (/\b(remove\s*background|remove\s*bg|cutout)\b/i.test(clean)) detectedOperation = "remove_bg";
  else if (/\b(compress|shrink|smaller|make\s*smaller)\b/i.test(clean)) detectedOperation = "compress";
  else if (/\b(resize|dimension)\b/i.test(clean) || /\d+\s*[xX×]\s*\d+/.test(clean)) detectedOperation = "resize";
  else if (/\b(upscale|enlarge|4k|2x|4x)\b/i.test(clean)) detectedOperation = "upscale";
  else if (/\b(ocr|extract\s*text)\b/i.test(clean)) detectedOperation = "ocr";
  else if (/\bconvert\b/i.test(clean) || detectedTarget) detectedOperation = "convert";

  return {
    normalized: clean,
    original,
    isCorrection,
    detectedTarget,
    detectedOperation,
  };
}

export function generateKarudiReply(messages: UIMessage[] | string, tier?: string): string {
  const msgList: UIMessage[] = Array.isArray(messages)
    ? messages
    : [{ id: "m0", role: "user", parts: [{ type: "text", text: messages }] }];

  const lastMsg = msgList[msgList.length - 1] as any;
  const rawText = (
    (typeof lastMsg?.content === "string" ? lastMsg.content : "") ||
    lastMsg?.parts?.find((p: any) => p.type === "text")?.text ||
    ""
  ).trim();

  // Helper to extract text from any message
  const getMsgText = (m: any): string => {
    if (!m) return "";
    if (typeof m.content === "string" && m.content) return m.content;
    const textPart = m?.parts?.find((p: any) => p.type === "text");
    return textPart?.text || "";
  };

  // Inspect previous conversation context to maintain Task State
  let prevAssistantText = "";
  let prevUserText = "";
  let hasConversationFile = !!(
    lastMsg?.parts?.some((p: any) => p.type === "file") ||
    (Array.isArray(lastMsg?.experimental_attachments) && lastMsg.experimental_attachments.length > 0)
  );
  let lastUploadedFilename = "";
  let lastUploadedMediaType = "";
  let pastActionTaken = "";
  let prevTargetFormat: "PDF" | "Excel" | "Word" | "JPG" | "PNG" | "WebP" | "" = "";

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
        if (txt.includes("pdf")) prevTargetFormat = "PDF";
        else if (txt.includes("excel") || txt.includes("xlsx") || txt.includes("spreadsheet")) prevTargetFormat = "Excel";
        else if (txt.includes("word") || txt.includes("docx")) prevTargetFormat = "Word";
        else if (txt.includes("jpg") || txt.includes("jpeg")) prevTargetFormat = "JPG";
        else if (txt.includes("png")) prevTargetFormat = "PNG";
        else if (txt.includes("webp")) prevTargetFormat = "WebP";

        if (txt.includes("resiz")) pastActionTaken = "resize";
        else if (txt.includes("background")) pastActionTaken = "remove_bg";
        else if (txt.includes("compress")) pastActionTaken = "compress";
        else if (txt.includes("upscal")) pastActionTaken = "upscale";
      } else if (!prevUserText && m.role === "user") {
        prevUserText = txt;
        if (!prevTargetFormat) {
          if (/\bpdf\b/i.test(txt)) prevTargetFormat = "PDF";
          else if (/\b(excel|xlsx|spreadsheet|sheet)\b/i.test(txt)) prevTargetFormat = "Excel";
          else if (/\b(word|docx)\b/i.test(txt)) prevTargetFormat = "Word";
        }
      }
    }
  }

  // Active file identification
  const currentTurnFile = lastMsg?.parts?.find((p: any) => p.type === "file") ||
    (Array.isArray(lastMsg?.experimental_attachments) ? lastMsg.experimental_attachments[0] : null);

  const currentFilename = currentTurnFile?.filename || currentTurnFile?.name || (hasConversationFile ? lastUploadedFilename : "");
  const currentMediaType = currentTurnFile?.mediaType || currentTurnFile?.contentType || (hasConversationFile ? lastUploadedMediaType : "");

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
    /\.(png|jpe?g|webp|avif|gif|bmp|tiff)$/i.test(currentFilename) ||
    (!isCurrentPdf && !isCurrentDocx && !isCurrentXlsx && !isCurrentPptx && hasConversationFile);

  // Normalize prompt with typo & language correction
  const { normalized: norm, isCorrection, detectedTarget, detectedOperation } = normalizeKarudiPrompt(rawText);

  // ── LAYER 1: SPECIALIZED UNIT CONVERSIONS ─────────────────────────────
  const unitConversion = tryUnitOrValueConversion(rawText);
  if (unitConversion) {
    return unitConversion;
  }

  // ── ABUSE / EXECUTABLE CHECK ──────────────────────────────────────────
  const isAbuseOrExecutable =
    /\b(hack|exploit|bypass\s*copyright|steal\s*copyright|\.exe\b|\.bat\b|\.sh\b|\.cmd\b|\.msi\b)\b/i.test(norm) ||
    currentFilename.endsWith(".exe") ||
    currentFilename.endsWith(".bat");
  if (isAbuseOrExecutable) {
    return "I can't help with that.";
  }

  // ── OFF-TOPIC CHECK ───────────────────────────────────────────────────
  const isOutsideScope =
    /(write\s*(me\s*)?(a\s*)?(poem|poetry|story|essay|song|joke|script)|what('s|\s*is)\s*the\s*weather|who\s*won\s*the\s*(match|game|election)|solve\s*this\s*math|tell\s*me\s*a\s*joke|write\s*code\s*for|birthday\s*poem)/i.test(norm) ||
    /^(who\s*is\s*the\s*president|what\s*is\s*the\s*capital\s*of|how\s*to\s*make\s*money|recipe\s*for)/i.test(norm);
  if (isOutsideScope) {
    return "That's outside what I handle — I'm built for image and file tools. Have a file you want worked on?";
  }

  // ── EMOTIONAL / FRUSTRATED TONE ───────────────────────────────────────
  const isFrustrated =
    /(this\s*is\s*so\s*slow|why\s*isn'?t\s*it\s*working|why\s*isn'?t\s*this\s*working|not\s*working\s*ugh|it\s*is\s*stuck|taking\s*too\s*long|so\s*slow\s*ugh|why\s*so\s*slow)/i.test(norm);
  if (isFrustrated) {
    return "I hear you — let me help troubleshoot. If an upload or process is stuck, try re-uploading the file or telling me your exact target format, and I'll process it right away.";
  }

  // ── SECTION 11 & SECTION 4: CORRECTION HANDLING (HIGHEST PRIORITY) ────
  // e.g. "no i need excel", "no, excel", "actually excel", "i need excel file", "no i need in exl file"
  const wxhMatch = rawText.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (isCorrection && wxhMatch) {
    return `Got it — resizing the original to ${wxhMatch[1]}×${wxhMatch[2]}px instead.`;
  }

  if (isCorrection || (detectedTarget && /^(no|wait|actually|instead|rather)/i.test(rawText))) {
    if (detectedTarget === "excel") {
      if (prevTargetFormat && prevTargetFormat !== "Excel") {
        return `Got it — Excel instead of ${prevTargetFormat}. I’ll convert the current file to Excel.`;
      }
      return "Got it — you need an Excel file. I’ll convert the current file to Excel.";
    }
    if (detectedTarget === "word") {
      if (prevTargetFormat && prevTargetFormat !== "Word") {
        return `Got it — Word instead of ${prevTargetFormat}. I’ll convert the current file to Word.`;
      }
      return "Got it — you need a Word file. I’ll convert the current file to Word.";
    }
    if (detectedTarget === "pdf") {
      if (prevTargetFormat && prevTargetFormat !== "PDF") {
        return `Got it — PDF instead of ${prevTargetFormat}. I’ll convert the current file to PDF.`;
      }
      return "Got it — you need a PDF file. I’ll convert the current file to PDF.";
    }
    if (detectedTarget === "jpg") {
      return "Got it — JPG instead. I’ll convert the current file to JPG.";
    }
    if (detectedTarget === "png") {
      return "Got it — PNG instead. I’ll convert the current file to PNG.";
    }
    if (detectedTarget === "webp") {
      return "Got it — WebP instead. I’ll convert the current file to WebP.";
    }
  }

  // ── SECTION 22: SHORT COMMANDS (pdf, excel, word, jpg, png, compress, resize, remove bg, again, download) ──
  const isExactShortPdf = /^(pdf|make\s*pdf|do\s*pdf|in\s*pdf)$/i.test(norm);
  if (isExactShortPdf) {
    if (prevTargetFormat && prevTargetFormat !== "PDF") {
      return `Got it — PDF instead of ${prevTargetFormat}. Converting your file to PDF.`;
    }
    return "Sure — converting the image to PDF.";
  }

  const isExactShortExcel = /^(excel|xlsx|sheet|spreadsheet|make\s*excel|do\s*excel|in\s*excel)$/i.test(norm);
  if (isExactShortExcel) {
    if (prevTargetFormat && prevTargetFormat !== "Excel") {
      return `Got it — Excel instead of ${prevTargetFormat}. Converting your file to Excel.`;
    }
    return "Sure — converting it to Excel.";
  }

  const isExactShortWord = /^(word|docx|doc|make\s*word|do\s*word|in\s*word)$/i.test(norm);
  if (isExactShortWord) {
    if (prevTargetFormat && prevTargetFormat !== "Word") {
      return `Got it — Word instead of ${prevTargetFormat}. Converting your file to Word.`;
    }
    return "Sure — converting the file to Word.";
  }

  const isExactShortJpg = /^(jpg|jpeg|change\s*to\s*jpg|make\s*jpg)$/i.test(norm);
  if (isExactShortJpg) {
    return "Sure — converting your file to JPG.";
  }

  const isExactShortPng = /^(png|change\s*to\s*png|make\s*png)$/i.test(norm);
  if (isExactShortPng) {
    return "Sure — converting your file to PNG.";
  }

  const isExactShortCompress = /^(compress|compress\s*this|make\s*smaller|smaller|shrink)$/i.test(norm);
  if (isExactShortCompress) {
    return "Sure — I'll compress the file.";
  }

  const isExactShortResize = /^(resize|resize\s*this|resiz)$/i.test(norm);
  if (isExactShortResize) {
    return "Sure — what dimensions would you like? (e.g. 1000x1000px)";
  }

  const isExactShortRemoveBg = /^(remove\s*bg|rem\s*bg|rm\s*bg|remove\s*background|cutout)$/i.test(norm);
  if (isExactShortRemoveBg) {
    return "Sure — removing the background.";
  }

  const isExactAgain = /^(again|retry|redo|repeat)$/i.test(norm);
  if (isExactAgain) {
    return "Repeating the previous operation on your file...";
  }

  const isExactDownload = /^(download|get\s*file|save\s*file)$/i.test(norm);
  if (isExactDownload) {
    return "You can download your processed file using the download button above.";
  }

  const isUndoRequest = /^(undo|undo\s*that|revert|go\s*back|restore\s*original)$/i.test(norm);
  if (isUndoRequest) {
    return "Reverted to your original file. What would you like done with it instead?";
  }

  // ── SECTION 6 & 7: CLARIFICATION RULES ────────────────────────────────
  // User: "convert this" / "convert"
  if (/^(convert\s*(this|file|it)?|convet\s*(this|file|it)?)$/i.test(norm)) {
    if (isCurrentImage) {
      return "What format do you need: PDF, JPG, PNG, or Excel?";
    }
    if (isCurrentPdf) {
      return "What format do you need: Word, Excel, JPG, or PNG?";
    }
    if (isCurrentDocx) {
      return "What format do you need: PDF, JPG, or PNG?";
    }
    return "What format do you need: PDF, Word, Excel, JPG, or PNG?";
  }

  // User: "make this file"
  if (/^make\s*(this|a)?\s*file$/i.test(norm)) {
    return "What format do you need — PDF, Word, or Excel?";
  }

  // ── MULTI-STEP TASKS (Section 19) ─────────────────────────────────────
  const hasAnd = /\b(and|then|after\s*that|also)\b/i.test(norm);
  const asksBgRemoval =
    /(remove|remov|rmv|no|transparent|cut\s*out|isolate|delete)\s*(the\s*)?(background|bg|backdrop)/i.test(norm) ||
    /^(bg\s*removal|remove\s*bg|remove\s*background|cutout)$/i.test(norm);

  if (hasAnd && asksBgRemoval && /pdf/i.test(norm)) {
    return "Got it — removing the background first, then converting to PDF...";
  }
  if (hasAnd && asksBgRemoval && (wxhMatch || /resize/i.test(norm))) {
    const dim = wxhMatch ? `${wxhMatch[1]}×${wxhMatch[2]}px` : "your requested dimensions";
    return `Got it — removing the background first, then resizing to ${dim}...`;
  }
  if (hasAnd && asksBgRemoval && /compress/i.test(norm)) {
    return "Got it — removing the background first, then compressing the file...";
  }
  if (hasAnd && asksBgRemoval && /png/i.test(norm)) {
    return "Got it — removing the background first, and saving as PNG...";
  }

  // ── EXCEL INTENT (Section 2, 3, 13, 20) ───────────────────────────────
  // "make this in excel", "make this excel", "convert this to excle", "convert this to exel", "i need excel file", "pdf into excle", "pdf to exel"
  const isExcelIntent =
    /\b(excel|xlsx|spreadsheet)\b/i.test(norm) &&
    (/(make|convert|in|into|to|need|give|as|export)\b/i.test(norm) || /^(excel|xlsx)$/i.test(norm));

  if (isExcelIntent) {
    if (isCurrentPdf || /pdf\s*(to|into|in)\s*excel/i.test(norm)) {
      return "Sure — converting the PDF to Excel.";
    }
    return "Sure — converting it to Excel.";
  }

  // ── WORD INTENT (Section 2, 13, 20) ───────────────────────────────────
  // "can you make word", "can you make this word file", "convert to word", "make word"
  const isWordIntent =
    /\b(word|docx|doc)\b/i.test(norm) &&
    (/(make|convert|in|into|to|need|give|as|export|can\s*you)\b/i.test(norm) || /^(word|docx)$/i.test(norm));

  if (isWordIntent) {
    if (isCurrentPdf || /pdf\s*(to|into|in)\s*word/i.test(norm)) {
      return "Sure — converting the PDF to Word.";
    }
    return "Sure — converting the file to Word.";
  }

  // ── PDF INTENT (Section 2, 20) ────────────────────────────────────────
  // "convert this image pdf", "img to pdf", "image convert pdf", "make pdf from photo", "make pdf"
  const isPdfIntent =
    /\bpdf\b/i.test(norm) &&
    (/(make|convert|in|into|to|need|give|as|from|photo|image|img)\b/i.test(norm) || norm === "pdf");

  if (isPdfIntent) {
    return "Sure — converting the image to PDF.";
  }

  // ── BACKGROUND REMOVAL (Section 2, 20) ────────────────────────────────
  if (asksBgRemoval) {
    if (isCurrentDocx) {
      return "This file is a Word document, not an image, so background removal doesn't apply. Did you mean to convert it first, or upload an image?";
    }
    if (isCurrentPdf) {
      return "This file is a PDF document, not an image, so background removal doesn't apply directly. Did you mean to convert PDF pages to images first?";
    }
    return "Sure — removing the background.";
  }

  // ── COMPRESSION (Section 2, 20) ───────────────────────────────────────
  const isCompressIntent =
    /(compress|make\s*smaller|make\s*it\s*smaller|reduce\s*file\s*size|lighter\s*file|shrink)/i.test(norm) ||
    /under\s*(\d+)\s*(kb|mb)/i.test(norm);

  if (isCompressIntent) {
    const sizeMatch = norm.match(/under\s*(\d+)\s*(kb|mb)/i);
    if (sizeMatch && sizeMatch[1] && sizeMatch[2]) {
      return `Compressing your file to under ${sizeMatch[1].toUpperCase()}${sizeMatch[2].toUpperCase()}...`;
    }
    return "Sure — I'll compress the file.";
  }

  // ── RESIZE IMAGE (Section 2) ──────────────────────────────────────────
  const isResizeRequest = /\b(resize|resiz|dimensions?|scale\s*to)\b/i.test(norm) || !!wxhMatch;
  if (isResizeRequest) {
    if (wxhMatch) {
      return `Resizing your image to ${wxhMatch[1]}×${wxhMatch[2]}px...`;
    }
    return "Sure — what dimensions would you like? (e.g. 1000x1000px)";
  }

  // ── UPSCALE IMAGE ─────────────────────────────────────────────────────
  const isUpscaleRequest =
    /(upscale|make\s*(it)?\s*bigger|increase\s*resolution|hd\s*version|4k\s*(this)?|sharpen\s*and\s*enlarge|improve\s*quality)/i.test(norm);
  if (isUpscaleRequest) {
    if (norm.includes("4x") || norm.includes("4k")) {
      return "Upscaling your image to 4× (4K resolution)...";
    }
    if (norm.includes("2x") || norm.includes("hd")) {
      return "Upscaling your image to 2× HD resolution...";
    }
    return "How much would you like to upscale — 2x or 4x?";
  }

  // ── WATERMARK REMOVAL / ADDITION ──────────────────────────────────────
  if (/(remove|delete|clean|erase)\s*(the\s*)?(watermark|logo|stamp)/i.test(norm)) {
    return "Removing the watermark and reconstructing the background...";
  }
  if (/(add|put|apply)\s*(a\s*)?(watermark|logo|text\s*overlay)/i.test(norm)) {
    return "What should the watermark say, or do you have a logo file to upload?";
  }

  // ── BLUR FACE ─────────────────────────────────────────────────────────
  if (/(blur\s*face|hide\s*identity|anonymize\s*photo|anonymise\s*photo)/i.test(norm)) {
    return "Detecting and blurring faces for privacy...";
  }

  // ── CROP IMAGE ────────────────────────────────────────────────────────
  if (/\b(crop|cut\s*out\s*this\s*part|trim\s*edges)\b/i.test(norm)) {
    const ratioMatch = norm.match(/(1\s*:\s*1|4\s*:\s*3|16\s*:\s*9|9\s*:\s*16)/i);
    if (ratioMatch) {
      return `Cropping image to ${ratioMatch[1]}...`;
    }
    return "Which part should I keep — can you describe the area or give a ratio like 1:1, 4:3?";
  }

  // ── ROTATE / FLIP IMAGE ───────────────────────────────────────────────
  if (/\b(rotate|flip|turn\s*90)\b/i.test(norm)) {
    if (norm.includes("counter") || norm.includes("left")) {
      return "Rotating image 90° counter-clockwise...";
    }
    if (norm.includes("clockwise") || norm.includes("right") || norm.includes("90")) {
      return "Rotating image 90° clockwise...";
    }
    if (norm.includes("180") || norm.includes("upside down")) {
      return "Rotating image 180°...";
    }
    return "Which way — 90° clockwise, 90° counter-clockwise, or 180°?";
  }

  // ── FORMAT CONVERSION (JPG, PNG, WEBP) ────────────────────────────────
  if (/(change\s*to\s*jpg|convert\s*to\s*jpg|make\s*it\s*jpg)/i.test(norm)) {
    return "Sure — converting the file to JPG.";
  }
  if (/(change\s*to\s*png|convert\s*to\s*png|make\s*it\s*png)/i.test(norm)) {
    return "Sure — converting the file to PNG.";
  }
  if (/(change\s*to\s*webp|convert\s*to\s*webp|make\s*it\s*webp)/i.test(norm)) {
    return "Sure — converting the file to WebP.";
  }

  // ── OCR / EXTRACT TEXT ────────────────────────────────────────────────
  if (/(extract\s*text|read\s*text\s*from\s*image|ocr\s*this|what\s*does\s*this\s*say)/i.test(norm)) {
    return "Extracting text from your image using neural OCR...";
  }

  // ── BASE64, BINARY, HEX ───────────────────────────────────────────────
  if (/base64/i.test(norm)) {
    return "Encoding your image into a Base64 data string...";
  }
  if (/binary/i.test(norm)) {
    return "Converting image into a raw binary bitstream...";
  }
  if (/hex/i.test(norm)) {
    return "Converting image into a Hexadecimal byte string...";
  }

  // ── CAPABILITY QUESTIONS ──────────────────────────────────────────────
  const isGeneralCapabilityQuery =
    /(what\s*all\s*can\s*(you|this)\s*do|what\s*can\s*(you|this)\s*do|what\s*are\s*your\s*capabilities|list\s*(all\s*)?your\s*tools|what\s*do\s*you\s*do)/i.test(norm);
  if (isGeneralCapabilityQuery) {
    return "I can convert documents (PDF ↔ Excel, Word, Image), remove backgrounds, compress files, resize, upscale, and extract text via OCR. What would you like done?";
  }

  // ── GREETINGS & SPIRITUAL ORIGIN ──────────────────────────────────────
  if (/^(hi|hello|hey|greetings|howdy|good\s*(morning|afternoon|evening)|namaste|pranam)$/i.test(norm)) {
    return "Hello! How can I help you with your files or images today?";
  }

  if (/(meaning\s*of\s*karudi|what\s*(is|does)\s*karudi\s*mean|who\s*is\s*karudi)/i.test(norm)) {
    return `**Karudi** (કારુડી) refers to **Maa Mahakali**, the supreme Hindu Goddess of strength and protection, affectionately called "Karudi" (કારુડી મા) in Gujarati. As your AI assistant, I bring that same dedication to help you process files, edit images, and convert formats with speed and precision.`;
  }

  // ── SECTION 8: NEVER USE GENERIC FALLBACKS WHEN CONTEXT EXISTS ────────
  if (hasConversationFile || prevAssistantText || prevUserText) {
    if (isCurrentImage) {
      return "What format or operation do you need for this image — PDF, Excel, resize, compress, or remove background?";
    }
    if (isCurrentPdf) {
      return "What format or operation do you need for this PDF — convert to Excel, Word, images, or compress?";
    }
    if (isCurrentDocx) {
      return "What would you like done with this Word document — convert to PDF or images?";
    }
    return "What format or operation do you need for this file — convert, compress, or edit?";
  }

  // Zero-context true cold start only
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
