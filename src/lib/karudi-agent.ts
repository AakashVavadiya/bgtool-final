import { removeBackgroundClientCanvas } from "@/components/RemovalProcess";
import {
  buildEditableDocxFromOcr,
  buildDocxFromImage,
  performAdvancedOcr,
} from "@/components/InteractiveToolWorkspace";

export type SubModelId = "karudi" | "ganga" | "brahmaputra" | "narmada" | "saraswati";

export interface SubModelMetadata {
  id: SubModelId;
  name: string;
  role: string;
  badge: string;
  color: string;
  accentBg: string;
  iconName: string;
}

export const SUB_MODELS: Record<SubModelId, SubModelMetadata> = {
  karudi: {
    id: "karudi",
    name: "Karudi 1.0 Prime",
    role: "Universal Master Orchestrator",
    badge: "Master AI",
    color: "text-amber-500",
    accentBg: "bg-amber-500/10 border-amber-500/30",
    iconName: "Crown",
  },
  ganga: {
    id: "ganga",
    name: "Ganga",
    role: "Sub-Pixel Alpha Matting & Cutout Engine",
    badge: "Background Removal",
    color: "text-blue-500",
    accentBg: "bg-blue-500/10 border-blue-500/30",
    iconName: "Scissors",
  },
  brahmaputra: {
    id: "brahmaputra",
    name: "Brahmaputra",
    role: "Media Transcoding & Format Conversion Engine",
    badge: "Format Converter",
    color: "text-purple-500",
    accentBg: "bg-purple-500/10 border-purple-500/30",
    iconName: "RefreshCw",
  },
  narmada: {
    id: "narmada",
    name: "Narmada",
    role: "Neural OCR, AI Summaries & Meme Generation",
    badge: "OCR & Generative",
    color: "text-emerald-500",
    accentBg: "bg-emerald-500/10 border-emerald-500/30",
    iconName: "Sparkles",
  },
  saraswati: {
    id: "saraswati",
    name: "Saraswati",
    role: "Deep Research, Inspection & Color Analytics",
    badge: "Deep Research",
    color: "text-rose-500",
    accentBg: "bg-rose-500/10 border-rose-500/30",
    iconName: "BookOpen",
  },
};

export type KarudiActionType =
  | "remove_background"
  | "add_background_color"
  | "convert_file_general"
  | "jpg_to_word"
  | "pdf_to_word"
  | "image_to_pdf"
  | "pdf_to_image"
  | "image_to_text"
  | "convert_format"
  | "image_to_binary"
  | "resize_image"
  | "crop_image"
  | "rotate_image"
  | "watermark_image"
  | "blur_face"
  | "square_image"
  | "analyze_image"
  | "compress_image"
  | "merge_pdf"
  | "split_pdf"
  | "compress_pdf"
  | "edit_pdf"
  | "protect_pdf"
  | "unlock_pdf"
  | "sign_pdf"
  | "add_pdf_watermark"
  | "add_page_numbers"
  | "rotate_pdf_pages"
  | "create_invoice"
  | "ocr_pdf"
  | "general_chat"
  | "needs_clarification";

export interface KarudiPlan {
  action: KarudiActionType;
  primaryModel: SubModelId;
  secondaryModel?: SubModelId | undefined;
  toolName: string;
  toolSlug: string;
  needsFile: boolean;
  filePrompt?: string | undefined;
  acceptedFileTypes?: string | undefined;
  summaryMessage: string;
  stageOptions?: {
    color?: string | undefined;
    bgType?: ("white" | "black" | "color" | "blur") | undefined;
    targetFormat?: ("image/jpeg" | "image/png" | "image/webp") | undefined;
    selectedFormat?: string | undefined;
    targetWidth?: number | undefined;
    targetHeight?: number | undefined;
    maintainAspectRatio?: boolean | undefined;
    targetKb?: number | undefined;
    rotationDegrees?: number | undefined;
    watermarkText?: string | undefined;
  } | undefined;
}

export interface KarudiContext {
  activeImageSrc?: string | undefined;
  activeCutoutSrc?: string | undefined;
  activeFilename?: string | undefined;
  pendingAction?: string | undefined;
}

/**
 * Normalizes text to handle common typos, abbreviations, and informal speech
 */
