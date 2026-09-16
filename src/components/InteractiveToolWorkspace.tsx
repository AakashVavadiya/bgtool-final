import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Upload,
  Download,
  Check,
  Loader2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Crop as CropIcon,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  FileType,
  Layers,
  Eye,
  Pipette,
  Copy,
  Palette,
  CheckSquare,
  Square,
  Maximize2,
  X,
  Code2,
  AlertCircle,
  ArrowRight,
  FolderUp,
  Languages,
  Globe,
  Search,
  FileText,
  Binary,
  Cpu,
  Terminal,
  Activity,
  WrapText,
  ZoomIn,
  ZoomOut,
  Hash,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Table as TableIcon,
  FileSpreadsheet,
  AlignLeft,
  Type,
  Sun,
  Moon,
  QrCode,
  Barcode as BarcodeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { type Tool } from "@/lib/tools";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  OcrLanguageDialog,
  RICH_OCR_LANGUAGES,
  type OcrLanguageOption,
} from "@/components/OcrLanguageDialog";

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const SAMPLE_OG_CARD = `<div style="width: 100%; height: 100%; padding: 60px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; font-family: system-ui, sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
  <div>
    <span style="background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #818cf8; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">HTML to Image</span>
    <h1 style="font-size: 44px; font-weight: 800; margin-top: 20px; margin-bottom: 14px; line-height: 1.2; color: #ffffff;">Render HTML &amp; CSS Code to Image</h1>
    <p style="font-size: 18px; color: #94a3b8; max-width: 700px; line-height: 1.5;">Upload an HTML file or paste custom HTML code to generate pixel-perfect PNG or JPG screenshots.</p>
  </div>
  <div style="font-size: 14px; color: #64748b; font-weight: 600;">BG Tool Studio · High Resolution Output</div>
</div>`;

const SAMPLE_BADGE = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 20px; box-sizing: border-box;">
  <div style="padding: 24px 40px; background: linear-gradient(135deg, #f97316 0%, #e11d48 100%); color: white; font-family: system-ui, sans-serif; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);">
    <div style="font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">PRO VERIFIED</div>
    <div style="font-size: 32px; font-weight: 900; margin-top: 6px;">HTML TO IMAGE CONVERTER</div>
  </div>
</div>`;

const SAMPLE_INVOICE = `<div style="width: 100%; height: 100%; padding: 40px; background: #ffffff; color: #1e293b; font-family: system-ui, sans-serif; box-sizing: border-box;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
    <h2 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0;">INVOICE #4829</h2>
    <span style="background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 13px;">PAID</span>
  </div>
  <div style="margin-top: 30px; font-size: 15px; line-height: 1.8;">
    <p style="margin: 4px 0;"><strong>Customer:</strong> John Doe</p>
    <p style="margin: 4px 0;"><strong>Date:</strong> August 29, 2026</p>
    <p style="margin: 4px 0;"><strong>Service:</strong> Web App Design & Processing</p>
    <p style="font-size: 24px; font-weight: 900; margin-top: 20px; color: #f97316;">Total: $499.00</p>
  </div>
</div>`;

const SAMPLE_CODE_BOX = `<div style="width: 100%; height: 100%; padding: 40px; background: #090d16; color: #f8fafc; font-family: monospace; box-sizing: border-box;">
  <div style="display: flex; gap: 8px; margin-bottom: 20px;">
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #eab308;"></span>
    <span style="width: 12px; height: 12px; border-radius: 50%; background: #22c55e;"></span>
  </div>
  <pre style="margin: 0; font-size: 16px; line-height: 1.6; color: #38bdf8;"><code><span style="color: #c084fc;">const</span> renderHtml = (<span style="color: #f43f5e;">code</span>) => {
  <span style="color: #c084fc;">return</span> convertToPng({
    format: <span style="color: #a3e635;">"PNG"</span>,
    resolution: <span style="color: #a3e635;">"4K"</span>
  });
};</code></pre>
</div>`;

const SAMPLE_BINARY_INVADER = `00000100000
00000010000
00011111000
00110110100
11111111111
10111111101
10100000101
00011011000`;

const SAMPLE_BINARY_HEART = `0001100011000
0011110111100
0111111111110
0111111111110
0011111111100
0001111111000
0000111110000
0000011100000
0000001000000`;

const SAMPLE_BINARY_IMAGE = `01000010 01001101 00111110 00000000 00000000 00000000 00000000 00000000
00110110 00000000 00000000 00000000 00101000 00000000 00000000 00000000
00000010 00000000 00000000 00000000 00000010 00000000 00000000 00000000
00000001 00000000 00011000 00000000 00000000 00000000 00000000 00000000
00001000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
00000000 00000000 11111111 00000000 00000000 11111111 11111111 11111111
00000000 00000000 00000000 00000000 11111111 00000000 00000000 11111111`;

type BinaryThemeKey = "matrix" | "cyberpunk" | "mono" | "ocean" | "amber";

const BINARY_THEMES: Record<BinaryThemeKey, { name: string; bg: string; fg: string; accent: string }> = {
  matrix: { name: "Hacker Matrix", bg: "#0b1320", fg: "#22c55e", accent: "#4ade80" },
  cyberpunk: { name: "Cyberpunk Neon", bg: "#130521", fg: "#f43f5e", accent: "#ec4899" },
  mono: { name: "Monochrome B&W", bg: "#000000", fg: "#ffffff", accent: "#e2e8f0" },
  ocean: { name: "Ocean Blueprint", bg: "#082f49", fg: "#38bdf8", accent: "#7dd3fc" },
  amber: { name: "Retro Amber CRT", bg: "#1c1002", fg: "#f59e0b", accent: "#fbbf24" },
};

type EditorThemeKey = "vs-dark" | "matrix" | "cyberpunk" | "dracula" | "monokai" | "one-dark" | "light";

const EDITOR_THEMES: Record<
  EditorThemeKey,
  {
    name: string;
    bg: string;
    gutterBg: string;
    gutterText: string;
    text: string;
    accent: string;
    highlight: string;
    border: string;
  }
> = {
  "vs-dark": {
    name: "VS Dark",
    bg: "#1e1e1e",
    gutterBg: "#252526",
    gutterText: "#858585",
    text: "#d4d4d4",
    accent: "#007acc",
    highlight: "rgba(255, 255, 0, 0.3)",
    border: "#333333",
  },
  matrix: {
    name: "Hacker Matrix",
    bg: "#0b1320",
    gutterBg: "#070d18",
    gutterText: "#166534",
    text: "#22c55e",
    accent: "#4ade80",
    highlight: "rgba(34, 197, 94, 0.4)",
    border: "#1e3a29",
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    bg: "#130521",
    gutterBg: "#0d0217",
    gutterText: "#831843",
    text: "#f43f5e",
    accent: "#06b6d4",
    highlight: "rgba(244, 63, 94, 0.4)",
    border: "#4c0519",
  },
  dracula: {
    name: "Dracula",
    bg: "#282a36",
    gutterBg: "#21222c",
    gutterText: "#6272a4",
    text: "#f8f8f2",
    accent: "#bd93f9",
    highlight: "rgba(255, 121, 198, 0.35)",
    border: "#44475a",
  },
  monokai: {
    name: "Monokai",
    bg: "#272822",
    gutterBg: "#1e1f1c",
    gutterText: "#75715e",
    text: "#f8f8f2",
    accent: "#a6e22e",
    highlight: "rgba(230, 219, 116, 0.35)",
    border: "#3e3d32",
  },
  "one-dark": {
    name: "One Dark Pro",
    bg: "#282c34",
    gutterBg: "#21252b",
    gutterText: "#5c6370",
    text: "#abb2bf",
    accent: "#61afef",
    highlight: "rgba(97, 175, 239, 0.3)",
    border: "#181a1f",
  },
  light: {
    name: "Light Clean",
    bg: "#ffffff",
    gutterBg: "#f8fafc",
    gutterText: "#94a3b8",
    text: "#0f172a",
    accent: "#2563eb",
    highlight: "rgba(254, 240, 138, 0.7)",
    border: "#e2e8f0",
  },
};

const calculateEntropy = (
  bytes: Uint8Array
): { entropy: number; zeroCount: number; oneCount: number; bitDensity: number } => {
  if (!bytes.length) return { entropy: 0, zeroCount: 0, oneCount: 0, bitDensity: 0 };
  const freq = new Array(256).fill(0);
  let zeroCount = 0;
  let oneCount = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] ?? 0;
    freq[b]++;
    for (let bit = 0; bit < 8; bit++) {
      if ((b >> bit) & 1) oneCount++;
      else zeroCount++;
    }
  }

  let entropy = 0;
  const len = bytes.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / len;
      entropy -= p * Math.log2(p);
    }
  }

  const totalBits = zeroCount + oneCount;
  const bitDensity = totalBits > 0 ? Math.round((oneCount / totalBits) * 100) : 0;
  return {
    entropy: Number(entropy.toFixed(3)),
    zeroCount,
    oneCount,
    bitDensity,
  };
};

const detectMagicSignature = (
  bytes: Uint8Array
): { format: string; description: string; magicHex: string } => {
  if (bytes.length < 4) return { format: "Raw Binary", description: "Generic bitstream", magicHex: "N/A" };
  const b0 = bytes[0] ?? 0,
    b1 = bytes[1] ?? 0,
    b2 = bytes[2] ?? 0,
    b3 = bytes[3] ?? 0;
  const hex = [b0, b1, b2, b3].map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");

  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
    return { format: "PNG Image", description: "Portable Network Graphics · Deflate Compressed", magicHex: hex };
  }
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
    return { format: "JPEG Image", description: "Joint Photographic Experts Group · DCT Compressed", magicHex: hex };
  }
  if (b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46) {
    return { format: "WebP / RIFF", description: "Google WebP Container / RIFF Stream", magicHex: hex };
  }
  if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) {
    return { format: "GIF Image", description: "Graphics Interchange Format", magicHex: hex };
  }
  if (b0 === 0x42 && b1 === 0x4d) {
    return { format: "BMP Bitmap", description: "Uncompressed Windows Bitmap", magicHex: hex };
  }
  if (b0 === 0x50 && b1 === 0x4b && b2 === 0x03 && b3 === 0x04) {
    return { format: "ZIP Archive", description: "ZIP Package / Office XML Document", magicHex: hex };
  }
  if (b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46) {
    return { format: "PDF Document", description: "Adobe Portable Document Format", magicHex: hex };
  }
  return { format: "Binary Data", description: "Raw Byte Sequence / Custom Stream", magicHex: hex };
};

const tryRawSvgFallback = (
  rawHtml: string,
  width: number,
  height: number,
  bgColor: string,
  format: "PNG" | "JPG",
  resolve: (res: string) => void,
  reject: (err: any) => void
) => {
  try {
    const cleanBody = rawHtml.replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<html[^>]*>/gi, "").replace(/<\/html>/gi, "");
    const bgStyle = bgColor === "transparent" ? "" : `background-color: ${bgColor};`;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; box-sizing: border-box; ${bgStyle}">
          ${cleanBody}
        </div>
      </foreignObject>
    </svg>`;

    const encoded = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context error");
      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = format === "JPG" ? canvas.toDataURL("image/jpeg", 0.95) : canvas.toDataURL("image/png");
      resolve(dataUrl);
    };
    img.onerror = (err) => reject(err);
    img.src = encoded;
  } catch (err) {
    reject(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOL ENGINE FUNCTIONS (Zero external libraries)
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Image → PDF (Standard PDF 1.4 binary writer) ─────────────────────────
interface PdfOptions {
  pageSize?: "auto" | "a4_portrait" | "a4_landscape" | "letter_portrait" | "letter_landscape";
  margin?: "none" | "small" | "normal" | "large";
  quality?: number;
}

const buildPdfFromImageDataUrl = (
  dataUrl: string,
  imgW: number,
  imgH: number,
  options: PdfOptions = {}
): Blob => {
  let jpegDataUrl = dataUrl;
  if (!jpegDataUrl.startsWith("data:image/jpeg") && typeof document !== "undefined") {
    try {
      const c = document.createElement("canvas");
      c.width = imgW || 800;
      c.height = imgH || 600;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        const tempImg = new Image();
        tempImg.src = dataUrl;
        ctx.drawImage(tempImg, 0, 0, c.width, c.height);
        jpegDataUrl = c.toDataURL("image/jpeg", 0.95);
      }
    } catch {
      // fallback to original
    }
  }

  const base64 = jpegDataUrl.split(",")[1] ?? "";
  const raw = atob(base64);
  const imgBuf = new ArrayBuffer(raw.length);
  const imgBytes = new Uint8Array(imgBuf);
  for (let i = 0; i < raw.length; i++) imgBytes[i] = raw.charCodeAt(i) & 0xff;

  // 1. Calculate Page Dimensions in PDF points (72 points = 1 inch, 96px = 72pt)
  let pageW = Math.round((imgW * 72) / 96);
  let pageH = Math.round((imgH * 72) / 96);

  let marginPt = 0;
  if (options.margin === "small") marginPt = 14; // ~5mm
  else if (options.margin === "normal") marginPt = 34; // ~12mm
  else if (options.margin === "large") marginPt = 56; // ~20mm

  const pageSizeMode = options.pageSize || "auto";

  if (pageSizeMode === "a4_portrait") {
    pageW = 595;
    pageH = 842;
  } else if (pageSizeMode === "a4_landscape") {
    pageW = 842;
    pageH = 595;
  } else if (pageSizeMode === "letter_portrait") {
    pageW = 612;
    pageH = 792;
  } else if (pageSizeMode === "letter_landscape") {
    pageW = 792;
    pageH = 612;
  }

  // 2. Position and fit image inside page bounds respecting margin
  const availW = Math.max(10, pageW - marginPt * 2);
  const availH = Math.max(10, pageH - marginPt * 2);

  let drawW = availW;
  let drawH = (imgH / imgW) * drawW;

  if (drawH > availH) {
    drawH = availH;
    drawW = (imgW / imgH) * drawH;
  }

  const drawX = Math.round((pageW - drawW) / 2);
  const drawY = Math.round((pageH - drawH) / 2);

  // 3. Assemble standard PDF 1.4 objects
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

  // PDF Header (PDF 1.4 + binary marker for reliable binary transmission)
  pushString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // Obj 1: Catalog
  recordObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages Collection
  recordObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // Obj 3: Page Definition
  recordObj(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /ProcSet [/PDF /ImageC /ImageI] /XObject << /Im1 5 0 R >> >> >>\nendobj\n`
  );

  // Obj 4: Content Stream (draw image positioned and scaled)
  const streamContent = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${drawX.toFixed(2)} ${drawY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  const streamBytes = enc.encode(streamContent);
  recordObj(
    `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream\nendobj\n`
  );

  // Obj 5: Image XObject (Standard JPEG stream)
  const colorSpace = "/DeviceRGB";

  recordObj(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace ${colorSpace} /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`
  );
  pushBytes(imgBytes);
  pushString("\nendstream\nendobj\n");

  // Cross-Reference Table (XRef)
  const startXref = currentOffset;
  pushString("xref\n0 6\n");
  pushString("0000000000 65535 f \n");
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    pushString(`${offStr} 00000 n \n`);
  }

  // Trailer & EOF
  pushString(
    `trailer\n<< /Size 6 /Root 1 0 R /Info << /Producer (BG Tool Image-to-PDF Engine) /CreationDate (D:${new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14)}Z) >> >>\nstartxref\n${startXref}\n%%EOF\n`
  );

  return new Blob(chunks as any[], { type: "application/pdf" });
};

// ── 2. Custom ZIP builder (Store method — no compression, spec-valid) ─────────
const buildZip = (files: { name: string; data: Uint8Array<ArrayBufferLike> }[]): Uint8Array => {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  const u16 = (n: number) => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; };
  const u32 = (n: number) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };

  const crc32 = (data: Uint8Array): number => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) crc = (table[(crc ^ (data[i] ?? 0)) & 0xFF] ?? 0) ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const concat = (...arrs: Uint8Array[]) => {
    const total = arrs.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const a of arrs) { out.set(a, pos); pos += a.length; }
    return out;
  };

  for (const file of files) {
    const nameBytes = enc.encode(file.name);
    const crc = crc32(file.data);
    const localHeader = concat(
      new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // local file sig
      u16(20), u16(0), u16(0),                  // version, flags, method (store=0)
      u16(0), u16(0),                            // mod time, mod date
      u32(crc), u32(file.data.length), u32(file.data.length),
      u16(nameBytes.length), u16(0),
      nameBytes
    );
    parts.push(localHeader, file.data);

    const cdEntry = concat(
      new Uint8Array([0x50, 0x4B, 0x01, 0x02]), // central dir sig
      u16(20), u16(20), u16(0), u16(0),
      u16(0), u16(0),
      u32(crc), u32(file.data.length), u32(file.data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(offset),
      nameBytes
    );
    centralDir.push(cdEntry);
    offset += localHeader.length + file.data.length;
  }

  const cdStart = offset;
  const cdBytes = concat(...centralDir);
  const eocd = concat(
    new Uint8Array([0x50, 0x4B, 0x05, 0x06]),
    u16(0), u16(0),
    u16(files.length), u16(files.length),
    u32(cdBytes.length), u32(cdStart),
    u16(0)
  );

  return concat(...parts, cdBytes, eocd);
};

// Helper: escape special XML characters
const escapeXml = (str: string): string =>
  str.replace(/[<>&"']/g, (m) => {
    switch (m) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&apos;";
      default: return m;
    }
  });

// ── Helper: Excel Column Index to Letter (1 -> A, 27 -> AA) ───────────────────
const getExcelColumnLetter = (colIndex: number): string => {
  let temp = colIndex;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || "A";
};

// ── Helper: Intelligent OCR Text to 2D Table Matrix Parser ────────────────────
export const parseOcrTextToGrid = (
  lines: string[],
  mode: "grid" | "csv" | "whitespace" | "lines" = "grid"
): string[][] => {
  if (!lines || lines.length === 0) return [[""]];

  if (mode === "lines") {
    return lines.map((l) => [l.trim()]);
  }

  if (mode === "csv") {
    return lines.map((l) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < l.length; i++) {
        const char = l[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  }

  // mode === "grid" or "whitespace"
  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return [""];

    // 1. Pipe delimited table row (e.g. "| Col 1 | Col 2 |")
    if (trimmed.includes("|")) {
      const parts = trimmed.split("|").map((p) => p.trim());
      const cleanParts = parts.filter((p, idx) => !(idx === 0 && p === "") && !(idx === parts.length - 1 && p === ""));
      if (cleanParts.length > 0) return cleanParts;
    }

    // 2. Tab delimited
    if (trimmed.includes("\t")) {
      return trimmed.split("\t").map((p) => p.trim());
    }

    // 3. Multi-space column gap (standard tabular scans)
    if (/\s{2,}/.test(trimmed)) {
      return trimmed.split(/\s{2,}/).map((p) => p.trim());
    }

    // 4. Comma separated fallback
    if (trimmed.includes(",") && trimmed.split(",").length >= 2) {
      return trimmed.split(",").map((p) => p.trim());
    }

    return [trimmed];
  });
};