function normalizePrompt(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Analyzes user prompt and context to determine the real-world tool and model pipeline.
 * Built with fuzzy pattern matching to gracefully handle spelling mistakes like "convt file", "remov bg", etc.
 */
export function analyzeKarudiIntent(
  userText: string,
  hasAttachedFiles: boolean,
  context?: KarudiContext
): KarudiPlan {
  const norm = normalizePrompt(userText);
  const text = norm;
  const rawLower = userText.toLowerCase().trim();

  const isActivePdf = !!(
    (context?.activeFilename && context.activeFilename.toLowerCase().endsWith(".pdf")) ||
    (context?.activeImageSrc && context.activeImageSrc.startsWith("data:application/pdf"))
  );
  const isActiveImage = !!(
    (context?.activeImageSrc && !isActivePdf) ||
    (context?.activeFilename && /\.(png|jpe?g|webp|avif|gif)$/i.test(context.activeFilename))
  );

  // 1. ADD / STAGE BACKGROUND COLOR (when a cutout or image is available)
  const isBgColorRequest =
    (context?.activeCutoutSrc || context?.activeImageSrc) &&
    (/(add|change|set|put|make|apply)\s*(background|bg|backdrop)?\s*(color|colour|white|black|blue|red|green|blur)/i.test(norm) ||
      /(white|black|blue|red|green|blur|yellow|purple)\s*(background|bg|backdrop)/i.test(norm) ||
      /(background|bg)\s*(white|black|blue|red|green|blur)/i.test(norm));

  if (isBgColorRequest) {
    let color = "#ffffff";
    let bgType: "white" | "black" | "color" | "blur" = "color";

    if (norm.includes("white")) {
      color = "#ffffff";
      bgType = "white";
    } else if (norm.includes("black")) {
      color = "#000000";
      bgType = "black";
    } else if (norm.includes("blur")) {
      bgType = "blur";
    } else if (norm.includes("blue")) {
      color = "#3b82f6";
    } else if (norm.includes("red")) {
      color = "#ef4444";
    } else if (norm.includes("green")) {
      color = "#10b981";
    } else if (norm.includes("yellow")) {
      color = "#f59e0b";
    } else if (norm.includes("purple") || norm.includes("violet")) {
      color = "#8b5cf6";
    }

    return {
      action: "add_background_color",
      primaryModel: "ganga",
      secondaryModel: "brahmaputra",
      toolName: "Composite Background Staging",
      toolSlug: "remove-background",
      needsFile: false,
      summaryMessage: `Ganga and Brahmaputra will stage your transparent cutout onto a ${bgType === "blur" ? "blurred backdrop" : color + " background"}.`,
      stageOptions: { color, bgType },
    };
  }

  // 2. BACKGROUND REMOVAL (handles "remove background", "remov bg", "rmv background", "bg removal", "cutout", "remove", etc.)
  const isBgRemoval =
    context?.pendingAction === "remove_background" ||
    /(remov|rmv|remve|eraz|erase|cut\s*out|isolat|isolate|clean)\s*(the\s*)?(background|backg|bkg|bg|backdrop)\b/i.test(norm) ||
    /\b(background|bg)\s*(removal|remover|cutout|remove|erase)\b/i.test(norm) ||
    /(bg|background)\s*(hata\s*do|hatao|nikal\s*do|saaf\s*karo)/i.test(norm) ||
    /(piche\s*ka)\s*(hata\s*do|hatao|nikal\s*do)/i.test(norm) ||
    /^(bg\s*removal|remove\s*bg|remove\s*background|cutout|remove|remov|rmv|cut\s*out|transparent|erase|isolate|remove\s*it|remove\s*this|do\s*it|bg|remov\s*bg\s*plz|remove\s*bg\s*pls)$/i.test(norm) ||
    norm === "remove" ||
    norm === "remov" ||
    norm === "bg";

  if (isBgRemoval) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "remove_background",
      primaryModel: "ganga",
      toolName: "Background Removal",
      toolSlug: "remove-background",
      needsFile: !hasImage,
      filePrompt: "Please upload or share the image you want to remove the background from.",
      acceptedFileTypes: "image/png,image/jpeg,image/webp,image/avif",
      summaryMessage: "Removing background, please wait some time...",
    };
  }

  // 3. RESIZE IMAGE (Brahmaputra Engine)
  const isCorrection =
    /(no\s*i\s*meant|wait\s*i\s*meant|i\s*meant|actually\s*i\s*meant|change\s*to)\s*(\d+)\s*[xX×]\s*(\d+)/i.test(rawLower);
  const wxhMatch = userText.match(/(\d+)\s*[xX×]\s*(\d+)/);
  const singleDimMatch = norm.match(/(?:width|height|w|h|size)?\s*(\d{2,5})\s*(?:px|pixels?)/i);
  const isExplicitResize =
    /\b(resize|resizing|dimensions?|scale\s*to)\b/i.test(norm) ||
    isCorrection ||
    (!!wxhMatch && !/ratio/i.test(norm));

  if (isExplicitResize) {
    let targetW = 1000;
    let targetH = 1000;
    if (wxhMatch && wxhMatch[1] && wxhMatch[2]) {
      targetW = parseInt(wxhMatch[1], 10);
      targetH = parseInt(wxhMatch[2], 10);
    } else if (singleDimMatch && singleDimMatch[1]) {
      targetW = parseInt(singleDimMatch[1], 10);
      targetH = targetW;
    }

    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "resize_image",
      primaryModel: "brahmaputra",
      toolName: `Resize Image (${targetW}×${targetH}px)`,
      toolSlug: "resize-image",
      needsFile: !hasImage,
      filePrompt: `Please upload or share your image to resize to ${targetW}×${targetH}px.`,
      acceptedFileTypes: "image/*",
      summaryMessage: `Resizing your image to ${targetW}×${targetH}px with Brahmaputra engine…`,
      stageOptions: {
        targetWidth: targetW,
        targetHeight: targetH,
      },
    };
  }

  // 4. IMAGE COMPRESSION (Brahmaputra Engine)
  const isCompressRequest =
    /\b(compress|compression|compressing|shrink|reduce\s*(file\s*)?size|lighter\s*file)\b/i.test(norm) ||
    /(ise|isko|is\s*file\s*ko|photo\s*ko)\s*(chota|chhota|kam)\s*(karo|kar\s*do|karna)/i.test(norm) ||
    /(file\s*size|size)\s*(kam|chota|chhota)\s*(karo|kar\s*do|kijiye)/i.test(norm) ||
    /under\s*(\d+)\s*(kb|mb)/i.test(norm);

  if (isCompressRequest) {
    const kbMatch = norm.match(/(?:under|to|below|less\s*than)?\s*(\d+)\s*(kb|mb)/i);
    let targetKb: number | undefined;
    if (kbMatch && kbMatch[1]) {
      const val = parseInt(kbMatch[1], 10);
      targetKb = kbMatch[2]?.toLowerCase() === "mb" ? val * 1024 : val;
    }
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "compress_image",
      primaryModel: "brahmaputra",
      toolName: targetKb ? `Image Compressor (Under ${targetKb >= 1024 ? targetKb / 1024 + "MB" : targetKb + "KB"})` : "Image Compressor",
      toolSlug: "compress-image",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image to compress.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Brahmaputra engine is compressing your image to reduce file size…",
      stageOptions: { targetKb },
    };
  }

  // 5. SQUARE YOUR IMAGE (1:1) (Brahmaputra + Ganga)
  const isSquareRequest =
    /\b(square|1:1|instagram\s*square|make\s*(it\s*)?square)\b/i.test(norm);

  if (isSquareRequest) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "square_image",
      primaryModel: "brahmaputra",
      secondaryModel: "ganga",
      toolName: "Square Your Image (1:1 Tool)",
      toolSlug: "square-your-image",
      needsFile: !hasImage,
      filePrompt: "Please upload or share your photo to format into 1:1 square canvas.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Formatting image into 1:1 square canvas with Brahmaputra engine…",
    };
  }

  // 6. ROTATE IMAGE (Brahmaputra Engine)
  const isRotateRequest = /\b(rotate|turn|orientation)\b/i.test(norm);
  if (isRotateRequest) {
    const degMatch = norm.match(/(\d+)\s*(?:deg|degrees?)/i);
    let deg = 90;
    if (degMatch && degMatch[1]) {
      deg = parseInt(degMatch[1], 10);
    } else if (norm.includes("180")) {
      deg = 180;
    } else if (norm.includes("270")) {
      deg = 270;
    }
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "rotate_image",
      primaryModel: "brahmaputra",
      toolName: `Rotate Image (${deg}°)`,
      toolSlug: "rotate-image",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image to rotate.",
      acceptedFileTypes: "image/*",
      summaryMessage: `Rotating image by ${deg}° with Brahmaputra engine…`,
      stageOptions: { rotationDegrees: deg },
    };
  }

  // 7. CROP IMAGE (Brahmaputra Engine)
  const isCropRequest = /\b(crop|cropping)\b/i.test(norm);
  if (isCropRequest) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "crop_image",
      primaryModel: "brahmaputra",
      toolName: "Crop Image",
      toolSlug: "crop-image",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image to crop.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Opening crop tool workspace with Brahmaputra engine…",
    };
  }

  // 8. PDF TO IMAGE (handles "pdf to img", "pdf to image", "pdf to jpg", "pdf to png", "convert pdf to img", or conversational target formats when PDF is active)
  const isPdfToImage =
    /(pdf\s*(to|into|->|2|as)\s*(img|image|images|jpg|jpeg|png|webp|pic|picture|photos?))/i.test(norm) ||
    /(convert\s*pdf\s*(to|into|->|2)\s*(img|image|images|jpg|jpeg|png|webp))/i.test(norm) ||
    /(extract|render|save)\s*(img|image|images|pages?)\s*(from|out of|of)\s*pdf/i.test(norm) ||
    (isActivePdf &&
      (/^(jpg|jpeg|png|webp|image|images|pic|pictures?)$/i.test(norm) ||
        /^(to|into)\s*(jpg|jpeg|png|webp|image|images)$/i.test(norm) ||
        /^(convert|make|save|export)\s*(to|into)?\s*(jpg|jpeg|png|webp|image|images)$/i.test(norm) ||
        norm === "pdf to jpg" ||
        norm === "pdf to image"));

  if (isPdfToImage) {
    const hasFile = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "pdf_to_image",
      primaryModel: "brahmaputra",
      toolName: "PDF to Image Converter",
      toolSlug: "pdf-to-jpg",
      needsFile: !hasFile,
      filePrompt: "Please upload or share the PDF document you want to convert to images (JPG/PNG).",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Extracting pages from PDF and converting to high-resolution images…",
    };
  }

  // 9. PDF TO WORD (.DOCX)
  const isPdfToWord =
    /(pdf\s*(to|into|->|2|as)\s*(word|docx|doc|text))/i.test(norm) ||
    /(convert\s*pdf\s*(to|into|->|2)\s*(word|docx|doc))/i.test(norm) ||
    (isActivePdf &&
      (/^(word|docx|doc|text)$/i.test(norm) ||
        /^(to|into)\s*(word|docx|doc)$/i.test(norm) ||
        /^(convert|make|save|export)\s*(to|into)?\s*(word|docx|doc)$/i.test(norm)));

  if (isPdfToWord) {
    const hasFile = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "pdf_to_word",
      primaryModel: "narmada",
      secondaryModel: "brahmaputra",
      toolName: "PDF to Word (.docx) Converter",
      toolSlug: "pdf-to-word",
      needsFile: !hasFile,
      filePrompt: "Please upload or share the PDF document you want to convert to Word (.docx).",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Extracting text and compiling Word (.docx) document…",
    };
  }

  // 10. IMAGE / JPG TO WORD (.DOCX)
  const isWordToOther = /(word|docx|doc)\s*(to|into|->|2|as)\s*\w+/i.test(norm);
  const isWordConversion =
    !isPdfToWord &&
    !isWordToOther &&
    (/(img|image|images|jpg|jpeg|png|webp|scan|photo)\s*(to|into|->|2|as)\s*(word|docx|doc)/i.test(norm) ||
      /(convert|turn|make|save)\s*(this|the|my)?\s*(img|image|images|jpg|png|webp|scan)?\s*(to|into|->|2|as)\s*(word|docx)/i.test(norm) ||
      norm === "word" ||
      norm === "docx" ||
      norm === "doc" ||
      norm === "to word" ||
      norm === "to docx");

  if (isWordConversion) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "jpg_to_word",
      primaryModel: "narmada",
      secondaryModel: "brahmaputra",
      toolName: "Image to Word (.docx) Converter",
      toolSlug: "image-to-word",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image or document scan to convert to Word (.docx).",
      acceptedFileTypes: "image/png,image/jpeg,image/webp,image/avif,application/pdf",
      summaryMessage: "Extracting text via neural OCR and compiling Word (.docx) document…",
    };
  }

  // 11. IMAGE TO PDF
  const isPdfToOther = /(pdf\s*(to|into|->|2|as)\s*\w+)/i.test(norm);
  const isPdfConversion =
    !isPdfToOther &&
    !isPdfToImage &&
    !isPdfToWord &&
    (/(img|image|images|jpg|jpeg|png|webp|photo|pic|picture|doc|document|file)\s*(to|into|->|2|as)\s*pdf/i.test(norm) ||
      /(convert|turn|make|save|export)\s*(this|the|my)?\s*(img|image|images|jpg|png|webp|file)?\s*(to|into|->|2|as)\s*pdf/i.test(norm) ||
      /(img|image|photo)\s*ko\s*pdf\s*(bnado|bana\s*do|karo)/i.test(norm) ||
      /pdf\s*(bnado|bana\s*do)/i.test(norm) ||
      norm === "pdf" ||
      norm === "to pdf" ||
      norm === "into pdf" ||
      norm === "pdf format" ||
      norm === "pdf document" ||
      norm === "make pdf");

  if (isPdfConversion) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "image_to_pdf",
      primaryModel: "brahmaputra",
      toolName: "Image to PDF Converter",
      toolSlug: "image-to-pdf",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image or document to convert into PDF.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Converting image to high-quality PDF document…",
    };
  }

  // 12. EXPLICIT FORMAT CONVERSION (JPG / PNG / WebP) (Brahmaputra)
  const isExplicitFormatConversion =
    /(png|jpg|jpeg|webp|img|image|photo)\s*(to|into|->|2|as)\s*(jpg|jpeg|png|webp)/i.test(norm) ||
    /(convert|transcode|change|save|export)\s*(this|the|my)?\s*(img|image|photo|png|jpg|webp)?\s*(to|into|->|2|as)\s*(jpg|jpeg|png|webp)/i.test(norm) ||
    (!isActivePdf && (
      /^(jpg|jpeg|png|webp)$/i.test(norm) ||
      /^(to|into)\s*(jpg|jpeg|png|webp)$/i.test(norm) ||
      /^(convert|convt|cnvrt)\s*(to\s*)?(jpg|jpeg|png|webp)$/i.test(norm)
    ));

  if (isExplicitFormatConversion) {
    const targetMatch = norm.match(/(?:to|into|->|2|as)\s*(jpg|jpeg|png|webp)/i);
    let targetExt = "jpg";
    if (targetMatch && targetMatch[1]) {
      targetExt = targetMatch[1].toLowerCase();
    } else if (/(\bjpg\b|\bjpeg\b)/i.test(norm)) {
      targetExt = "jpg";
    } else if (/\bpng\b/i.test(norm)) {
      targetExt = "png";
    } else if (/\bwebp\b/i.test(norm)) {
      targetExt = "webp";
    }
    const targetFormat: "image/jpeg" | "image/png" | "image/webp" =
      targetExt === "png" ? "image/png" : targetExt === "webp" ? "image/webp" : "image/jpeg";

    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    const extLabel = targetFormat === "image/png" ? "PNG" : targetFormat === "image/webp" ? "WebP" : "JPG";
    return {
      action: "convert_format",
      primaryModel: "brahmaputra",
      toolName: `Image to ${extLabel} Converter`,
      toolSlug: targetFormat === "image/jpeg" ? "convert-to-jpg" : targetFormat === "image/png" ? "convert-to-png" : "convert-to-webp",
      needsFile: !hasImage,
      filePrompt: `Please upload or share your image to convert to ${extLabel}.`,
      acceptedFileTypes: "image/*",
      summaryMessage: `Converting image to high-quality ${extLabel} format with Brahmaputra…`,
      stageOptions: { targetFormat },
    };
  }

  // 13. IMAGE TO BINARY / BASE64 / HEX (.TXT FILE) (Brahmaputra)
  const isBinaryConversion =
    /(image|img|photo|picture|file)?\s*(to|into|->|2|as)?\s*(binary|bin|base64|b64|hex|byte|bytes|ascii85|bitstream)/i.test(norm) ||
    /binary\s*(file|txt|text|data|string|code|export)?/i.test(norm) ||
    /give\s*(me)?\s*(a|the)?\s*binary/i.test(norm) ||
    norm === "binary" ||
    norm === "bin" ||
    norm === "base64" ||
    norm === "binary file" ||
    norm === "binary txt" ||
    norm === "binary text" ||
    norm === "image to binary";

  if (isBinaryConversion) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "image_to_binary",
      primaryModel: "brahmaputra",
      toolName: "Image to Binary (.txt) Generator",
      toolSlug: "image-to-binary",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image to encode into binary bitstream (.txt).",
      acceptedFileTypes: "image/*",
      summaryMessage: "Brahmaputra engine is encoding image bytes into binary bitstream and generating .txt file…",
    };
  }

  // 14. OCR TEXT EXTRACTION
  if (
    text.includes("ocr") ||
    text.includes("extract text") ||
    text.includes("read text") ||
    text.includes("image to text") ||
    text.includes("scan text")
  ) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "image_to_text",
      primaryModel: "narmada",
      toolName: "Image to Text (OCR) Engine",
      toolSlug: "image-to-text-ocr",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image with text to extract with OCR.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Extracting text via neural OCR…",
    };
  }

  // 15. IMAGE ANALYSIS & COLOR PALETTE
  if (
    text.includes("analyze") ||
    text.includes("color palette") ||
    text.includes("palette") ||
    text.includes("colors") ||
    text.includes("metadata") ||
    text.includes("inspect image")
  ) {
    const hasImage = hasAttachedFiles || !!context?.activeImageSrc;
    return {
      action: "analyze_image",
      primaryModel: "saraswati",
      toolName: "Image Analysis & Research Suite",
      toolSlug: "color-picker-from-image",
      needsFile: !hasImage,
      filePrompt: "Please upload or share an image to inspect color palette and metadata.",
      acceptedFileTypes: "image/*",
      summaryMessage: "Analyzing color palette and metadata…",
    };
  }

  // 15.5 PDF TOOLS INTENT DETECTION
  // Merge PDF
  const isMergePdf =
    /(merge|combine|join|bundle)\s*(the\s*)?(pdfs?|pdf\s*files?|documents?)/i.test(norm) ||
    /pdf\s*(merge|combine|join)/i.test(norm) ||
    /(pdf|pdfs)\s*(jodo|milao|combine\s*karo)/i.test(norm) ||
    norm === "merge pdf" || norm === "combine pdf";
  if (isMergePdf) {
    return {
      action: "merge_pdf",
      primaryModel: "brahmaputra",
      toolName: "Merge PDF",
      toolSlug: "merge-pdf",
      needsFile: !hasAttachedFiles,
      filePrompt: "Please upload or select the PDF files you want to merge together.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Combining your PDF files in sequence with Brahmaputra engine…",
    };
  }

  // Split PDF
  const isSplitPdf =
    /(split|separate|divide|cut|extract\s*pages?)\s*(the\s*)?(pdfs?|pdf\s*file|document)/i.test(norm) ||
    /pdf\s*(split|separate|tukde)/i.test(norm) ||
    norm === "split pdf";
  if (isSplitPdf) {
    return {
      action: "split_pdf",
      primaryModel: "brahmaputra",
      toolName: "Split PDF",
      toolSlug: "split-pdf",
      needsFile: !hasAttachedFiles && !isActivePdf,
      filePrompt: "Please upload the PDF document you want to split into separate pages.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Splitting PDF pages with Brahmaputra engine…",
    };
  }

  // Compress PDF
  const isCompressPdf =
    (isActivePdf && isCompressRequest) ||
    /(compress|reduce|shrink|small)\s*(the\s*)?(pdf|pdf\s*file|pdf\s*size)/i.test(norm) ||
    /pdf\s*(compress|chota|chhota)/i.test(norm);
  if (isCompressPdf) {
    return {
      action: "compress_pdf",
      primaryModel: "brahmaputra",
      toolName: "Compress PDF",
      toolSlug: "compress-pdf",
      needsFile: !hasAttachedFiles && !isActivePdf,
      filePrompt: "Please upload the PDF document you want to compress.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Compressing and optimizing your PDF document…",
    };
  }

  // Protect PDF (Password Lock)
  const isProtectPdf =
    /(protect|lock|password\s*protect|encrypt)\s*(the\s*)?(pdf|document)/i.test(norm) ||
    /pdf\s*(lock|protect|password)/i.test(norm);
  if (isProtectPdf) {
    return {
      action: "protect_pdf",
      primaryModel: "saraswati",
      toolName: "Protect PDF (Password Lock)",
      toolSlug: "protect-pdf",
      needsFile: !hasAttachedFiles && !isActivePdf,
      filePrompt: "Please upload the PDF document you want to encrypt with a password.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Opening security suite to password-protect your PDF document…",
    };
  }

  // Unlock PDF
  const isUnlockPdf =
    /(unlock|remove\s*password|decrypt)\s*(the\s*)?(pdf|document)/i.test(norm) ||
    /pdf\s*(unlock|password\s*hatao)/i.test(norm);
  if (isUnlockPdf) {
    return {
      action: "unlock_pdf",
      primaryModel: "saraswati",
      toolName: "Unlock PDF",
      toolSlug: "unlock-pdf",
      needsFile: !hasAttachedFiles && !isActivePdf,
      filePrompt: "Please upload the password-protected PDF document you want to unlock.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Opening unlock utility to remove PDF password security…",
    };
  }

  // Sign PDF
  const isSignPdf =
    /(sign|signature|add\s*signature|sign\s*this)\s*(the\s*)?(pdf|document)?/i.test(norm) ||
    /pdf\s*(sign|signature)/i.test(norm);
  if (isSignPdf) {
    return {
      action: "sign_pdf",
      primaryModel: "narmada",
      toolName: "Sign PDF",
      toolSlug: "sign-pdf",
      needsFile: !hasAttachedFiles && !isActivePdf,
      filePrompt: "Please upload the PDF document you want to electronically sign.",
      acceptedFileTypes: "application/pdf,.pdf",
      summaryMessage: "Opening digital signature workspace for your PDF…",
    };
  }

  // Invoices (Create Invoice / E-Invoice)
  const isInvoice =
    /(create|make|generate|build)\s*(an?\s*)?(invoice|bill|e-invoice|einvoice)/i.test(norm) ||
    /(invoice|bill)\s*(banana|bana\s*do|maker|generator)/i.test(norm) ||
    norm === "invoice" || norm === "create invoice";
  if (isInvoice) {
    return {
      action: "create_invoice",
      primaryModel: "narmada",
      secondaryModel: "brahmaputra",
      toolName: "Create Invoice (PDF)",
      toolSlug: "create-invoice",
      needsFile: false,
      summaryMessage: "Launching interactive visual invoice builder…",
    };
  }

  // 16. GENERAL FILE CONVERSION FALLBACK (Only when intent is strictly generic conversion with no specific parameters)
  const isGeneralFileConvert =
    /^(convt|cnvrt|convr|cnvt|cnvert|covnert|convert|conversion|transcode)(\s*(file|files|doc|format|image|img))?$/i.test(norm) ||
    norm === "convert" ||
    norm === "convt" ||
    norm === "cnvrt" ||
    norm === "convert file" ||
    norm === "convt file" ||
    (hasAttachedFiles && (!norm || norm.length === 0 || norm === "convert"));

  if (isGeneralFileConvert) {
    const hasFile = hasAttachedFiles;
    const isDocx = !!(
      (context?.activeFilename && context.activeFilename.toLowerCase().endsWith(".docx")) ||
      (context?.activeImageSrc && context.activeImageSrc.startsWith("data:application/vnd.openxmlformats-officedocument"))
    );
    const suiteName = isActivePdf && hasFile
      ? "PDF Conversion Suite"
      : isDocx && hasFile
      ? "Word Document Suite"
      : hasFile
      ? "Universal File & Image Converter"
      : "Universal File & Format Converter";
    const summaryMsg = hasFile
      ? (isActivePdf
          ? "PDF loaded. Select whether to convert to JPG/Images, Word (.docx), or OCR text extraction."
          : isDocx
          ? "Word document loaded. Select whether to convert to PDF or extract text."
          : "Image loaded. Select whether to convert to PDF, Word (.docx), or Remove Background.")
      : "Please upload your file to convert (PDF, Word, or Image).";

    return {
      action: "convert_file_general",
      primaryModel: "brahmaputra",
      secondaryModel: "narmada",
      toolName: suiteName,
      toolSlug: "convert-to-jpg",
      needsFile: !hasFile,
      filePrompt: "Please upload or share your file to convert.",
      acceptedFileTypes: "image/*,application/pdf,.docx",
      summaryMessage: summaryMsg,
    };
  }

  // 10. GENERAL CHAT (Casual chat, questions, conversions, greetings)
  return {
    action: "general_chat",
    primaryModel: "karudi",
    toolName: "Karudi Universal Assistant",
    toolSlug: "",
    needsFile: false,
    summaryMessage: "",
  };
}

// ============================================================================
// TOOL EXECUTORS (Zero duplicate code, calling actual existing tool engines)
// ============================================================================

/**
 * 1. Background Removal Tool Executor (Ganga Model)
 */
export async function executeRemoveBackground(imageSrc: string): Promise<{
  cutoutSrc: string;
  source: "python_neural" | "client_canvas";
}> {
  try {
    const res = await fetch("/api/remove-bg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Image: imageSrc,
        model: "birefnet-general-lite",
        alphaMatting: true,
        smoothEdge: 0.5,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.base64Image) {
        return { cutoutSrc: data.base64Image, source: "python_neural" };
      }
    }
  } catch (e) {
    console.warn("Python backend unreachable, using high-speed client matting engine:", e);
  }

  // Seamless client canvas fallback (already exported from RemovalProcess.tsx)
  const clientCutout = await removeBackgroundClientCanvas(imageSrc);
  return { cutoutSrc: clientCutout, source: "client_canvas" };
}

/**
 * 2. Background Compositing Tool Executor (Ganga + Brahmaputra)
 */
export async function executeCompositeBackground(
  cutoutSrc: string,
  bgType: "white" | "black" | "color" | "blur",
  hexColor = "#ffffff",
  originalSrc?: string
): Promise<string> {
  return new Promise((resolve) => {
    const cutoutImg = new Image();
    cutoutImg.crossOrigin = "anonymous";
    cutoutImg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cutoutImg.width;
      canvas.height = cutoutImg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(cutoutSrc);

      if (bgType === "blur" && originalSrc) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
          ctx.save();
          ctx.filter = "blur(28px)";
          const scale = 1.15;
          const bgW = canvas.width * scale;
          const bgH = canvas.height * scale;
          ctx.drawImage(bgImg, (canvas.width - bgW) / 2, (canvas.height - bgH) / 2, bgW, bgH);
          ctx.restore();
          ctx.drawImage(cutoutImg, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        bgImg.onerror = () => {
          ctx.fillStyle = hexColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(cutoutImg, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        bgImg.src = originalSrc;
        return;
      }

      ctx.fillStyle = bgType === "white" ? "#ffffff" : bgType === "black" ? "#000000" : hexColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cutoutImg, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    cutoutImg.onerror = () => resolve(cutoutSrc);
    cutoutImg.src = cutoutSrc;
  });
}

/**
 * 3. Image to Word (.docx) Converter Tool Executor (Narmada + Brahmaputra)
 */
export async function executeImageToWord(
  imageSrc: string,
  filename = "converted-document"
): Promise<{
  docxBlob: Blob;
  docxUrl: string;
  textSnippet: string;
  lineCount: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);

      // Narmada Model: Run OCR
      let textLines: string[] = [];
      try {
        const ocrRes = await performAdvancedOcr(canvas, {
          contrastMode: "auto",
          language: "eng",
        });
        textLines = ocrRes.textLines.filter((l) => l.trim().length > 0);
      } catch (e) {
        console.warn("OCR pass fallback:", e);
      }

      // Brahmaputra Model: Build Word .docx file
      let docxBlob: Blob;
      if (textLines.length > 0) {
        docxBlob = buildEditableDocxFromOcr(textLines, {
          mode: "text_and_image",
          imageDataUrl: imageSrc,
          imgW: img.width,
          imgH: img.height,
          filename,
        });
      } else {
        docxBlob = buildDocxFromImage(imageSrc, img.width, img.height, filename);
      }

      const docxUrl = URL.createObjectURL(docxBlob);
      const textSnippet = textLines.slice(0, 6).join("\n") || "(Scanned document image embedded)";
      resolve({
        docxBlob,
        docxUrl,
        textSnippet,
        lineCount: textLines.length,
      });
    };
    img.src = imageSrc;
  });
}