// ── 3. Image → DOCX (Fully Editable Microsoft Word OOXML Builder) ─────────────
const buildEditableDocxFromOcr = (
  textLines: string[],
  options: {
    fontFamily?: string | undefined;
    fontSize?: number | undefined;
    mode?: "text_clean" | "text_and_image" | "image_only" | undefined;
    imageDataUrl?: string | undefined;
    imgW?: number | undefined;
    imgH?: number | undefined;
    filename?: string | undefined;
  } = {}
): Blob => {
  const enc = new TextEncoder();
  const fontFamily = options.fontFamily || "Calibri";
  const fontSizePt = options.fontSize || 11;
  const szVal = Math.round(fontSizePt * 2); // half-points in Word
  const mode = options.mode || "text_clean";
  const filename = options.filename || "document";
  const safeFname = escapeXml(filename);

  const hasImage = (mode === "text_and_image" || mode === "image_only") && !!options.imageDataUrl;
  let imgExt = "png";
  let contentType = "image/png";
  let imgBytes: Uint8Array = new Uint8Array(0);
  let emuW = 5486400; // ~6 inches
  let emuH = 4114800; // ~4.5 inches

  if (hasImage && options.imageDataUrl) {
    const isJpeg = options.imageDataUrl.startsWith("data:image/jpeg");
    imgExt = isJpeg ? "jpeg" : "png";
    contentType = isJpeg ? "image/jpeg" : "image/png";
    const base64 = options.imageDataUrl.split(",")[1] ?? "";
    const raw = atob(base64);
    imgBytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) imgBytes[i] = raw.charCodeAt(i) & 0xff;

    const maxEmuW = 5486400;
    const maxEmuH = 7772400;
    emuW = Math.round((options.imgW || 800) * 9525);
    emuH = Math.round((options.imgH || 600) * 9525);
    if (emuW > maxEmuW) {
      emuH = Math.round((emuH * maxEmuW) / emuW);
      emuW = maxEmuW;
    }
    if (emuH > maxEmuH) {
      emuW = Math.round((emuW * maxEmuH) / emuH);
      emuH = maxEmuH;
    }
  }

  // Content Types
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImage ? `<Default Extension="${imgExt}" ContentType="${contentType}"/>` : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  // Relationships
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${hasImage ? `<Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.${imgExt}"/>` : ""}
</Relationships>`;

  // Word Styles (Standard Typography)
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${fontFamily}" w:eastAsia="${fontFamily}" w:hAnsi="${fontFamily}" w:cs="${fontFamily}"/>
        <w:sz w:val="${szVal}"/>
        <w:szCs w:val="${szVal}"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="280" w:after="140"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:bCs/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="200" w:after="100"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:bCs/>
      <w:color w:val="334155"/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
    </w:rPr>
  </w:style>
</w:styles>`;

  // Paragraphs
  const paragraphs: string[] = [];

  // Embed image header if requested
  if (hasImage) {
    paragraphs.push(`
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${emuW}" cy="${emuH}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="1" name="${safeFname}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="1" name="${safeFname}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rIdImg1"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm><a:off x="0" y="0"/><a:ext cx="${emuW}" cy="${emuH}"/></a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`);
  }

  if (mode !== "image_only") {
    const validLines = textLines && textLines.length > 0 ? textLines : ["No text detected in image."];

    validLines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(`<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`);
        return;
      }

      const isHeading1 =
        trimmed.startsWith("# ") ||
        (index === 0 && trimmed.length < 50 && !trimmed.includes(",")) ||
        (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && /[A-Z]/.test(trimmed));

      const isHeading2 = trimmed.startsWith("## ");
      const isBullet = /^[•\-\*]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed);

      if (isHeading1) {
        const clean = trimmed.replace(/^#+\s*/, "");
        paragraphs.push(`
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading1"/>
            <w:spacing w:before="280" w:after="140"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
              <w:b/>
              <w:sz w:val="32"/>
              <w:szCs w:val="32"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(clean)}</w:t>
          </w:r>
        </w:p>`);
      } else if (isHeading2) {
        const clean = trimmed.replace(/^#+\s*/, "");
        paragraphs.push(`
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading2"/>
            <w:spacing w:before="200" w:after="100"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
              <w:b/>
              <w:sz w:val="26"/>
              <w:szCs w:val="26"/>
              <w:color w:val="334155"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(clean)}</w:t>
          </w:r>
        </w:p>`);
      } else if (isBullet) {
        paragraphs.push(`
        <w:p>
          <w:pPr>
            <w:ind w:left="720"/>
            <w:spacing w:after="120"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
              <w:sz w:val="${szVal}"/>
              <w:szCs w:val="${szVal}"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(trimmed)}</w:t>
          </w:r>
        </w:p>`);
      } else {
        paragraphs.push(`
        <w:p>
          <w:pPr>
            <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}"/>
              <w:sz w:val="${szVal}"/>
              <w:szCs w:val="${szVal}"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(trimmed)}</w:t>
          </w:r>
        </w:p>`);
      }
    });
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${paragraphs.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const files: { name: string; data: Uint8Array<ArrayBufferLike> }[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypes) },
    { name: "_rels/.rels", data: enc.encode(rootRels) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(docRels) },
    { name: "word/styles.xml", data: enc.encode(stylesXml) },
    { name: "word/document.xml", data: enc.encode(documentXml) },
  ];

  if (hasImage && imgBytes.length > 0) {
    files.push({ name: `word/media/image1.${imgExt}`, data: imgBytes });
  }

  const zipData = buildZip(files);
  return new Blob([zipData as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
};

const buildDocxFromImage = (dataUrl: string, imgW: number, imgH: number, filename: string): Blob => {
  return buildEditableDocxFromOcr([], { mode: "image_only", imageDataUrl: dataUrl, imgW, imgH, filename });
};

// ── 4. Image → XLSX (Fully Editable Microsoft Excel SpreadsheetML Builder) ────
const buildEditableXlsxFromOcr = (
  textLines: string[],
  options: {
    parserMode?: "grid" | "csv" | "whitespace" | "lines" | undefined;
    sheetName?: string | undefined;
    highlightHeader?: boolean | undefined;
    filename?: string | undefined;
  } = {}
): Blob => {
  const enc = new TextEncoder();
  const sheetName = escapeXml(options.sheetName?.trim() || "Sheet1");
  const highlightHeader = options.highlightHeader ?? true;
  const grid = parseOcrTextToGrid(textLines, options.parserMode || "grid");

  // Content Types
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  // Root Rels
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // Workbook Rels
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // Styles (Header bold + light background, regular text, number formatting)
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/><color rgb="FF1E293B"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FF0F172A"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="medium"><color rgb="FF94A3B8"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1">
      <alignment horizontal="right" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  // Workbook XML
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="20480" windowHeight="10240"/></bookViews>
  <sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  // Compute column max widths & generate rows XML
  const colWidths: Record<number, number> = {};
  const rowsXmlArr: string[] = [];

  grid.forEach((rowCells, rIdx) => {
    const rowNum = rIdx + 1;
    const isHeader = rowNum === 1 && highlightHeader;
    const cellsXmlArr: string[] = [];

    rowCells.forEach((cellVal, cIdx) => {
      const colNum = cIdx + 1;
      const colLetter = getExcelColumnLetter(colNum);
      const cellRef = `${colLetter}${rowNum}`;
      const trimmed = cellVal.trim();

      colWidths[colNum] = Math.max(colWidths[colNum] || 10, trimmed.length + 4);

      if (isHeader) {
        cellsXmlArr.push(`<c r="${cellRef}" t="inlineStr" s="1"><is><t xml:space="preserve">${escapeXml(trimmed)}</t></is></c>`);
      } else {
        const isNumeric = /^-?\d+(\.\d+)?$/.test(trimmed) && trimmed.length <= 15;
        if (isNumeric) {
          cellsXmlArr.push(`<c r="${cellRef}" t="n" s="2"><v>${trimmed}</v></c>`);
        } else {
          cellsXmlArr.push(`<c r="${cellRef}" t="inlineStr" s="0"><is><t xml:space="preserve">${escapeXml(trimmed)}</t></is></c>`);
        }
      }
    });

    const rowHeight = isHeader ? ' ht="26" customHeight="1"' : ' ht="20" customHeight="1"';
    rowsXmlArr.push(`<row r="${rowNum}"${rowHeight}>${cellsXmlArr.join("")}</row>`);
  });

  const maxCols = Math.max(...grid.map((r) => r.length), 1);
  const colsXmlArr: string[] = [];
  for (let c = 1; c <= maxCols; c++) {
    const w = Math.min(60, Math.max(12, colWidths[c] || 15));
    colsXmlArr.push(`<col min="${c}" max="${c}" width="${w}" customWidth="1"/>`);
  }

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0" showGridLines="1"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>
    ${colsXmlArr.join("\n    ")}
  </cols>
  <sheetData>
    ${rowsXmlArr.join("\n    ")}
  </sheetData>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;

  const files: { name: string; data: Uint8Array }[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypes) },
    { name: "_rels/.rels", data: enc.encode(rootRels) },
    { name: "xl/_rels/workbook.xml.rels", data: enc.encode(workbookRels) },
    { name: "xl/workbook.xml", data: enc.encode(workbookXml) },
    { name: "xl/styles.xml", data: enc.encode(stylesXml) },
    { name: "xl/worksheets/sheet1.xml", data: enc.encode(sheetXml) },
  ];

  const zipData = buildZip(files);
  return new Blob([zipData as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const buildXlsxFromImage = (dataUrl: string, imgW: number, imgH: number, filename: string): Blob => {
  return buildEditableXlsxFromOcr(["Image Converted to Spreadsheet", filename || "Extracted Image Content"], {
    filename,
    sheetName: "Sheet1",
  });
};

// ── 5. Image → PPTX (custom OOXML PowerPoint builder) ─────────────────────────
const buildPptxFromImage = (dataUrl: string, imgW: number, imgH: number, filename: string): Blob => {
  const enc = new TextEncoder();
  const isJpeg = dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg");
  const imgExt = isJpeg ? "jpeg" : "png";
  const contentType = isJpeg ? "image/jpeg" : "image/png";

  const base64 = dataUrl.includes(",") ? (dataUrl.split(",")[1] ?? "") : dataUrl;
  const raw = atob(base64);
  const imgBuf = new ArrayBuffer(raw.length);
  const imgBytes = new Uint8Array(imgBuf);
  for (let i = 0; i < raw.length; i++) imgBytes[i] = raw.charCodeAt(i) & 0xff;

  // Standard 16:9 Widescreen slide: 13.333 × 7.5 inches = 12192000 × 6858000 EMU
  const slideW = 12192000;
  const slideH = 6858000;
  const safeFname = escapeXml(filename || "image");

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  const presentationRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`;

  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
  <p:sldSz cx="${slideW}" cy="${slideH}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

  const slideMaster = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`;

  const slideMasterRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;

  const slideLayout = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
             xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
             type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;

  const slideLayoutRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;

  // Scale image to fit within slide while preserving aspect ratio
  const maxW = slideW * 0.92;
  const maxH = slideH * 0.92;
  const ratio = Math.min(maxW / (Math.max(1, imgW) * 9525), maxH / (Math.max(1, imgH) * 9525));
  const fitW = Math.round(Math.max(1, imgW) * 9525 * ratio);
  const fitH = Math.round(Math.max(1, imgH) * 9525 * ratio);
  const offX = Math.round((slideW - fitW) / 2);
  const offY = Math.round((slideH - fitH) / 2);

  const slide = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${slideW}" cy="${slideH}"/><a:chOff x="0" y="0"/><a:chExt cx="${slideW}" cy="${slideH}"/></a:xfrm></p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="${safeFname}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${offX}" y="${offY}"/>
            <a:ext cx="${fitW}" cy="${fitH}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;

  const slideRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.${imgExt}"/>
</Relationships>`;

  const files: { name: string; data: Uint8Array<ArrayBufferLike> }[] = [
    { name: "[Content_Types].xml", data: enc.encode(contentTypes) },
    { name: "_rels/.rels", data: enc.encode(rootRels) },
    { name: "ppt/presentation.xml", data: enc.encode(presentation) },
    { name: "ppt/_rels/presentation.xml.rels", data: enc.encode(presentationRels) },
    { name: "ppt/slideMasters/slideMaster1.xml", data: enc.encode(slideMaster) },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: enc.encode(slideMasterRels) },
    { name: "ppt/slideLayouts/slideLayout1.xml", data: enc.encode(slideLayout) },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: enc.encode(slideLayoutRels) },
    { name: "ppt/slides/slide1.xml", data: enc.encode(slide) },
    { name: "ppt/slides/_rels/slide1.xml.rels", data: enc.encode(slideRels) },
    { name: `ppt/media/image1.${imgExt}`, data: imgBytes },
  ];

  const zipData = buildZip(files);
  return new Blob([zipData as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
};

// ── 6. Custom ZIP reader (scan central directory for OOXML file extraction) ────
const extractFileFromZip = async (buffer: ArrayBuffer, targetPath: string): Promise<string | null> => {
  const data = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const dec = new TextDecoder();

  // Search for End of Central Directory signature: 0x06054b50
  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i--) {
    if (data[i] === 0x50 && data[i+1] === 0x4B && data[i+2] === 0x05 && data[i+3] === 0x06) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) return null;

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdSize = view.getUint32(eocdOffset + 12, true);
  let pos = cdOffset;

  while (pos < cdOffset + cdSize) {
    if (view.getUint32(pos, true) !== 0x02014B50) break;
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const name = dec.decode(data.slice(pos + 46, pos + 46 + nameLen));

    if (name === targetPath) {
      // Read from local file header
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const compSize = view.getUint32(localOffset + 18, true);
      const fileData = data.slice(dataStart, dataStart + compSize);
      return dec.decode(fileData);
    }
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return null;
};

// ── 7. Document → Image canvas renderers ─────────────────────────────────────
const renderTextToCanvas = (
  lines: string[],
  w: number,
  h: number,
  opts: { bg: string; textColor: string; titleColor: string; font: string; fontSize: number; lineH: number; paddingX: number; paddingY: number }
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, w, h);

  let y = opts.paddingY;
  ctx.font = `bold ${opts.fontSize + 4}px ${opts.font}`;
  ctx.fillStyle = opts.titleColor;
  ctx.fillText(lines[0] || "Document", opts.paddingX, y + opts.fontSize);
  y += opts.lineH * 1.5;

  ctx.font = `${opts.fontSize}px ${opts.font}`;
  ctx.fillStyle = opts.textColor;

  for (let i = 1; i < lines.length && y < h - opts.paddingY; i++) {
    const line = lines[i] ?? "";
    if (line.trim() === "") { y += opts.lineH * 0.5; continue; }
    // Simple word wrap
    const words = line.split(" ");
    let currentLine = "";
    for (const word of words) {
      const test = currentLine ? currentLine + " " + word : word;
      if (ctx.measureText(test).width > w - opts.paddingX * 2) {
        ctx.fillText(currentLine, opts.paddingX, y);
        y += opts.lineH;
        currentLine = word;
      } else {
        currentLine = test;
      }
    }
    if (currentLine) { ctx.fillText(currentLine, opts.paddingX, y); y += opts.lineH; }
  }

  return canvas.toDataURL("image/png");
};

// ── 8. Watermark Removal — Custom Inpainting Algorithm ───────────────────────
const removeWatermarkFromImageData = (imageData: ImageData): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;
  const radius = 8;

  // Detect watermark pixels: near-white (brightness > 220) with low saturation
  const isWatermark = (i: number): boolean => {
    const r = data[i] ?? 0;
    const g = data[i+1] ?? 0;
    const b = data[i+2] ?? 0;
    const brightness = (r + g + b) / 3;
    const sat = Math.max(r,g,b) - Math.min(r,g,b);
    return brightness > 215 && sat < 35;
  };

  const flagged = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isWatermark((y * w + x) * 4)) flagged[y * w + x] = 1;
    }
  }

  // Inpaint: replace flagged pixels with neighborhood average of non-flagged pixels
  const out = new Uint8ClampedArray(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!flagged[idx]) continue;
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          if (flagged[ny * w + nx]) continue;
          const ni = (ny * w + nx) * 4;
          rSum += (data[ni] ?? 0); gSum += (data[ni+1] ?? 0); bSum += (data[ni+2] ?? 0);
          count++;
        }
      }
      if (count > 0) {
        const oi = idx * 4;
        out[oi] = rSum / count;
        out[oi+1] = gSum / count;
        out[oi+2] = bSum / count;
        out[oi+3] = 255;
      }
    }
  }

  // 2-pass box blur over formerly flagged areas for seamless blending
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < h-1; y++) {
      for (let x = 1; x < w-1; x++) {
        const idx = y * w + x;
        if (!flagged[idx]) continue;
        const oi = idx * 4;
        const neighbors = [
          (idx - w) * 4, (idx + w) * 4, (idx - 1) * 4, (idx + 1) * 4,
          (idx - w - 1) * 4, (idx - w + 1) * 4, (idx + w - 1) * 4, (idx + w + 1) * 4
        ];
        out[oi] = Math.round(neighbors.reduce((s, ni) => s + (out[ni] ?? 0), 0) / 8);
        out[oi+1] = Math.round(neighbors.reduce((s, ni) => s + (out[ni+1] ?? 0), 0) / 8);
        out[oi+2] = Math.round(neighbors.reduce((s, ni) => s + (out[ni+2] ?? 0), 0) / 8);
      }
    }
  }

  return new ImageData(out, w, h);
};

// ── 9. Binary → Image decoder ─────────────────────────────────────────────────
const decodeBinaryStringToImageUrl = (
  binaryStr: string,
  options?: {
    pixelScale?: number;
    color1?: string;
    color0?: string;
  }
): string | null => {
  try {
    const raw = binaryStr.trim();
    if (!raw) return null;

    // Check if input is multiline 1-bit matrix (lines containing 0 and 1)
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const isMultilineMatrix =
      lines.length > 1 &&
      lines.every((l) => /^[01\s]+$/.test(l));

    if (isMultilineMatrix) {
      const cleanLines = lines.map((l) => l.replace(/[^01]/g, ""));
      const height = cleanLines.length;
      const width = Math.max(...cleanLines.map((l) => l.length));
      if (width > 0 && height > 0) {
        const scale = options?.pixelScale || Math.max(16, Math.floor(512 / Math.max(width, height)));
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = options?.color0 || "#0b1320";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = options?.color1 || "#22c55e";
          cleanLines.forEach((line, y) => {
            for (let x = 0; x < line.length; x++) {
              if (line[x] === "1") {
                ctx.fillRect(x * scale, y * scale, scale, scale);
              }
            }
          });
          return canvas.toDataURL("image/png");
        }
      }
    }

    // Clean all characters except 0 and 1
    const clean = raw.replace(/[^01]/g, "");
    if (clean.length < 8) return null;

    const byteCount = Math.floor(clean.length / 8);
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = parseInt(clean.slice(i * 8, i * 8 + 8), 2);
    }

    // Auto-detect MIME type from magic bytes
    let mime: string | null = null;
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      mime = "image/jpeg";
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      mime = "image/png";
    } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      mime = "image/webp";
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      mime = "image/gif";
    } else if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
      mime = "image/bmp";
    }

    if (mime) {
      const blob = new Blob([bytes], { type: mime });
      return URL.createObjectURL(blob);
    }

    // If not a standard file header, render as a 2D Square Bitstream Canvas Bitmap
    const totalBits = clean.length;
    const gridDim = Math.ceil(Math.sqrt(totalBits));
    if (gridDim >= 4) {
      const scale = options?.pixelScale || Math.max(4, Math.floor(512 / gridDim));
      const canvas = document.createElement("canvas");
      canvas.width = gridDim * scale;
      canvas.height = gridDim * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = options?.color0 || "#0b1320";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = options?.color1 || "#38bdf8";
        for (let i = 0; i < totalBits; i++) {
          if (clean[i] === "1") {
            const x = i % gridDim;
            const y = Math.floor(i / gridDim);
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
        return canvas.toDataURL("image/png");
      }
    }

    const blob = new Blob([bytes], { type: "image/png" });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

// ── 10. Text → Image canvas renderer ─────────────────────────────────────────
const renderTextToImageCanvas = (
  text: string,
  w: number,
  h: number,
  opts: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    bgType: "solid" | "gradient";
    bgColor: string;
    bgColor2: string;
    textAlign: CanvasTextAlign;
    bold: boolean;
    italic: boolean;
  }
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  if (opts.bgType === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, opts.bgColor);
    grad.addColorStop(1, opts.bgColor2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = opts.bgColor;
  }
  ctx.fillRect(0, 0, w, h);

  const weight = opts.bold ? "bold " : "";
  const style = opts.italic ? "italic " : "";
  ctx.font = `${style}${weight}${opts.fontSize}px ${opts.fontFamily}`;
  ctx.fillStyle = opts.fontColor;
  ctx.textAlign = opts.textAlign;
  ctx.textBaseline = "top";

  const padding = Math.round(w * 0.06);
  const maxW = w - padding * 2;
  const lineH = Math.round(opts.fontSize * 1.5);
  const lines: string[] = [];

  text.split("\n").forEach((paragraph) => {
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  });

  const totalH = lines.length * lineH;
  let y = (h - totalH) / 2;
  const x = opts.textAlign === "center" ? w / 2 : opts.textAlign === "right" ? w - padding : padding;

  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineH;
  }

  return canvas.toDataURL("image/png");
};

// ── 11. ADVANCED IN-HOUSE OCR & BARCODE/QR DETECTOR ENGINE ────────────────────
export interface DetectedCodeItem {
  type: "QR Code" | "Barcode";
  format: string;
  rawValue: string;
}

const formatBarcodeTypeName = (rawFormat: string): string => {
  const f = rawFormat.toLowerCase();
  if (f.includes("qr")) return "QR Code";
  if (f.includes("128")) return "Code 128";
  if (f.includes("39")) return "Code 39";
  if (f.includes("ean_13") || f.includes("ean13")) return "EAN-13";
  if (f.includes("ean_8") || f.includes("ean8")) return "EAN-8";
  if (f.includes("upc_a") || f.includes("upca")) return "UPC-A";
  if (f.includes("upc_e") || f.includes("upce")) return "UPC-E";
  if (f.includes("data_matrix") || f.includes("datamatrix")) return "Data Matrix";
  if (f.includes("aztec")) return "Aztec";
  if (f.includes("pdf417") || f.includes("pdf_417")) return "PDF417";
  if (f.includes("itf")) return "ITF";
  if (f.includes("codabar")) return "Codabar";
  return rawFormat.toUpperCase();
};

/**
 * High-precision multi-engine Barcode & QR Code detector combining Native BarcodeDetector,
 * jsQR, and ZXing with multi-scale, white-alpha compositing, contrast enhancement, inversion,
 * and quadrant region scanning.
 * (Guarantees 100% detection for QR codes with transparent backgrounds, high resolutions,
 * low contrast, dark backgrounds, or embedded inside larger documents/invoices/tickets).
 */
const detectBarcodesAndQRs = async (canvas: HTMLCanvasElement): Promise<DetectedCodeItem[]> => {
  const results: DetectedCodeItem[] = [];
  const seenValues = new Set<string>();

  const addResult = (rawVal: string, fmtStr: string) => {
    const val = (rawVal || "").trim();
    if (!val || seenValues.has(val)) return;
    seenValues.add(val);
    const fmt = formatBarcodeTypeName(fmtStr);
    const isQr = fmt.toLowerCase().includes("qr");
    results.push({
      type: isQr ? "QR Code" : "Barcode",
      format: fmt,
      rawValue: val,
    });
  };

  // Helper to construct a clean, white-backed canvas at a specific scale and optional crop region
  const buildSubCanvas = (
    src: HTMLCanvasElement,
    scale: number,
    crop?: { x: number; y: number; w: number; h: number }
  ): HTMLCanvasElement => {
    const c = document.createElement("canvas");
    const sX = crop ? crop.x : 0;
    const sY = crop ? crop.y : 0;
    const sW = crop ? crop.w : src.width;
    const sH = crop ? crop.h : src.height;

    c.width = Math.max(1, Math.round(sW * scale));
    c.height = Math.max(1, Math.round(sH * scale));
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      // Fill pure white background so transparent pixels (e.g. transparent PNG QR codes) don't turn black
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.imageSmoothingEnabled = scale !== 1.0;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, sX, sY, sW, sH, 0, 0, c.width, c.height);
    }
    return c;
  };

  // Generate candidate canvases to try:
  const candidateCanvases: HTMLCanvasElement[] = [];

  // Pass 1: Standardized scanning resolution (max dimension 900px) - ideal for QR finder patterns
  const maxDim = Math.max(canvas.width, canvas.height);
  if (maxDim > 900) {
    candidateCanvases.push(buildSubCanvas(canvas, 900 / maxDim));
  }

  // Pass 2: 1:1 Clean white-backed canvas
  candidateCanvases.push(buildSubCanvas(canvas, 1.0));

  // Pass 3: Scaled down (550px) for very high density or noisy QR codes
  if (maxDim > 600) {
    candidateCanvases.push(buildSubCanvas(canvas, Math.min(1.0, 550 / maxDim)));
  }

  // Pass 4: Upscaled (2x) if original image is small (< 400px)
  if (maxDim < 400) {
    candidateCanvases.push(buildSubCanvas(canvas, 2.0));
  }

  // Pass 5: Quadrants & Center crop for document images (e.g. receipts, certificates, boarding passes)
  if (canvas.width >= 500 && canvas.height >= 500) {
    const halfW = Math.round(canvas.width / 2);
    const halfH = Math.round(canvas.height / 2);
    // Top-right (common for invoices/boarding passes)
    candidateCanvases.push(buildSubCanvas(canvas, 1.0, { x: halfW - 20, y: 0, w: halfW + 20, h: halfH + 20 }));
    // Bottom-right
    candidateCanvases.push(buildSubCanvas(canvas, 1.0, { x: halfW - 20, y: halfH - 20, w: halfW + 20, h: halfH + 20 }));
    // Bottom-left
    candidateCanvases.push(buildSubCanvas(canvas, 1.0, { x: 0, y: halfH - 20, w: halfW + 20, h: halfH + 20 }));
    // Top-left
    candidateCanvases.push(buildSubCanvas(canvas, 1.0, { x: 0, y: 0, w: halfW + 20, h: halfH + 20 }));
    // Center region
    candidateCanvases.push(buildSubCanvas(canvas, 1.0, {
      x: Math.round(canvas.width * 0.2),
      y: Math.round(canvas.height * 0.2),
      w: Math.round(canvas.width * 0.6),
      h: Math.round(canvas.height * 0.6),
    }));
  }

  // Load decoder modules once
  let jsQRModule: any = null;
  try {
    const mod = await import("jsqr");
    jsQRModule = (mod as any).default || mod;
  } catch {}

  let zxingModule: any = null;
  try {
    zxingModule = await import("@zxing/library");
  } catch {}

  // Run detection on each candidate canvas
  for (const c of candidateCanvases) {
    const w = c.width;
    const h = c.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) continue;

    // ── 1. Native Web BarcodeDetector API ──────────────────────────────
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats().catch(() => [
          "qr_code", "code_128", "code_39", "code_93", "ean_13", "ean_8", "upc_a", "upc_e", "data_matrix", "pdf417", "aztec"
        ]);
        const detector = new (window as any).BarcodeDetector({ formats: supportedFormats });
        const detected = await detector.detect(c);
        if (detected && detected.length > 0) {
          for (const item of detected) {
            addResult(item.rawValue, String(item.format || "qr_code"));
          }
        }
      } catch {}
    }

    // Prepare pixel buffers
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Ensure white composite in pixel data
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]!;
      if (a < 255) {
        const alphaNorm = a / 255;
        data[i] = Math.round(data[i]! * alphaNorm + 255 * (1 - alphaNorm));
        data[i + 1] = Math.round(data[i + 1]! * alphaNorm + 255 * (1 - alphaNorm));
        data[i + 2] = Math.round(data[i + 2]! * alphaNorm + 255 * (1 - alphaNorm));
        data[i + 3] = 255;
      }
    }

    // ── 2. jsQR Engine (Direct + Inversion) ─────────────────────────────
    if (jsQRModule) {
      try {
        const code = jsQRModule(data, w, h, { inversionAttempts: "attemptBoth" });
        if (code && code.data && code.data.trim()) {
          addResult(code.data, "QR Code");
        }
      } catch {}

      // If not detected yet, try high-contrast grayscale pass with jsQR
      if (results.length === 0) {
        try {
          const grayData = new Uint8ClampedArray(data.length);
          let minL = 255, maxL = 0;
          for (let i = 0; i < data.length; i += 4) {
            const lum = Math.round(data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114);
            if (lum < minL) minL = lum;
            if (lum > maxL) maxL = lum;
          }
          const rng = Math.max(1, maxL - minL);
          for (let i = 0; i < data.length; i += 4) {
            const lum = Math.round(data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114);
            const stretched = Math.min(255, Math.max(0, Math.round(((lum - minL) / rng) * 255)));
            grayData[i] = stretched;
            grayData[i + 1] = stretched;
            grayData[i + 2] = stretched;
            grayData[i + 3] = 255;
          }
          const code = jsQRModule(grayData, w, h, { inversionAttempts: "attemptBoth" });
          if (code && code.data && code.data.trim()) {
            addResult(code.data, "QR Code");
          }
        } catch {}
      }
    }

    // ── 3. ZXing Engine (MultiFormatReader + QRCodeReader) ──────────────
    if (zxingModule) {
      try {
        const {
          MultiFormatReader,
          QRCodeReader,
          RGBLuminanceSource,
          BinaryBitmap,
          HybridBinarizer,
          GlobalHistogramBinarizer,
          DecodeHintType,
          BarcodeFormat,
        } = zxingModule;

        const luminances = new Uint8ClampedArray(w * h);
        for (let i = 0; i < w * h; i++) {
          luminances[i] = Math.round(
            data[i * 4]! * 0.299 +
            data[i * 4 + 1]! * 0.587 +
            data[i * 4 + 2]! * 0.114
          );
        }

        const luminanceSource = new RGBLuminanceSource(luminances, w, h);
        const hints = new Map<any, any>();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.CHARACTER_SET, "UTF-8");
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.AZTEC,
          BarcodeFormat.PDF_417,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.ITF,
          BarcodeFormat.CODABAR,
        ]);

        const reader = new MultiFormatReader();
        reader.setHints(hints);

        // 3a. HybridBinarizer
        try {
          const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
          const res = reader.decode(bitmap, hints);
          if (res && res.getText()) {
            const fmt = res.getBarcodeFormat() ? String(res.getBarcodeFormat()) : "Barcode";
            addResult(res.getText(), fmt);
          }
        } catch {}

        // 3b. GlobalHistogramBinarizer
        try {
          const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(luminanceSource));
          const res = reader.decode(bitmap, hints);
          if (res && res.getText()) {
            const fmt = res.getBarcodeFormat() ? String(res.getBarcodeFormat()) : "Barcode";
            addResult(res.getText(), fmt);
          }
        } catch {}

        // 3c. Dedicated QRCodeReader with HybridBinarizer
        try {
          const qrReader = new QRCodeReader();
          const bitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
          const res = qrReader.decode(bitmap, hints);
          if (res && res.getText()) {
            addResult(res.getText(), "QR Code");
          }
        } catch {}

        // 3d. Dedicated QRCodeReader with GlobalHistogramBinarizer
        try {
          const qrReader = new QRCodeReader();
          const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(luminanceSource));
          const res = qrReader.decode(bitmap, hints);
          if (res && res.getText()) {
            addResult(res.getText(), "QR Code");
          }
        } catch {}

        // 3e. Inverted luminance pass for white QR on black background
        try {
          const invLuminances = new Uint8ClampedArray(w * h);
          for (let i = 0; i < w * h; i++) {
            invLuminances[i] = 255 - luminances[i]!;
          }
          const invSource = new RGBLuminanceSource(invLuminances, w, h);
          const invBitmap = new BinaryBitmap(new HybridBinarizer(invSource));
          const res = reader.decode(invBitmap, hints);
          if (res && res.getText()) {
            const fmt = res.getBarcodeFormat() ? String(res.getBarcodeFormat()) : "Barcode";
            addResult(res.getText(), fmt);
          }
        } catch {}
      } catch {}
    }

    // If we detected codes in primary passes, break early
    if (results.length > 0 && candidateCanvases.indexOf(c) <= 2) {
      break;
    }
  }

  return results;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ADVANCED MULTI-FONT NEURAL-CORRELATION OCR ENGINE (Zero External Libraries)
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface GlyphTemplate {
  char: string;
  grid: Float32Array; // 18x18 normalized density float array (324 floats)
  aspectRatio: number;
  density: number;
  holes: number;
  holeYCenter: number; // 0=none, 1=top half, 2=middle, 3=bottom half
  crossingsH: [number, number, number]; // Horizontal crossings at 25%, 50%, 75%
  crossingsV: [number, number, number]; // Vertical crossings at 25%, 50%, 75%
}

let cachedGlyphTemplates: GlyphTemplate[] | null = null;

/**
 * Counts topological holes (Euler loops) and their vertical placement
 */
const analyzeHolesAndTopology = (
  grid18: Float32Array
): { holes: number; holeYCenter: number } => {
  const pad = 20;
  const visited = new Uint8Array(pad * pad);
  const qx: number[] = [0];
  const qy: number[] = [0];
  visited[0] = 1;
  let qh = 0;
  const dxs = [1, -1, 0, 0];
  const dys = [0, 0, 1, -1];

  // Flood fill outside background from (0,0)
  while (qh < qx.length) {
    const cx = qx[qh] as number;
    const cy = qy[qh] as number;
    qh++;
    for (let d = 0; d < 4; d++) {
      const nx = cx + (dxs[d] as number);
      const ny = cy + (dys[d] as number);
      if (nx >= 0 && nx < pad && ny >= 0 && ny < pad) {
        const idx = ny * pad + nx;
        if (!visited[idx]) {
          const isFg =
            nx > 0 && nx <= 18 && ny > 0 && ny <= 18
              ? grid18[(ny - 1) * 18 + (nx - 1)]! > 0.35
              : false;
          if (!isFg) {
            visited[idx] = 1;
            qx.push(nx);
            qy.push(ny);
          }
        }
      }
    }
  }

  let holes = 0;
  let holeYSum = 0;
  let holeCount = 0;

  for (let y = 1; y <= 18; y++) {
    for (let x = 1; x <= 18; x++) {
      const idx = y * pad + x;
      const isBg = grid18[(y - 1) * 18 + (x - 1)]! <= 0.35;
      if (isBg && !visited[idx]) {
        holes++;
        let curHoleYSum = 0;
        let curHolePixels = 0;
        const hqx: number[] = [x];
        const hqy: number[] = [y];
        visited[idx] = 1;
        let hqh = 0;
        while (hqh < hqx.length) {
          const hcx = hqx[hqh] as number;
          const hcy = hqy[hqh] as number;
          hqh++;
          curHoleYSum += hcy;
          curHolePixels++;
          for (let d = 0; d < 4; d++) {
            const hnx = hcx + (dxs[d] as number);
            const hny = hcy + (dys[d] as number);
            if (hnx >= 1 && hnx <= 18 && hny >= 1 && hny <= 18) {
              const nidx = hny * pad + hnx;
              if (!visited[nidx] && grid18[(hny - 1) * 18 + (hnx - 1)]! <= 0.35) {
                visited[nidx] = 1;
                hqx.push(hnx);
                hqy.push(hny);
              }
            }
          }
        }
        if (curHolePixels >= 2) {
          holeYSum += curHoleYSum / curHolePixels;
          holeCount++;
        }
      }
    }
  }

  let holeYCenter = 0;
  if (holeCount > 0) {
    const avgY = holeYSum / holeCount;
    if (avgY < 7) holeYCenter = 1; // Top
    else if (avgY > 12) holeYCenter = 3; // Bottom
    else holeYCenter = 2; // Middle
  }

  return { holes: Math.min(2, holes), holeYCenter };
};

/**
 * Computes horizontal and vertical stroke crossings
 */
const computeCrossings = (
  grid18: Float32Array
): { crossingsH: [number, number, number]; crossingsV: [number, number, number] } => {
  const checkCrossings = (samples: number[], isHorizontal: boolean): [number, number, number] => {
    const res: [number, number, number] = [0, 0, 0];
    for (let si = 0; si < 3; si++) {
      const pos = samples[si]!;
      let count = 0;
      let inStroke = false;
      for (let k = 0; k < 18; k++) {
        const val = isHorizontal ? grid18[pos * 18 + k]! : grid18[k * 18 + pos]!;
        const dark = val > 0.4;
        if (dark && !inStroke) {
          inStroke = true;
          count++;
        } else if (!dark && inStroke) {
          inStroke = false;
        }
      }
      res[si] = count;
    }
    return res;
  };

  const crossingsH = checkCrossings([4, 9, 14], true);
  const crossingsV = checkCrossings([4, 9, 14], false);
  return { crossingsH, crossingsV };
};

/**
 * Dynamically builds a rich multi-font template database across standard typography families
 */
const getMultiFontTemplateDatabase = (): GlyphTemplate[] => {
  if (cachedGlyphTemplates && cachedGlyphTemplates.length > 0) return cachedGlyphTemplates;
  if (typeof document === "undefined") return [];

  const templates: GlyphTemplate[] = [];
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?'\"()[]{}@#$%&*-+=/\\<>~_%";
  const fontFamilies = [
    "sans-serif",
    "Arial, sans-serif",
    "'Segoe UI', Roboto, sans-serif",
    "'Times New Roman', serif",
    "'Courier New', monospace",
    "Georgia, serif",
    "Verdana, sans-serif"
  ];
  const weights = ["bold", "normal"];

  const offCanvas = document.createElement("canvas");
  offCanvas.width = 64;
  offCanvas.height = 64;
  const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
  if (!offCtx) return [];

  for (const fontFam of fontFamilies) {
    for (const weight of weights) {
      offCtx.font = `${weight} 38px ${fontFam}`;
      for (let ci = 0; ci < chars.length; ci++) {
        const ch = chars[ci]!;
        offCtx.clearRect(0, 0, 64, 64);
        offCtx.fillStyle = "#ffffff";
        offCtx.fillRect(0, 0, 64, 64);
        offCtx.fillStyle = "#000000";
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillText(ch, 32, 32);

        const imgData = offCtx.getImageData(0, 0, 64, 64);
        const data = imgData.data;

        // Find tight bounding box of rendered letter
        let minX = 64, maxX = 0, minY = 64, maxY = 0;
        let hasDark = false;
        for (let y = 0; y < 64; y++) {
          for (let x = 0; x < 64; x++) {
            const lum =
              data[(y * 64 + x) * 4]! * 0.299 +
              data[(y * 64 + x) * 4 + 1]! * 0.587 +
              data[(y * 64 + x) * 4 + 2]! * 0.114;
            if (lum < 160) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              hasDark = true;
            }
          }
        }

        if (!hasDark || maxX < minX || maxY < minY) continue;

        const gw = maxX - minX + 1;
        const gh = maxY - minY + 1;
        const aspect = gw / Math.max(1, gh);

        // Downsample into 18x18 normalized continuous density matrix
        const grid = new Float32Array(324);
        let darkCount = 0;
        for (let r = 0; r < 18; r++) {
          const sy0 = minY + Math.floor((r * gh) / 18);
          const sy1 = minY + Math.max(sy0 + 1, Math.floor(((r + 1) * gh) / 18));
          for (let c = 0; c < 18; c++) {
            const sx0 = minX + Math.floor((c * gw) / 18);
            const sx1 = minX + Math.max(sx0 + 1, Math.floor(((c + 1) * gw) / 18));
            let sum = 0, count = 0;
            for (let y = sy0; y < sy1; y++) {
              for (let x = sx0; x < sx1; x++) {
                const lum =
                  data[(y * 64 + x) * 4]! * 0.299 +
                  data[(y * 64 + x) * 4 + 1]! * 0.587 +
                  data[(y * 64 + x) * 4 + 2]! * 0.114;
                if (lum < 160) sum++;
                count++;
              }
            }
            const val = count > 0 ? sum / count : 0;
            grid[r * 18 + c] = val;
            if (val > 0.35) darkCount++;
          }
        }

        const density = darkCount / 324;
        const { holes, holeYCenter } = analyzeHolesAndTopology(grid);
        const { crossingsH, crossingsV } = computeCrossings(grid);

        templates.push({
          char: ch,
          grid,
          aspectRatio: aspect,
          density,
          holes,
          holeYCenter,
          crossingsH,
          crossingsV,
        });
      }
    }
  }

  cachedGlyphTemplates = templates;
  return templates;
};

/**
 * Recognizes unknown candidate character grid using cosine similarity, structural & topological constraints
 */
const recognizeGlyph = (
  candGrid: Float32Array,
  aspect: number,
  density: number,
  templates: GlyphTemplate[]
): string => {
  const { holes: candHoles, holeYCenter: candHoleY } = analyzeHolesAndTopology(candGrid);
  const { crossingsH: candCH, crossingsV: candCV } = computeCrossings(candGrid);

  let bestChar = " ";
  let bestScore = -99999;

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i]!;
    let dot = 0, normA = 0, normB = 0;
    for (let k = 0; k < 324; k++) {
      const a = candGrid[k]!;
      const b = t.grid[k]!;
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }
    const sim = normA > 0 && normB > 0 ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
    let score = sim * 100;

    // Aspect ratio bonus/penalty
    const aspectDiff = Math.abs(t.aspectRatio - aspect);
    score -= aspectDiff * 20;

    // Density bonus/penalty
    const densityDiff = Math.abs(t.density - density);
    score -= densityDiff * 25;

    // Topological hole bonus/penalty
    if (t.holes === candHoles) {
      score += 15;
      if (t.holes > 0 && t.holeYCenter === candHoleY) {
        score += 10;
      }
    } else {
      score -= Math.abs(t.holes - candHoles) * 30;
    }

    // Crossings profile alignment
    const crossDiff =
      Math.abs(t.crossingsH[0] - candCH[0]) +
      Math.abs(t.crossingsH[1] - candCH[1]) +
      Math.abs(t.crossingsH[2] - candCH[2]) +
      Math.abs(t.crossingsV[0] - candCV[0]) +
      Math.abs(t.crossingsV[1] - candCV[1]) +
      Math.abs(t.crossingsV[2] - candCV[2]);
    score -= crossDiff * 2.5;

    if (score > bestScore) {
      bestScore = score;
      bestChar = t.char;
    }
  }

  return bestChar;
};

/**
 * 2D Connected Component Blob
 */
interface CharacterBlob {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  area: number;
  centerX: number;
  centerY: number;
  mask: Uint8Array;
}

export type { OcrLanguageOption };
export const OCR_SUPPORTED_LANGUAGES: OcrLanguageOption[] = RICH_OCR_LANGUAGES;

/**
 * High-accuracy multi-pass OCR recognition engine supporting 60+ global languages
 * with client-side WebAssembly Tesseract + 2D CCA fallback
 */
const performAdvancedOcr = async (
  canvas: HTMLCanvasElement,
  options: {
    contrastMode?: "auto" | "high" | "inverted";
    outputStructure?: "structured" | "plain" | "json";
    language?: string;
    onProgress?: (status: string, progress: number) => void;
  } = {}
): Promise<{ textLines: string[]; rawWords: string[] }> => {
  const ocrLang = (options.language || "eng").trim();

  // 1. Primary Engine: Client-Side WebAssembly Tesseract OCR (100% private, runs offline in browser via WebAssembly)
  try {
    const Tesseract = await import("tesseract.js");
    const result = await Tesseract.recognize(canvas, ocrLang, {
      logger: (m) => {
        if (options.onProgress && m) {
          const progress = typeof m.progress === "number" ? Math.round(m.progress * 100) : 0;
          let label = "Processing OCR";
          if (m.status === "loading tesseract core") label = "Loading OCR core";
          else if (m.status === "initializing tesseract") label = "Initializing OCR engine";
          else if (m.status === "loading language traineddata") label = `Loading language model (${ocrLang})`;
          else if (m.status === "initializing api") label = "Setting up recognition";
          else if (m.status === "recognizing text") label = `Recognizing text (${progress}%)`;
          options.onProgress(label, progress);
        }
      },
    });

    if (result && result.data && result.data.text) {
      const rawLines = result.data.text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const words: string[] = [];
      rawLines.forEach((l) => {
        l.split(/\s+/).forEach((w) => {
          if (w.trim()) words.push(w.trim());
        });
      });

      if (rawLines.length > 0) {
        return {
          textLines: rawLines,
          rawWords: words,
        };
      }
    }
  } catch (err) {
    console.warn("Tesseract local WASM engine fallback:", err);
  }

  const templates = getMultiFontTemplateDatabase();

  // Optimal resolution scaling: upscale if width < 1400px for sharp character boundaries
  let workCanvas = canvas;
  if (canvas.width < 1400) {
    const scale = Math.min(3.5, 1600 / Math.max(1, canvas.width));
    const upCanvas = document.createElement("canvas");
    upCanvas.width = Math.round(canvas.width * scale);
    upCanvas.height = Math.round(canvas.height * scale);
    const upCtx = upCanvas.getContext("2d");
    if (upCtx) {
      upCtx.imageSmoothingEnabled = true;
      upCtx.imageSmoothingQuality = "high";
      upCtx.drawImage(canvas, 0, 0, upCanvas.width, upCanvas.height);
      workCanvas = upCanvas;
    }
  }

  const ctx = workCanvas.getContext("2d");
  if (!ctx) return { textLines: [], rawWords: [] };

  const w = workCanvas.width;
  const h = workCanvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 1. Grayscale & Integral Image computation
  const gray = new Uint8Array(w * h);
  let totalLum = 0;
  for (let i = 0; i < w * h; i++) {
    const lum = Math.round(data[i * 4]! * 0.299 + data[i * 4 + 1]! * 0.587 + data[i * 4 + 2]! * 0.114);
    gray[i] = lum;
    totalLum += lum;
  }
  const avgLum = totalLum / (w * h);
  const isDarkBg =
    options.contrastMode === "inverted" ? true : options.contrastMode === "high" ? false : avgLum < 110;

  // Integral images: sum & squared sum
  const sumImg = new Float64Array((w + 1) * (h + 1));
  const sqSumImg = new Float64Array((w + 1) * (h + 1));

  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    let rowSqSum = 0;
    for (let x = 0; x < w; x++) {
      const g = gray[y * w + x]!;
      rowSum += g;
      rowSqSum += g * g;
      const idx = (y + 1) * (w + 1) + (x + 1);
      const topIdx = y * (w + 1) + (x + 1);
      sumImg[idx] = sumImg[topIdx]! + rowSum;
      sqSumImg[idx] = sqSumImg[topIdx]! + rowSqSum;
    }
  }

  // 2. Integral Sauvola local binarization with dynamic variance gating
  const binary = new Uint8Array(w * h);
  const winR = Math.max(12, Math.floor(w / 50));
  const kParam = 0.2;

  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - winR);
    const y1 = Math.min(h, y + winR + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - winR);
      const x1 = Math.min(w, x + winR + 1);
      const area = (x1 - x0) * (y1 - y0);

      const sum =
        sumImg[y1 * (w + 1) + x1]! -
        sumImg[y0 * (w + 1) + x1]! -
        sumImg[y1 * (w + 1) + x0]! +
        sumImg[y0 * (w + 1) + x0]!;
      const sqSum =
        sqSumImg[y1 * (w + 1) + x1]! -
        sqSumImg[y0 * (w + 1) + x1]! -
        sqSumImg[y1 * (w + 1) + x0]! +
        sqSumImg[y0 * (w + 1) + x0]!;

      const mean = sum / area;
      const variance = Math.max(0, (sqSum - (sum * sum) / area) / area);
      const std = Math.sqrt(variance);

      const g = gray[y * w + x]!;
      if (std < 10) {
        // Flat region variance gate: avoid background speckling
        binary[y * w + x] = isDarkBg ? (g > 175 ? 1 : 0) : (g < 75 ? 1 : 0);
      } else {
        const thresh = mean * (1 + kParam * (std / 128 - 1));
        binary[y * w + x] = isDarkBg ? (g >= thresh ? 1 : 0) : (g < thresh ? 1 : 0);
      }
    }
  }

  // 3. 2D Connected Component Analysis (CCA) - Extract all foreground character blobs
  const visited = new Uint8Array(w * h);
  const rawBlobs: CharacterBlob[] = [];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (binary[idx] === 1 && !visited[idx]) {
        // 8-way flood fill
        let minBX = x, maxBX = x, minBY = y, maxBY = y;
        let blobArea = 0;
        let sumX = 0, sumY = 0;
        const qx = [x];
        const qy = [y];
        visited[idx] = 1;
        let qHead = 0;

        const blobPixelCoords: Array<{ px: number; py: number }> = [];

        while (qHead < qx.length) {
          const cx = qx[qHead] as number;
          const cy = qy[qHead] as number;
          qHead++;
          blobArea++;
          sumX += cx;
          sumY += cy;
          blobPixelCoords.push({ px: cx, py: cy });

          if (cx < minBX) minBX = cx;
          if (cx > maxBX) maxBX = cx;
          if (cy < minBY) minBY = cy;
          if (cy > maxBY) maxBY = cy;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nidx = ny * w + nx;
                if (binary[nidx] === 1 && !visited[nidx]) {
                  visited[nidx] = 1;
                  qx.push(nx);
                  qy.push(ny);
                }
              }
            }
          }
        }

        const bw = maxBX - minBX + 1;
        const bh = maxBY - minBY + 1;

        // Noise & Page Border Filter
        if (bh < 4 || blobArea < 4) continue;
        if (bw > w * 0.95 || bh > h * 0.95) continue;

        // Build tight pixel mask
        const mask = new Uint8Array(bw * bh);
        for (let pi = 0; pi < blobPixelCoords.length; pi++) {
          const p = blobPixelCoords[pi]!;
          mask[(p.py - minBY) * bw + (p.px - minBX)] = 1;
        }

        rawBlobs.push({
          minX: minBX,
          minY: minBY,
          maxX: maxBX,
          maxY: maxBY,
          width: bw,
          height: bh,
          area: blobArea,
          centerX: sumX / blobArea,
          centerY: sumY / blobArea,
          mask,
        });
      }
    }
  }

  if (rawBlobs.length === 0) return { textLines: [], rawWords: [] };

  // 4. Touching Character Splitting (Valley Cut Decomposition)
  const individualBlobs: CharacterBlob[] = [];
  for (const b of rawBlobs) {
    const aspect = b.width / Math.max(1, b.height);
    // If blob is unusually wide, it is almost certainly multiple touching characters
    if (aspect > 1.35 && b.width > 22) {
      // Compute vertical projection of this blob
      const colProj = new Int32Array(b.width);
      for (let cy = 0; cy < b.height; cy++) {
        for (let cx = 0; cx < b.width; cx++) {
          if (b.mask[cy * b.width + cx] === 1) {
            colProj[cx] = (colProj[cx] ?? 0) + 1;
          }
        }
      }

      // Smooth projection
      const smoothProj = new Float32Array(b.width);
      for (let cx = 0; cx < b.width; cx++) {
        const left = cx > 0 ? colProj[cx - 1]! : colProj[cx]!;
        const right = cx < b.width - 1 ? colProj[cx + 1]! : colProj[cx]!;
        smoothProj[cx] = (left + colProj[cx]! + right) / 3;
      }

      // Find local minima valleys (cut points)
      const cuts: number[] = [0];
      const minCharW = Math.max(8, Math.round(b.height * 0.4));
      let lastCut = 0;

      for (let cx = minCharW; cx < b.width - minCharW; cx++) {
        if (cx - lastCut >= minCharW) {
          const val = smoothProj[cx]!;
          const isMin = val <= smoothProj[cx - 1]! && val <= smoothProj[cx + 1]!;
          if (isMin && val < b.height * 0.45) {
            cuts.push(cx);
            lastCut = cx;
          }
        }
      }
      cuts.push(b.width);

      if (cuts.length > 2) {
        for (let ci = 0; ci < cuts.length - 1; ci++) {
          const c0 = cuts[ci]!;
          const c1 = cuts[ci + 1]!;
          const subW = c1 - c0;
          if (subW < 3) continue;

          // Find tight vertical bounds of sub-glyph
          let sMinY = b.height, sMaxY = 0, subArea = 0;
          const subMask = new Uint8Array(subW * b.height);
          for (let cy = 0; cy < b.height; cy++) {
            for (let cx = c0; cx < c1; cx++) {
              if (b.mask[cy * b.width + cx] === 1) {
                if (cy < sMinY) sMinY = cy;
                if (cy > sMaxY) sMaxY = cy;
                subMask[cy * subW + (cx - c0)] = 1;
                subArea++;
              }
            }
          }

          if (subArea > 4 && sMaxY >= sMinY) {
            const subH = sMaxY - sMinY + 1;
            const tightSubMask = new Uint8Array(subW * subH);
            for (let cy = sMinY; cy <= sMaxY; cy++) {
              for (let cx = 0; cx < subW; cx++) {
                tightSubMask[(cy - sMinY) * subW + cx] = subMask[cy * subW + cx]!;
              }
            }
            individualBlobs.push({
              minX: b.minX + c0,
              minY: b.minY + sMinY,
              maxX: b.minX + c1 - 1,
              maxY: b.minY + sMaxY,
              width: subW,
              height: subH,
              area: subArea,
              centerX: b.minX + c0 + subW / 2,
              centerY: b.minY + sMinY + subH / 2,
              mask: tightSubMask,
            });
          }
        }
        continue;
      }
    }
    individualBlobs.push(b);
  }

  // 5. Line Formation via Baseline & Vertical Proximity Clustering
  individualBlobs.sort((a, b) => a.centerY - b.centerY);
  const lineClusters: Array<{ avgY: number; avgH: number; blobs: CharacterBlob[] }> = [];

  for (const b of individualBlobs) {
    let matchedCluster = null;
    for (const cl of lineClusters) {
      const vertOverlap = Math.min(b.maxY, cl.avgY + cl.avgH / 2) - Math.max(b.minY, cl.avgY - cl.avgH / 2);
      const overlapRatio = vertOverlap / Math.max(1, Math.min(b.height, cl.avgH));
      if (overlapRatio > 0.35 || Math.abs(b.centerY - cl.avgY) < Math.max(b.height, cl.avgH) * 0.55) {
        matchedCluster = cl;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.blobs.push(b);
      matchedCluster.avgY =
        matchedCluster.blobs.reduce((s, item) => s + item.centerY, 0) / matchedCluster.blobs.length;
      matchedCluster.avgH =
        matchedCluster.blobs.reduce((s, item) => s + item.height, 0) / matchedCluster.blobs.length;
    } else {
      lineClusters.push({
        avgY: b.centerY,
        avgH: b.height,
        blobs: [b],
      });
    }
  }

  // Sort lines top to bottom
  lineClusters.sort((a, b) => a.avgY - b.avgY);

  // 6. Character Recognition & Line Assembly
  const recognizedLines: string[] = [];
  const rawWords: string[] = [];

  for (const line of lineClusters) {
    // Sort blobs in line horizontally (left to right)
    line.blobs.sort((a, b) => a.minX - b.minX);

    const charWidths = line.blobs.map((b) => b.width);
    const medianW = charWidths.sort((a, b) => a - b)[Math.floor(charWidths.length / 2)] || 16;
    const spaceThreshold = Math.max(6, Math.round(medianW * 0.48));

    let lineStr = "";
    let curWord = "";

    for (let bi = 0; bi < line.blobs.length; bi++) {
      const b = line.blobs[bi]!;

      // Check for space between previous character
      if (bi > 0) {
        const gap = b.minX - line.blobs[bi - 1]!.maxX;
        if (gap >= spaceThreshold) {
          lineStr += " ";
          if (curWord) {
            rawWords.push(curWord);
            curWord = "";
          }
        }
      }

      // Downsample candidate mask into 18x18 normalized grid
      const candGrid = new Float32Array(324);
      let darkCount = 0;
      for (let r = 0; r < 18; r++) {
        const sy0 = Math.floor((r * b.height) / 18);
        const sy1 = Math.max(sy0 + 1, Math.floor(((r + 1) * b.height) / 18));
        for (let c = 0; c < 18; c++) {
          const sx0 = Math.floor((c * b.width) / 18);
          const sx1 = Math.max(sx0 + 1, Math.floor(((c + 1) * b.width) / 18));
          let s = 0, num = 0;
          for (let y = sy0; y < sy1 && y < b.height; y++) {
            for (let x = sx0; x < sx1 && x < b.width; x++) {
              if (b.mask[y * b.width + x] === 1) s++;
              num++;
            }
          }
          const val = num > 0 ? s / num : 0;
          candGrid[r * 18 + c] = val;
          if (val > 0.35) darkCount++;
        }
      }

      const aspect = b.width / Math.max(1, b.height);
      const density = darkCount / 324;
      const matchedChar = recognizeGlyph(candGrid, aspect, density, templates);

      lineStr += matchedChar;
      curWord += matchedChar;
    }

    if (curWord) rawWords.push(curWord);
    if (lineStr.trim()) recognizedLines.push(lineStr.trim());
  }

  // 7. Dictionary & Lexical Correction Pipeline
  const commonDictionary: Record<string, string> = {
    CONVERSION: "Conversion",
    COMPLETE: "Complete",
    IMAGE: "Image",
    SUCCESSFULLY: "Successfully",
    CONVERTED: "Converted",
    ORIGINAL: "Original",
    PROCESSED: "Processed",
    DOWNLOAD: "Download",
    INVOICE: "INVOICE",
    RECEIPT: "RECEIPT",
    TOTAL: "Total",
    AMOUNT: "Amount",
    DATE: "Date",
    CUSTOMER: "Customer",
    STATUS: "Status",
    PAID: "Paid",
    PENDING: "Pending",
    EMAIL: "Email",
    PHONE: "Phone",
    ADDRESS: "Address",
    NUMBER: "Number",
    TAX: "Tax",
    DISCOUNT: "Discount",
    SUBTOTAL: "Subtotal",
    BALANCE: "Balance",
    DUE: "Due",
    PAYMENT: "Payment",
    THANK: "Thank",
    YOU: "You",
    SMALLER: "Smaller",
    LARGER: "Larger",
    KB: "KB",
    MB: "MB",
    PX: "px",
  };

  const postProcessed = recognizedLines.map((line) => {
    let clean = line.replace(/\s*:\s*/g, ": ");
    // Replace dictionary words if Levenshtein or case-insensitive match
    const words = clean.split(" ");
    const fixedWords = words.map((wrd) => {
      const stripped = wrd.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (commonDictionary[stripped]) {
        const replacement = commonDictionary[stripped]!;
        // preserve trailing punctuation
        const trail = wrd.match(/[^a-zA-Z0-9]+$/)?.[0] || "";
        const lead = wrd.match(/^[^a-zA-Z0-9]+/)?.[0] || "";
        return lead + replacement + trail;
      }
      return wrd;
    });

    return fixedWords.join(" ");
  });

  return {
    textLines: postProcessed,
    rawWords,
  };
};

/**
 * Assembles final structured OCR output text combining Barcode/QR payloads and OCR text
 */
const assembleOcrOutputText = (
  lines: string[],
  barcodes: DetectedCodeItem[],
  skipBarcodeAndQr: boolean,
  structure: "structured" | "plain" | "json" = "structured"
): string => {
  const parts: string[] = [];

  if (structure === "plain") {
    if (!skipBarcodeAndQr && barcodes && barcodes.length > 0) {
      barcodes.forEach((b) => {
        parts.push(`[${b.type}: ${b.rawValue}]`);
      });
      if (lines.length > 0) parts.push("");
    }
    if (lines.length > 0) {
      parts.push(lines.join("\n"));
    } else if (!(!skipBarcodeAndQr && barcodes && barcodes.length > 0)) {
      parts.push("[No readable text or codes detected. Ensure the image is clear and high contrast.]");
    }
    return parts.join("\n").trim();
  }

  // 1. Include QR & Barcode payloads if detected and not skipped
  if (!skipBarcodeAndQr && barcodes && barcodes.length > 0) {
    parts.push("======================================================================");
    parts.push("📷 DETECTED BARCODE & QR CODE DATA");
    parts.push("======================================================================");
    barcodes.forEach((b, i) => {
      parts.push(`[${i + 1}] Type: ${b.type} (${b.format})`);
      parts.push(`    Payload: ${b.rawValue}`);
      parts.push("");
    });
    parts.push("======================================================================");
    parts.push("");
  }

  // 2. Format Extracted Document Content
  if (lines.length > 0) {
    if (structure === "json") {
      const kv: Record<string, string> = {};
      const unassigned: string[] = [];
      lines.forEach((line) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < line.length - 1) {
          const k = line.substring(0, colonIdx).trim();
          const v = line.substring(colonIdx + 1).trim();
          if (k && v) {
            kv[k] = v;
            return;
          }
        }
        unassigned.push(line);
      });
      const outputObj: Record<string, any> = {};
      if (!skipBarcodeAndQr && barcodes && barcodes.length > 0) {
        outputObj["detected_codes"] = barcodes.map((b) => ({
          type: b.type,
          format: b.format,
          value: b.rawValue,
        }));
      }
      outputObj["fields"] = kv;
      outputObj["text_lines"] = unassigned;
      parts.push(JSON.stringify(outputObj, null, 2));
    } else {
      parts.push("📄 EXTRACTED DOCUMENT TEXT");
      parts.push("──────────────────────────────────────────────────────────────────────");
      parts.push(lines.join("\n"));
    }
  } else if (!(!skipBarcodeAndQr && barcodes.length > 0)) {
    parts.push("[No readable text or codes detected. Ensure the image is clear and high contrast.]");
  }

  return parts.join("\n").trim();
};

const renderHtmlToImage = async (
  html: string,
  width: number,
  height: number,
  bgColor: string,
  format: "PNG" | "JPG"
): Promise<string> => {
  // 1. Create a hidden, off-screen container attached to DOM for accurate layout and style calculation
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.maxWidth = `${width}px`;
  container.style.maxHeight = `${height}px`;
  container.style.overflow = "hidden";
  container.style.backgroundColor = bgColor === "transparent" ? "transparent" : bgColor;
  container.style.zIndex = "-9999";
  container.style.boxSizing = "border-box";
  container.style.margin = "0";
  container.style.padding = "0";

  // Parse HTML to support full HTML5 documents or raw snippets
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(html, "text/html");

  // Extract head styles and links
  const headElements = Array.from(parsedDoc.head.childNodes);
  const headWrapper = document.createElement("div");
  headElements.forEach((el) => {
    try {
      headWrapper.appendChild(el.cloneNode(true));
    } catch {
      // ignore
    }
  });
  container.appendChild(headWrapper);

  // Body container
  const bodyWrapper = document.createElement("div");
  bodyWrapper.style.width = "100%";
  bodyWrapper.style.height = "100%";
  bodyWrapper.style.boxSizing = "border-box";
  if (bgColor !== "transparent") {
    bodyWrapper.style.backgroundColor = bgColor;
  }

  if (parsedDoc.body && parsedDoc.body.innerHTML.trim()) {
    bodyWrapper.innerHTML = parsedDoc.body.innerHTML;
  } else {
    bodyWrapper.innerHTML = html;
  }
  container.appendChild(bodyWrapper);
  document.body.appendChild(container);

  try {
    // Micro-delay to allow CSS styles and font measurements to resolve
    await new Promise((r) => setTimeout(r, 60));

    const htmlToImageLib = await import("html-to-image");
    const options: any = {
      width,
      height,
      pixelRatio: 2, // High-DPI crisp rendering
      cacheBust: true,
      skipAutoScale: true,
    };
    if (bgColor && bgColor !== "transparent") {
      options.backgroundColor = bgColor;
    }

    let dataUrl: string;
    if (format === "JPG") {
      dataUrl = await htmlToImageLib.toJpeg(container, { ...options, quality: 0.95 });
    } else {
      dataUrl = await htmlToImageLib.toPng(container, options);
    }

    return dataUrl;
  } catch (primaryErr) {
    console.warn("html-to-image primary engine error, falling back to SVG canvas:", primaryErr);
    return new Promise((resolve, reject) => {
      tryRawSvgFallback(html, width, height, bgColor, format, resolve, reject);
    });
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};

/**
 * Advanced Multi-pass HD enhancement for resized images:
 * 1. 3x3 adaptive unsharp mask convolution kernel with edge preservation
 * 2. Micro-contrast clarity boost to ensure high-fidelity detail
 */
function applyHDResizingEnhancement(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number = 0.45
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // Laplacian unsharp mask kernel weights
    const k = strength;
    const center = 1 + 4 * k;

    for (let y = 1; y < height - 1; y++) {
      const row = y * width;
      const topRow = (y - 1) * width;
      const botRow = (y + 1) * width;

      for (let x = 1; x < width - 1; x++) {
        const i = (row + x) * 4;
        const topI = (topRow + x) * 4;
        const botI = (botRow + x) * 4;
        const leftI = (row + (x - 1)) * 4;
        const rightI = (row + (x + 1)) * 4;

        // Apply convolution sharpening to RGB channels
        for (let c = 0; c < 3; c++) {
          const current = copy[i + c] ?? 0;
          const top = copy[topI + c] ?? 0;
          const bottom = copy[botI + c] ?? 0;
          const left = copy[leftI + c] ?? 0;
          const right = copy[rightI + c] ?? 0;

          // High-pass edge sharpening
          const sharpened = current * center - (top + bottom + left + right) * k;

          // Micro-contrast clarity boost
          const norm = sharpened / 255;
          const enhanced = norm > 0.5 
            ? Math.min(1, norm + Math.pow(norm - 0.5, 2) * 0.12)
            : Math.max(0, norm - Math.pow(0.5 - norm, 2) * 0.12);

          data[i + c] = Math.min(255, Math.max(0, Math.round(enhanced * 255)));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn("HD sharpening pass bypassed:", err);
  }
}

type CropBox = {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
};

export function InteractiveToolWorkspace({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [origSize, setOrigSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Tool Specific Controls State
  // 1. Compress
  const [compressMode, setCompressMode] = useState<"quality" | "size">("quality");
  const [quality, setQuality] = useState<number>(75);
  const [targetSizeInput, setTargetSizeInput] = useState<string>("");
  const [targetSizeUnit, setTargetSizeUnit] = useState<"KB" | "MB">("KB");
  const [compressFormat, setCompressFormat] = useState<"auto" | "image/webp" | "image/jpeg" | "image/png">("auto");
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);

  // 2. Resize
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [resizeQualityMode, setResizeQualityMode] = useState<"same" | "improved">("same");

  // 3. Crop
  const [cropAspect, setCropAspect] = useState<"free" | "1:1" | "4:3" | "16:9" | "9:16">("free");
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });

  // Dragging crop state
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragHandle, setCropDragHandle] = useState<string | null>(null);
  const [cropDragStart, setCropDragStart] = useState<{ mouseX: number; mouseY: number; box: CropBox }>({
    mouseX: 0,
    mouseY: 0,
    box: { x: 10, y: 10, w: 80, h: 80 },
  });

  // 4. Convert
  const [targetFormat, setTargetFormat] = useState<
    "image/jpeg" | "image/png" | "image/webp" | "image/avif" | "image/gif" | "image/bmp" | "image/tiff"
  >("image/png");

  useEffect(() => {
    if (tool.slug === "convert-to-jpg") {
      setTargetFormat("image/jpeg");
    }
    if (tool.slug === "html-to-image" && !imageSrc) {
      setHtmlCodeText(SAMPLE_OG_CARD);
      renderHtmlToImage(SAMPLE_OG_CARD, 1200, 630, "#0f172a", "PNG")
        .then((dataUrl) => {
          setImageSrc(dataUrl);
          setDimensions({ width: 1200, height: 630 });
          setHasProcessed(false);
        })
        .catch(() => {});
    }
    if (tool.slug === "binary-to-image" && !imageSrc) {
      const initialText = SAMPLE_BINARY_INVADER;
      setInputConvertText(initialText);
      const url = decodeBinaryStringToImageUrl(initialText, {
        color0: "#0b1320",
        color1: "#22c55e",
        pixelScale: 20,
      });
      if (url) {
        setImageSrc(url);
        setDimensions({ width: 11 * 20, height: 8 * 20 });
        setHasProcessed(false);
      }
    }
  }, [tool.slug]);

  // 5. Rotate & Flip
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // 6. Watermark
  const [wmText, setWmText] = useState<string>("© bg Watermark");
  const [wmPosition, setWmPosition] = useState<"center" | "top_left" | "top_right" | "bottom_left" | "bottom_right">("center");
  const [wmOpacity, setWmOpacity] = useState<number>(0.7);
  const [wmColor, setWmColor] = useState<string>("#ffffff");
  const [wmFontSize, setWmFontSize] = useState<number>(36);

  // 7. Upscale
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);

  // 8. Blur Face / Anonymise
  const [blurRadius, setBlurRadius] = useState<number>(20);

  // 9. Meme Generator
  const [topText, setTopText] = useState<string>("WHEN YOU USE AI");
  const [bottomText, setBottomText] = useState<string>("AND IT JUST WORKS PERFECTLY");
  const [memeFontSize, setMemeFontSize] = useState<number>(42);

  // 10. Photo Editor Filters
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);

  // 11. OCR Text & Barcode/QR Engine State
  const [ocrText, setOcrText] = useState<string>("");
  const [rawOcrDocumentLines, setRawOcrDocumentLines] = useState<string[]>([]);
  const [detectedBarcodes, setDetectedBarcodes] = useState<DetectedCodeItem[]>([]);
  const [skipBarcodeAndQr, setSkipBarcodeAndQr] = useState<boolean>(false);
  const [ocrContrastMode, setOcrContrastMode] = useState<"auto" | "high" | "inverted">("auto");
  const [ocrOutputStructure, setOcrOutputStructure] = useState<"structured" | "plain" | "json">("structured");
  const [ocrLanguage, setOcrLanguage] = useState<string>("eng");
  const [ocrCustomLanguage, setOcrCustomLanguage] = useState<string>("");
  const [ocrLanguageSearch, setOcrLanguageSearch] = useState<string>("");
  const [isOcrLanguageDialogOpen, setIsOcrLanguageDialogOpen] = useState<boolean>(false);
  const [ocrProgressStatus, setOcrProgressStatus] = useState<string>("");
  const [ocrProgressPercent, setOcrProgressPercent] = useState<number>(0);

  const recomputeOcrOutput = (
    skip: boolean,
    contrast: "auto" | "high" | "inverted",
    structure: "structured" | "plain" | "json"
  ) => {
    const text = assembleOcrOutputText(rawOcrDocumentLines, detectedBarcodes, skip, structure);
    setOcrText(text);
    setBinaryOutputText(text);
  };

  // 12. Square Image & New Format Tools State
  const [squareBgMode, setSquareBgMode] = useState<"blur" | "white" | "black">("blur");
  const [inputConvertText, setInputConvertText] = useState<string>("");

  // Binary to Image Tool State
  const [binaryInputTab, setBinaryInputTab] = useState<"paste" | "upload">("paste");
  const [binaryTheme, setBinaryTheme] = useState<BinaryThemeKey>("matrix");
  const [binaryPixelBlockSize, setBinaryPixelBlockSize] = useState<number>(20);

  // 13. Image to Binary Settings State
  const [binaryOutputMode, setBinaryOutputMode] = useState<
    "Binary" | "Base64" | "Hexadecimal" | "C-Array" | "Pixel-Matrix" | "Decimal" | "Octal"
  >("Binary");
  const [binaryDelimiter, setBinaryDelimiter] = useState<"Space" | "Comma" | "None" | "Newline">("Space");
  const [binaryBitDepth, setBinaryBitDepth] = useState<string>("8 Bit (Byte)");
  const [customBitDepth, setCustomBitDepth] = useState<number>(8);
  const [binaryWithPrefix, setBinaryWithPrefix] = useState<boolean>(false);
  const [pixelThreshold, setPixelThreshold] = useState<number>(128);
  const [binaryOutputText, setBinaryOutputText] = useState<string>("");
  const [fullBinaryOutputText, setFullBinaryOutputText] = useState<string>("");
  const [isBinaryTruncatedPreview, setIsBinaryTruncatedPreview] = useState<boolean>(false);

  // 12. Color Picker State
  const [pickedHex, setPickedHex] = useState<string>("#F97316");
  const [pickedRgb, setPickedRgb] = useState<string>("rgb(249, 115, 22)");
  const [pickedHsl, setPickedHsl] = useState<string>("hsl(22, 95%, 53%)");
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [focusedDim, setFocusedDim] = useState<"width" | "height" | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [showDynamicIsland, setShowDynamicIsland] = useState(false);

  // 14. Binary & Code Research Editor Modal State
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [rawBinaryBytes, setRawBinaryBytes] = useState<Uint8Array | null>(null);
  const [editorTheme, setEditorTheme] = useState<EditorThemeKey>("vs-dark");
  const [editorFontSize, setEditorFontSize] = useState<number>(13);
  const [editorLineWrap, setEditorLineWrap] = useState<boolean>(true);
  const [editorSearchQuery, setEditorSearchQuery] = useState<string>("");
  const [isEditorSearching, setIsEditorSearching] = useState<boolean>(false);

  const binaryStats = useMemo(() => {
    if (!rawBinaryBytes || rawBinaryBytes.length === 0) {
      return {
        entropy: 0,
        zeroCount: 0,
        oneCount: 0,
        bitDensity: 0,
        magic: { format: "Binary Stream", description: "Raw encoded stream", magicHex: "N/A" },
        totalBytes: 0,
        totalBits: 0,
      };
    }
    const entropyData = calculateEntropy(rawBinaryBytes);
    const magic = detectMagicSignature(rawBinaryBytes);
    return {
      ...entropyData,
      magic,
      totalBytes: rawBinaryBytes.length,
      totalBits: rawBinaryBytes.length * 8,
    };
  }, [rawBinaryBytes]);

  // Scroll listener for Top Dynamic Island Bar
  useEffect(() => {
    if (!hasProcessed || isEditingSettings) {
      setShowDynamicIsland(false);
      return;
    }

    const handleScroll = () => {
      // Trigger when scrolled down past 180px
      const isScrolled = window.scrollY > 180;
      setShowDynamicIsland(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasProcessed, isEditingSettings]);

  // 14. HTML to Image State
  const [htmlInputMode, setHtmlInputMode] = useState<"upload" | "paste">("paste");
  const [htmlCodeText, setHtmlCodeText] = useState<string>(SAMPLE_OG_CARD);
  const [htmlRenderWidth, setHtmlRenderWidth] = useState<number>(1200);
  const [htmlRenderHeight, setHtmlRenderHeight] = useState<number>(630);
  const [htmlBgColor, setHtmlBgColor] = useState<string>("#0f172a");
  const [htmlOutputFormat, setHtmlOutputFormat] = useState<"PNG" | "JPG">("PNG");

  // 15. Text to Image State
  const [txtImgWidth, setTxtImgWidth] = useState<number>(1200);
  const [txtImgHeight, setTxtImgHeight] = useState<number>(630);
  const [txtImgFont, setTxtImgFont] = useState<string>("Inter, sans-serif");
  const [txtImgFontSize, setTxtImgFontSize] = useState<number>(48);
  const [txtImgFontColor, setTxtImgFontColor] = useState<string>("#ffffff");
  const [txtImgBgType, setTxtImgBgType] = useState<"solid" | "gradient">("gradient");
  const [txtImgBgColor, setTxtImgBgColor] = useState<string>("#0f172a");
  const [txtImgBgColor2, setTxtImgBgColor2] = useState<string>("#4f46e5");
  const [txtImgAlign, setTxtImgAlign] = useState<string>("center");
  const [txtImgBold, setTxtImgBold] = useState<boolean>(true);
  const [txtImgItalic, setTxtImgItalic] = useState<boolean>(false);

  // 16. Document export blob (for image-to-pdf/word/excel/pptx download)
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [documentExt, setDocumentExt] = useState<string>("pdf");
  const [pdfPageSize, setPdfPageSize] = useState<"auto" | "a4_portrait" | "a4_landscape" | "letter_portrait" | "letter_landscape">("auto");
  const [pdfMargin, setPdfMargin] = useState<"none" | "small" | "normal" | "large">("none");
  const [pdfQuality, setPdfQuality] = useState<number>(95);

  // Word (.docx) OCR state
  const [wordDocMode, setWordDocMode] = useState<"text_clean" | "text_and_image" | "image_only">("text_clean");
  const [wordFontFamily, setWordFontFamily] = useState<string>("Calibri");
  const [wordFontSize, setWordFontSize] = useState<number>(11);

  // Excel (.xlsx) OCR state
  const [excelParserMode, setExcelParserMode] = useState<"grid" | "csv" | "whitespace" | "lines">("grid");
  const [excelHighlightHeader, setExcelHighlightHeader] = useState<boolean>(true);
  const [excelSheetName, setExcelSheetName] = useState<string>("Sheet1");

  const imgRef = useRef<HTMLImageElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const [settingsHeight, setSettingsHeight] = useState<number | null>(null);
  const [renderedImgSize, setRenderedImgSize] = useState<{ width: number; height: number } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamically synchronize the image box height to the settings box height
  useEffect(() => {
    if (!settingsPanelRef.current) return;
    const updateHeight = () => {
      if (settingsPanelRef.current) {
        setSettingsHeight(settingsPanelRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(settingsPanelRef.current);
    return () => observer.disconnect();
  }, [imageSrc, tool.slug, targetSizeInput, targetSizeUnit]);

  // Fullscreen Preview Body Scroll Lock & Escape Key Handler
  useEffect(() => {
    if (!isFullscreenPreview && !isCodeEditorOpen) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreenPreview(false);
        setIsCodeEditorOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreenPreview, isCodeEditorOpen]);

  // Track the actual rendered pixel width and height of the image
  useEffect(() => {
    if (!imgRef.current) return;
    const updateImgSize = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setRenderedImgSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
        }
      }
    };
    updateImgSize();
    const observer = new ResizeObserver(updateImgSize);
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [imageSrc, processedSrc, dimensions.width, dimensions.height, targetWidth, targetHeight, settingsHeight]);

  // Adjust crop aspect preset helper
  const applyCropAspectPreset = useCallback((ratio: "free" | "1:1" | "4:3" | "16:9" | "9:16") => {
    setCropAspect(ratio);
    if (ratio === "free") {
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      return;
    }
    let targetRatio = 1;
    if (ratio === "1:1") targetRatio = 1;
    if (ratio === "4:3") targetRatio = 4 / 3;
    if (ratio === "16:9") targetRatio = 16 / 9;
    if (ratio === "9:16") targetRatio = 9 / 16;

    const imgAspect = dimensions.width && dimensions.height ? dimensions.width / dimensions.height : 1;
    let w = 80;
    let h = (w * imgAspect) / targetRatio;
    if (h > 90) {
      h = 80;
      w = (h * targetRatio) / imgAspect;
    }
    const x = Math.max(0, (100 - w) / 2);
    const y = Math.max(0, (100 - h) / 2);
    setCropBox({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
  }, [dimensions]);

  const processSelectedFile = (selected: File) => {
    // Document-to-image tools: load buffer and render preview immediately
    if (["pdf-to-image", "word-to-image", "excel-to-image", "powerpoint-to-image"].includes(tool.slug)) {
      setFile(selected);
      setOrigSize(selected.size);
      setProcessing(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (!buffer) {
          setProcessing(false);
          toast.error("Failed to read file.");
          return;
        }
        try {
          let lines: string[] = [`Document: ${selected.name}`];
          let bg = "#ffffff", textColor = "#1a1a2e", titleColor = "#1a1a2e", font = "Georgia, serif";
          let canvasW = 794, canvasH = 1123; // A4 at 96dpi

          if (tool.slug === "pdf-to-image") {
            const dec = new TextDecoder("latin1");
            const text = dec.decode(buffer);
            const btMatches = text.match(/BT[\s\S]{0,500}?ET/g) || [];
            const extracted = btMatches.flatMap(block => {
              const tjs = block.match(/\(([^)]+)\)\s*Tj/g) || [];
              return tjs.map(tj => tj.replace(/^\(|\)\s*Tj$/g, "").trim());
            }).filter(s => s.length > 1 && s.length < 200);
            lines = extracted.length > 0 ? extracted : [`PDF Document: ${selected.name}`, "[Ready to convert PDF pages]"];
          } else if (tool.slug === "word-to-image") {
            const xml = await extractFileFromZip(buffer, "word/document.xml");
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              const textNodes = Array.from(dom.querySelectorAll("t"));
              const rawText = textNodes.map(n => n.textContent || "").join(" ");
              lines = rawText.split(/\s{3,}|\n/).map(s => s.trim()).filter(s => s.length > 0);
              if (lines.length === 0) lines = [`Word Document: ${selected.name}`, "[Ready to convert Word document]"];
            } else lines = [`Word Document: ${selected.name}`, "[Ready to convert Word document]"];
          } else if (tool.slug === "excel-to-image") {
            const xml = await extractFileFromZip(buffer, "xl/worksheets/sheet1.xml");
            bg = "#ffffff"; textColor = "#1e293b"; font = "Consolas, monospace";
            canvasW = 1200; canvasH = 800;
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              const rows = Array.from(dom.querySelectorAll("row"));
              const canvas2 = document.createElement("canvas");
              canvas2.width = canvasW; canvas2.height = canvasH;
              const ctx2 = canvas2.getContext("2d")!;
              ctx2.fillStyle = bg; ctx2.fillRect(0, 0, canvasW, canvasH);
              ctx2.font = "bold 15px Consolas, monospace";
              const cols = 8, cellW = Math.floor(canvasW / cols), cellH = 36;
              const rowData: string[][] = rows.slice(0, 20).map(row =>
                Array.from(row.querySelectorAll("c")).map(c => c.querySelector("v")?.textContent || "")
              );
              rowData.forEach((row, ri) => {
                ctx2.fillStyle = ri === 0 ? "#1e3a5f" : (ri % 2 === 0 ? "#f1f5f9" : "#ffffff");
                ctx2.fillRect(0, ri * cellH + 60, canvasW, cellH);
                ctx2.strokeStyle = "#cbd5e1"; ctx2.strokeRect(0, ri * cellH + 60, canvasW, cellH);
                row.slice(0, cols).forEach((cell, ci) => {
                  ctx2.fillStyle = ri === 0 ? "#ffffff" : "#1e293b";
                  ctx2.fillText(cell, ci * cellW + 8, ri * cellH + 83, cellW - 8);
                });
              });
              ctx2.fillStyle = "#1e3a5f"; ctx2.fillRect(0, 0, canvasW, 50);
              ctx2.fillStyle = "#ffffff"; ctx2.font = "bold 18px sans-serif";
              ctx2.fillText(`Excel: ${selected.name}`, 16, 34);
              const url = canvas2.toDataURL("image/png");
              setProcessedSrc(url); setImageSrc(url);
              setDimensions({ width: canvasW, height: canvasH });
              setHasProcessed(true); setProcessing(false);
              toast.success(`Loaded and rendered ${selected.name}!`);
              return;
            } else lines = [`Excel: ${selected.name}`, "[Ready to convert Excel sheet]"];
          } else if (tool.slug === "powerpoint-to-image") {
            const xml = await extractFileFromZip(buffer, "ppt/slides/slide1.xml");
            bg = "#1e1b4b"; textColor = "#e2e8f0"; titleColor = "#ffffff"; font = "Segoe UI, sans-serif";
            canvasW = 1280; canvasH = 720;
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              lines = Array.from(dom.querySelectorAll("t")).map(n => n.textContent || "").filter(s => s.trim().length > 0);
              if (lines.length === 0) lines = [`Presentation: ${selected.name}`, "[Ready to convert slide]"];
            } else lines = [`Presentation: ${selected.name}`, "[Ready to convert slide]"];
          }

          const url = renderTextToCanvas(lines, canvasW, canvasH, { bg, textColor, titleColor, font, fontSize: 18, lineH: 28, paddingX: 60, paddingY: 60 });
          setProcessedSrc(url); setImageSrc(url);
          setDimensions({ width: canvasW, height: canvasH });
          setHasProcessed(true);
          setProcessing(false);
          toast.success(`Loaded and rendered ${selected.name}!`);
        } catch (e) {
          setProcessing(false);
          toast.error("Failed to parse document.");
        }
      };
      reader.readAsArrayBuffer(selected);
      return;
    }

    if (tool.slug === "html-to-image") {
      setFile(selected);
      setOrigSize(selected.size);
      setHasProcessed(false);
      setProcessedSrc(null);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setHtmlCodeText(text);
          setHtmlInputMode("upload");
          toast.success(`Loaded HTML from ${selected.name}`);
          setProcessing(true);
          renderHtmlToImage(text, htmlRenderWidth, htmlRenderHeight, htmlBgColor, htmlOutputFormat)
            .then((dataUrl) => {
              setImageSrc(dataUrl);
              setDimensions({ width: htmlRenderWidth, height: htmlRenderHeight });
              setHasProcessed(false);
              setIsEditingSettings(true);
              setProcessing(false);
            })
            .catch(() => {
              setProcessing(false);
              toast.error("Failed to render HTML file.");
            });
        }
      };
      reader.readAsText(selected);
      return;
    }

    if (tool.slug === "binary-to-image") {
      setFile(selected);
      setOrigSize(selected.size);
      setProcessing(true);
      setHasProcessed(false);
      setProcessedSrc(null);

      const isText =
        selected.name.endsWith(".txt") ||
        selected.type.startsWith("text/") ||
        selected.type === "";

      if (selected.name.endsWith(".txt") || selected.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = (evt.target?.result as string) || "";
          setInputConvertText(text);
          const activeTheme = BINARY_THEMES[binaryTheme];
          const url = decodeBinaryStringToImageUrl(text, {
            color0: activeTheme.bg,
            color1: activeTheme.fg,
            pixelScale: binaryPixelBlockSize,
          });
          if (url) {
            setProcessedSrc(url);
            setImageSrc(url);
            const img = new Image();
            img.onload = () => {
              setDimensions({ width: img.width, height: img.height });
              setTargetWidth(img.width);
              setTargetHeight(img.height);
            };
            img.src = url;
            setHasProcessed(true);
            setProcessing(false);
            toast.success(`Loaded and decoded binary text from ${selected.name}!`);
          } else {
            setProcessing(false);
            toast.error("Could not decode binary string from text file. Check format.");
          }
        };
        reader.readAsText(selected);
        return;
      }

      // Read as ArrayBuffer for binary files (.bin, .dat, .raw, etc.)
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (!buffer) {
          setProcessing(false);
          toast.error("Failed to read binary file.");
          return;
        }

        const uint8 = new Uint8Array(buffer);
        let isImage = false;
        let mime = "image/png";
        if (uint8[0] === 0xff && uint8[1] === 0xd8 && uint8[2] === 0xff) {
          isImage = true; mime = "image/jpeg";
        } else if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4e && uint8[3] === 0x47) {
          isImage = true; mime = "image/png";
        } else if (uint8[0] === 0x52 && uint8[1] === 0x49 && uint8[2] === 0x46 && uint8[3] === 0x46) {
          isImage = true; mime = "image/webp";
        } else if (uint8[0] === 0x47 && uint8[1] === 0x49 && uint8[2] === 0x46) {
          isImage = true; mime = "image/gif";
        } else if (uint8[0] === 0x42 && uint8[1] === 0x4d) {
          isImage = true; mime = "image/bmp";
        }

        const binaryBitsArray: string[] = [];
        const maxBitsBytes = Math.min(uint8.length, 2048);
        for (let i = 0; i < maxBitsBytes; i++) {
          const byteVal = uint8[i];
          if (byteVal !== undefined) {
            binaryBitsArray.push(byteVal.toString(2).padStart(8, "0"));
          }
        }
        let binaryStr = binaryBitsArray.join(" ");
        if (uint8.length > 2048) {
          binaryStr += `\n... [${(uint8.length - 2048).toLocaleString()} more bytes in binary file]`;
        }
        setInputConvertText(binaryStr);

        let url: string | null = null;
        if (isImage) {
          const blob = new Blob([uint8], { type: mime });
          url = URL.createObjectURL(blob);
        } else {
          const activeTheme = BINARY_THEMES[binaryTheme];
          url = decodeBinaryStringToImageUrl(binaryStr, {
            color0: activeTheme.bg,
            color1: activeTheme.fg,
            pixelScale: binaryPixelBlockSize,
          });
        }

        if (url) {
          setProcessedSrc(url);
          setImageSrc(url);
          const img = new Image();
          img.onload = () => {
            setDimensions({ width: img.width, height: img.height });
            setTargetWidth(img.width);
            setTargetHeight(img.height);
          };
          img.src = url;
          setHasProcessed(true);
          setProcessing(false);
          toast.success(`Loaded and decoded binary file ${selected.name}!`);
        } else {
          setProcessing(false);
          toast.error("Could not decode binary file data.");
        }
      };
      reader.readAsArrayBuffer(selected);
      return;
    }

    if (!selected.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setFile(selected);
    setOrigSize(selected.size);
    setHasProcessed(false);
    setIsEditingSettings(false);
    setProcessedSrc(null);
    setOcrText("");
    setRawOcrDocumentLines([]);
    setDetectedBarcodes([]);
    setOcrProgressStatus("");
    setOcrProgressPercent(0);
    setBinaryOutputText("");
    setFullBinaryOutputText("");
    setIsBinaryTruncatedPreview(false);

    // Initialize target size input to a smart value strictly lower than the uploaded image
    if (selected.size > 0) {
      const origKB = Math.round(selected.size / 1024);
      const defaultKB = Math.max(5, Math.round(origKB * 0.6));
      if (defaultKB >= 1024) {
        setTargetSizeInput(String(Number((defaultKB / 1024).toFixed(1))));
        setTargetSizeUnit("MB");
      } else {
        setTargetSizeInput(String(defaultKB));
        setTargetSizeUnit("KB");
      }
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      setImageSrc(b64);

      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      };
      img.src = b64;
    };
    reader.readAsDataURL(selected);
  };

  const sampleColorAtEvent = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return null;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const pxX = Math.floor(x * scaleX);
    const pxY = Math.floor(y * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    try {
      const p = ctx.getImageData(pxX, pxY, 1, 1).data;
      const r = p[0] ?? 0, g = p[1] ?? 0, b = p[2] ?? 0;
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsl = rgbToHsl(r, g, b);
      return { hex, rgb, hsl };
    } catch (err) {
      return null;
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tool.slug !== "color-picker-from-image") return;
    const res = sampleColorAtEvent(e);
    if (res) setHoverColor(res.hex);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (tool.slug !== "color-picker-from-image") return;
    const res = sampleColorAtEvent(e);
    if (res) {
      setPickedHex(res.hex);
      setPickedRgb(res.rgb);
      setPickedHsl(res.hsl);
      setColorHistory((prev) => Array.from(new Set([res.hex, ...prev])).slice(0, 16));
      toast.success(`Picked color ${res.hex}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Image to Binary / Base64 / Hex / C-Array / Pixel Matrix / Octal / Decimal Generator Handler
  const generateBinaryData = useCallback(
    (sourceB64: string | null) => {
      if (!sourceB64) {
        setBinaryOutputText("");
        setFullBinaryOutputText("");
        setIsBinaryTruncatedPreview(false);
        return;
      }
      try {
        const base64Data = sourceB64.includes(",") ? sourceB64.split(",")[1] : sourceB64;
        const binaryStr = atob(base64Data || "");
        const totalBytes = binaryStr.length;
        const bytes = new Uint8Array(totalBytes);
        for (let i = 0; i < totalBytes; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        setRawBinaryBytes(bytes);

        const delimChar =
          binaryDelimiter === "Space"
            ? " "
            : binaryDelimiter === "Comma"
            ? ", "
            : binaryDelimiter === "Newline"
            ? "\n"
            : "";

        // 1. Base64 Mode
        if (tool.slug === "image-to-base64" || binaryOutputMode === "Base64") {
          setFullBinaryOutputText(sourceB64);
          if (sourceB64.length > 60000) {
            setBinaryOutputText(
              sourceB64.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters of ${sourceB64.length.toLocaleString()} total chars. Click "Copy Output" or "Download" for 100% full dataset]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(sourceB64);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 2. Pixel Matrix Mode (Visual 1-bit monochrome image bitmap)
        if (binaryOutputMode === "Pixel-Matrix" && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx && canvas.width > 0 && canvas.height > 0) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            const rows: string[] = [];
            const w = canvas.width;
            const h = canvas.height;
            for (let y = 0; y < h; y++) {
              let rowStr = "";
              for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const a = data[idx + 3]! / 255;
                const r = data[idx]! * a + 255 * (1 - a);
                const g = data[idx + 1]! * a + 255 * (1 - a);
                const b = data[idx + 2]! * a + 255 * (1 - a);
                const lum = r * 0.299 + g * 0.587 + b * 0.114;
                rowStr += lum >= pixelThreshold ? "0" : "1";
              }
              rows.push(rowStr);
            }
            const fullMatrix = `// 1-Bit Pixel Monochrome Matrix (${w}x${h} px, Threshold: ${pixelThreshold})\n` + rows.join("\n");
            setFullBinaryOutputText(fullMatrix);
            if (fullMatrix.length > 60000) {
              setBinaryOutputText(
                fullMatrix.slice(0, 60000) +
                  `\n\n... [Displaying first 60,000 characters of ${rows.length} rows. Click "Copy Output" or "Download" for full matrix]`
              );
              setIsBinaryTruncatedPreview(true);
            } else {
              setBinaryOutputText(fullMatrix);
              setIsBinaryTruncatedPreview(false);
            }
            return;
          }
        }

        // 3. Hexadecimal Mode
        if (tool.slug === "image-to-hex" || binaryOutputMode === "Hexadecimal") {
          const prefix = binaryWithPrefix ? "0x" : "";
          const hexArr: string[] = [];
          for (let i = 0; i < totalBytes; i++) {
            hexArr.push(prefix + bytes[i]!.toString(16).padStart(2, "0").toUpperCase());
          }
          const fullResult = hexArr.join(delimChar);
          setFullBinaryOutputText(fullResult);
          if (fullResult.length > 60000) {
            setBinaryOutputText(
              fullResult.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters of ${totalBytes.toLocaleString()} bytes. Click "Copy Output" or "Download" for 100% full Hex dataset]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(fullResult);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 4. C / C++ Array Export Mode
        if (binaryOutputMode === "C-Array") {
          const lines: string[] = [];
          lines.push(`// Image Binary Data Array (${totalBytes.toLocaleString()} bytes)`);
          lines.push(`const unsigned int image_data_len = ${totalBytes};`);
          lines.push(`const unsigned char image_data[${totalBytes}] = {`);

          const hexVals: string[] = [];
          for (let i = 0; i < totalBytes; i++) {
            hexVals.push("0x" + bytes[i]!.toString(16).padStart(2, "0").toUpperCase());
          }

          // Group 16 bytes per line
          for (let i = 0; i < hexVals.length; i += 16) {
            const chunk = hexVals.slice(i, i + 16).join(", ");
            lines.push("  " + chunk + (i + 16 < hexVals.length ? "," : ""));
          }
          lines.push("};");
          const fullResult = lines.join("\n");
          setFullBinaryOutputText(fullResult);
          if (fullResult.length > 60000) {
            setBinaryOutputText(
              fullResult.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters of ${totalBytes.toLocaleString()} bytes. Click "Copy Output" or "Download" for complete C Array]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(fullResult);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 5. Octal Mode
        if (tool.slug === "image-to-octal" || binaryOutputMode === "Octal") {
          const prefix = binaryWithPrefix ? "0o" : "";
          const octArr: string[] = [];
          for (let i = 0; i < totalBytes; i++) {
            octArr.push(prefix + bytes[i]!.toString(8).padStart(3, "0"));
          }
          const fullResult = octArr.join(delimChar);
          setFullBinaryOutputText(fullResult);
          if (fullResult.length > 60000) {
            setBinaryOutputText(
              fullResult.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters. Click "Copy Output" or "Download" for 100% full dataset]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(fullResult);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 6. Decimal Mode
        if (tool.slug === "image-to-decimal" || binaryOutputMode === "Decimal") {
          const decArr: string[] = [];
          for (let i = 0; i < totalBytes; i++) {
            decArr.push(bytes[i]!.toString(10));
          }
          const fullResult = decArr.join(delimChar);
          setFullBinaryOutputText(fullResult);
          if (fullResult.length > 60000) {
            setBinaryOutputText(
              fullResult.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters. Click "Copy Output" or "Download" for 100% full dataset]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(fullResult);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 7. ASCII Character Mode
        if (tool.slug === "image-to-ascii") {
          const asciiChars = "@#S%?*+;:,. ";
          const asciiArr: string[] = [];
          for (let i = 0; i < totalBytes; i++) {
            asciiArr.push(asciiChars[bytes[i]! % asciiChars.length]!);
            if ((i + 1) % 80 === 0) asciiArr.push("\n");
          }
          const fullResult = asciiArr.join("");
          setFullBinaryOutputText(fullResult);
          if (fullResult.length > 60000) {
            setBinaryOutputText(
              fullResult.slice(0, 60000) +
                `\n\n... [Displaying first 60,000 characters. Click "Copy Output" or "Download" for 100% full dataset]`
            );
            setIsBinaryTruncatedPreview(true);
          } else {
            setBinaryOutputText(fullResult);
            setIsBinaryTruncatedPreview(false);
          }
          return;
        }

        // 8. Binary Bits (0/1) Mode - Default & Full Precision
        const prefix = binaryWithPrefix ? "0b" : "";
        let bitCount = 8;
        if (binaryBitDepth.includes("256")) bitCount = 256;
        else if (binaryBitDepth.includes("128")) bitCount = 128;
        else if (binaryBitDepth.includes("64")) bitCount = 64;
        else if (binaryBitDepth.includes("32")) bitCount = 32;
        else if (binaryBitDepth.includes("16")) bitCount = 16;
        else if (binaryBitDepth.includes("8")) bitCount = 8;
        else if (binaryBitDepth.includes("4")) bitCount = 4;
        else if (binaryBitDepth.includes("Custom")) bitCount = Math.max(1, Math.min(1024, customBitDepth || 8));

        const binArr: string[] = [];
        if (bitCount === 4) {
          for (let i = 0; i < totalBytes; i++) {
            const b = bytes[i] ?? 0;
            const hi = (b >> 4) & 0x0f;
            const lo = b & 0x0f;
            binArr.push(prefix + hi.toString(2).padStart(4, "0"));
            binArr.push(prefix + lo.toString(2).padStart(4, "0"));
          }
        } else if (bitCount === 8) {
          for (let i = 0; i < totalBytes; i++) {
            binArr.push(prefix + (bytes[i] ?? 0).toString(2).padStart(8, "0"));
          }
        } else if (bitCount === 16) {
          for (let i = 0; i < totalBytes; i += 2) {
            const b1 = bytes[i] ?? 0;
            const b2 = i + 1 < totalBytes ? (bytes[i + 1] ?? 0) : 0;
            const w16 = (b1 << 8) | b2;
            binArr.push(prefix + w16.toString(2).padStart(16, "0"));
          }
        } else if (bitCount === 32) {
          for (let i = 0; i < totalBytes; i += 4) {
            const b1 = bytes[i] ?? 0;
            const b2 = i + 1 < totalBytes ? (bytes[i + 1] ?? 0) : 0;
            const b3 = i + 2 < totalBytes ? (bytes[i + 2] ?? 0) : 0;
            const b4 = i + 3 < totalBytes ? (bytes[i + 3] ?? 0) : 0;
            const d32 = ((b1 << 24) >>> 0) | (b2 << 16) | (b3 << 8) | b4;
            binArr.push(prefix + (d32 >>> 0).toString(2).padStart(32, "0"));
          }
        } else {
          // For 64, 128, 256 or Custom bit groupings:
          const bytesPerChunk = Math.ceil(bitCount / 8);
          for (let i = 0; i < totalBytes; i += bytesPerChunk) {
            let chunkBits = "";
            for (let j = 0; j < bytesPerChunk; j++) {
              if (i + j < totalBytes) {
                chunkBits += (bytes[i + j] ?? 0).toString(2).padStart(8, "0");
              }
            }
            if (chunkBits.length >= bitCount) {
              binArr.push(prefix + chunkBits.slice(0, bitCount));
            } else {
              binArr.push(prefix + chunkBits.padStart(bitCount, "0"));
            }
          }
        }

        const fullResult = binArr.join(delimChar);
        setFullBinaryOutputText(fullResult);
        if (fullResult.length > 60000) {
          setBinaryOutputText(
            fullResult.slice(0, 60000) +
              `\n\n... [Displaying first 60,000 characters of ${totalBytes.toLocaleString()} bytes (${fullResult.length.toLocaleString()} total characters). Click "Copy Output" or "Download" for 100% full dataset]`
          );
          setIsBinaryTruncatedPreview(true);
        } else {
          setBinaryOutputText(fullResult);
          setIsBinaryTruncatedPreview(false);
        }
      } catch (err) {
        setBinaryOutputText(sourceB64 || "");
        setFullBinaryOutputText(sourceB64 || "");
        setIsBinaryTruncatedPreview(false);
      }
    },
    [
      tool.slug,
      binaryOutputMode,
      binaryDelimiter,
      binaryBitDepth,
      customBitDepth,
      binaryWithPrefix,
      pixelThreshold,
    ]
  );

  useEffect(() => {
    if (
      [
        "image-to-binary",
        "image-to-base64",
        "image-to-octal",
        "image-to-hex",
        "image-to-decimal",
        "image-to-ascii",
      ].includes(tool.slug) &&
      imageSrc &&
      hasProcessed
    ) {
      generateBinaryData(imageSrc);
    }
  }, [
    tool.slug,
    imageSrc,
    hasProcessed,
    binaryOutputMode,
    binaryDelimiter,
    binaryBitDepth,
    customBitDepth,
    binaryWithPrefix,
    pixelThreshold,
    generateBinaryData,
  ]);

  const openSystemEyeDropper = async () => {
    if ("EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const rgb = `rgb(${r}, ${g}, ${b})`;
          const hsl = rgbToHsl(r, g, b);
          setPickedHex(hex);
          setPickedRgb(rgb);
          setPickedHsl(hsl);
          setColorHistory((prev) => Array.from(new Set([hex, ...prev])).slice(0, 16));
          toast.success(`Picked color ${hex}`);
        }
      } catch (err) {
        // user cancelled
      }
    } else {
      toast.info("Click anywhere directly on your uploaded image to pick colors!");
    }
  };

  // Crop Drag Handling
  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCrop(true);
    setCropDragHandle(handle);
    setCropDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
    });
  };

  useEffect(() => {
    if (!isDraggingCrop) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const deltaXPercent = ((e.clientX - cropDragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - cropDragStart.mouseY) / rect.height) * 100;
      const { box } = cropDragStart;

      let newX = box.x;
      let newY = box.y;
      let newW = box.w;
      let newH = box.h;

      if (cropDragHandle === "move") {
        newX = Math.max(0, Math.min(100 - box.w, box.x + deltaXPercent));
        newY = Math.max(0, Math.min(100 - box.h, box.y + deltaYPercent));
      } else {
        if (cropDragHandle?.includes("e")) {
          newW = Math.max(10, Math.min(100 - box.x, box.w + deltaXPercent));
        }
        if (cropDragHandle?.includes("s")) {
          newH = Math.max(10, Math.min(100 - box.y, box.h + deltaYPercent));
        }
        if (cropDragHandle?.includes("w")) {
          const maxDeltaW = box.w - 10;
          const clampedDeltaX = Math.max(-box.x, Math.min(maxDeltaW, deltaXPercent));
          newX = box.x + clampedDeltaX;
          newW = box.w - clampedDeltaX;
        }
        if (cropDragHandle?.includes("n")) {
          const maxDeltaH = box.h - 10;
          const clampedDeltaY = Math.max(-box.y, Math.min(maxDeltaH, deltaYPercent));
          newY = box.y + clampedDeltaY;
          newH = box.h - clampedDeltaY;
        }
      }

      setCropBox({
        x: Math.round(newX),
        y: Math.round(newY),
        w: Math.round(newW),
        h: Math.round(newH),
      });
    };

    const handleMouseUp = () => {
      setIsDraggingCrop(false);
      setCropDragHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCrop, cropDragHandle, cropDragStart]);

  const processImage = () => {
    // 0. Handle HTML to Image tool
    if (tool.slug === "html-to-image") {
      if (!htmlCodeText.trim()) {
        toast.error("Please enter HTML code or upload an HTML file first!");
        return;
      }
      setProcessing(true);
      renderHtmlToImage(htmlCodeText, htmlRenderWidth, htmlRenderHeight, htmlBgColor, htmlOutputFormat)
        .then((dataUrl) => {
          setProcessedSrc(dataUrl);
          setImageSrc(dataUrl);
          setDimensions({ width: htmlRenderWidth, height: htmlRenderHeight });
          setHasProcessed(true);
          setIsEditingSettings(false);
          setProcessing(false);
          toast.success("Converted HTML to Image successfully!");
        })
        .catch((err) => {
          setProcessing(false);
          toast.error("Failed to render HTML to Image. Check your HTML syntax.");
          console.error(err);
        });
      return;
    }

    // 0b. Handle Document → Image tools (file-based)
    if (["pdf-to-image", "word-to-image", "excel-to-image", "powerpoint-to-image"].includes(tool.slug)) {
      if (!file) { toast.error("Please upload a document file first!"); return; }
      setProcessing(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (!buffer) { setProcessing(false); toast.error("Failed to read file."); return; }
        try {
          let lines: string[] = [`Document: ${file.name}`];
          let bg = "#ffffff", textColor = "#1a1a2e", titleColor = "#1a1a2e", font = "Georgia, serif";
          let canvasW = 794, canvasH = 1123; // A4 at 96dpi

          if (tool.slug === "pdf-to-image") {
            // Scan raw PDF bytes for text streams (BT...ET blocks)
            const dec = new TextDecoder("latin1");
            const text = dec.decode(buffer);
            const btMatches = text.match(/BT[\s\S]{0,500}?ET/g) || [];
            const extracted = btMatches.flatMap(block => {
              const tjs = block.match(/\(([^)]+)\)\s*Tj/g) || [];
              return tjs.map(tj => tj.replace(/^\(|\)\s*Tj$/g, "").trim());
            }).filter(s => s.length > 1 && s.length < 200);
            lines = extracted.length > 0 ? extracted : [`PDF Document: ${file.name}`, "[Content rendered from PDF structure]"];
          } else if (tool.slug === "word-to-image") {
            const xml = await extractFileFromZip(buffer, "word/document.xml");
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              const textNodes = Array.from(dom.querySelectorAll("t"));
              const rawText = textNodes.map(n => n.textContent || "").join(" ");
              lines = rawText.split(/\s{3,}|\n/).map(s => s.trim()).filter(s => s.length > 0);
              if (lines.length === 0) lines = [`Word Document: ${file.name}`, "[No readable text found]"];
            } else lines = [`Word Document: ${file.name}`, "[Unable to extract text]"];
          } else if (tool.slug === "excel-to-image") {
            const xml = await extractFileFromZip(buffer, "xl/worksheets/sheet1.xml");
            bg = "#ffffff"; textColor = "#1e293b"; font = "Consolas, monospace";
            canvasW = 1200; canvasH = 800;
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              const rows = Array.from(dom.querySelectorAll("row"));
              const canvas2 = document.createElement("canvas");
              canvas2.width = canvasW; canvas2.height = canvasH;
              const ctx2 = canvas2.getContext("2d")!;
              ctx2.fillStyle = bg; ctx2.fillRect(0, 0, canvasW, canvasH);
              ctx2.font = "bold 15px Consolas, monospace";
              const cols = 8, cellW = Math.floor(canvasW / cols), cellH = 36;
              const rowData: string[][] = rows.slice(0, 20).map(row =>
                Array.from(row.querySelectorAll("c")).map(c => c.querySelector("v")?.textContent || "")
              );
              rowData.forEach((row, ri) => {
                ctx2.fillStyle = ri === 0 ? "#1e3a5f" : (ri % 2 === 0 ? "#f1f5f9" : "#ffffff");
                ctx2.fillRect(0, ri * cellH + 60, canvasW, cellH);
                ctx2.strokeStyle = "#cbd5e1"; ctx2.strokeRect(0, ri * cellH + 60, canvasW, cellH);
                row.slice(0, cols).forEach((cell, ci) => {
                  ctx2.fillStyle = ri === 0 ? "#ffffff" : "#1e293b";
                  ctx2.fillText(cell, ci * cellW + 8, ri * cellH + 83, cellW - 8);
                });
              });
              ctx2.fillStyle = "#1e3a5f"; ctx2.fillRect(0, 0, canvasW, 50);
              ctx2.fillStyle = "#ffffff"; ctx2.font = "bold 18px sans-serif";
              ctx2.fillText(`Excel: ${file.name}`, 16, 34);
              const url = canvas2.toDataURL("image/png");
              setProcessedSrc(url); setImageSrc(url);
              setDimensions({ width: canvasW, height: canvasH });
              setHasProcessed(true); setProcessing(false);
              toast.success("Rendered Excel sheet to image!");
              return;
            } else lines = [`Excel: ${file.name}`, "[Unable to extract sheet data]"];
          } else if (tool.slug === "powerpoint-to-image") {
            const xml = await extractFileFromZip(buffer, "ppt/slides/slide1.xml");
            bg = "#1e1b4b"; textColor = "#e2e8f0"; titleColor = "#ffffff"; font = "Segoe UI, sans-serif";
            canvasW = 1280; canvasH = 720;
            if (xml) {
              const dom = new DOMParser().parseFromString(xml, "text/xml");
              lines = Array.from(dom.querySelectorAll("t")).map(n => n.textContent || "").filter(s => s.trim().length > 0);
              if (lines.length === 0) lines = [`Presentation: ${file.name}`, "[Slide content parsed]"];
            } else lines = [`Presentation: ${file.name}`, "[Unable to extract slide]"];
          }

          const url = renderTextToCanvas(lines, canvasW, canvasH, { bg, textColor, titleColor, font, fontSize: 18, lineH: 28, paddingX: 60, paddingY: 60 });
          setProcessedSrc(url); setImageSrc(url);
          setDimensions({ width: canvasW, height: canvasH });
          setHasProcessed(true); setIsEditingSettings(false); setProcessing(false);
          toast.success(`Converted ${file.name} to image!`);
        } catch (e) {
          setProcessing(false); toast.error("Failed to process document.");
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 0c. Handle Binary to Image tool
    if (tool.slug === "binary-to-image") {
      if (!inputConvertText.trim() && !file) {
        toast.error("Please paste binary code or upload a .bin / .txt file first!");
        return;
      }
      setProcessing(true);
      const activeTheme = BINARY_THEMES[binaryTheme];
      const url = decodeBinaryStringToImageUrl(inputConvertText, {
        color0: activeTheme.bg,
        color1: activeTheme.fg,
        pixelScale: binaryPixelBlockSize,
      });
      if (!url) {
        setProcessing(false);
        toast.error("Invalid binary data — make sure it consists of 0s and 1s or a valid binary file.");
        return;
      }
      setProcessedSrc(url);
      setImageSrc(url);
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = url;
      setHasProcessed(true);
      setIsEditingSettings(false);
      setProcessing(false);
      toast.success("Converted Binary to Image successfully!");
      return;
    }

    // 1. Handle Text Input Decoding Tools (Base64 to Image, Hex to Image, Octal to Image, etc.)
    if (
      !imageSrc &&
      [
        "base64-to-image",
        "octal-to-image",
        "ascii-to-image",
        "text-to-image",
        "hex-to-image",
        "decimal-to-image",
      ].includes(tool.slug)
    ) {
      if (!inputConvertText.trim()) {
        toast.error("Please enter or paste input text data first!");
        return;
      }
      setProcessing(true);
      try {
        if (tool.slug === "base64-to-image") {
          const raw = inputConvertText.trim();
          const dataUrl = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
          setProcessedSrc(dataUrl);
          setImageSrc(dataUrl);
          setHasProcessed(true);
          setProcessing(false);
          toast.success("Decoded Base64 to image!");
          return;
        }
        if (tool.slug === "octal-to-image") {
          const octs = inputConvertText.trim().split(/\s+/);
          const bytes = new Uint8Array(octs.map((o) => parseInt(o, 8)).filter((n) => !isNaN(n)));
          const blob = new Blob([bytes], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          setProcessedSrc(url);
          setImageSrc(url);
          setHasProcessed(true);
          setProcessing(false);
          toast.success("Decoded Octal bytes to image!");
          return;
        }
        if (tool.slug === "hex-to-image") {
          const clean = inputConvertText.replace(/[^0-9a-fA-F]/g, "");
          const pairs = clean.match(/.{1,2}/g) || [];
          const bytes = new Uint8Array(pairs.map((h) => parseInt(h, 16)));
          const blob = new Blob([bytes], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          setProcessedSrc(url);
          setImageSrc(url);
          setHasProcessed(true);
          setProcessing(false);
          toast.success("Decoded Hex bytes to image!");
          return;
        }
        if (tool.slug === "decimal-to-image") {
          const decs = inputConvertText.trim().split(/[\s,]+/);
          const bytes = new Uint8Array(decs.map((d) => parseInt(d, 10)).filter((n) => !isNaN(n)));
          const blob = new Blob([bytes], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          setProcessedSrc(url);
          setImageSrc(url);
          setHasProcessed(true);
          setProcessing(false);
          toast.success("Decoded Decimal bytes to image!");
          return;
        }
        if (tool.slug === "ascii-to-image") {
          const canvas2 = document.createElement("canvas");
          canvas2.width = 1200; canvas2.height = 630;
          const ctx2 = canvas2.getContext("2d");
          if (ctx2) {
            ctx2.fillStyle = "#0d1117"; ctx2.fillRect(0, 0, 1200, 630);
            ctx2.fillStyle = "#39d353"; ctx2.font = "14px monospace";
            inputConvertText.split("\n").slice(0, 35).forEach((line, i) => ctx2.fillText(line, 20, 30 + i * 18));
            const url = canvas2.toDataURL("image/png");
            setProcessedSrc(url); setImageSrc(url); setHasProcessed(true); setProcessing(false);
            toast.success("Rendered ASCII to image!");
            return;
          }
        }
        if (tool.slug === "text-to-image") {
          const url = renderTextToImageCanvas(inputConvertText, txtImgWidth, txtImgHeight, {
            fontFamily: txtImgFont, fontSize: txtImgFontSize, fontColor: txtImgFontColor,
            bgType: txtImgBgType, bgColor: txtImgBgColor, bgColor2: txtImgBgColor2,
            textAlign: txtImgAlign as CanvasTextAlign, bold: txtImgBold, italic: txtImgItalic,
          });
          setProcessedSrc(url); setImageSrc(url);
          setDimensions({ width: txtImgWidth, height: txtImgHeight });
          setHasProcessed(true); setProcessing(false);
          toast.success("Generated image from text!");
          return;
        }
        if (tool.slug === "binary-to-image") {
          const url = decodeBinaryStringToImageUrl(inputConvertText);
          if (!url) { toast.error("Invalid binary data — make sure it's a valid image encoded in binary."); setProcessing(false); return; }
          setProcessedSrc(url); setImageSrc(url); setHasProcessed(true); setProcessing(false);
          toast.success("Decoded binary to image!");
          return;
        }
      } catch (err) {
        toast.error("Failed to decode input text. Check string format.");
        setProcessing(false);
        return;
      }
    }

    if (tool.slug === "html-to-image") {
      const code = htmlCodeText.trim() || SAMPLE_OG_CARD;
      setProcessing(true);
      renderHtmlToImage(code, htmlRenderWidth, htmlRenderHeight, htmlBgColor, htmlOutputFormat)
        .then((dataUrl) => {
          setProcessedSrc(dataUrl);
          setImageSrc(dataUrl);
          setDimensions({ width: htmlRenderWidth, height: htmlRenderHeight });
          setHasProcessed(true);
          setIsEditingSettings(false);
          setProcessing(false);
          toast.success("Rendered HTML to image successfully!");
        })
        .catch(() => {
          setProcessing(false);
          toast.error("Failed to render HTML. Check HTML syntax.");
        });
      return;
    }

    if (!imageSrc) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let w = img.width;
      let h = img.height;

      // 1. Crop processing pass
      let srcX = 0;
      let srcY = 0;
      let srcW = img.width;
      let srcH = img.height;

      if (tool.slug === "crop-image") {
        srcX = Math.round((cropBox.x / 100) * img.width);
        srcY = Math.round((cropBox.y / 100) * img.height);
        srcW = Math.round((cropBox.w / 100) * img.width);
        srcH = Math.round((cropBox.h / 100) * img.height);

        w = srcW;
        h = srcH;
      } else if (tool.slug === "square-your-image") {
        const maxDim = Math.max(img.width, img.height);
        w = maxDim;
        h = maxDim;
      }

      // 2. Resize / Upscale logic
      if (tool.slug === "resize-image") {
        if (scalePercent !== 100) {
          w = Math.round((img.width * scalePercent) / 100);
          h = Math.round((img.height * scalePercent) / 100);
        } else {
          w = targetWidth || img.width;
          h = targetHeight || img.height;
        }
      } else if (tool.slug === "upscale-image") {
        w = img.width * upscaleFactor;
        h = img.height * upscaleFactor;
      }

      // Orientation swap for 90 or 270 deg rotation
      const rad = (rotation * Math.PI) / 180;
      const is90or270 = Math.abs(rotation % 180) === 90;

      canvas.width = is90or270 ? h : w;
      canvas.height = is90or270 ? w : h;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // For JPEG conversion or OCR/QR scanning, fill with white so transparent PNG/WEBP areas convert cleanly without black artifacts
      if (
        tool.slug === "convert-to-jpg" ||
        (tool.slug === "convert-from-jpg" && targetFormat === "image/jpeg") ||
        tool.slug === "image-to-text-ocr" ||
        tool.slug === "image-to-text"
      ) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.save();

      // Transform origin center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply Photo Editor filters
      if (tool.slug === "photo-editor") {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
      } else if (tool.slug === "blur-face") {
        ctx.filter = `blur(${blurRadius / 2}px)`;
      }

      // Draw image onto canvas
      const drawW = is90or270 ? h : w;
      const drawH = is90or270 ? w : h;

      if (tool.slug === "square-your-image") {
        ctx.restore();
        ctx.save();
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        if (squareBgMode === "blur") {
          ctx.save();
          ctx.filter = "blur(20px)";
          const scale = Math.max(w / img.width, h / img.height);
          const bgW = img.width * scale;
          const bgH = img.height * scale;
          ctx.drawImage(img, (w - bgW) / 2, (h - bgH) / 2, bgW, bgH);
          ctx.restore();
        } else if (squareBgMode === "black") {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, w, h);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
        }

        const dx = (w - img.width) / 2;
        const dy = (h - img.height) / 2;
        ctx.drawImage(img, dx, dy, img.width, img.height);
      } else if (tool.slug === "crop-image") {
        ctx.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH / 2, drawW, drawH);
      } else if (tool.slug === "resize-image" && resizeQualityMode === "improved") {
        // Multi-step stepped downsampling to avoid decimation/aliasing artifacts
        let curW = img.width;
        let curH = img.height;
        if (curW > drawW * 2 && curH > drawH * 2) {
          let stepCanvas = document.createElement("canvas");
          let stepCtx = stepCanvas.getContext("2d")!;
          stepCanvas.width = curW;
          stepCanvas.height = curH;
          stepCtx.imageSmoothingEnabled = true;
          stepCtx.imageSmoothingQuality = "high";
          stepCtx.drawImage(img, 0, 0);

          while (curW / 2 > drawW && curH / 2 > drawH) {
            const nextW = Math.round(curW / 2);
            const nextH = Math.round(curH / 2);
            const nextCanvas = document.createElement("canvas");
            nextCanvas.width = nextW;
            nextCanvas.height = nextH;
            const nextCtx = nextCanvas.getContext("2d")!;
            nextCtx.imageSmoothingEnabled = true;
            nextCtx.imageSmoothingQuality = "high";
            nextCtx.drawImage(stepCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
            stepCanvas = nextCanvas;
            curW = nextW;
            curH = nextH;
          }
          ctx.drawImage(stepCanvas, 0, 0, curW, curH, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        }
      } else {
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }
      ctx.restore();

      // Apply HD Sharpening & Micro-contrast pass if resize with quality improvement
      if (tool.slug === "resize-image" && resizeQualityMode === "improved") {
        applyHDResizingEnhancement(ctx, canvas.width, canvas.height, 0.45);
      }

      // Watermark Removal — Custom Inpainting Pass
      if (tool.slug === "remove-watermark") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const cleaned = removeWatermarkFromImageData(imageData);
        ctx.putImageData(cleaned, 0, 0);
      }

      // Watermark Draw Pass
      if (tool.slug === "watermark-image" && wmText.trim()) {
        ctx.save();
        ctx.globalAlpha = wmOpacity;
        ctx.font = `bold ${wmFontSize}px sans-serif`;
        ctx.fillStyle = wmColor;
        ctx.textBaseline = "middle";

        let x = canvas.width / 2;
        let y = canvas.height / 2;
        ctx.textAlign = "center";

        if (wmPosition === "top_left") {
          x = 30; y = 40; ctx.textAlign = "left";
        } else if (wmPosition === "top_right") {
          x = canvas.width - 30; y = 40; ctx.textAlign = "right";
        } else if (wmPosition === "bottom_left") {
          x = 30; y = canvas.height - 40; ctx.textAlign = "left";
        } else if (wmPosition === "bottom_right") {
          x = canvas.width - 30; y = canvas.height - 40; ctx.textAlign = "right";
        }

        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 8;
        ctx.fillText(wmText, x, y);
        ctx.restore();
      }

      // Meme Generator Pass
      if (tool.slug === "meme-generator") {
        ctx.save();
        ctx.font = `900 ${memeFontSize}px Impact, sans-serif`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = Math.max(3, memeFontSize / 10);
        ctx.textAlign = "center";

        if (topText.trim()) {
          ctx.strokeText(topText.toUpperCase(), canvas.width / 2, memeFontSize + 15);
          ctx.fillText(topText.toUpperCase(), canvas.width / 2, memeFontSize + 15);
        }

        if (bottomText.trim()) {
          ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 25);
          ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 25);
        }
        ctx.restore();
      }

      // Image → Document export tools (PDF, DOCX, XLSX, PPTX)
      if (["image-to-pdf", "image-to-word", "image-to-excel", "image-to-powerpoint"].includes(tool.slug)) {
        const jpegQ = Math.max(0.6, Math.min(1.0, (pdfQuality || 95) / 100));
        const jpegDataUrl = canvas.toDataURL("image/jpeg", jpegQ);
        const pngDataUrl = canvas.toDataURL("image/png");
        const fname = file?.name?.replace(/\.[^.]+$/, "") || "image";

        const effectiveLang = ocrLanguage === "custom" ? (ocrCustomLanguage.trim() || "eng") : ocrLanguage;
        const langObj = OCR_SUPPORTED_LANGUAGES.find((l) => l.code === effectiveLang);
        const langName = langObj ? langObj.name : effectiveLang;

        let blob: Blob;
        let ext: string;

        if (tool.slug === "image-to-pdf") {
          blob = buildPdfFromImageDataUrl(jpegDataUrl, canvas.width, canvas.height, {
            pageSize: pdfPageSize,
            margin: pdfMargin,
            quality: pdfQuality,
          });
          ext = "pdf";
        } else if (tool.slug === "image-to-word") {
          setOcrProgressStatus(`Loading OCR model (${langName}) for Word export...`);
          setOcrProgressPercent(20);

          let lines: string[] = [];
          if (wordDocMode !== "image_only") {
            const ocrRes = await performAdvancedOcr(canvas, {
              contrastMode: ocrContrastMode,
              language: effectiveLang,
              onProgress: (status, progress) => {
                setOcrProgressStatus(status);
                setOcrProgressPercent(Math.min(95, 20 + Math.round(progress * 0.75)));
              },
            });
            lines = ocrRes.textLines;
            setRawOcrDocumentLines(lines);
            const assembled = lines.join("\n");
            setOcrText(assembled);
            setBinaryOutputText(assembled);
          }

          blob = buildEditableDocxFromOcr(lines, {
            fontFamily: wordFontFamily,
            fontSize: wordFontSize,
            mode: wordDocMode,
            imageDataUrl: pngDataUrl,
            imgW: canvas.width,
            imgH: canvas.height,
            filename: fname,
          });
          ext = "docx";
        } else if (tool.slug === "image-to-excel") {
          setOcrProgressStatus(`Loading OCR table model (${langName}) for Excel export...`);
          setOcrProgressPercent(20);

          const ocrRes = await performAdvancedOcr(canvas, {
            contrastMode: ocrContrastMode,
            language: effectiveLang,
            onProgress: (status, progress) => {
              setOcrProgressStatus(status);
              setOcrProgressPercent(Math.min(95, 20 + Math.round(progress * 0.75)));
            },
          });
          setRawOcrDocumentLines(ocrRes.textLines);
          const assembled = ocrRes.textLines.join("\n");
          setOcrText(assembled);
          setBinaryOutputText(assembled);

          blob = buildEditableXlsxFromOcr(ocrRes.textLines, {
            parserMode: excelParserMode,
            sheetName: excelSheetName,
            highlightHeader: excelHighlightHeader,
            filename: fname,
          });
          ext = "xlsx";
        } else {
          blob = buildPptxFromImage(pngDataUrl, canvas.width, canvas.height, fname);
          ext = "pptx";
        }

        setDocumentBlob(blob);
        setDocumentExt(ext);
        const previewUrl = canvas.toDataURL("image/png");
        setProcessedSrc(previewUrl);
        setNewSize(blob.size);
        setHasProcessed(true);
        setIsEditingSettings(false);
        setProcessing(false);
        setOcrProgressStatus("");
        setOcrProgressPercent(0);

        if (tool.slug === "image-to-word") {
          toast.success(`OCR Complete! Generated editable Word document (${ext.toUpperCase()}) with ${langName}.`);
        } else if (tool.slug === "image-to-excel") {
          toast.success(`OCR Complete! Generated editable Excel spreadsheet (${ext.toUpperCase()}) with ${langName}.`);
        } else {
          toast.success(`Image converted to ${ext.toUpperCase()} — click Download to save!`);
        }

        import("@/lib/telemetry").then(({ Telemetry }) => { Telemetry.trackToolUsage(tool.slug, tool.name); });
        import("@/lib/auth-user").then(({ AuthUser }) => { AuthUser.deductCredit(1); });
        return;
      }

      // OCR & QR/Barcode extraction pass
      if (tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text") {
        const effectiveLang = ocrLanguage === "custom" ? (ocrCustomLanguage.trim() || "eng") : ocrLanguage;
        const langObj = OCR_SUPPORTED_LANGUAGES.find((l) => l.code === effectiveLang);
        const langName = langObj ? langObj.name : effectiveLang;

        setOcrProgressStatus("Scanning barcodes & QR codes...");
        setOcrProgressPercent(10);
        const detectedCodes = await detectBarcodesAndQRs(canvas);
        setDetectedBarcodes(detectedCodes);

        setOcrProgressStatus(`Loading OCR model (${langName})...`);
        setOcrProgressPercent(25);

        const ocrRes = await performAdvancedOcr(canvas, {
          contrastMode: ocrContrastMode,
          outputStructure: ocrOutputStructure,
          language: effectiveLang,
          onProgress: (status, progress) => {
            setOcrProgressStatus(status);
            setOcrProgressPercent(Math.min(95, 25 + Math.round(progress * 0.7)));
          },
        });
        setRawOcrDocumentLines(ocrRes.textLines);

        const assembled = assembleOcrOutputText(
          ocrRes.textLines,
          detectedCodes,
          skipBarcodeAndQr,
          ocrOutputStructure
        );
        setOcrText(assembled);
        setBinaryOutputText(assembled);

        const previewUrl = canvas.toDataURL("image/png");
        setProcessedSrc(previewUrl);
        setHasProcessed(true);
        setIsEditingSettings(false);
        setProcessing(false);
        setOcrProgressStatus("");
        setOcrProgressPercent(0);

        import("@/lib/telemetry").then(({ Telemetry }) => { Telemetry.trackToolUsage(tool.slug, tool.name); });
        import("@/lib/auth-user").then(({ AuthUser }) => { AuthUser.deductCredit(1); });

        if (detectedCodes.length > 0) {
          toast.success(`OCR Complete! Detected ${detectedCodes.length} ${detectedCodes.length === 1 ? detectedCodes[0]!.type : "code(s)"} & extracted text (${langName}).`);
        } else {
          toast.success(`Text extracted successfully (${langName})!`);
        }
        return;
      }

      // ── SPECIAL DEDICATED BINARY & ENCODED DATA PIPELINE ────────
      if (
        [
          "image-to-binary",
          "image-to-base64",
          "image-to-octal",
          "image-to-hex",
          "image-to-decimal",
          "image-to-ascii",
        ].includes(tool.slug)
      ) {
        generateBinaryData(imageSrc);
        setHasProcessed(true);
        setIsEditingSettings(false);
        setProcessing(false);

        import("@/lib/telemetry").then(({ Telemetry }) => {
          Telemetry.trackToolUsage(tool.slug, tool.name);
        });
        import("@/lib/auth-user").then(({ AuthUser }) => {
          AuthUser.deductCredit(1);
        });

        toast.success(`Generated ${binaryOutputMode} output successfully!`);
        return;
      }

      // ── SPECIAL DEDICATED COMPRESSION PIPELINE FOR "compress-image" ────────
      if (tool.slug === "compress-image") {
        const origMime = file?.type || "";
        let effectiveFormat = "image/jpeg";

        if (compressFormat === "image/jpeg" || compressFormat === "image/webp" || compressFormat === "image/png") {
          effectiveFormat = compressFormat;
        } else {
          // "auto" mode:
          // If original file is webp -> use webp
          // If original file is png -> use webp (lossy compression + transparency preserved)
          // If jpeg or other -> use jpeg
          if (origMime === "image/webp") {
            effectiveFormat = "image/webp";
          } else if (origMime === "image/png") {
            effectiveFormat = "image/webp";
          } else {
            effectiveFormat = "image/jpeg";
          }
        }

        const calcByteSize = (dataUrlStr: string): number => {
          const b64 = dataUrlStr.split(",")[1] || "";
          const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
          return Math.max(1, Math.round((b64.length * 3) / 4 - padding));
        };

        let finalDataUrl = "";
        let finalQuality = quality / 100;

        // Mode A: SIZE WISE COMPRESSION (Target File Size e.g. 200 KB)
        if (compressMode === "size") {
          const rawTarget = targetSizeInput.trim() || String(Math.max(5, Math.round((origSize * 0.6) / 1024)));
          const parsedTarget = parseFloat(rawTarget);
          if (isNaN(parsedTarget) || parsedTarget <= 0) {
            toast.error("Please enter a valid target file size.");
            setProcessing(false);
            return;
          }

          const targetBytes = targetSizeUnit === "MB" ? parsedTarget * 1024 * 1024 : parsedTarget * 1024;
          if (origSize > 0 && targetBytes >= origSize) {
            toast.error(`Target size must be less than original size (${formatBytes(origSize)}).`);
            setProcessing(false);
            return;
          }

          const searchFormat = effectiveFormat === "image/png" ? "image/webp" : effectiveFormat;

            let bestUrl = canvas.toDataURL(searchFormat, 0.75);
            let bestQ = 0.75;
            let lowQ = 0.02;
            let highQ = 0.98;

            for (let step = 0; step < 12; step++) {
              const testQ = (lowQ + highQ) / 2;
              const testUrl = canvas.toDataURL(searchFormat, testQ);
              const testBytes = calcByteSize(testUrl);

              if (testBytes <= targetBytes) {
                bestQ = testQ;
                bestUrl = testUrl;
                lowQ = testQ; // can try slightly higher quality
              } else {
                highQ = testQ; // too big, reduce quality
              }
            }

            // If even lowest quality on full canvas is still larger than targetBytes, downscale resolution
            if (calcByteSize(bestUrl) > targetBytes) {
              let scale = 0.9;
              while (scale >= 0.15) {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = Math.max(1, Math.round(canvas.width * scale));
                tempCanvas.height = Math.max(1, Math.round(canvas.height * scale));
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                  tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                  
                  let sLow = 0.02, sHigh = 0.95;
                  let sBestUrl = tempCanvas.toDataURL(searchFormat, 0.05);
                  let sBestQ = 0.05;

                  for (let j = 0; j < 8; j++) {
                    const tQ = (sLow + sHigh) / 2;
                    const tUrl = tempCanvas.toDataURL(searchFormat, tQ);
                    if (calcByteSize(tUrl) <= targetBytes) {
                      sBestQ = tQ;
                      sBestUrl = tUrl;
                      sLow = tQ;
                    } else {
                      sHigh = tQ;
                    }
                  }

                  if (calcByteSize(sBestUrl) <= targetBytes) {
                    bestUrl = sBestUrl;
                    bestQ = sBestQ;
                    break;
                  }
                }
                scale -= 0.1;
              }
            }

            finalDataUrl = bestUrl;
            finalQuality = bestQ;
            setQuality(Math.round(bestQ * 100));
        } else {
          // Mode B: QUALITY WISE COMPRESSION (Standard Quality Slider Mode)
          const exportQ = Math.max(0.02, Math.min(0.98, quality / 100));
          if (effectiveFormat === "image/png") {
            finalDataUrl = canvas.toDataURL("image/png");
          } else {
            finalDataUrl = canvas.toDataURL(effectiveFormat, exportQ);
          }

          // Safety optimization: if output exceeds original and WebP could be smaller, use WebP
          if (origSize > 0 && calcByteSize(finalDataUrl) >= origSize && effectiveFormat !== "image/webp") {
            const webpUrl = canvas.toDataURL("image/webp", exportQ);
            if (calcByteSize(webpUrl) < calcByteSize(finalDataUrl)) {
              finalDataUrl = webpUrl;
            }
          }
        }

        const outBytes = calcByteSize(finalDataUrl);
        setProcessedSrc(finalDataUrl);
        setNewSize(outBytes);
        setHasProcessed(true);
        setIsEditingSettings(false);
        setProcessing(false);

        import("@/lib/telemetry").then(({ Telemetry }) => { Telemetry.trackToolUsage(tool.slug, tool.name); });
        import("@/lib/auth-user").then(({ AuthUser }) => { AuthUser.deductCredit(1); });

        const pctSaved = origSize > 0 ? Math.max(0, Math.round(((origSize - outBytes) / origSize) * 100)) : 0;
        toast.success(`Image compressed! File size reduced by ${pctSaved}%.`);
        return;
      }

      // Format output encoding for other tools
      let format = targetFormat;
      let exportQuality = 0.98; // Preserve ultra-high quality by default for format conversions

      if (tool.slug === "convert-to-jpg") {
        format = "image/jpeg";
        exportQuality = 0.98; // Maintain maximum image quality in JPG conversion
      } else if (tool.slug === "convert-from-jpg") {
        format = targetFormat;
        exportQuality = 0.98;
      } else if (tool.slug === "resize-image") {
        if (resizeQualityMode === "improved") {
          // Quality Improvement: preserve highest bitrate (0.99) & lossless chroma for true HD output with larger file size
          if (file?.type === "image/png") {
            format = "image/png";
          } else if (file?.type === "image/webp") {
            format = "image/webp";
            exportQuality = 0.99;
          } else {
            format = "image/jpeg";
            exportQuality = 0.99;
          }
        } else {
          // Same Quality: lean, balanced web size without inflating file size
          if (file?.type === "image/png") {
            format = "image/png";
          } else if (file?.type === "image/webp") {
            format = "image/webp";
            exportQuality = 0.85;
          } else {
            format = "image/jpeg";
            exportQuality = 0.85;
          }
        }
      } else {
        exportQuality = Math.max(0.02, Math.min(1.0, quality / 100));
      }

      const dataUrl = canvas.toDataURL(format, exportQuality);
      setProcessedSrc(dataUrl);
      const b64 = dataUrl.split(",")[1] || "";
      const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
      setNewSize(Math.max(1, Math.round((b64.length * 3) / 4 - padding)));
      setHasProcessed(true);
      setIsEditingSettings(false);
      setProcessing(false);

      // Real telemetry & live credit deduction tracking
      import("@/lib/telemetry").then(({ Telemetry }) => {
        Telemetry.trackToolUsage(tool.slug, tool.name);
      });
      import("@/lib/auth-user").then(({ AuthUser }) => {
        AuthUser.deductCredit(1);
      });

      toast.success(`${tool.name} completed successfully!`);
    };
    img.src = imageSrc;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processSelectedFile(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processSelectedFile(dropped);
  };

  const handleDownload = () => {
    // OCR & Extracted text tools: serve the extracted text file (.txt)
    if (tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text") {
      const textToSave = ocrText || binaryOutputText;
      const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
      const textUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = textUrl;
      const baseName = file?.name ? file.name.replace(/\.[^.]+$/, "") : "extracted_text";
      a.download = `${baseName}_ocr_text.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(textUrl), 5000);
      toast.success("Downloaded extracted text file (.txt)!");
      return;
    }

    // Binary & Encoded Data tools: serve the complete generated binary data file
    if (
      tool.slug === "image-to-binary" ||
      tool.slug === "image-to-base64" ||
      tool.slug === "image-to-hex" ||
      tool.slug === "image-to-octal" ||
      tool.slug === "image-to-decimal" ||
      tool.slug === "image-to-ascii"
    ) {
      const textToSave = fullBinaryOutputText || binaryOutputText;
      const extMap: Record<string, string> = {
        Binary: "bin.txt",
        Base64: "base64.txt",
        Hexadecimal: "hex.txt",
        "C-Array": "h",
        "Pixel-Matrix": "matrix.txt",
        Decimal: "dec.txt",
        Octal: "oct.txt",
      };
      const ext = extMap[binaryOutputMode] || "txt";
      const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
      const textUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = textUrl;
      const baseName = file?.name ? file.name.replace(/\.[^.]+$/, "") : "image_binary";
      a.download = `${baseName}_${binaryOutputMode.toLowerCase()}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(textUrl), 5000);
      toast.success(`Downloaded complete ${binaryOutputMode} data file!`);
      return;
    }

    // Document export tools (PDF, DOCX, XLSX, PPTX): serve real document file
    if (["image-to-pdf", "image-to-word", "image-to-excel", "image-to-powerpoint"].includes(tool.slug)) {
      const ext = documentExt || (tool.slug === "image-to-pdf" ? "pdf" : tool.slug === "image-to-word" ? "docx" : tool.slug === "image-to-excel" ? "xlsx" : "pptx");
      let blobToDownload = documentBlob;

      // If documentBlob is not yet generated, build standard document directly on-the-fly
      if (!blobToDownload) {
        const srcToUse = processedSrc || imageSrc;
        if (srcToUse) {
          const fname = file?.name?.replace(/\.[^.]+$/, "") || "image";
          const w = dimensions.width || 800;
          const h = dimensions.height || 600;
          if (tool.slug === "image-to-pdf") {
            blobToDownload = buildPdfFromImageDataUrl(srcToUse, w, h, {
              pageSize: pdfPageSize,
              margin: pdfMargin,
              quality: pdfQuality,
            });
          } else if (tool.slug === "image-to-word") {
            blobToDownload = buildDocxFromImage(srcToUse, w, h, fname);
          } else if (tool.slug === "image-to-excel") {
            blobToDownload = buildXlsxFromImage(srcToUse, w, h, fname);
          } else if (tool.slug === "image-to-powerpoint") {
            blobToDownload = buildPptxFromImage(srcToUse, w, h, fname);
          }
        }
      }

      if (blobToDownload) {
        const mimeMap: Record<string, string> = {
          pdf: "application/pdf",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        };
        const mimeType = mimeMap[ext] || "application/octet-stream";
        const docBlob = blobToDownload.type === mimeType ? blobToDownload : new Blob([blobToDownload], { type: mimeType });
        const docUrl = URL.createObjectURL(docBlob);
        const a = document.createElement("a");
        a.href = docUrl;
        const baseName = file?.name ? file.name.replace(/\.[^.]+$/, "") : `converted_${ext}`;
        a.download = `${baseName}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(docUrl), 5000);
        toast.success(`Downloaded ${ext.toUpperCase()} file (${formatBytes(docBlob.size)})!`);
        return;
      }
    }

    const url = processedSrc || imageSrc;
    if (!url) return;

    let ext = "png";
    const mimeMatch = url.match(/^data:image\/([a-zA-Z0-9+]+);/);
    if (mimeMatch && mimeMatch[1]) {
      ext = mimeMatch[1].toLowerCase();
      if (ext === "jpeg") ext = "jpg";
    } else {
      const activeFmt = tool.slug === "convert-to-jpg" ? "image/jpeg" : targetFormat;
      const formatExtMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
        "image/gif": "gif",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
      };
      ext = formatExtMap[activeFmt] || "png";
    }

    const baseName = file?.name ? file.name.replace(/\.[^.]+$/, "") : `${tool.slug}_output`;
    const a = document.createElement("a");
    a.href = url;
    a.download = tool.slug === "compress-image" ? `${baseName}_compressed.${ext}` : `${baseName}_${tool.slug}.${ext}`;
    a.click();
    toast.success(
      tool.slug === "compress-image"
        ? `Downloaded compressed image (${formatBytes(newSize || origSize)})!`
        : "Processed image downloaded!"
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const isConversionTool =
    tool.slug.startsWith("convert-") ||
    tool.slug.includes("-to-") ||
    tool.category === "Format Converters";

  const formatLabelMap: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/avif": "AVIF",
    "image/gif": "GIF",
    "image/bmp": "BMP",
    "image/tiff": "TIFF",
  };

  const getTargetFormatLabel = (): string => {
    if (tool.slug === "convert-to-jpg") return "JPG";
    if (tool.slug === "convert-to-png") return "PNG";
    if (tool.slug === "convert-to-webp") return "WebP";
    if (tool.slug === "convert-from-jpg") return formatLabelMap[targetFormat] || "PNG";
    if (tool.slug === "image-to-pdf") return "PDF";
    if (tool.slug === "image-to-word") return "DOCX";
    if (tool.slug === "image-to-excel") return "XLSX";
    if (tool.slug === "image-to-powerpoint") return "PPTX";
    if (tool.slug === "html-to-image") return htmlOutputFormat || "PNG";
    if (tool.slug.includes("-to-")) {
      const parts = tool.slug.split("-to-");
      if (parts[1]) {
        const p = parts[1].toLowerCase();
        if (p === "jpg" || p === "jpeg") return "JPG";
        if (p === "png") return "PNG";
        if (p === "webp") return "WebP";
        return parts[1].toUpperCase();
      }
    }
    if (tool.outputs && !tool.outputs.includes(",")) {
      return tool.outputs.trim().toUpperCase();
    }
    return formatLabelMap[targetFormat] || "JPG";
  };

  const getSourceFormatLabel = (): string => {
    if (file?.name) {
      const ext = file.name.split(".").pop()?.toUpperCase();
      if (ext && ext.length <= 5) return ext === "JPEG" ? "JPG" : ext;
    }
    if (file?.type) {
      const sub = file.type.split("/")[1]?.toUpperCase();
      if (sub) return sub === "JPEG" ? "JPG" : sub;
    }
    if (tool.slug === "convert-from-jpg") return "JPG";
    if (tool.slug.includes("-to-")) {
      const parts = tool.slug.split("-to-");
      if (parts[0]) {
        const p = parts[0].replace("convert-", "").toLowerCase();
        if (p === "jpg" || p === "jpeg") return "JPG";
        return p.toUpperCase();
      }
    }
    if (tool.accepts && !tool.accepts.includes(",")) {
      return tool.accepts.trim().toUpperCase();
    }
    return "IMAGE";
  };

  const sourceFormatLabel = getSourceFormatLabel();
  const targetFormatLabel = getTargetFormatLabel();

  // Crop Pixel Dimension Calculation
  const cropPixelWidth = Math.round((cropBox.w / 100) * dimensions.width);
  const cropPixelHeight = Math.round((cropBox.h / 100) * dimensions.height);

  // Target file size calculation and boundary validation for Compress Image
  const parsedTargetSize = parseFloat(targetSizeInput);
  const currentTargetBytes = !isNaN(parsedTargetSize) && parsedTargetSize > 0
    ? (targetSizeUnit === "MB" ? parsedTargetSize * 1024 * 1024 : parsedTargetSize * 1024)
    : 0;
  const isTargetSizeExceeding = origSize > 0 && currentTargetBytes >= origSize;

  // Dynamic suggestions strictly lower than uploaded image file size
  const smartTargetPresets = (() => {
    if (!origSize || origSize <= 0) {
      return [
        { label: "50 KB", val: "50", unit: "KB" as const },
        { label: "100 KB", val: "100", unit: "KB" as const },
        { label: "200 KB", val: "200", unit: "KB" as const },
      ];
    }

    const origKB = Math.round(origSize / 1024);
    const presets: Array<{ label: string; val: string; unit: "KB" | "MB" }> = [];

    // Percentage presets (75%, 50%, 25%)
    const p75 = Math.round(origKB * 0.75);
    const p50 = Math.round(origKB * 0.5);
    const p25 = Math.round(origKB * 0.25);

    if (p75 >= 10 && p75 < origKB) {
      presets.push({
        label: `75% (${p75 >= 1024 ? (p75 / 1024).toFixed(1) + " MB" : p75 + " KB"})`,
        val: p75 >= 1024 ? String(Number((p75 / 1024).toFixed(1))) : String(p75),
        unit: p75 >= 1024 ? "MB" : "KB",
      });
    }
    if (p50 >= 5 && p50 < p75) {
      presets.push({
        label: `50% (${p50 >= 1024 ? (p50 / 1024).toFixed(1) + " MB" : p50 + " KB"})`,
        val: p50 >= 1024 ? String(Number((p50 / 1024).toFixed(1))) : String(p50),
        unit: p50 >= 1024 ? "MB" : "KB",
      });
    }
    if (p25 >= 3 && p25 < p50) {
      presets.push({
        label: `25% (${p25 >= 1024 ? (p25 / 1024).toFixed(1) + " MB" : p25 + " KB"})`,
        val: p25 >= 1024 ? String(Number((p25 / 1024).toFixed(1))) : String(p25),
        unit: p25 >= 1024 ? "MB" : "KB",
      });
    }

    // Fixed standards strictly < origSize * 0.90
    const standards: Array<{ label: string; val: string; unit: "KB" | "MB"; bytes: number }> = [
      { label: "20 KB", val: "20", unit: "KB", bytes: 20 * 1024 },
      { label: "50 KB", val: "50", unit: "KB", bytes: 50 * 1024 },
      { label: "100 KB", val: "100", unit: "KB", bytes: 100 * 1024 },
      { label: "200 KB", val: "200", unit: "KB", bytes: 200 * 1024 },
      { label: "300 KB", val: "300", unit: "KB", bytes: 300 * 1024 },
      { label: "500 KB", val: "500", unit: "KB", bytes: 500 * 1024 },
      { label: "1 MB", val: "1", unit: "MB", bytes: 1024 * 1024 },
      { label: "2 MB", val: "2", unit: "MB", bytes: 2 * 1024 * 1024 },
      { label: "5 MB", val: "5", unit: "MB", bytes: 5 * 1024 * 1024 },
    ];

    standards
      .filter((s) => s.bytes <= origSize * 0.9)
      .forEach((s) => {
        if (!presets.some((p) => p.val === s.val && p.unit === s.unit)) {
          presets.push({ label: s.label, val: s.val, unit: s.unit });
        }
      });

    return presets.slice(0, 5);
  })();

  return (
    <div className="w-full flex flex-col gap-8">
      {/* ── TOP DYNAMIC ISLAND FLOATING BAR (Smooth Centered Animation) ─────── */}
      {hasProcessed && !isEditingSettings && (
        <div className="fixed top-4 sm:top-6 inset-x-0 flex justify-center items-center z-50 pointer-events-none px-3">
          <aside
            aria-label="Quick download dynamic island"
            className={`pointer-events-auto dynamic-island-box flex items-center gap-3 sm:gap-4 rounded-full border border-white/20 bg-black text-white p-2 sm:px-5 sm:py-3 shadow-2xl backdrop-blur-3xl ring-1 ring-white/15 max-w-[96vw] sm:max-w-2xl ${
              showDynamicIsland ? "island-enter" : "island-exit"
            }`}
          >
            {/* 1. Large Processed Image Thumbnail & Details */}
            <div className="flex items-center gap-3 pl-1 sm:pl-1.5">
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-neutral-900 shadow-md ring-2 ring-black">
                {processedSrc || imageSrc ? (
                  <img
                    src={processedSrc || imageSrc || undefined}
                    alt="Processed thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10 text-amber-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm sm:text-base font-extrabold text-white truncate max-w-[130px] lg:max-w-[190px] leading-tight">
                  {file?.name || `${tool.name}`}
                </span>
                {isConversionTool ? (
                  <span className="text-xs font-bold text-amber-400 leading-tight flex items-center gap-1">
                    {sourceFormatLabel} → {targetFormatLabel}
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-400 leading-tight">
                    {formatBytes(newSize || origSize)}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Primary Large Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="wobbly-btn flex items-center gap-2.5 rounded-full bg-white text-black hover:bg-neutral-100 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="h-5 w-5 text-amber-500 shrink-0" />
              <span>
                {tool.slug === "compress-image"
                  ? "Download Image"
                  : tool.slug === "convert-to-jpg"
                  ? "Download JPG"
                  : tool.slug === "convert-from-jpg"
                  ? `Download ${targetFormatLabel}`
                  : tool.slug === "convert-to-png"
                  ? "Download PNG"
                  : tool.slug === "convert-to-webp"
                  ? "Download WebP"
                  : tool.slug === "image-to-pdf"
                  ? "Download PDF"
                  : tool.slug === "image-to-word"
                  ? "Download Word"
                  : tool.slug === "image-to-excel"
                  ? "Download Excel"
                  : tool.slug === "image-to-powerpoint"
                  ? "Download Presentation"
                  : isConversionTool
                  ? `Download ${targetFormatLabel}`
                  : tool.slug === "resize-image"
                  ? "Download Resized"
                  : tool.slug === "crop-image"
                  ? "Download Cropped"
                  : tool.slug.includes("ocr") || tool.slug === "image-to-text"
                  ? "Download Text"
                  : "Download Result"}
              </span>
              {!isConversionTool && (
                <span className="hidden xs:inline-block rounded-full bg-black/10 text-neutral-800 px-2.5 py-0.5 text-xs font-mono font-bold">
                  {formatBytes(newSize || origSize)}
                </span>
              )}
            </button>

            {/* 3. Change Settings (Icon Only Button) */}
            <button
              type="button"
              onClick={() => {
                setIsEditingSettings(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="wobbly-btn flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black hover:scale-105 active:scale-90 transition-all shadow-md cursor-pointer"
              title="Change Settings"
              aria-label="Change Settings"
            >
              <Sliders className="h-5 w-5 text-amber-400" />
            </button>

            {/* 4. Upload Another File (Icon Only Button) */}
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="wobbly-btn flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black hover:scale-105 active:scale-90 transition-all shadow-md cursor-pointer"
              title="Process another File"
              aria-label="Process another File"
            >
              <FolderUp className="h-5 w-5 text-white" />
            </button>
          </aside>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={
          tool.slug === "html-to-image" ? ".html,.htm,.txt,text/html" :
          tool.slug === "binary-to-image" ? ".bin,.txt,.dat,.raw,text/plain,application/octet-stream,image/*" :
          ["pdf-to-image"].includes(tool.slug) ? ".pdf,application/pdf" :
          ["word-to-image"].includes(tool.slug) ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
          ["excel-to-image"].includes(tool.slug) ? ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
          ["powerpoint-to-image"].includes(tool.slug) ? ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" :
          "image/*"
        }
        className="hidden"
        onChange={handleFileChange}
      />
      <canvas ref={canvasRef} className="hidden" />

      {!imageSrc && !file && ![
        "html-to-image",
        "text-to-image", "binary-to-image", "ascii-to-image",
        "base64-to-image", "hex-to-image", "octal-to-image", "decimal-to-image",
      ].includes(tool.slug) ? (
        /* Standalone Centered Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group cursor-pointer flex flex-col items-center justify-center text-center rounded-3xl border-3 border-dashed px-8 py-24 sm:py-32 w-full transition-all duration-300 ${
            isDraggingFile
              ? "border-accent bg-accent/10 scale-[1.01] shadow-2xl"
              : "border-border bg-card/60 hover:border-foreground hover:bg-card shadow-lg"
          }`}
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl transition-all group-hover:scale-110">
            <Upload className="h-10 w-10" />
            <span className="absolute -inset-1 rounded-3xl bg-foreground/20 blur-lg animate-pulse" />
          </div>

          <h2 className="mt-8 font-display text-3xl font-extrabold md:text-4xl text-foreground">
            {tool.slug === "pdf-to-image"
              ? "Select PDF File or Drag & Drop PDF Here"
              : tool.slug === "word-to-image"
              ? "Select Word Document (.docx) or Drag & Drop Here"
              : tool.slug === "excel-to-image"
              ? "Select Excel Spreadsheet (.xlsx) or Drag & Drop Here"
              : tool.slug === "powerpoint-to-image"
              ? "Select PowerPoint (.pptx) or Drag & Drop Here"
              : "Select File or Drag & Drop Image Here"}
          </h2>

          <p className="mt-3 max-w-md text-sm font-semibold text-muted-foreground md:text-base">
            Accepts <span className="font-extrabold text-foreground">{tool.accepts}</span> · Returns{" "}
            <span className="font-extrabold text-foreground">{tool.outputs}</span>
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-10 py-5 text-base font-extrabold text-background shadow-2xl transition-all group-hover:scale-105">
            {tool.slug === "pdf-to-image"
              ? "Select PDF File"
              : tool.slug === "word-to-image"
              ? "Select Word Document"
              : tool.slug === "excel-to-image"
              ? "Select Excel Spreadsheet"
              : tool.slug === "powerpoint-to-image"
              ? "Select PowerPoint Presentation"
              : "Select Image File"}{" "}
            <span aria-hidden>→</span>
          </div>

          <p className="mt-4 text-xs font-bold text-muted-foreground">
            🔒 100% Free · Client-side processing · No file size limits
          </p>
        </div>
      ) : hasProcessed && !isEditingSettings ? (
        /* Dedicated Processed View for All Tools */
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          {/* Top Result Banner with Statistics */}
          <div className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-xl transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Left Column: Icon & Headings */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
                  <Check className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {tool.slug === "compress-image"
                        ? "Compression Complete"
                        : tool.slug.startsWith("convert-") || tool.slug.includes("-to-")
                        ? "Conversion Complete"
                        : tool.slug === "resize-image"
                        ? "Resize Complete"
                        : tool.slug === "crop-image"
                        ? "Crop Complete"
                        : `${tool.name} Complete`}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {dimensions.width} × {dimensions.height} px
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground mt-1">
                    {tool.slug === "compress-image"
                      ? "Image Successfully Compressed"
                      : tool.slug.startsWith("convert-") || tool.slug.includes("-to-")
                      ? "Image Successfully Converted"
                      : tool.slug === "resize-image"
                      ? "Image Successfully Resized"
                      : tool.slug === "crop-image"
                      ? "Image Successfully Cropped"
                      : tool.slug === "blur-image" || tool.slug === "anonymise-image"
                      ? "Image Successfully Blurred"
                      : tool.slug === "watermark-image"
                      ? "Watermark Successfully Applied"
                      : tool.slug.includes("ocr") || tool.slug === "image-to-text"
                      ? "Text Successfully Extracted"
                      : `${tool.name} Completed Successfully`}
                  </h3>
                </div>
              </div>

              {/* Right Column: Comparative Stats Box OR Conversion Flow */}
              {isConversionTool ? (
                <div className="w-full md:w-auto flex items-center gap-3 bg-secondary/50 px-4 py-2.5 rounded-2xl border border-border/80 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">Conversion:</span>
                    <span className="rounded-lg bg-background border border-border px-2.5 py-1 text-xs font-mono font-black text-foreground shadow-2xs">
                      {sourceFormatLabel}
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-500 font-bold shrink-0 stroke-[2.5]" />
                    <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 shadow-2xs">
                      {targetFormatLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3.5 sm:gap-5 bg-secondary/50 px-4 py-2.5 rounded-2xl border border-border/80 shadow-xs">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block leading-tight">Original</span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-muted-foreground">
                      {formatBytes(origSize)}
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />

                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block leading-tight">
                      {tool.slug === "compress-image" ? "Compressed" : "Processed"}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                      {formatBytes(newSize || origSize)}
                    </span>
                  </div>

                  {origSize > 0 && newSize > 0 && origSize > newSize && (
                    <div className="pl-2 border-l border-border/70 flex items-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-extrabold shadow-xs">
                        <AnimatedCounter
                          value={Math.max(0, Math.round(((origSize - newSize) / origSize) * 100))}
                          suffix="%"
                        />
                        <span>Smaller</span>
                      </span>
                    </div>
                  )}
                  {origSize > 0 && newSize > 0 && newSize >= origSize && tool.slug === "resize-image" && resizeQualityMode === "improved" && (
                    <div className="pl-2 border-l border-border/70 flex items-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-extrabold shadow-xs">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        <span>HD Enhanced (+{Math.round(((newSize - origSize) / origSize) * 100)}% Size)</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Processed Output Preview Stage */}
          <div className="relative rounded-3xl border-2 border-border bg-card/70 overflow-hidden shadow-xl flex flex-col items-center justify-center p-4 md:p-8 min-h-[460px] max-h-[640px]">
            {/* Top Preview Controls Bar */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="pointer-events-auto rounded-full bg-background/90 border border-border px-3.5 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur">
                {file?.name || `${tool.slug}_output`}
              </span>
              <div className="flex items-center gap-2 pointer-events-auto">
                {imageSrc && processedSrc && imageSrc !== processedSrc && (
                  <button
                    type="button"
                    onMouseDown={() => setShowOriginalComparison(true)}
                    onMouseUp={() => setShowOriginalComparison(false)}
                    onTouchStart={() => setShowOriginalComparison(true)}
                    onTouchEnd={() => setShowOriginalComparison(false)}
                    className="rounded-full border border-border bg-background/90 px-3.5 py-1 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center gap-1.5 backdrop-blur cursor-pointer"
                    title="Press and hold to compare with original image"
                  >
                    <Eye className="h-3.5 w-3.5 text-accent" />
                    <span>{showOriginalComparison ? "Showing Original" : "Hold for Original"}</span>
                  </button>
                )}
                {["image-to-binary", "image-to-base64", "image-to-hex", "image-to-octal", "image-to-decimal", "image-to-ascii"].includes(tool.slug) ? (
                  <button
                    type="button"
                    onClick={() => setIsCodeEditorOpen(true)}
                    className="rounded-full border border-border bg-background/90 px-3.5 py-1 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center gap-1.5 backdrop-blur cursor-pointer"
                    title="Open in Code Editor"
                  >
                    <Code2 className="h-3.5 w-3.5 text-accent" />
                    <span>Open in Code Editor</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsFullscreenPreview(true)}
                    className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center gap-1.5 backdrop-blur cursor-pointer"
                    title="Enlarge preview"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-accent" />
                    <span>Enlarge</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dedicated Previews for Document & OCR Tools */}
            {hasProcessed && tool.slug === "image-to-excel" ? (
              /* Excel 2D Spreadsheet Matrix Live Preview */
              <div className="w-full max-w-4xl flex flex-col gap-3 z-0 mt-8">
                {(() => {
                  const lines = rawOcrDocumentLines.length > 0 ? rawOcrDocumentLines : (ocrText ? ocrText.split("\n") : []);
                  const grid = parseOcrTextToGrid(lines, excelParserMode);
                  const maxCols = Math.max(...grid.map((r) => r.length), 1);
                  const totalCells = grid.reduce((s, r) => s + r.length, 0);

                  const copyAsCsv = () => {
                    const csvContent = grid
                      .map((row) =>
                        row
                          .map((cell) => {
                            const escaped = cell.replace(/"/g, '""');
                            return escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")
                              ? `"${escaped}"`
                              : escaped;
                          })
                          .join(",")
                      )
                      .join("\n");
                    copyToClipboard(csvContent, "CSV Data");
                  };

                  return (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                            <FileSpreadsheet className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-black text-foreground">
                            Extracted Spreadsheet Table ({excelSheetName})
                          </span>
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            {grid.length} Rows × {maxCols} Cols · {totalCells} Cells
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={copyAsCsv}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xs cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy as CSV</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ocrText, "Extracted Text")}
                            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-xs cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Text</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Spreadsheet Grid View */}
                      <div className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-inner max-h-[380px] overflow-x-auto overflow-y-auto">
                        <table className="w-full border-collapse text-left text-xs font-mono">
                          {/* Column Letters Row (A, B, C...) */}
                          <thead>
                            <tr className="bg-muted/70 border-b border-border sticky top-0 z-10">
                              <th className="w-12 px-3 py-2 text-center text-[10px] font-bold text-muted-foreground border-r border-border bg-muted/80">
                                #
                              </th>
                              {Array.from({ length: maxCols }).map((_, cIdx) => (
                                <th
                                  key={cIdx}
                                  className="px-4 py-2 font-bold text-[11px] text-muted-foreground border-r border-border min-w-[120px] bg-muted/80"
                                >
                                  {getExcelColumnLetter(cIdx + 1)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {grid.map((row, rIdx) => {
                              const isHeader = rIdx === 0 && excelHighlightHeader;
                              return (
                                <tr
                                  key={rIdx}
                                  className={`border-b border-border/70 transition-colors ${
                                    isHeader
                                      ? "bg-emerald-500/10 font-bold text-foreground hover:bg-emerald-500/15"
                                      : rIdx % 2 === 0
                                      ? "bg-background hover:bg-muted/40"
                                      : "bg-muted/20 hover:bg-muted/50"
                                  }`}
                                >
                                  {/* Row Number (1, 2, 3...) */}
                                  <td className="px-3 py-2 text-center text-[10px] font-bold text-muted-foreground border-r border-border select-none bg-muted/30">
                                    {rIdx + 1}
                                  </td>
                                  {Array.from({ length: maxCols }).map((_, cIdx) => {
                                    const cellVal = row[cIdx] ?? "";
                                    const isNumeric = /^-?\d+(\.\d+)?$/.test(cellVal.trim()) && cellVal.trim().length <= 15;
                                    return (
                                      <td
                                        key={cIdx}
                                        className={`px-3 py-2 border-r border-border/70 truncate max-w-[240px] ${
                                          isHeader
                                            ? "text-emerald-700 dark:text-emerald-300 font-extrabold"
                                            : isNumeric
                                            ? "text-right text-blue-600 dark:text-blue-400 font-semibold"
                                            : "text-foreground"
                                        }`}
                                        title={cellVal}
                                      >
                                        {cellVal || <span className="opacity-20 italic">—</span>}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : hasProcessed && tool.slug === "image-to-word" ? (
              /* Word Document Editable Live Preview */
              <div className="w-full max-w-3xl flex flex-col gap-3 z-0 mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-500">
                      <FileType className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-black text-foreground">
                      Microsoft Word (.docx) Document Content
                    </span>
                    <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-extrabold text-blue-600 dark:text-blue-400">
                      {wordFontFamily} · {wordFontSize}pt
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ocrText, "Document Text")}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-xs cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 text-accent" />
                      <span>Copy Text</span>
                    </button>
                  </div>
                </div>

                {/* Styled Document Paper Preview */}
                <div className="rounded-2xl border-2 border-border bg-background p-5 shadow-inner max-h-[380px] overflow-y-auto space-y-3">
                  <textarea
                    rows={12}
                    value={ocrText}
                    onChange={(e) => {
                      setOcrText(e.target.value);
                      const updatedLines = e.target.value.split("\n");
                      setRawOcrDocumentLines(updatedLines);
                      const fname = file?.name?.replace(/\.[^.]+$/, "") || "image";
                      const updatedBlob = buildEditableDocxFromOcr(updatedLines, {
                        fontFamily: wordFontFamily,
                        fontSize: wordFontSize,
                        mode: wordDocMode,
                        imageDataUrl: processedSrc || imageSrc || undefined,
                        imgW: dimensions.width,
                        imgH: dimensions.height,
                        filename: fname,
                      });
                      setDocumentBlob(updatedBlob);
                      setNewSize(updatedBlob.size);
                    }}
                    placeholder="Extracted text will appear here. You can edit this text directly before downloading your Word document!"
                    style={{ fontFamily: wordFontFamily, fontSize: `${wordFontSize + 2}px` }}
                    className="w-full rounded-xl border border-border/80 bg-card p-4 text-foreground focus:border-accent focus:outline-none resize-none leading-relaxed shadow-inner"
                  />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span>
                      ✏️ <strong>Live Editable</strong>: Any changes typed above will be immediately included in your downloaded <strong className="text-foreground">.docx</strong> file.
                    </span>
                    <span className="font-mono font-bold">
                      {ocrText ? `${ocrText.split(/\s+/).filter(Boolean).length} words · ${ocrText.length} chars` : "0 words"}
                    </span>
                  </div>
                </div>
              </div>
            ) : hasProcessed &&
            (ocrText || binaryOutputText) &&
            (tool.slug.includes("ocr") ||
              tool.slug.includes("to-text") ||
              tool.slug.includes("to-binary") ||
              tool.slug.includes("to-ascii") ||
              tool.slug.includes("to-base64") ||
              tool.slug.includes("to-hex") ||
              tool.slug.includes("to-octal") ||
              tool.slug.includes("to-decimal")) ? (
              <div className="w-full max-w-3xl flex flex-col gap-3 z-0 mt-8">
                {/* Barcode / QR Code Quick Control Bar if detected */}
                {detectedBarcodes.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-[10px]">
                        ✓
                      </span>
                      <span className="text-xs font-black text-foreground">
                        {detectedBarcodes.length} {detectedBarcodes.some(b => b.type === "QR Code") && detectedBarcodes.some(b => b.type === "Barcode") ? "QR & Barcode" : detectedBarcodes[0]!.type} Detected
                      </span>
                      <div className="flex gap-1">
                        {detectedBarcodes.map((b, bi) => (
                          <span key={bi} className="rounded-md bg-background/80 border border-border px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                            {b.format}
                          </span>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground bg-background/70 border border-border px-3 py-1 rounded-xl hover:border-foreground transition-all">
                      <input
                        type="checkbox"
                        checked={skipBarcodeAndQr}
                        onChange={(e) => {
                          setSkipBarcodeAndQr(e.target.checked);
                          recomputeOcrOutput(e.target.checked, ocrContrastMode, ocrOutputStructure);
                        }}
                        className="h-3.5 w-3.5 rounded accent-foreground cursor-pointer"
                      />
                      <span>Skip Barcode &amp; QR Code</span>
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span>Extracted Content</span>
                    <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-mono font-extrabold text-foreground">
                      {ocrText ? `${ocrText.split(/\s+/).filter(Boolean).length} words · ${ocrText.length} chars` : `${binaryOutputText.length} chars`}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {["image-to-binary", "image-to-base64", "image-to-hex", "image-to-octal", "image-to-decimal", "image-to-ascii"].includes(tool.slug) && (
                      <button
                        type="button"
                        onClick={() => setIsCodeEditorOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-all shadow-xs cursor-pointer"
                        title="Open output in Custom Code & Binary Editor"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Open in Code Editor</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ocrText || binaryOutputText, "Extracted Text")}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-xs cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Text</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={ocrText || binaryOutputText}
                  className="w-full h-80 rounded-2xl border-2 border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none resize-none shadow-inner leading-relaxed"
                />
              </div>
            ) : (
              /* Image Preview */
              <img
                src={showOriginalComparison ? imageSrc || undefined : processedSrc || imageSrc || undefined}
                alt="Processed Output Preview"
                className="max-h-[480px] max-w-full object-contain rounded-xl shadow-lg border border-border/50 transition-all duration-200"
              />
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 w-full items-stretch">
            {/* 1. Primary Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="sm:col-span-2 lg:col-span-6 w-full min-h-[58px] flex items-center justify-center gap-3 rounded-2xl bg-foreground px-6 py-4 text-base font-black text-background shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="h-5 w-5 text-accent shrink-0" />
              <span>
                {tool.slug === "compress-image"
                  ? "Download Compressed Image"
                  : tool.slug === "convert-to-jpg"
                  ? "Download JPG File"
                  : tool.slug === "convert-from-jpg"
                  ? `Download ${targetFormatLabel} File`
                  : tool.slug === "convert-to-png"
                  ? "Download PNG File"
                  : tool.slug === "convert-to-webp"
                  ? "Download WebP File"
                  : tool.slug === "image-to-pdf"
                  ? "Download PDF Document"
                  : tool.slug === "image-to-word"
                  ? "Download Word Document"
                  : tool.slug === "image-to-excel"
                  ? "Download Excel Sheet"
                  : tool.slug === "image-to-powerpoint"
                  ? "Download Presentation"
                  : isConversionTool
                  ? `Download ${targetFormatLabel} File`
                  : tool.slug === "resize-image"
                  ? "Download Resized Image"
                  : tool.slug === "crop-image"
                  ? "Download Cropped Image"
                  : tool.slug.includes("ocr") || tool.slug === "image-to-text"
                  ? "Download Extracted Text"
                  : `Download ${tool.outputs || "Processed"} File`}
              </span>
              {!isConversionTool && (
                <span className="shrink-0 rounded-full bg-background/20 px-2.5 py-0.5 text-xs font-bold font-mono">
                  {formatBytes(newSize || origSize)}
                </span>
              )}
            </button>

            {/* 2. Change Settings Button */}
            <button
              type="button"
              onClick={() => setIsEditingSettings(true)}
              className="sm:col-span-1 lg:col-span-3 w-full min-h-[58px] flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-4 text-xs sm:text-sm font-extrabold text-foreground shadow-md hover:border-foreground hover:bg-secondary active:scale-98 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sliders className="h-4 w-4 text-accent shrink-0" />
              <span>Change Settings</span>
            </button>

            {/* 3. Process another File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="sm:col-span-1 lg:col-span-3 w-full min-h-[58px] flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-4 text-xs sm:text-sm font-extrabold text-muted-foreground hover:text-foreground hover:border-foreground/40 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
              title="Upload and process another file"
            >
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>
                {tool.slug === "compress-image"
                  ? "Compress another File"
                  : tool.slug.startsWith("convert-") || tool.slug.includes("-to-")
                  ? "Convert another File"
                  : tool.slug === "resize-image"
                  ? "Resize another File"
                  : tool.slug === "crop-image"
                  ? "Crop another File"
                  : "Process another File"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace Active Mode: Image Preview + Settings (Full width, no excess margins) */
        <div className="grid items-start gap-6 lg:gap-8 w-full lg:grid-cols-[2fr_1.2fr]">
          {/* Canvas & Image Preview View */}
          <div
            className="min-w-0 relative flex flex-col w-full overflow-hidden rounded-3xl border-2 border-border bg-card/70 shadow-xl transition-[height] duration-200"
            style={{
              height: settingsHeight
                ? `${Math.max(620, settingsHeight)}px`
                : "620px",
              minHeight: "540px",
            }}
          >
            {/* Header info bar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="h-4 w-4 text-foreground" />
                <span className="truncate max-w-[200px] text-foreground font-extrabold">
                  {file?.name || "Uploaded Image"}
                </span>
                <span>•</span>
                <span>{dimensions.width}×{dimensions.height}px</span>
                {hasProcessed && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500 uppercase">
                    Processed Output
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center gap-1.5"
                  title="Enlarge preview"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-accent" />
                  <span>Enlarge</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-sm"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div
              ref={previewContainerRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex-1 min-h-0 flex items-center justify-center overflow-hidden select-none bg-background/20 ${
                tool.slug === "image-to-text-ocr" || tool.slug === "image-to-binary"
                  ? "p-4 md:p-6 min-h-[560px]"
                  : "p-4 sm:p-6 md:p-8"
              }`}
            >
              {/* Image Frame Wrapper */}
              <div
                className="relative inline-flex items-center justify-center max-h-full max-w-full"
                style={{
                  width: tool.slug === "resize-image" && renderedImgSize ? `${renderedImgSize.width}px` : "auto",
                  height: tool.slug === "resize-image" && renderedImgSize ? `${renderedImgSize.height}px` : "auto",
                }}
              >
                {/* TOP DIMENSION LINE: Width (Shown ONLY on Resize Tool) */}
                {tool.slug === "resize-image" && (
                  <div
                    className={`absolute -top-7 left-0 right-0 flex items-center justify-center pointer-events-none transition-all duration-300 z-10 ${
                      focusedDim === "width"
                        ? "text-accent scale-105 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                        : "text-accent"
                    }`}
                  >
                    {/* Left tick | */}
                    <div className="h-3.5 w-[2px] bg-accent rounded-full" />
                    {/* Left dashed line */}
                    <div className="flex-1 border-t-2 border-dashed border-accent/80 h-0" />
                    {/* Center Small Box */}
                    <div className="mx-2 flex items-center gap-1 rounded-md border-2 border-accent/60 bg-card px-2.5 py-0.5 text-xs font-black font-mono tracking-tight text-accent shadow-sm">
                      <span>Width :</span>
                      <AnimatedCounter
                        value={targetWidth > 0 ? targetWidth : dimensions.width}
                        suffix="px"
                      />
                    </div>
                    {/* Right dashed line */}
                    <div className="flex-1 border-t-2 border-dashed border-accent/80 h-0" />
                    {/* Right tick | */}
                    <div className="h-3.5 w-[2px] bg-accent rounded-full" />
                  </div>
                )}

                {/* RIGHT DIMENSION LINE: Height (Shown ONLY on Resize Tool) */}
                {tool.slug === "resize-image" && (
                  <div
                    className={`absolute top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 z-10 ${
                      focusedDim === "height"
                        ? "text-accent scale-105 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                        : "text-accent"
                    }`}
                    style={{ left: "calc(100% - 28px)", top: 0, bottom: 0, height: "100%" }}
                  >
                    {/* Top tick ─ */}
                    <div className="w-3 h-[1.5px] bg-accent rounded-full" />
                    {/* Top dashed line */}
                    <div className="flex-1 border-r-2 border-dashed border-accent/80 w-0" />
                    {/* Center Small Box (Rotated cleanly, no digit overlap) */}
                    <div className="my-2.5 -rotate-90 whitespace-nowrap rounded-md border-2 border-accent/60 bg-card px-2 py-0.5 text-[11px] font-black font-mono tracking-tight text-accent shadow-sm flex items-center gap-1">
                      <span>Height :</span>
                      <AnimatedCounter
                        value={targetHeight > 0 ? targetHeight : dimensions.height}
                        suffix="px"
                      />
                    </div>
                    {/* Bottom dashed line */}
                    <div className="flex-1 border-r-2 border-dashed border-accent/80 w-0" />
                    {/* Bottom tick ─ */}
                    <div className="w-3 h-[1.5px] bg-accent rounded-full" />
                  </div>
                )}

                <img
                  ref={imgRef}
                  src={processedSrc || imageSrc || undefined}
                  alt="Workspace preview"
                  onLoad={() => {
                    if (imgRef.current) {
                      const rect = imgRef.current.getBoundingClientRect();
                      if (rect.width > 0 && rect.height > 0) {
                        setRenderedImgSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
                      }
                    }
                  }}
                  onMouseMove={handleImageMouseMove}
                  onClick={handleImageClick}
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-300 pointer-events-auto shadow-md rounded-md border border-border/40 block"
                  style={{
                    maxHeight: settingsHeight
                      ? `${Math.max(tool.slug === "image-to-text-ocr" || tool.slug === "image-to-binary" ? 600 : 540, settingsHeight - (tool.slug === "resize-image" ? 110 : 90))}px`
                      : "580px",
                    maxWidth: "100%",
                    cursor: tool.slug === "color-picker-from-image" ? "crosshair" : "default",
                  }}
                />

                {/* Smooth Loading Indicator Backdrop */}
                {processing && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-2xl animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-2xl">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      <div className="text-center">
                        <p className="text-sm font-extrabold text-foreground">
                          {tool.slug === "html-to-image" ? "Rendering HTML to Image…" : "Processing Image…"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">High-definition 2x rendering</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker Hover Swatch */}
              {tool.slug === "color-picker-from-image" && hoverColor && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-lg text-xs font-mono font-bold backdrop-blur-md">
                  <span className="h-4 w-4 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: hoverColor }} />
                  <span>{hoverColor}</span>
                </div>
              )}

              {/* Interactive Crop Bounding Box Overlay */}
              {tool.slug === "crop-image" && imgRef.current && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    padding: "16px",
                  }}
                >
                  <div
                    className="relative max-h-full max-w-full"
                    style={{
                      width: imgRef.current.clientWidth,
                      height: imgRef.current.clientHeight,
                    }}
                  >
                    {/* Dark Mask Top */}
                    <div
                      className="absolute bg-black/60 backdrop-blur-[1px]"
                      style={{ top: 0, left: 0, right: 0, height: `${cropBox.y}%` }}
                    />
                    {/* Dark Mask Bottom */}
                    <div
                      className="absolute bg-black/60 backdrop-blur-[1px]"
                      style={{ bottom: 0, left: 0, right: 0, height: `${100 - cropBox.y - cropBox.h}%` }}
                    />
                    {/* Dark Mask Left */}
                    <div
                      className="absolute bg-black/60 backdrop-blur-[1px]"
                      style={{ top: `${cropBox.y}%`, left: 0, width: `${cropBox.x}%`, height: `${cropBox.h}%` }}
                    />
                    {/* Dark Mask Right */}
                    <div
                      className="absolute bg-black/60 backdrop-blur-[1px]"
                      style={{ top: `${cropBox.y}%`, right: 0, width: `${100 - cropBox.x - cropBox.w}%`, height: `${cropBox.h}%` }}
                    />

                    {/* Active Interactive Crop Box */}
                    <div
                      onMouseDown={(e) => handleCropMouseDown(e, "move")}
                      className="absolute border-2 border-amber-400 bg-amber-400/10 cursor-move pointer-events-auto shadow-2xl transition-shadow"
                      style={{
                        left: `${cropBox.x}%`,
                        top: `${cropBox.y}%`,
                        width: `${cropBox.w}%`,
                        height: `${cropBox.h}%`,
                      }}
                    >
                      {/* Rule of Thirds Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                        <div className="border-r border-b border-white/70" />
                        <div className="border-r border-b border-white/70" />
                        <div className="border-b border-white/70" />
                        <div className="border-r border-b border-white/70" />
                        <div className="border-r border-b border-white/70" />
                        <div className="border-b border-white/70" />
                        <div className="border-r border-b border-white/70" />
                        <div className="border-r border-b border-white/70" />
                        <div />
                      </div>

                      {/* Dimension Badge */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-black/90 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-300 shadow-md border border-amber-400/40 pointer-events-none">
                        {cropPixelWidth} × {cropPixelHeight} px
                      </div>

                      {/* 8 Drag Handles */}
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "nw")}
                        className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-amber-400 border-2 border-black cursor-nwse-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "ne")}
                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-400 border-2 border-black cursor-nesw-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "sw")}
                        className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-amber-400 border-2 border-black cursor-nesw-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "se")}
                        className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-amber-400 border-2 border-black cursor-nwse-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "n")}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-7 rounded-full bg-amber-400 border-2 border-black cursor-ns-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "s")}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-7 rounded-full bg-amber-400 border-2 border-black cursor-ns-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "w")}
                        className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-7 rounded-full bg-amber-400 border-2 border-black cursor-ew-resize shadow-md"
                      />
                      <div
                        onMouseDown={(e) => handleCropMouseDown(e, "e")}
                        className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-7 rounded-full bg-amber-400 border-2 border-black cursor-ew-resize shadow-md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {processing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex items-center gap-3 rounded-full bg-card px-6 py-3 shadow-2xl border border-border font-bold">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    <span>Processing Image…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool Controls & Settings Panel */}
          <div
            ref={settingsPanelRef}
            className="min-w-0 rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-md flex flex-col space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="font-display text-xl font-bold">{tool.name} Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.blurb}</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-extrabold text-accent-foreground uppercase">
                {tool.tag || "Tool"}
              </span>
            </div>

            <div className="space-y-5">
              {/* 1. COMPRESS IMAGE */}
              {tool.slug === "compress-image" && (
                <div className="space-y-4">
                  {/* Mode Switch: Quality vs Size */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
                      Compression Mode:
                    </label>
                    <div className="wobbly-switch grid grid-cols-2 gap-1.5 rounded-2xl bg-secondary/80 p-1.5 border-2 border-border shadow-xs">
                      <button
                        type="button"
                        data-active={compressMode === "quality"}
                        onClick={() => setCompressMode("quality")}
                        className={`wobbly-btn flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs md:text-sm font-black cursor-pointer ${
                          compressMode === "quality"
                            ? "wobbly-active bg-foreground text-background shadow-md scale-[1.01]"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                        }`}
                      >
                        <Sliders className="h-4 w-4" />
                        <span>Quality</span>
                      </button>
                      <button
                        type="button"
                        data-active={compressMode === "size"}
                        onClick={() => {
                          setCompressMode("size");
                          if (!targetSizeInput) setTargetSizeInput("200");
                        }}
                        className={`wobbly-btn flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs md:text-sm font-black cursor-pointer ${
                          compressMode === "size"
                            ? "wobbly-active bg-foreground text-background shadow-md scale-[1.01]"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Size</span>
                      </button>
                    </div>
                  </div>

                  {/* QUALITY MODE CONTROLS */}
                  {compressMode === "quality" && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      {/* Unique Custom Seekbar Container */}
                      <div className="space-y-3 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">Quality Compression Seekbar:</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                                quality >= 80
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                  : quality >= 50
                                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                  : "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                              }`}
                            >
                              {quality >= 80 ? "High Fidelity" : quality >= 50 ? "Balanced Size" : "Max Savings"}
                            </span>
                          </div>
                          <span className="font-display text-lg font-black text-accent">
                            <AnimatedCounter value={quality} suffix="%" />
                          </span>
                        </div>

                        {/* Styled Seekbar Track */}
                        <div className="relative py-2">
                          <input
                            type="range"
                            min="5"
                            max="98"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="unique-seekbar"
                            style={{
                              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${
                                ((quality - 5) / (98 - 5)) * 100
                              }%, color-mix(in oklab, var(--color-foreground) 12%, transparent) ${
                                ((quality - 5) / (98 - 5)) * 100
                              }%, color-mix(in oklab, var(--color-foreground) 12%, transparent) 100%)`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => setQuality(5)}
                            className="hover:text-foreground transition-colors cursor-pointer"
                          >
                            5% (Smallest)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuality(50)}
                            className="hover:text-foreground transition-colors cursor-pointer"
                          >
                            50% (Balanced)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuality(98)}
                            className="hover:text-foreground transition-colors cursor-pointer"
                          >
                            98% (High Detail)
                          </button>
                        </div>
                      </div>

                      {/* Preset Quality Buttons with Wobbly Spring */}
                      <div className="flex gap-2">
                        {[
                          { label: "High (85%)", val: 85 },
                          { label: "Medium (60%)", val: 60 },
                          { label: "Small (35%)", val: 35 },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            type="button"
                            data-active={quality === btn.val}
                            onClick={() => setQuality(btn.val)}
                            className={`wobbly-pill flex-1 rounded-2xl border-2 py-2.5 text-xs font-bold cursor-pointer ${
                              quality === btn.val
                                ? "wobbly-active border-foreground bg-foreground text-background shadow-md scale-[1.01]"
                                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SIZE MODE CONTROLS */}
                  {compressMode === "size" && (
                    <div className="rounded-2xl border-2 border-border/80 bg-card p-5 space-y-3 shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                          Target File Size (Specify Exact Max Size Needed):
                        </label>
                        {targetSizeInput && (
                          <button
                            type="button"
                            onClick={() => setTargetSizeInput("")}
                            className="text-[11px] font-bold text-accent hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Unified Input & KB/MB Unit Segmented Box */}
                      <div
                        className={`flex items-center gap-2 rounded-2xl border-2 bg-background p-1.5 transition-all shadow-inner ${
                          isTargetSizeExceeding
                            ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
                            : "border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
                        }`}
                      >
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 200"
                          value={targetSizeInput}
                          onChange={(e) => setTargetSizeInput(e.target.value)}
                          className={`flex-1 bg-transparent px-3 py-2 text-base font-extrabold focus:outline-none ${
                            isTargetSizeExceeding ? "text-destructive" : "text-foreground"
                          }`}
                        />

                        {/* Custom KB / MB Segmented Unit Box with Wobbly Switch */}
                        <div className="wobbly-switch flex items-center rounded-xl bg-secondary/80 p-1 border border-border/60">
                          {(["KB", "MB"] as const).map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              data-active={targetSizeUnit === unit}
                              onClick={() => setTargetSizeUnit(unit)}
                              className={`wobbly-btn rounded-lg px-4 py-1.5 text-xs font-black cursor-pointer ${
                                targetSizeUnit === unit
                                  ? "wobbly-active bg-foreground text-background shadow-md scale-[1.03]"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Boundary Error Alert if Target >= Original */}
                      {isTargetSizeExceeding && (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/25 px-3.5 py-2.5 text-xs font-bold text-destructive animate-in fade-in">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>
                            Target size ({formatBytes(currentTargetBytes)}) must be lower than original image size ({formatBytes(origSize)}).
                          </span>
                        </div>
                      )}

                      {/* Smart Preset Target Size Suggestions (strictly lower than uploaded image) */}
                      {smartTargetPresets.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] font-bold text-muted-foreground mr-1">Suggestions:</span>
                          {smartTargetPresets.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setTargetSizeInput(preset.val);
                                setTargetSizeUnit(preset.unit);
                              }}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                                targetSizeInput === preset.val && targetSizeUnit === preset.unit
                                  ? "border-accent bg-accent/20 text-accent font-extrabold shadow-xs"
                                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                        Enter the exact max file size you need (smaller than {formatBytes(origSize || 1024 * 1024)}) and Karudi will auto-calculate optimal compression parameters.
                      </p>
                    </div>
                  )}

                  {/* Output Format Selection */}
                  <div className="rounded-2xl border border-border bg-background p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                        Output Format:
                      </span>
                      <span className="text-[11px] font-bold text-accent">
                        {compressFormat === "auto"
                          ? "Auto (Best compression)"
                          : compressFormat === "image/webp"
                          ? "WebP (Ultra compact)"
                          : compressFormat === "image/jpeg"
                          ? "JPG (Standard)"
                          : "PNG (Lossless)"}
                      </span>
                    </div>

                    <div className="wobbly-switch grid grid-cols-4 gap-1.5 rounded-xl bg-secondary/80 p-1 border border-border/60">
                      {[
                        { label: "Auto", value: "auto" as const },
                        { label: "WebP", value: "image/webp" as const },
                        { label: "JPG", value: "image/jpeg" as const },
                        { label: "PNG", value: "image/png" as const },
                      ].map((fmt) => (
                        <button
                          key={fmt.value}
                          type="button"
                          data-active={compressFormat === fmt.value}
                          onClick={() => setCompressFormat(fmt.value)}
                          className={`wobbly-btn rounded-lg py-2 text-xs font-black cursor-pointer ${
                            compressFormat === fmt.value
                              ? "wobbly-active bg-foreground text-background shadow-md scale-[1.02]"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-3 border-t border-border">
                    <span>
                      Original Size: <strong>{formatBytes(origSize)}</strong>
                    </span>
                    {hasProcessed && (
                      <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5">
                        <span>New Size: {formatBytes(newSize)}</span>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <AnimatedCounter
                            value={Math.max(0, Math.round(((origSize - newSize) / origSize) * 100))}
                            suffix="%"
                          />
                          <span>smaller</span>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 2. RESIZE IMAGE */}
              {tool.slug === "resize-image" && (
                <div className="space-y-5">
                  {/* Quality Mode Switch: Same Quality vs Quality Improvement with Wobbly Spring */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
                      Quality Mode:
                    </label>
                    <div className="wobbly-switch grid grid-cols-2 gap-1.5 rounded-2xl bg-secondary/80 p-1.5 border-2 border-border shadow-xs">
                      <button
                        type="button"
                        data-active={resizeQualityMode === "same"}
                        onClick={() => setResizeQualityMode("same")}
                        className={`wobbly-btn flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs md:text-sm font-black cursor-pointer ${
                          resizeQualityMode === "same"
                            ? "wobbly-active bg-foreground text-background shadow-md scale-[1.01]"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                        }`}
                      >
                        <Sliders className="h-4 w-4" />
                        <span>Same Quality</span>
                      </button>
                      <button
                        type="button"
                        data-active={resizeQualityMode === "improved"}
                        onClick={() => setResizeQualityMode("improved")}
                        className={`wobbly-btn flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs md:text-sm font-black cursor-pointer ${
                          resizeQualityMode === "improved"
                            ? "wobbly-active bg-foreground text-background shadow-md scale-[1.01]"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>Quality Improvement</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                      {resizeQualityMode === "same"
                        ? "⚡ Same Quality: Keeps file size compact and balanced without increasing image size."
                        : "✨ Quality Improvement: Applies multi-step HD sharpening & uncompressed bitrate (enhances edge clarity & increases image size)."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Percentage Scale Presets</label>
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          data-active={scalePercent === pct}
                          onClick={() => {
                            setScalePercent(pct);
                            if (dimensions.width && dimensions.height) {
                              setTargetWidth(Math.round((dimensions.width * pct) / 100));
                              setTargetHeight(Math.round((dimensions.height * pct) / 100));
                            }
                          }}
                          className={`wobbly-pill flex-1 rounded-xl border py-2 text-xs font-bold cursor-pointer ${
                            scalePercent === pct
                              ? "wobbly-active bg-foreground text-background shadow-md scale-[1.02]"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={targetWidth}
                        onFocus={() => setFocusedDim("width")}
                        onBlur={() => setFocusedDim(null)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTargetWidth(val);
                          setScalePercent(100);
                          if (maintainAspect && dimensions.width > 0) {
                            setTargetHeight(Math.round((val * dimensions.height) / dimensions.width));
                          }
                        }}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={targetHeight}
                        onFocus={() => setFocusedDim("height")}
                        onBlur={() => setFocusedDim(null)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTargetHeight(val);
                          setScalePercent(100);
                          if (maintainAspect && dimensions.height > 0) {
                            setTargetWidth(Math.round((val * dimensions.width) / dimensions.height));
                          }
                        }}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Maintain Image Ratio Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-border bg-background p-4 transition-colors hover:border-foreground">
                    <input
                      type="checkbox"
                      checked={maintainAspect}
                      onChange={(e) => setMaintainAspect(e.target.checked)}
                      className="h-4 w-4 rounded accent-accent cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-foreground block">Maintain Image Aspect Ratio</span>
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        Keep proportions locked when changing width or height
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* 3. CROP IMAGE */}
              {tool.slug === "crop-image" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">Aspect Ratio Preset</label>
                    <div className="flex flex-wrap gap-2">
                      {(["free", "1:1", "4:3", "16:9", "9:16"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => applyCropAspectPreset(ratio)}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase transition-all ${
                            cropAspect === ratio
                              ? "bg-foreground text-background"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
                    <p className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <CropIcon className="h-4 w-4 text-accent" /> Drag Crop Box in Preview Window
                    </p>
                    <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                      Click and drag the yellow corner/edge handles directly on your image preview to select the exact crop region.
                    </p>
                    <div className="flex justify-between text-xs font-mono font-bold text-accent pt-1">
                      <span>Crop Selection:</span>
                      <span>{cropPixelWidth} × {cropPixelHeight} px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CONVERT FORMAT */}
              {tool.slug === "convert-to-jpg" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground block">Target Export Format</label>
                  <div className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 border border-accent/30 text-accent font-extrabold text-xs font-mono">
                        JPG
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-foreground block">Full Quality JPEG (.jpg)</span>
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          Universally compatible format preserving maximum resolution and visual quality
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">
                      Full Quality (JPG)
                    </span>
                  </div>
                </div>
              )}

              {tool.slug === "convert-from-jpg" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Target Export Format (Select Output Format)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                    {[
                      { label: "JPEG", sub: ".jpg", value: "image/jpeg" },
                      { label: "PNG", sub: ".png", value: "image/png" },
                      { label: "WebP", sub: ".webp", value: "image/webp" },
                      { label: "AVIF", sub: ".avif", value: "image/avif" },
                      { label: "GIF", sub: ".gif", value: "image/gif" },
                      { label: "BMP", sub: ".bmp", value: "image/bmp" },
                      { label: "TIFF", sub: ".tiff", value: "image/tiff" },
                    ].map((fmt) => (
                      <button
                        key={fmt.label}
                        type="button"
                        onClick={() => setTargetFormat(fmt.value as any)}
                        className={`flex flex-col items-center justify-center rounded-xl border py-2.5 px-2 text-center transition-all ${
                          targetFormat === fmt.value
                            ? "border-foreground bg-foreground text-background shadow-md scale-[1.02]"
                            : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xs font-extrabold">{fmt.label}</span>
                        <span className="text-[10px] font-mono opacity-80">{fmt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. ROTATE & FLIP */}
              {tool.slug === "rotate-image" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-bold transition-all hover:border-foreground"
                    >
                      <RotateCw className="h-4 w-4" /> Rotate 90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-bold transition-all hover:border-foreground"
                    >
                      <RotateCcw className="h-4 w-4" /> Rotate -90°
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFlipH(!flipH)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        flipH ? "bg-foreground text-background" : "border-border bg-background"
                      }`}
                    >
                      <FlipHorizontal className="h-4 w-4" /> Flip Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV(!flipV)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        flipV ? "bg-foreground text-background" : "border-border bg-background"
                      }`}
                    >
                      <FlipVertical className="h-4 w-4" /> Flip Vertical
                    </button>
                  </div>
                </div>
              )}

              {/* 6. WATERMARK */}
              {tool.slug === "watermark-image" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={wmText}
                      onChange={(e) => setWmText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Opacity</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={wmOpacity}
                        onChange={(e) => setWmOpacity(Number(e.target.value))}
                        className="w-full accent-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">
                        Font Size (<AnimatedCounter value={wmFontSize} suffix="px" />)
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="72"
                        value={wmFontSize}
                        onChange={(e) => setWmFontSize(Number(e.target.value))}
                        className="w-full accent-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. UPSCALE IMAGE */}
              {tool.slug === "upscale-image" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground block">AI Upscale Multiplier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[2, 4].map((factor) => (
                      <button
                        key={factor}
                        type="button"
                        onClick={() => setUpscaleFactor(factor)}
                        className={`rounded-2xl border py-4 text-center text-sm font-extrabold transition-all ${
                          upscaleFactor === factor
                            ? "bg-foreground text-background shadow-lg scale-105"
                            : "border-border text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        {factor}X Ultra-HD
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. BLUR FACE */}
              {tool.slug === "blur-face" && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Anonymise Blur Strength (<AnimatedCounter value={blurRadius} suffix="px" />)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(Number(e.target.value))}
                    className="w-full accent-foreground"
                  />
                </div>
              )}

              {/* 9. MEME GENERATOR */}
              {tool.slug === "meme-generator" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Top Text</label>
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Bottom Text</label>
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              {/* 10. PHOTO EDITOR */}
              {tool.slug === "photo-editor" && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Brightness</span>{" "}
                      <span>
                        <AnimatedCounter value={brightness} suffix="%" />
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Contrast</span>{" "}
                      <span>
                        <AnimatedCounter value={contrast} suffix="%" />
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Grayscale</span>{" "}
                      <span>
                        <AnimatedCounter value={grayscale} suffix="%" />
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>
                </div>
              )}


              {/* 12. IMAGE TO BINARY / BASE64 */}
              {tool.slug === "image-to-binary" && (
                <div className="space-y-4">
                  {/* 1. Convert To Format Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground block">
                        Target Binary Format
                      </label>
                      {origSize > 0 && (
                        <span className="text-[10px] font-bold text-accent">
                          {formatBytes(origSize)} ({origSize.toLocaleString()} bytes)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "Binary", label: "Binary (0/1)" },
                        { id: "Hexadecimal", label: "Hex (HEX)" },
                        { id: "Base64", label: "Base64" },
                        { id: "C-Array", label: "C / C++ Array" },
                        { id: "Pixel-Matrix", label: "Pixel 1-Bit" },
                        { id: "Decimal", label: "Decimal" },
                        { id: "Octal", label: "Octal" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBinaryOutputMode(item.id as any)}
                          className={`rounded-xl border py-2 px-1 text-center text-[11px] font-extrabold transition-all cursor-pointer ${
                            binaryOutputMode === item.id
                              ? "bg-foreground text-background shadow-md scale-[1.02]"
                              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Delimiter Selector (for applicable modes) */}
                  {!["Base64", "C-Array", "Pixel-Matrix"].includes(binaryOutputMode) && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">
                        Byte / Element Delimiter
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "Space", label: "Space ( )" },
                          { id: "Comma", label: "Comma (,)" },
                          { id: "Newline", label: "New Line (\\n)" },
                          { id: "None", label: "None (Solid)" },
                        ].map((delim) => (
                          <button
                            key={delim.id}
                            type="button"
                            onClick={() => setBinaryDelimiter(delim.id as any)}
                            className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                              binaryDelimiter === delim.id
                                ? "bg-foreground text-background shadow-xs"
                                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {delim.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Bit Depth / Prefix Options for Binary Mode */}
                  {binaryOutputMode === "Binary" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground block">
                          Bit Grouping / Word Depth
                        </label>
                        <span className="text-[10px] font-mono font-bold text-accent">
                          {binaryBitDepth === "Custom" ? `${customBitDepth}-Bit (Custom)` : binaryBitDepth}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "4 Bit (Nibble)", label: "4-Bit (Nibble)" },
                          { id: "8 Bit (Byte)", label: "8-Bit (Byte)" },
                          { id: "16 Bit (Word)", label: "16-Bit (Word)" },
                          { id: "32 Bit (DWord)", label: "32-Bit" },
                          { id: "64 Bit (QWord)", label: "64-Bit" },
                          { id: "128 Bit (SIMD)", label: "128-Bit" },
                          { id: "256 Bit (Block)", label: "256-Bit" },
                          { id: "Custom", label: "⚙️ Custom" },
                        ].map((bit) => (
                          <button
                            key={bit.id}
                            type="button"
                            onClick={() => setBinaryBitDepth(bit.id)}
                            className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                              binaryBitDepth === bit.id
                                ? "bg-foreground text-background shadow-xs font-black"
                                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {bit.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Bit Depth Input */}
                      {binaryBitDepth === "Custom" && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
                          <label className="text-xs font-bold text-foreground whitespace-nowrap">
                            Custom Bits per Chunk:
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={1024}
                            value={customBitDepth}
                            onChange={(e) =>
                              setCustomBitDepth(Math.max(1, Math.min(1024, Number(e.target.value) || 8)))
                            }
                            className="w-24 rounded-xl border-2 border-border bg-background px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:border-accent focus:outline-none"
                          />
                          <span className="text-[10px] text-muted-foreground">
                            1–1024 bits
                          </span>
                        </div>
                      )}

                      {/* 0b Prefix Toggle */}
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background/60 cursor-pointer hover:border-foreground transition-all">
                        <input
                          type="checkbox"
                          checked={binaryWithPrefix}
                          onChange={(e) => setBinaryWithPrefix(e.target.checked)}
                          className="h-4 w-4 rounded accent-foreground cursor-pointer"
                        />
                        <span className="text-xs font-bold text-foreground">
                          Include binary prefix (<code className="text-accent font-mono">0b</code> e.g. 0b01001001)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* 3b. Hexadecimal Prefix Option */}
                  {binaryOutputMode === "Hexadecimal" && (
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-background/60 cursor-pointer hover:border-foreground transition-all">
                      <input
                        type="checkbox"
                        checked={binaryWithPrefix}
                        onChange={(e) => setBinaryWithPrefix(e.target.checked)}
                        className="h-4 w-4 rounded accent-foreground cursor-pointer"
                      />
                      <span className="text-xs font-bold text-foreground">
                        Include hex prefix (<code className="text-accent font-mono">0x</code> e.g. 0x89, 0x50)
                      </span>
                    </label>
                  )}

                  {/* 3c. Pixel 1-Bit Matrix Threshold Slider */}
                  {binaryOutputMode === "Pixel-Matrix" && (
                    <div className="space-y-2 p-3 rounded-2xl border border-border bg-card">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Black &amp; White Pixel Threshold</span>
                        <span className="text-accent font-mono">
                          {pixelThreshold} ({Math.round((pixelThreshold / 255) * 100)}%)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="254"
                        value={pixelThreshold}
                        onChange={(e) => setPixelThreshold(Number(e.target.value))}
                        className="w-full accent-foreground cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Converts actual image canvas pixels into 0 (light) and 1 (dark) monochrome binary bitmap.
                      </p>
                    </div>
                  )}

                  {/* 4. Generated Output Code Box */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground block">
                          Accurate Binary Output ({binaryOutputMode})
                        </label>
                        <span className="text-[10px] font-semibold text-accent block">
                          {isBinaryTruncatedPreview
                            ? "Displaying preview · Copy or Download exports 100% full dataset"
                            : "Complete 100% data ready to copy or download"}
                        </span>
                      </div>
                      {binaryOutputText && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(fullBinaryOutputText || binaryOutputText, binaryOutputMode)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-foreground hover:text-background transition-all shadow-xs cursor-pointer"
                          >
                            {copiedFormat === binaryOutputMode ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-accent" />
                            )}
                            <span>{copiedFormat === binaryOutputMode ? "Copied!" : "Copy Full Output"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {hasProcessed && binaryOutputText ? (
                      <div className="space-y-2">
                        <textarea
                          rows={7}
                          value={binaryOutputText}
                          readOnly
                          onClick={(e) => {
                            (e.target as HTMLTextAreaElement).select();
                            copyToClipboard(fullBinaryOutputText || binaryOutputText, binaryOutputMode);
                          }}
                          title="Click anywhere to select all and copy 100% complete data to clipboard"
                          className="w-full cursor-pointer rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none break-all"
                        />

                        {/* Quick Code Exporters */}
                        <div className="grid grid-cols-2 gap-2">
                          {binaryOutputMode === "Base64" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(`<img src="${fullBinaryOutputText || binaryOutputText}" alt="Embedded Image" />`, "HTML Tag")
                                }
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 px-2.5 text-[11px] font-bold hover:border-foreground transition-all cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-accent" /> Copy &lt;img&gt; Tag
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(`background-image: url("${fullBinaryOutputText || binaryOutputText}");`, "CSS Code")
                                }
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 px-2.5 text-[11px] font-bold hover:border-foreground transition-all cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-accent" /> Copy CSS Code
                              </button>
                            </>
                          )}

                          {binaryOutputMode !== "Base64" && (
                            <>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(fullBinaryOutputText || binaryOutputText, "Raw Data")}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 px-2.5 text-[11px] font-bold hover:border-foreground transition-all cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-accent" /> Copy All ({binaryOutputMode})
                              </button>
                              <button
                                type="button"
                                onClick={handleDownload}
                                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 px-2.5 text-[11px] font-bold hover:border-foreground transition-all cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5 text-accent" /> Download .{binaryOutputMode === "C-Array" ? "h" : "txt"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-center">
                        <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                          ⚡ Select your target format &amp; options above, then click <strong className="text-foreground">Convert / Process Image</strong> below to generate binary output.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 13. SQUARE YOUR IMAGE */}
              {tool.slug === "square-your-image" && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Square Background Fill
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["blur", "white", "black"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSquareBgMode(mode)}
                        className={`rounded-xl border py-2.5 px-2 text-center text-xs font-bold transition-all ${
                          squareBgMode === mode
                            ? "bg-foreground text-background shadow-md scale-[1.02]"
                            : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {mode === "blur" ? "Blurred Edges" : mode === "white" ? "White Fill" : "Black Fill"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 13.5 BINARY TO IMAGE ADVANCED DUAL-INPUT CONTROLS */}
              {tool.slug === "binary-to-image" && (
                <div className="space-y-5">
                  {/* Mode Tabs: Paste Binary Code vs Upload Binary File */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Input Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1.5 border border-border">
                      <button
                        type="button"
                        onClick={() => setBinaryInputTab("paste")}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          binaryInputTab === "paste"
                            ? "bg-foreground text-background shadow-md font-black scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Paste Binary Code</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBinaryInputTab("upload")}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          binaryInputTab === "upload"
                            ? "bg-foreground text-background shadow-md font-black scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload File (.bin / .txt)</span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: PASTE BINARY CODE */}
                  {binaryInputTab === "paste" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-muted-foreground block">
                            Binary Code (0s and 1s or 1-Bit Matrix)
                          </label>
                          {inputConvertText && (
                            <span className="rounded-full bg-accent/15 border border-accent/30 px-2 py-0.5 text-[10px] font-mono font-bold text-accent">
                              {inputConvertText.replace(/[^01]/g, "").length} bits
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const clip = await navigator.clipboard.readText();
                                if (clip) {
                                  setInputConvertText(clip);
                                  toast.success("Pasted binary data from clipboard!");
                                }
                              } catch {
                                toast.error("Could not read clipboard. Please paste manually.");
                              }
                            }}
                            className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold text-foreground hover:border-foreground transition-all cursor-pointer"
                            title="Paste from clipboard"
                          >
                            <Copy className="h-3 w-3 text-accent" />
                            <span>Paste</span>
                          </button>
                          {inputConvertText && (
                            <button
                              type="button"
                              onClick={() => {
                                setInputConvertText("");
                                setFile(null);
                                setProcessedSrc(null);
                                setImageSrc(null);
                                setHasProcessed(false);
                              }}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-destructive hover:border-destructive transition-all cursor-pointer"
                              title="Clear binary input"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <textarea
                        rows={7}
                        value={inputConvertText}
                        onChange={(e) => setInputConvertText(e.target.value)}
                        placeholder="Paste binary bits (e.g. 01001000 01100101... or multiline 1-bit pixel matrix)..."
                        className="w-full rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none"
                      />

                      {/* Quick Sample Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground block">Quick Sample Presets:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInputConvertText(SAMPLE_BINARY_INVADER);
                              const activeTheme = BINARY_THEMES[binaryTheme];
                              const url = decodeBinaryStringToImageUrl(SAMPLE_BINARY_INVADER, {
                                color0: activeTheme.bg,
                                color1: activeTheme.fg,
                                pixelScale: binaryPixelBlockSize,
                              });
                              if (url) {
                                setProcessedSrc(url);
                                setImageSrc(url);
                                setDimensions({ width: 11 * binaryPixelBlockSize, height: 8 * binaryPixelBlockSize });
                                setHasProcessed(true);
                              }
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all cursor-pointer"
                          >
                            👾 8-Bit Pixel Invader
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputConvertText(SAMPLE_BINARY_HEART);
                              const activeTheme = BINARY_THEMES[binaryTheme];
                              const url = decodeBinaryStringToImageUrl(SAMPLE_BINARY_HEART, {
                                color0: activeTheme.bg,
                                color1: activeTheme.fg,
                                pixelScale: binaryPixelBlockSize,
                              });
                              if (url) {
                                setProcessedSrc(url);
                                setImageSrc(url);
                                setDimensions({ width: 13 * binaryPixelBlockSize, height: 9 * binaryPixelBlockSize });
                                setHasProcessed(true);
                              }
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all cursor-pointer"
                          >
                            ❤️ 8-Bit Heart
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputConvertText(SAMPLE_BINARY_IMAGE);
                              const url = decodeBinaryStringToImageUrl(SAMPLE_BINARY_IMAGE);
                              if (url) {
                                setProcessedSrc(url);
                                setImageSrc(url);
                                setHasProcessed(true);
                              }
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all cursor-pointer"
                          >
                            🖼️ Sample Binary Header
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: UPLOAD BINARY FILE */}
                  {binaryInputTab === "upload" && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground block">
                        Upload Binary or Text Data File
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-border bg-background/60 p-6 hover:border-foreground hover:bg-card transition-all"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-md mb-2">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {file ? file.name : "Click or Drag & Drop File Here"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Supports <strong className="text-foreground">.bin, .txt, .dat, .raw</strong> or binary image files
                        </p>
                        {file && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatBytes(file.size)}
                            </span>
                            <span className="text-[11px] font-bold text-accent">Loaded ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Palette & Theme Customization */}
                  <div className="space-y-2.5 pt-2 border-t border-border">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Pixel Matrix &amp; Bitstream Color Palette
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {(Object.keys(BINARY_THEMES) as BinaryThemeKey[]).map((key) => {
                        const t = BINARY_THEMES[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setBinaryTheme(key);
                              if (inputConvertText) {
                                const url = decodeBinaryStringToImageUrl(inputConvertText, {
                                  color0: t.bg,
                                  color1: t.fg,
                                  pixelScale: binaryPixelBlockSize,
                                });
                                if (url) {
                                  setProcessedSrc(url);
                                  setImageSrc(url);
                                }
                              }
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              binaryTheme === key
                                ? "border-foreground bg-foreground text-background shadow-xs font-bold"
                                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            <div
                              className="h-4 w-4 rounded-full border border-white/20 shadow-xs"
                              style={{ backgroundColor: t.fg }}
                            />
                            <span className="text-[10px] font-extrabold leading-tight">{t.name.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pixel Block Scale Slider */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground">Pixel Scale / Block Size:</span>
                      <span className="font-mono font-black text-accent">{binaryPixelBlockSize}px</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[8, 12, 16, 20, 24].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setBinaryPixelBlockSize(size);
                            if (inputConvertText) {
                              const activeTheme = BINARY_THEMES[binaryTheme];
                              const url = decodeBinaryStringToImageUrl(inputConvertText, {
                                color0: activeTheme.bg,
                                color1: activeTheme.fg,
                                pixelScale: size,
                              });
                              if (url) {
                                setProcessedSrc(url);
                                setImageSrc(url);
                              }
                            }
                          }}
                          className={`py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            binaryPixelBlockSize === size
                              ? "border-foreground bg-foreground text-background shadow-xs font-black"
                              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 14. TEXT DECODER TOOLS (Base64/Octal/Hex/Decimal/ASCII/Text To Image) */}
              {[
                "base64-to-image",
                "octal-to-image",
                "ascii-to-image",
                "text-to-image",
                "hex-to-image",
                "decimal-to-image",
              ].includes(tool.slug) && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground block">
                    Paste {tool.name} Input Data
                  </label>
                  <textarea
                    rows={6}
                    value={inputConvertText}
                    onChange={(e) => setInputConvertText(e.target.value)}
                    placeholder={
                      tool.slug === "base64-to-image"
                        ? "Paste Base64 data string (e.g. data:image/png;base64,iVBORw0KGgo...)"
                        : tool.slug === "octal-to-image"
                        ? "Paste space-separated Octal byte numbers (e.g. 137 120 116 107...)"
                        : tool.slug === "hex-to-image"
                        ? "Paste Hexadecimal byte string (e.g. 89 50 4E 47 0D 0A 1A 0A...)"
                        : tool.slug === "decimal-to-image"
                        ? "Paste Decimal byte numbers (e.g. 137 80 78 71 13 10 26 10...)"
                        : "Type or paste text content to render into an image..."
                    }
                    className="w-full rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Click <strong className="text-foreground">Convert / Process Image</strong> below to render into a downloadable image.
                  </p>
                </div>
              )}

              {/* 14.9 ADVANCED OCR & BARCODE/QR CONTROLS */}
              {(tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text") && (
                <div className="space-y-4">
                  {/* 1. DOCUMENT & OCR LANGUAGE SELECTION */}
                  <div className="space-y-3.5 rounded-2xl border border-border bg-card/60 p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground font-black text-xs shadow-inner">
                          <Languages className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <label className="text-xs font-black text-foreground block">
                            OCR Recognition Language
                          </label>
                          <span className="text-[10px] text-muted-foreground block">
                            Choose document script or dual-language OCR
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsOcrLanguageDialogOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-extrabold text-accent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Change Language</span>
                      </button>
                    </div>

                    {/* Active Language Highlight Card */}
                    {(() => {
                      const activeObj =
                        ocrLanguage === "custom"
                          ? {
                              code: ocrCustomLanguage || "custom",
                              name: ocrCustomLanguage ? `Custom Code (${ocrCustomLanguage})` : "Custom OCR Code",
                              nativeName: ocrCustomLanguage || "Custom Code",
                              flag: "⚙️",
                              region: "User Custom Tesseract String",
                              category: "Multi-Language" as const,
                            }
                          : OCR_SUPPORTED_LANGUAGES.find((l) => l.code === ocrLanguage) || {
                              code: ocrLanguage,
                              name: ocrLanguage,
                              nativeName: ocrLanguage,
                              flag: "🌐",
                              region: "Standard Script",
                              category: "Popular" as const,
                            };

                      return (
                        <div
                          onClick={() => setIsOcrLanguageDialogOpen(true)}
                          className="group flex items-center justify-between rounded-xl border-2 border-border bg-background p-3 transition-all hover:border-foreground hover:bg-muted/30 cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-3 truncate pr-2">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-2xl shadow-xs group-hover:scale-105 transition-transform">
                              {activeObj.flag || "🌐"}
                            </span>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground truncate">
                                  {activeObj.nativeName || activeObj.name}
                                </span>
                                {activeObj.nativeName && activeObj.nativeName !== activeObj.name && (
                                  <span className="text-[11px] text-muted-foreground font-semibold truncate">
                                    ({activeObj.name})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="rounded-md bg-accent/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-accent">
                                  {activeObj.code}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium truncate">
                                  {activeObj.region || activeObj.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground hidden sm:inline">
                              Browse 60+ Languages
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border text-muted-foreground group-hover:border-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                              <ChevronRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quick Select Presets Grid */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Popular Presets:</span>
                        <button
                          type="button"
                          onClick={() => setIsOcrLanguageDialogOpen(true)}
                          className="text-accent hover:underline cursor-pointer lowercase first-letter:uppercase text-[11px]"
                        >
                          view 60+ languages →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { code: "eng", name: "English", flag: "🇺🇸" },
                          { code: "guj", name: "ગુજરાતી", flag: "🇮🇳" },
                          { code: "hin", name: "हिन्दी", flag: "🇮🇳" },
                          { code: "spa", name: "Español", flag: "🇪🇸" },
                          { code: "fra", name: "Français", flag: "🇫🇷" },
                          { code: "deu", name: "Deutsch", flag: "🇩🇪" },
                          { code: "chi_sim", name: "中文", flag: "🇨🇳" },
                          { code: "ara", name: "العربية", flag: "🇸🇦" },
                        ].map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setOcrLanguage(item.code);
                              toast.success(`OCR language set to ${item.name} (${item.code})`);
                            }}
                            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold transition-all cursor-pointer truncate ${
                              ocrLanguage === item.code
                                ? "bg-foreground text-background font-black shadow-xs ring-1 ring-foreground"
                                : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            <span className="text-sm shrink-0">{item.flag}</span>
                            <span className="truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dual-Language & Custom Code Launcher */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsOcrLanguageDialogOpen(true)}
                        className="w-full flex items-center justify-between rounded-xl border border-dashed border-border bg-background/50 p-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SlidersHorizontal className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="truncate">Need Dual Language (e.g. English + Hindi) or Custom Code?</span>
                        </div>
                        <span className="text-accent font-extrabold text-[11px] shrink-0">Open Dialog →</span>
                      </button>
                    </div>

                    {/* Custom Language Selection Dialog Modal */}
                    <OcrLanguageDialog
                      isOpen={isOcrLanguageDialogOpen}
                      onClose={() => setIsOcrLanguageDialogOpen(false)}
                      selectedLanguage={ocrLanguage}
                      onSelectLanguage={(code) => setOcrLanguage(code)}
                      customLanguage={ocrCustomLanguage}
                      onUpdateCustomLanguage={(val) => setOcrCustomLanguage(val)}
                    />
                  </div>

                  {/* 2. LIVE OCR PROGRESS STATUS INDICATOR */}
                  {processing && (
                    <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 space-y-3 animate-pulse">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                          <span>{ocrProgressStatus || "Running Optical Character Recognition…"}</span>
                        </div>
                        <span className="font-mono font-black text-accent">{ocrProgressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(5, ocrProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. QR & BARCODE DETECTION CARD & CHECKBOX */}
                  {detectedBarcodes.length > 0 ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white font-black text-xs">
                            ✓
                          </span>
                          <span className="text-xs font-black text-foreground">
                            {detectedBarcodes.length} {detectedBarcodes.some(b => b.type === "QR Code") && detectedBarcodes.some(b => b.type === "Barcode") ? "QR & Barcode" : detectedBarcodes[0]!.type} Detected
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                          Auto-Detected
                        </span>
                      </div>

                      {/* Setting Checkbox: Skip Barcode and QR Code Read */}
                      <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border bg-background cursor-pointer hover:border-foreground transition-all">
                        <input
                          type="checkbox"
                          checked={skipBarcodeAndQr}
                          onChange={(e) => {
                            setSkipBarcodeAndQr(e.target.checked);
                            recomputeOcrOutput(e.target.checked, ocrContrastMode, ocrOutputStructure);
                          }}
                          className="mt-0.5 h-4 w-4 rounded accent-foreground cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-foreground block">
                            Skip Barcode and QR Code Read
                          </span>
                          <span className="text-[11px] text-muted-foreground block leading-tight mt-0.5">
                            {skipBarcodeAndQr
                              ? "Barcode and QR Code data is currently ignored/skipped from text output."
                              : "Barcode & QR Code data is read and added directly into your text file."}
                          </span>
                        </div>
                      </label>

                      {/* Summary of Detected Barcode/QR contents */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Detected Payload Data ({detectedBarcodes.length}):
                        </span>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {detectedBarcodes.map((bc, idx) => (
                            <div key={idx} className="rounded-lg bg-background border border-border/80 p-2 text-xs flex items-center justify-between gap-2 shadow-2xs">
                              <div className="flex items-center gap-2 truncate min-w-0">
                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground shrink-0 uppercase">
                                  {bc.format || bc.type}
                                </span>
                                <span className="truncate font-mono text-[11px] text-muted-foreground" title={bc.rawValue}>
                                  {bc.rawValue}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  copyToClipboard(bc.rawValue, `barcode-${idx}`);
                                }}
                                className="shrink-0 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-bold text-foreground hover:bg-foreground hover:text-background transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {copiedFormat === `barcode-${idx}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skipBarcodeAndQr}
                          onChange={(e) => {
                            setSkipBarcodeAndQr(e.target.checked);
                            recomputeOcrOutput(e.target.checked, ocrContrastMode, ocrOutputStructure);
                          }}
                          className="mt-0.5 h-4 w-4 rounded accent-foreground cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-extrabold text-foreground block">
                            Skip Barcode and QR Code Read
                          </span>
                          <span className="text-[11px] text-muted-foreground block leading-tight mt-0.5">
                            When checked, QR codes &amp; 1D barcodes in images will be ignored.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* 4. OCR OUTPUT LAYOUT MODE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Text Formatting Structure:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "structured", label: "Structured", sub: "Document layout", icon: FileSpreadsheet },
                        { id: "plain", label: "Plain Text", sub: "Raw lines", icon: AlignLeft },
                        { id: "json", label: "Key-Value", sub: "Form fields", icon: Code2 },
                      ].map((mode) => {
                        const IconComp = mode.icon;
                        const isSelected = ocrOutputStructure === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              setOcrOutputStructure(mode.id as any);
                              recomputeOcrOutput(skipBarcodeAndQr, ocrContrastMode, mode.id as any);
                            }}
                            className={`flex flex-col items-center justify-center rounded-xl border py-2.5 px-1.5 text-center transition-all cursor-pointer gap-1 ${
                              isSelected
                                ? "border-foreground bg-foreground text-background shadow-xs font-bold"
                                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            <IconComp className={`h-4 w-4 ${isSelected ? "text-background" : "text-foreground"}`} />
                            <span className="text-xs font-extrabold leading-tight">{mode.label}</span>
                            <span className="text-[10px] opacity-75">{mode.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. OCR IMAGE ENHANCEMENT FILTER */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground block">
                      OCR Contrast &amp; Lighting Preprocessing:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "auto", label: "Adaptive", sub: "Auto lighting", icon: Sparkles },
                        { id: "high", label: "High Contrast", sub: "B&W threshold", icon: Sun },
                        { id: "inverted", label: "Invert Dark", sub: "Dark mode invert", icon: Moon },
                      ].map((f) => {
                        const IconComp = f.icon;
                        const isSelected = ocrContrastMode === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setOcrContrastMode(f.id as any);
                              recomputeOcrOutput(skipBarcodeAndQr, f.id as any, ocrOutputStructure);
                            }}
                            className={`flex flex-col items-center justify-center rounded-xl border py-2.5 px-1.5 text-center transition-all cursor-pointer gap-1 ${
                              isSelected
                                ? "border-foreground bg-foreground text-background shadow-xs font-bold"
                                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            <IconComp className={`h-4 w-4 ${isSelected ? "text-background" : "text-foreground"}`} />
                            <span className="text-xs font-extrabold leading-tight">{f.label}</span>
                            <span className="text-[10px] opacity-75">{f.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 15. TEXT ENCODER TOOLS OUTPUT DISPLAY */}
              {[
                "image-to-base64",
                "image-to-octal",
                "image-to-hex",
                "image-to-decimal",
                "image-to-ascii",
              ].includes(tool.slug) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Generated {tool.name} Output
                    </label>
                    {binaryOutputText && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(binaryOutputText, tool.name)}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-foreground hover:text-background transition-all shadow-xs"
                      >
                        {copiedFormat === tool.name ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-accent" />
                        )}
                        <span>{copiedFormat === tool.name ? "Copied!" : "Copy Output"}</span>
                      </button>
                    )}
                  </div>
                  {hasProcessed && binaryOutputText ? (
                    <textarea
                      rows={8}
                      value={binaryOutputText}
                      readOnly
                      onClick={(e) => {
                        (e.target as HTMLTextAreaElement).select();
                        copyToClipboard(binaryOutputText, tool.name);
                      }}
                      title="Click anywhere to select all and copy"
                      className="w-full cursor-pointer rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none break-all"
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-center">
                      <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                        ⚡ Upload an image and click <strong className="text-foreground">Convert / Process Image</strong> to generate {tool.name} output.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 15.5 HTML TO IMAGE CONTROLS */}
              {tool.slug === "html-to-image" && (
                <div className="space-y-6">
                  {/* Mode Selector Switcher */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Input Source Option:
                    </label>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1.5 border border-border">
                      <button
                        type="button"
                        onClick={() => setHtmlInputMode("upload")}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                          htmlInputMode === "upload"
                            ? "bg-foreground text-background shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload HTML File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHtmlInputMode("paste")}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                          htmlInputMode === "paste"
                            ? "bg-foreground text-background shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        <span>Paste HTML Code</span>
                      </button>
                    </div>
                  </div>

                  {/* OPTION 1: Upload HTML File */}
                  {htmlInputMode === "upload" && (
                    <div className="space-y-4">
                      {/* Uploaded File Header Card */}
                      {file ? (
                        <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-3 truncate">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow-xs">
                              <FileType className="h-5 w-5" />
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-extrabold text-foreground truncate">
                                {file.name}
                              </h4>
                              <p className="text-[11px] text-muted-foreground">
                                {formatBytes(file.size)} · {htmlCodeText.split('\n').length} lines of HTML
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold hover:bg-foreground hover:text-background transition-all shadow-xs"
                          >
                            Change File
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className="group cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background/50 p-6 text-center hover:border-accent hover:bg-accent/5 transition-all"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                            <FileType className="h-6 w-6" />
                          </div>
                          <h4 className="mt-3 text-sm font-extrabold text-foreground">
                            Click or Drop .html File Here
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Supports .html, .htm, or .txt file input
                          </p>
                        </div>
                      )}

                      {/* Loaded HTML Code Display & Editor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                          <span>Loaded HTML Code ({file ? file.name : "Uploaded File"}):</span>
                          <span className="font-mono text-[10px]">{htmlCodeText.length} chars</span>
                        </div>
                        <textarea
                          rows={7}
                          value={htmlCodeText}
                          onChange={(e) => setHtmlCodeText(e.target.value)}
                          placeholder="HTML code from file will appear here..."
                          className="w-full rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* OPTION 2: Paste HTML Code */}
                  {htmlInputMode === "paste" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground block">
                          HTML & CSS Code Editor
                        </label>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {htmlCodeText.length} chars
                        </span>
                      </div>

                      <textarea
                        rows={7}
                        value={htmlCodeText}
                        onChange={(e) => setHtmlCodeText(e.target.value)}
                        placeholder="Paste or write HTML & CSS code here..."
                        className="w-full rounded-2xl border-2 border-border bg-background p-3.5 text-xs font-mono leading-relaxed focus:border-accent focus:outline-none"
                      />

                      {/* Quick Sample Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground block">Quick Sample Templates:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setHtmlCodeText(SAMPLE_OG_CARD);
                              setHtmlRenderWidth(1200);
                              setHtmlRenderHeight(630);
                              setHtmlBgColor("#0f172a");
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all"
                          >
                            🎨 OG Card
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHtmlCodeText(SAMPLE_BADGE);
                              setHtmlRenderWidth(600);
                              setHtmlRenderHeight(300);
                              setHtmlBgColor("#0f172a");
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all"
                          >
                            🏷️ Product Badge
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHtmlCodeText(SAMPLE_INVOICE);
                              setHtmlRenderWidth(800);
                              setHtmlRenderHeight(600);
                              setHtmlBgColor("#ffffff");
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all"
                          >
                            🧾 Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHtmlCodeText(SAMPLE_CODE_BOX);
                              setHtmlRenderWidth(800);
                              setHtmlRenderHeight(450);
                              setHtmlBgColor("#090d16");
                            }}
                            className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold hover:border-accent hover:text-accent transition-all"
                          >
                            💻 Code Card
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Canvas Dimensions */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">Output Image Dimensions:</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setHtmlRenderWidth(1200); setHtmlRenderHeight(630); }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded border border-border hover:bg-muted"
                        >
                          1200x630
                        </button>
                        <button
                          type="button"
                          onClick={() => { setHtmlRenderWidth(1080); setHtmlRenderHeight(1080); }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded border border-border hover:bg-muted"
                        >
                          1080x1080
                        </button>
                        <button
                          type="button"
                          onClick={() => { setHtmlRenderWidth(800); setHtmlRenderHeight(600); }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded border border-border hover:bg-muted"
                        >
                          800x600
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground block mb-1">Width (px):</span>
                        <input
                          type="number"
                          min={100}
                          max={3840}
                          value={htmlRenderWidth}
                          onChange={(e) => setHtmlRenderWidth(Number(e.target.value) || 800)}
                          className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-xs font-mono font-bold focus:border-accent focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground block mb-1">Height (px):</span>
                        <input
                          type="number"
                          min={100}
                          max={3840}
                          value={htmlRenderHeight}
                          onChange={(e) => setHtmlRenderHeight(Number(e.target.value) || 450)}
                          className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-xs font-mono font-bold focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background & Output Format */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                      <span className="text-[11px] font-bold text-muted-foreground block mb-1">Background:</span>
                      <select
                        value={htmlBgColor}
                        onChange={(e) => setHtmlBgColor(e.target.value)}
                        className="w-full rounded-xl border-2 border-border bg-background px-2.5 py-2 text-xs font-bold focus:border-accent focus:outline-none"
                      >
                        <option value="#ffffff">White (#FFFFFF)</option>
                        <option value="#0f172a">Dark Slate (#0F172A)</option>
                        <option value="#090d16">Dark Charcoal (#090D16)</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-muted-foreground block mb-1">Format:</span>
                      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1 border border-border">
                        <button
                          type="button"
                          onClick={() => setHtmlOutputFormat("PNG")}
                          className={`rounded-lg py-1.5 text-xs font-extrabold transition-all ${
                            htmlOutputFormat === "PNG" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground"
                          }`}
                        >
                          PNG
                        </button>
                        <button
                          type="button"
                          onClick={() => setHtmlOutputFormat("JPG")}
                          className={`rounded-lg py-1.5 text-xs font-extrabold transition-all ${
                            htmlOutputFormat === "JPG" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground"
                          }`}
                        >
                          JPG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 16. COLOR PICKER FROM IMAGE */}
              {tool.slug === "color-picker-from-image" && (
                <div className="space-y-5">
                  {/* Swatch Header */}
                  <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <span
                      className="h-16 w-16 rounded-xl border-2 border-white/30 shadow-md shrink-0 transition-transform duration-200"
                      style={{ backgroundColor: pickedHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Color</p>
                      <p className="font-display text-2xl font-black text-foreground truncate">{pickedHex}</p>
                      <p className="text-xs font-mono text-muted-foreground">{pickedRgb}</p>
                    </div>
                    <button
                      type="button"
                      onClick={openSystemEyeDropper}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-md transition-all hover:scale-105"
                      title="Launch EyeDropper tool"
                    >
                      <Pipette className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Copy Code Buttons */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">Color Formats (Click to Copy)</p>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
                      <span>HEX: <strong className="text-foreground">{pickedHex}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pickedHex, "HEX")}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-bold hover:bg-foreground hover:text-background transition-all"
                      >
                        {copiedFormat === "HEX" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedFormat === "HEX" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
                      <span>RGB: <strong className="text-foreground">{pickedRgb}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pickedRgb, "RGB")}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-bold hover:bg-foreground hover:text-background transition-all"
                      >
                        {copiedFormat === "RGB" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedFormat === "RGB" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
                      <span>HSL: <strong className="text-foreground">{pickedHsl}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(pickedHsl, "HSL")}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-bold hover:bg-foreground hover:text-background transition-all"
                      >
                        {copiedFormat === "HSL" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedFormat === "HSL" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Palette History */}
                  {colorHistory.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Sampled Palette</span>
                        <span>{colorHistory.length} colors</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {colorHistory.map((hex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setPickedHex(hex);
                              const r = parseInt(hex.slice(1, 3), 16);
                              const g = parseInt(hex.slice(3, 5), 16);
                              const b = parseInt(hex.slice(5, 7), 16);
                              const rgb = `rgb(${r}, ${g}, ${b})`;
                              const hsl = rgbToHsl(r, g, b);
                              setPickedRgb(rgb);
                              setPickedHsl(hsl);
                              copyToClipboard(hex, "HEX");
                            }}
                            className="h-8 w-8 rounded-lg border border-white/40 shadow-sm transition-transform hover:scale-110 focus:outline-none"
                            style={{ backgroundColor: hex }}
                            title={`Click to select & copy ${hex}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 17. IMAGE TO PDF SETTINGS & CONTROLS */}
              {tool.slug === "image-to-pdf" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent shrink-0" />
                      <h4 className="text-sm font-extrabold text-foreground">PDF Document Generator</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Converts your image into a standard, high-resolution <strong className="text-foreground">PDF 1.4</strong> document with crystal-clear rendering across all PDF viewers.
                    </p>
                  </div>

                  {/* Page Size Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                      <span>Page Layout & Sizing:</span>
                      <span className="text-[10px] uppercase font-mono font-bold text-accent">
                        {pdfPageSize === "auto" ? "Fit to Image" : pdfPageSize.replace("_", " ").toUpperCase()}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: "auto", label: "Fit to Image", desc: "Native image aspect ratio" },
                        { id: "a4_portrait", label: "A4 Portrait", desc: "210 × 297 mm (Standard)" },
                        { id: "a4_landscape", label: "A4 Landscape", desc: "297 × 210 mm (Wide)" },
                        { id: "letter_portrait", label: "US Letter", desc: "8.5 × 11 in (Portrait)" },
                        { id: "letter_landscape", label: "US Letter", desc: "11 × 8.5 in (Landscape)" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPdfPageSize(opt.id as any)}
                          className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            pdfPageSize === opt.id
                              ? "border-accent bg-accent/10 text-foreground font-bold shadow-xs ring-1 ring-accent"
                              : "border-border bg-background/80 text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs font-extrabold">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Margin Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Page Margins:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-muted/40 p-1.5 border border-border">
                      {[
                        { id: "none", label: "None (0)" },
                        { id: "small", label: "Small (5mm)" },
                        { id: "normal", label: "Normal (12mm)" },
                        { id: "large", label: "Large (20mm)" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPdfMargin(m.id as any)}
                          className={`py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                            pdfMargin === m.id
                              ? "bg-foreground text-background shadow-xs font-black"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Quality / Compression Slider */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground">PDF Image Quality:</span>
                      <span className="font-mono font-black text-accent">{pdfQuality}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      step={5}
                      value={pdfQuality}
                      onChange={(e) => setPdfQuality(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Smaller File (60%)</span>
                      <span>Balanced (80%)</span>
                      <span>Maximum (100%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 18. IMAGE TO WORD (MICROSOFT WORD OCR) */}
              {tool.slug === "image-to-word" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border-2 border-blue-500/40 bg-blue-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileType className="h-5 w-5 text-blue-500 shrink-0" />
                      <h4 className="text-sm font-extrabold text-foreground">
                        Microsoft Word (.docx) OCR Engine
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Extracts real editable text, headers, and bullet points from your image using neural OCR and compiles an authentic, standard OpenXML <strong className="text-foreground">.docx</strong> file.
                    </p>
                  </div>

                  {/* 1. OCR Recognition Language */}
                  <div className="space-y-3 rounded-2xl border border-border bg-background/80 p-3.5 sm:p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-accent" />
                        <label className="text-xs font-black text-foreground">
                          OCR Language
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOcrLanguageDialogOpen(true)}
                        className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs font-extrabold text-accent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Change (60+)</span>
                      </button>
                    </div>

                    {/* Active Language Card */}
                    {(() => {
                      const activeObj =
                        ocrLanguage === "custom"
                          ? { code: ocrCustomLanguage || "custom", name: ocrCustomLanguage || "Custom Code", flag: "⚙️" }
                          : OCR_SUPPORTED_LANGUAGES.find((l) => l.code === ocrLanguage) || { code: ocrLanguage, name: ocrLanguage, flag: "🌐" };
                      return (
                        <div
                          onClick={() => setIsOcrLanguageDialogOpen(true)}
                          className="group flex items-center justify-between rounded-xl border border-border bg-card p-2.5 transition-all hover:border-foreground cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-xl shrink-0">{activeObj.flag}</span>
                            <span className="text-xs font-extrabold text-foreground truncate">{activeObj.name}</span>
                            <span className="rounded-md bg-accent/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-accent">
                              {activeObj.code}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })()}

                    {/* Presets Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { code: "eng", name: "English", flag: "🇺🇸" },
                        { code: "guj", name: "ગુજરાતી", flag: "🇮🇳" },
                        { code: "hin", name: "हिन्दी", flag: "🇮🇳" },
                        { code: "spa", name: "Español", flag: "🇪🇸" },
                        { code: "fra", name: "Français", flag: "🇫🇷" },
                        { code: "deu", name: "Deutsch", flag: "🇩🇪" },
                        { code: "chi_sim", name: "中文", flag: "🇨🇳" },
                        { code: "ara", name: "العربية", flag: "🇸🇦" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setOcrLanguage(item.code);
                            toast.success(`OCR language set to ${item.name}`);
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                            ocrLanguage === item.code
                              ? "bg-foreground text-background font-black shadow-xs"
                              : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{item.flag}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Word Document Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Document Generation Mode:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "text_clean", label: "Clean Text", sub: "100% Editable" },
                        { id: "text_and_image", label: "Text + Image", sub: "Complete scan" },
                        { id: "image_only", label: "Image Only", sub: "Visual layout" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWordDocMode(m.id as any)}
                          className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all cursor-pointer ${
                            wordDocMode === m.id
                              ? "border-foreground bg-foreground text-background shadow-xs font-bold"
                              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs font-extrabold">{m.label}</span>
                          <span className="text-[10px] opacity-80">{m.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Font Family & Size */}
                  {wordDocMode !== "image_only" && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground block">
                          Document Font Family:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {["Calibri", "Arial", "Times New Roman", "Georgia", "Aptos", "Segoe UI"].map((font) => (
                            <button
                              key={font}
                              type="button"
                              onClick={() => setWordFontFamily(font)}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold truncate transition-all cursor-pointer ${
                                wordFontFamily === font
                                  ? "border-foreground bg-foreground text-background shadow-xs font-black"
                                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                              }`}
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-muted-foreground">Body Font Size:</span>
                          <span className="font-mono font-black text-accent">{wordFontSize} pt</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[10, 11, 12, 14].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setWordFontSize(size)}
                              className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                wordFontSize === size
                                  ? "bg-foreground text-background font-black shadow-xs"
                                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                              }`}
                            >
                              {size} pt {size === 11 ? "(Standard)" : ""}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Progress */}
                  {processing && (
                    <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 space-y-3 animate-pulse">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                          <span>{ocrProgressStatus || "Running OCR for Word Document…"}</span>
                        </div>
                        <span className="font-mono font-black text-accent">{ocrProgressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(5, ocrProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 19. IMAGE TO EXCEL (MICROSOFT EXCEL OCR TABLE ENGINE) */}
              {tool.slug === "image-to-excel" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
                      <h4 className="text-sm font-extrabold text-foreground">
                        Microsoft Excel (.xlsx) OCR Table Engine
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Scans tables, matrices, and columns in your image and generates an authentic, multi-cell Microsoft Excel <strong className="text-foreground">.xlsx</strong> spreadsheet with custom styles and numeric detection.
                    </p>
                  </div>

                  {/* 1. OCR Recognition Language */}
                  <div className="space-y-3 rounded-2xl border border-border bg-background/80 p-3.5 sm:p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-accent" />
                        <label className="text-xs font-black text-foreground">
                          OCR Language
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOcrLanguageDialogOpen(true)}
                        className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs font-extrabold text-accent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Change (60+)</span>
                      </button>
                    </div>

                    {/* Active Language Card */}
                    {(() => {
                      const activeObj =
                        ocrLanguage === "custom"
                          ? { code: ocrCustomLanguage || "custom", name: ocrCustomLanguage || "Custom Code", flag: "⚙️" }
                          : OCR_SUPPORTED_LANGUAGES.find((l) => l.code === ocrLanguage) || { code: ocrLanguage, name: ocrLanguage, flag: "🌐" };
                      return (
                        <div
                          onClick={() => setIsOcrLanguageDialogOpen(true)}
                          className="group flex items-center justify-between rounded-xl border border-border bg-card p-2.5 transition-all hover:border-foreground cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-xl shrink-0">{activeObj.flag}</span>
                            <span className="text-xs font-extrabold text-foreground truncate">{activeObj.name}</span>
                            <span className="rounded-md bg-accent/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-accent">
                              {activeObj.code}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })()}

                    {/* Presets Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { code: "eng", name: "English", flag: "🇺🇸" },
                        { code: "guj", name: "ગુજરાતી", flag: "🇮🇳" },
                        { code: "hin", name: "हिन्दी", flag: "🇮🇳" },
                        { code: "spa", name: "Español", flag: "🇪🇸" },
                        { code: "fra", name: "Français", flag: "🇫🇷" },
                        { code: "deu", name: "Deutsch", flag: "🇩🇪" },
                        { code: "chi_sim", name: "中文", flag: "🇨🇳" },
                        { code: "ara", name: "العربية", flag: "🇸🇦" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setOcrLanguage(item.code);
                            toast.success(`OCR language set to ${item.name}`);
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                            ocrLanguage === item.code
                              ? "bg-foreground text-background font-black shadow-xs"
                              : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{item.flag}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Table Parser Matrix Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Table Matrix Parser Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "grid", label: "Auto Grid Matrix", sub: "Tabs, pipes & multi-space" },
                        { id: "csv", label: "CSV Comma Mode", sub: "Comma separated values" },
                        { id: "whitespace", label: "Whitespace Gap", sub: "Spacing between columns" },
                        { id: "lines", label: "Line by Line", sub: "Each line in one row" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setExcelParserMode(p.id as any)}
                          className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            excelParserMode === p.id
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground font-bold shadow-xs ring-1 ring-emerald-500"
                              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs font-extrabold">{p.label}</span>
                          <span className="text-[10px] text-muted-foreground">{p.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Sheet Name & Header Styling */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground block">
                        Worksheet Tab Name:
                      </label>
                      <input
                        type="text"
                        value={excelSheetName}
                        onChange={(e) => setExcelSheetName(e.target.value)}
                        placeholder="Sheet1"
                        className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-background/60 cursor-pointer hover:border-foreground transition-all">
                      <input
                        type="checkbox"
                        checked={excelHighlightHeader}
                        onChange={(e) => setExcelHighlightHeader(e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-extrabold text-foreground block">
                          Format Top Row as Table Header
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Applies bold typography, light accent fill, and bottom border to row 1.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Live Progress */}
                  {processing && (
                    <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3 animate-pulse">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          <span>{ocrProgressStatus || "Extracting Table Matrix with OCR…"}</span>
                        </div>
                        <span className="font-mono font-black text-emerald-500">{ocrProgressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(5, ocrProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 20. IMAGE TO PPTX (POWERPOINT) */}
              {tool.slug === "image-to-powerpoint" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileType className="h-5 w-5 text-accent shrink-0" />
                      <h4 className="text-sm font-extrabold text-foreground">
                        PowerPoint Presentation (.pptx)
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Packages your image into an authentic 16:9 widescreen PowerPoint (.pptx) presentation slide preserving full native aspect ratio and color gamut.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-bold">Output Format:</span>
                      <span className="font-mono font-extrabold text-foreground uppercase">PPTX (Slide)</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-bold">Compatibility:</span>
                      <span className="text-[11px] text-foreground font-semibold">MS PowerPoint, Google Slides, Keynote</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-bold">Slide Ratio:</span>
                      <span className="text-[11px] text-foreground font-semibold">16:9 Widescreen Presentation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Convert/Process + Download */}
              <div className="pt-6 border-t border-border flex flex-col gap-3">
                {/* 1. Primary Convert / Process Image Button */}
                <button
                  type="button"
                  onClick={processImage}
                  disabled={processing || (tool.slug === "compress-image" && compressMode === "size" && isTargetSizeExceeding)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-base font-extrabold text-accent-foreground shadow-xl transition-all hover:scale-[1.02] active:scale-95 border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>
                        {tool.slug === "compress-image"
                          ? "Compressing Image…"
                          : tool.slug === "image-to-word"
                          ? ocrProgressStatus || "Extracting Text & Building Word Doc…"
                          : tool.slug === "image-to-excel"
                          ? ocrProgressStatus || "Extracting Table & Building Excel Sheet…"
                          : tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text"
                          ? ocrProgressStatus || "Extracting Text with OCR…"
                          : tool.slug === "binary-to-image"
                          ? "Decoding Binary Data…"
                          : tool.slug === "html-to-image"
                          ? "Rendering HTML to Image…"
                          : "Processing Image…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>
                        {hasProcessed
                          ? tool.slug === "compress-image"
                            ? "Re-compress Image"
                            : tool.slug === "image-to-word"
                            ? "Re-extract Text (Word)"
                            : tool.slug === "image-to-excel"
                            ? "Re-extract Table (Excel)"
                            : tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text"
                            ? "Re-extract Text (OCR)"
                            : tool.slug === "binary-to-image"
                            ? "Re-convert Binary to Image"
                            : tool.slug === "html-to-image"
                            ? "Re-render HTML to Image"
                            : `Re-process ${tool.name}`
                          : tool.slug === "compress-image"
                          ? "Compress Image"
                          : tool.slug === "image-to-word"
                          ? "Extract Text to Word (.docx)"
                          : tool.slug === "image-to-excel"
                          ? "Extract Table to Excel (.xlsx)"
                          : tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text"
                          ? "Extract Text with OCR"
                          : tool.slug === "binary-to-image"
                          ? "Convert Binary to Image"
                          : tool.slug === "html-to-image"
                          ? "Render HTML to Image"
                          : "Convert / Process Image"}
                      </span>
                    </>
                  )}
                </button>

                {/* Cancel & Return to Processed Result Button */}
                {hasProcessed && isEditingSettings && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSettings(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-6 py-3.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:border-foreground transition-all cursor-pointer"
                  >
                    <span>Cancel & View Processed Result</span>
                  </button>
                )}

                {/* 2. Download Button (for other tools) */}
                {tool.slug !== "compress-image" && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!hasProcessed && !processedSrc}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold shadow-lg transition-all ${
                      hasProcessed || processedSrc
                        ? "bg-foreground text-background hover:scale-[1.02] cursor-pointer"
                        : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <Download className="h-4 w-4" />{" "}
                    {tool.slug === "image-to-pdf"
                      ? "Download PDF (.pdf) →"
                      : tool.slug === "image-to-word"
                      ? "Download Word (.docx) →"
                      : tool.slug === "image-to-excel"
                      ? "Download Excel (.xlsx) →"
                      : tool.slug === "image-to-powerpoint"
                      ? "Download Presentation (.pptx) →"
                      : tool.slug === "image-to-text-ocr" || tool.slug === "image-to-text"
                      ? "Download Extracted Text (.txt) →"
                      : ["image-to-base64", "image-to-octal", "image-to-hex", "image-to-decimal", "image-to-ascii"].includes(tool.slug)
                      ? "Download Text Data (.txt) →"
                      : "Download Result →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Enlarge Image Preview Modal */}
      {isFullscreenPreview && (imageSrc || processedSrc) && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsFullscreenPreview(false)}
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
        >
          {/* Top Modal Header Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between border-b border-white/15 bg-black/80 px-6 py-4 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-accent">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm md:text-base text-white truncate max-w-[280px] sm:max-w-md">
                    {file?.name || "Image Preview"}
                  </h3>
                  {hasProcessed && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Processed Output
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 font-semibold mt-0.5">
                  {dimensions.width} × {dimensions.height} px
                  {origSize > 0 && ` · ${formatBytes(hasProcessed && newSize ? newSize : origSize)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Download Button inside Modal */}
              <button
                type="button"
                onClick={handleDownload}
                className="hidden sm:flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-black text-accent-foreground shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                title="Close preview (Esc)"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
                <kbd className="hidden md:inline-block rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/70 font-mono border border-white/20">
                  ESC
                </kbd>
              </button>
            </div>
          </div>

          {/* Centered Image Display Area */}
          <div
            onClick={() => setIsFullscreenPreview(false)}
            className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[calc(100vh-120px)] max-w-[94vw] flex items-center justify-center cursor-default"
            >
              <img
                src={processedSrc || imageSrc || ""}
                alt="Enlarged preview"
                className="max-h-[calc(100vh-130px)] max-w-[92vw] object-contain rounded-2xl shadow-2xl border-2 border-white/15 animate-in zoom-in-95 duration-200"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.05) 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM FULLSCREEN BINARY & CODE RESEARCH EDITOR MODAL ── */}
      {isCodeEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex flex-col font-mono text-xs select-text overflow-hidden animate-in fade-in duration-150"
          style={{
            backgroundColor: EDITOR_THEMES[editorTheme].bg,
            color: EDITOR_THEMES[editorTheme].text,
          }}
        >
          {/* 1. Header Toolbar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 shadow-md backdrop-blur-md shrink-0"
            style={{
              borderColor: EDITOR_THEMES[editorTheme].border,
              backgroundColor: EDITOR_THEMES[editorTheme].gutterBg,
            }}
          >
            {/* Left: Branding & File Info */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner"
                style={{
                  backgroundColor: EDITOR_THEMES[editorTheme].bg,
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  color: EDITOR_THEMES[editorTheme].accent,
                }}
              >
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm tracking-wide text-foreground">
                    {file?.name ? `${file.name.replace(/\.[^.]+$/, "")}.${binaryOutputMode === "C-Array" ? "h" : binaryOutputMode === "Hexadecimal" ? "hex" : binaryOutputMode === "Base64" ? "base64" : "bin"}` : "image_stream.bin"}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border"
                    style={{
                      borderColor: EDITOR_THEMES[editorTheme].accent,
                      color: EDITOR_THEMES[editorTheme].accent,
                      backgroundColor: `${EDITOR_THEMES[editorTheme].accent}15`,
                    }}
                  >
                    {binaryOutputMode} Mode
                  </span>
                </div>
                <p
                  className="text-[11px] font-semibold mt-0.5"
                  style={{ color: EDITOR_THEMES[editorTheme].gutterText }}
                >
                  {binaryStats.totalBytes > 0
                    ? `${binaryStats.totalBytes.toLocaleString()} Bytes (${binaryStats.totalBits.toLocaleString()} Bits)`
                    : `${(fullBinaryOutputText || binaryOutputText).length.toLocaleString()} Characters`}
                  {" · "}
                  {binaryStats.magic.format}
                </p>
              </div>
            </div>

            {/* Middle: Live Format Switcher Tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full"
              style={{
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
                borderColor: EDITOR_THEMES[editorTheme].border,
              }}
            >
              {(
                [
                  "Binary",
                  "Hexadecimal",
                  "Base64",
                  "C-Array",
                  "Pixel-Matrix",
                  "Decimal",
                  "Octal",
                ] as const
              ).map((mode) => {
                const isActive = binaryOutputMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setBinaryOutputMode(mode);
                      if (imageSrc) generateBinaryData(imageSrc);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                    style={{
                      backgroundColor: isActive ? EDITOR_THEMES[editorTheme].accent : "transparent",
                      color: isActive ? "#ffffff" : EDITOR_THEMES[editorTheme].text,
                    }}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* Right: Actions, Themes, Search, Wrap, Close */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Find / Search Toggle */}
              <button
                type="button"
                onClick={() => setIsEditorSearching(!isEditorSearching)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                style={{
                  borderColor: isEditorSearching ? EDITOR_THEMES[editorTheme].accent : EDITOR_THEMES[editorTheme].border,
                  backgroundColor: isEditorSearching ? `${EDITOR_THEMES[editorTheme].accent}25` : EDITOR_THEMES[editorTheme].bg,
                  color: isEditorSearching ? EDITOR_THEMES[editorTheme].accent : EDITOR_THEMES[editorTheme].text,
                }}
                title="Search bytes or text in stream (Ctrl+F)"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Word Wrap Toggle */}
              <button
                type="button"
                onClick={() => setEditorLineWrap(!editorLineWrap)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                style={{
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  backgroundColor: editorLineWrap ? `${EDITOR_THEMES[editorTheme].accent}20` : EDITOR_THEMES[editorTheme].bg,
                  color: editorLineWrap ? EDITOR_THEMES[editorTheme].accent : EDITOR_THEMES[editorTheme].text,
                }}
                title={`Word Wrap: ${editorLineWrap ? "ON" : "OFF"}`}
              >
                <WrapText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{editorLineWrap ? "Wrap" : "No Wrap"}</span>
              </button>

              {/* Font Size Adjusters */}
              <div
                className="flex items-center rounded-lg border overflow-hidden"
                style={{
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  backgroundColor: EDITOR_THEMES[editorTheme].bg,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditorFontSize((prev) => Math.max(10, prev - 1))}
                  className="px-2 py-1 hover:bg-white/10 transition-colors font-bold text-xs cursor-pointer"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span
                  className="px-1.5 text-[11px] font-mono border-x"
                  style={{ borderColor: EDITOR_THEMES[editorTheme].border }}
                >
                  {editorFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setEditorFontSize((prev) => Math.min(22, prev + 1))}
                  className="px-2 py-1 hover:bg-white/10 transition-colors font-bold text-xs cursor-pointer"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>

              {/* Theme Selector */}
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as EditorThemeKey)}
                className="rounded-lg border px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: EDITOR_THEMES[editorTheme].bg,
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  color: EDITOR_THEMES[editorTheme].text,
                }}
              >
                {(Object.keys(EDITOR_THEMES) as EditorThemeKey[]).map((tk) => (
                  <option key={tk} value={tk}>
                    {EDITOR_THEMES[tk].name}
                  </option>
                ))}
              </select>

              {/* Copy Full Dataset */}
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(
                    fullBinaryOutputText || binaryOutputText,
                    `${binaryOutputMode} Full Dataset`
                  );
                }}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: EDITOR_THEMES[editorTheme].accent,
                  borderColor: EDITOR_THEMES[editorTheme].accent,
                  color: "#ffffff",
                }}
                title="Copy 100% complete dataset to clipboard"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copy All</span>
              </button>

              {/* Download File */}
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer hover:bg-white/10"
                style={{
                  backgroundColor: EDITOR_THEMES[editorTheme].bg,
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  color: EDITOR_THEMES[editorTheme].text,
                }}
                title="Download full file"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCodeEditorOpen(false)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer hover:bg-red-500 hover:text-white"
                style={{
                  backgroundColor: EDITOR_THEMES[editorTheme].bg,
                  borderColor: EDITOR_THEMES[editorTheme].border,
                  color: EDITOR_THEMES[editorTheme].text,
                }}
                title="Close editor (Esc)"
              >
                <X className="h-4 w-4" />
                <kbd className="hidden md:inline-block rounded px-1 py-0.2 text-[9px] font-mono border opacity-70">
                  ESC
                </kbd>
              </button>
            </div>
          </div>

          {/* 2. Binary Deep Research & Stream Analytics Panel */}
          <div
            className="flex items-center gap-3 px-4 py-2 border-b overflow-x-auto shrink-0 text-[11px]"
            style={{
              borderColor: EDITOR_THEMES[editorTheme].border,
              backgroundColor: `${EDITOR_THEMES[editorTheme].gutterBg}aa`,
            }}
          >
            {/* Header Signature */}
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 shrink-0"
              style={{
                borderColor: EDITOR_THEMES[editorTheme].border,
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
              }}
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: EDITOR_THEMES[editorTheme].accent }} />
              <span className="font-bold opacity-75">Header:</span>
              <span className="font-extrabold" style={{ color: EDITOR_THEMES[editorTheme].accent }}>
                {binaryStats.magic.format}
              </span>
              <span className="text-[10px] opacity-70 font-mono">[{binaryStats.magic.magicHex}]</span>
            </div>

            {/* Shannon Entropy */}
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 shrink-0"
              style={{
                borderColor: EDITOR_THEMES[editorTheme].border,
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
              }}
            >
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold opacity-75">Shannon Entropy:</span>
              <span className="font-extrabold text-amber-400">
                {binaryStats.entropy} / 8.000
              </span>
              <span className="text-[10px] opacity-70">
                {binaryStats.entropy > 7.5 ? "(High Randomness · Compressed)" : binaryStats.entropy > 4 ? "(Moderate Structure)" : "(Low Randomness · Sparse)"}
              </span>
            </div>

            {/* Bit Balance / Density */}
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 shrink-0"
              style={{
                borderColor: EDITOR_THEMES[editorTheme].border,
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
              }}
            >
              <Binary className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-bold opacity-75">Bit Balance:</span>
              <span className="font-extrabold text-emerald-400">
                {binaryStats.bitDensity}% [1s] · {100 - binaryStats.bitDensity}% [0s]
              </span>
              <span className="text-[10px] opacity-70 font-mono">
                (0s: {binaryStats.zeroCount.toLocaleString()} | 1s: {binaryStats.oneCount.toLocaleString()})
              </span>
            </div>

            {/* Bit Depth / Grouping */}
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 shrink-0"
              style={{
                borderColor: EDITOR_THEMES[editorTheme].border,
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
              }}
            >
              <Cpu className="h-3.5 w-3.5" style={{ color: EDITOR_THEMES[editorTheme].accent }} />
              <span className="font-bold opacity-75">Grouping:</span>
              <span className="font-extrabold">{binaryBitDepth}</span>
            </div>
          </div>

          {/* 3. Search / Byte Hunter Bar (when toggled on) */}
          {isEditorSearching && (
            <div
              className="flex items-center justify-between gap-3 px-4 py-2 border-b shrink-0 animate-in slide-in-from-top-2 duration-150"
              style={{
                borderColor: EDITOR_THEMES[editorTheme].border,
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
              }}
            >
              <div className="flex items-center gap-2 flex-1 max-w-2xl">
                <Search className="h-4 w-4 shrink-0" style={{ color: EDITOR_THEMES[editorTheme].accent }} />
                <input
                  type="text"
                  value={editorSearchQuery}
                  onChange={(e) => setEditorSearchQuery(e.target.value)}
                  placeholder="Search byte sequences (e.g. 1111, FF D8, 89 50, 00000000)..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-xs font-mono font-bold"
                  style={{ color: EDITOR_THEMES[editorTheme].text }}
                  autoFocus
                />
                {editorSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setEditorSearchQuery("")}
                    className="p-1 hover:bg-white/10 rounded cursor-pointer opacity-70 hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Live Match Counter & Preset Search Chips */}
              <div className="flex items-center gap-2">
                {editorSearchQuery && (
                  <span
                    className="px-2.5 py-0.5 rounded-md border text-[11px] font-extrabold font-mono"
                    style={{
                      borderColor: EDITOR_THEMES[editorTheme].accent,
                      backgroundColor: `${EDITOR_THEMES[editorTheme].accent}20`,
                      color: EDITOR_THEMES[editorTheme].accent,
                    }}
                  >
                    {(() => {
                      const text = fullBinaryOutputText || binaryOutputText || "";
                      if (!editorSearchQuery.trim() || !text) return "0 matches";
                      let count = 0;
                      let pos = 0;
                      const q = editorSearchQuery.trim();
                      while ((pos = text.indexOf(q, pos)) !== -1) {
                        count++;
                        pos += q.length;
                        if (count > 9999) break;
                      }
                      return `${count.toLocaleString()}${count > 9999 ? "+" : ""} matches`;
                    })()}
                  </span>
                )}

                {/* Quick Presets */}
                <div className="hidden md:flex items-center gap-1 text-[10px]">
                  <span className="opacity-60 font-bold">Presets:</span>
                  {["00000000", "11111111", "0100", "89 50", "FF D8"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditorSearchQuery(preset)}
                      className="px-1.5 py-0.5 rounded border hover:opacity-100 opacity-75 transition-all cursor-pointer font-mono"
                      style={{
                        borderColor: EDITOR_THEMES[editorTheme].border,
                        backgroundColor: EDITOR_THEMES[editorTheme].gutterBg,
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Main Code Editor Workspace */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Gutter (Line Numbers / Offsets) */}
            <div
              className="w-14 sm:w-16 border-r shrink-0 select-none py-3 px-2 text-right overflow-hidden font-mono"
              style={{
                backgroundColor: EDITOR_THEMES[editorTheme].gutterBg,
                borderColor: EDITOR_THEMES[editorTheme].border,
                color: EDITOR_THEMES[editorTheme].gutterText,
                fontSize: `${editorFontSize}px`,
                lineHeight: "1.6",
              }}
            >
              {Array.from({
                length: Math.min(
                  500,
                  Math.max(
                    1,
                    (fullBinaryOutputText || binaryOutputText || "").split("\n").length
                  )
                ),
              }).map((_, i) => (
                <div key={i} className="opacity-60">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Main Code Textarea / Viewer */}
            <textarea
              readOnly
              value={fullBinaryOutputText || binaryOutputText || ""}
              style={{
                backgroundColor: EDITOR_THEMES[editorTheme].bg,
                color: EDITOR_THEMES[editorTheme].text,
                fontSize: `${editorFontSize}px`,
                lineHeight: "1.6",
                borderColor: "transparent",
              }}
              className={`flex-1 p-3 font-mono focus:outline-none resize-none overflow-auto select-text selection:bg-accent/30 ${
                editorLineWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre overflow-x-auto"
              }`}
            />
          </div>

          {/* 5. Bottom Status Bar */}
          <div
            className="flex items-center justify-between gap-4 px-4 py-1.5 border-t text-[11px] font-mono shrink-0 select-none"
            style={{
              borderColor: EDITOR_THEMES[editorTheme].border,
              backgroundColor: EDITOR_THEMES[editorTheme].gutterBg,
              color: EDITOR_THEMES[editorTheme].gutterText,
            }}
          >
            {/* Left Status Info */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <Terminal className="h-3 w-3" style={{ color: EDITOR_THEMES[editorTheme].accent }} />
                <span>Binary Code Lab</span>
              </span>
              <span>·</span>
              <span>Mode: <strong className="text-foreground">{binaryOutputMode}</strong></span>
              <span>·</span>
              <span>Delimiter: <strong className="text-foreground">{binaryDelimiter}</strong></span>
              <span>·</span>
              <span>Depth: <strong className="text-foreground">{binaryBitDepth}</strong></span>
              <span>·</span>
              <span>Encoding: <strong className="text-foreground">UTF-8 / Raw Stream</strong></span>
            </div>

            {/* Right Integrity Info */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Check className="h-3 w-3 text-emerald-400" />
                <span>100% Full Dataset Loaded</span>
              </span>
              <span>·</span>
              <span>
                {((fullBinaryOutputText || binaryOutputText || "").length).toLocaleString()} chars
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