/**
 * 3b. Image to PDF Tool Executor (Brahmaputra Model)
 */
export async function executeImageToPdf(
  imageSrc: string,
  filename = "document.pdf"
): Promise<{
  pdfBlob: Blob;
  filename: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        const imgW = img.naturalWidth || img.width || 800;
        const imgH = img.naturalHeight || img.height || 600;
        c.width = imgW;
        c.height = imgH;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);

        const jpegDataUrl = c.toDataURL("image/jpeg", 0.95);
        const base64 = jpegDataUrl.split(",")[1] ?? "";
        const raw = atob(base64);
        const imgBytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) imgBytes[i] = raw.charCodeAt(i) & 0xff;

        const pageW = Math.round((imgW * 72) / 96);
        const pageH = Math.round((imgH * 72) / 96);

        const enc = new TextEncoder();
        const chunks: Uint8Array[] = [];
        const offsets: number[] = [];
        let currentOffset = 0;

        const pushString = (str: string) => {
          const bytes = enc.encode(str);
          chunks.push(bytes);
          currentOffset += bytes.length;
        };
        const pushBytes = (bytes: Uint8Array) => {
          chunks.push(bytes);
          currentOffset += bytes.length;
        };
        const recordObj = (str: string) => {
          offsets.push(currentOffset);
          pushString(str);
        };

        pushString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
        recordObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        recordObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        recordObj(
          `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /ProcSet [/PDF /ImageC /ImageI] /XObject << /Im1 5 0 R >> >> >>\nendobj\n`
        );
        const streamContent = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im1 Do\nQ\n`;
        const streamBytes = enc.encode(streamContent);
        recordObj(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream\nendobj\n`);
        recordObj(
          `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
        );
        pushBytes(imgBytes);
        pushString("\nendstream\nendobj\n");

        const startXref = currentOffset;
        pushString("xref\n0 6\n0000000000 65535 f \n");
        for (let i = 0; i < offsets.length; i++) {
          pushString(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
        }
        pushString(
          `trailer\n<< /Size 6 /Root 1 0 R /Info << /Producer (Karudi Universal PDF Engine) >> >>\nstartxref\n${startXref}\n%%EOF\n`
        );

        const pdfBlob = new Blob(chunks as any[], { type: "application/pdf" });
        const pdfName = filename.replace(/\.[^.]+$/, "") + ".pdf";
        resolve({ pdfBlob, filename: pdfName });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for PDF conversion"));
    img.src = imageSrc;
  });
}

/**
 * 4. Format Transcoding Tool Executor (Brahmaputra)
 */
export async function executeConvertFormat(
  imageSrc: string,
  targetFormat: "image/jpeg" | "image/png" | "image/webp"
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL(targetFormat, 0.98));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * 5. Deep Image & Palette Analysis Tool Executor (Saraswati)
 */
export async function executeAnalyzeImage(imageSrc: string, filename = "image"): Promise<{
  dimensions: string;
  aspectRatio: string;
  palette: string[];
  approxBytes: number;
  report: string;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      const aspect = `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;

      // Sample colors
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(100, w);
      canvas.height = Math.min(100, h);
      const ctx = canvas.getContext("2d");
      const palette: string[] = [];

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorSet = new Set<string>();

        for (let i = 0; i < data.length; i += 24) {
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const a = data[i + 3] ?? 255;
          if (a > 50) {
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            colorSet.add(hex);
            if (colorSet.size >= 6) break;
          }
        }
        palette.push(...Array.from(colorSet));
      }

      const approxBytes = Math.round((imageSrc.length * 3) / 4);
      const report = `**Image Specifications**:\n- **Dimensions**: ${w} × ${h} px (${aspect} aspect)\n- **Color Profile**: sRGB 8-bit\n- **Dominant Palette**: ${palette.join(", ")}`;

      resolve({
        dimensions: `${w} × ${h} px`,
        aspectRatio: aspect,
        palette: palette.length > 0 ? palette : ["#ffffff", "#000000"],
        approxBytes,
        report,
      });
    };
    img.src = imageSrc;
  });
}

/**
 * 6. PDF to Image Extractor / Transcoder (Brahmaputra)
 */
export async function executePdfToImages(
  pdfSrc: string,
  filename = "document.pdf",
  scale = 2.0,
  targetFormat: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<{ images: string[]; totalPages: number; firstImage: string; format: "jpg" | "png" | "webp" }> {
  const pdfjsLib = await import("pdfjs-dist");
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "6.3.289"}/build/pdf.worker.min.mjs`;
    }
  } catch {}

  let dataUint8: Uint8Array;
  if (pdfSrc.startsWith("data:")) {
    const base64 = pdfSrc.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    dataUint8 = bytes;
  } else {
    const res = await fetch(pdfSrc);
    const buf = await res.arrayBuffer();
    dataUint8 = new Uint8Array(buf);
  }

  const loadingTask = pdfjsLib.getDocument({
    data: dataUint8,
    useSystemFonts: true,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "6.3.289"}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "6.3.289"}/standard_fonts/`,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = Math.max(1, pdfDoc.numPages || 1);
  const images: string[] = [];
  const ext: "jpg" | "png" | "webp" = targetFormat === "image/png" ? "png" : targetFormat === "image/webp" ? "webp" : "jpg";

  const renderCount = Math.min(totalPages, 5);
  for (let p = 1; p <= renderCount; p++) {
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
    } as any).promise;

    images.push(canvas.toDataURL(targetFormat, 0.95));
  }

  return {
    images,
    totalPages,
    firstImage: images[0] || "",
    format: ext,
  };
}

/**
 * 7. Image Format Transcoder / Converter (Brahmaputra)
 * Converts any image (PNG, WebP, JPG, etc.) into JPG, PNG, or WebP with canvas rendering.
 */
export async function executeConvertImageFormat(
  imageSrc: string,
  filename = "image.png",
  targetFormat: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.95
): Promise<{ dataUrl: string; format: "jpg" | "png" | "webp"; filename: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create canvas 2D context"));
          return;
        }

        // If target is JPEG/JPG, fill background white so transparent PNG alpha becomes clean white
        if (targetFormat === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(targetFormat, quality);
        const ext = targetFormat === "image/png" ? "png" : targetFormat === "image/webp" ? "webp" : "jpg";
        const baseName = filename.replace(/\.[^.]+$/, "") || "converted_image";
        resolve({
          dataUrl,
          format: ext,
          filename: `${baseName}.${ext}`,
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load source image for format conversion"));
    img.src = imageSrc;
  });
}

/**
 * 8. Image to Binary Bitstream (.txt) Generator (Brahmaputra)
 * Encodes image bytes into standard 8-bit binary strings (01010101...) and generates a downloadable .txt file.
 */
export async function executeImageToBinary(
  imageSrc: string,
  filename = "image.png"
): Promise<{
  binaryText: string;
  previewText: string;
  textBlob: Blob;
  binBlob: Blob;
  txtFilename: string;
  binFilename: string;
  totalBytes: number;
  totalBits: number;
}> {
  let base64Data = imageSrc;
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1] || "";
  }
  const binaryStr = atob(base64Data);
  const totalBytes = binaryStr.length;
  const bytes = new Uint8Array(totalBytes);
  for (let i = 0; i < totalBytes; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const binChunks: string[] = [];
  for (let i = 0; i < totalBytes; i++) {
    binChunks.push(bytes[i]!.toString(2).padStart(8, "0"));
  }

  const baseName = filename.replace(/\.[^.]+$/, "") || "image";
  const txtFilename = `${baseName}_binary.txt`;
  const binFilename = `${baseName}.bin`;

  const header = `// ============================================================================\n// Image to Binary Bitstream Export\n// Original File: ${filename}\n// Total Bytes: ${totalBytes.toLocaleString()} bytes\n// Total Bits: ${(totalBytes * 8).toLocaleString()} bits\n// Encoding: 8-Bit Binary (0/1)\n// Engine: Brahmaputra Transcoder (bg. platform)\n// ============================================================================\n\n`;

  const lines: string[] = [];
  for (let i = 0; i < binChunks.length; i += 8) {
    lines.push(binChunks.slice(i, i + 8).join(" "));
  }
  const fullText = header + lines.join("\n");

  const previewText =
    binChunks.slice(0, 64).join(" ") +
    (binChunks.length > 64 ? `\n\n... [Showing first 64 bytes of ${totalBytes.toLocaleString()} total bytes. Download the .txt file for full bitstream]` : "");

  const textBlob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  const binBlob = new Blob([bytes], { type: "application/octet-stream" });

  return {
    binaryText: fullText,
    previewText,
    textBlob,
    binBlob,
    txtFilename,
    binFilename,
    totalBytes,
    totalBits: totalBytes * 8,
  };
}

/**
 * 9. Image Resizer Tool Executor (Brahmaputra)
 * Scales an image to exact targetWidth and targetHeight on HTML5 Canvas.
 */
export async function executeResizeImage(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  format: "image/png" | "image/jpeg" = "image/png"
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(targetWidth));
        canvas.height = Math.max(1, Math.round(targetHeight));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(format, 0.95);
        resolve({
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          originalWidth: origW,
          originalHeight: origH,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = imageSrc;
  });
}

/**
 * 10. Image Compressor Tool Executor (Brahmaputra)
 * Compresses an image with progressive quality degradation to hit target size.
 */
export async function executeCompressImage(
  imageSrc: string,
  quality = 0.75,
  targetKb?: number
): Promise<{
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0);

        let q = quality;
        let dataUrl = canvas.toDataURL("image/jpeg", q);
        let bytes = Math.round((dataUrl.length * 3) / 4);

        if (targetKb && targetKb > 0) {
          const targetBytes = targetKb * 1024;
          let attempts = 0;
          while (bytes > targetBytes && q > 0.15 && attempts < 5) {
            attempts++;
            q -= 0.15;
            dataUrl = canvas.toDataURL("image/jpeg", Math.max(0.1, q));
            bytes = Math.round((dataUrl.length * 3) / 4);
          }
        }

        const origBytes = Math.round((imageSrc.length * 3) / 4);
        resolve({
          dataUrl,
          originalBytes: origBytes,
          compressedBytes: bytes,
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = imageSrc;
  });
}

/**
 * 11. Rotate Image Tool Executor (Brahmaputra)
 */
export async function executeRotateImage(
  imageSrc: string,
  degrees = 90
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const rad = (degrees * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        canvas.width = Math.round(origW * cos + origH * sin);
        canvas.height = Math.round(origW * sin + origH * cos);

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -origW / 2, -origH / 2);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for rotation"));
    img.src = imageSrc;
  });
}

/**
 * 12. Square Image Tool Executor (Brahmaputra + Ganga)
 */
export async function executeSquareImage(
  imageSrc: string,
  bgType: "blur" | "white" | "black" = "blur"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        const size = Math.max(origW, origH);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        if (bgType === "blur") {
          ctx.save();
          ctx.filter = "blur(28px)";
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();
        } else {
          ctx.fillStyle = bgType === "white" ? "#ffffff" : "#000000";
          ctx.fillRect(0, 0, size, size);
        }

        const dx = (size - origW) / 2;
        const dy = (size - origH) / 2;
        ctx.drawImage(img, dx, dy, origW, origH);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for square formatting"));
    img.src = imageSrc;
  });
}



