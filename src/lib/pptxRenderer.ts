// ── PowerPoint (PPTX) High-Fidelity Parser and Multi-Slide Canvas Renderer ────

export interface PptxMetadata {
  totalSlides: number;
  slidePaths: string[];
  slideWidthEMU: number;
  slideHeightEMU: number;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatioLabel: string;
  themeColors: Record<string, string>;
  slideTitles: string[];
}

export interface PptxRenderOptions {
  slideNumber?: number | undefined; // 1-based index
  theme?: ("original" | "clean" | "indigo" | "dark") | undefined;
  format?: ("PNG" | "JPG") | undefined;
  scale?: number | undefined;
}

export interface PptxRenderResult {
  dataUrl: string;
  width: number;
  height: number;
  totalSlides: number;
  currentSlide: number;
  slideTitle: string;
}

// ── 1. Custom In-Memory ZIP Archive Reader ──────────────────────────────────
export class PptxZipReader {
  private buffer: ArrayBuffer;
  private entries: Map<string, { compSize: number; uncompSize: number; method: number; localOffset: number }> = new Map();
  private isLoaded = false;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  public async init(): Promise<boolean> {
    try {
      const data = new Uint8Array(this.buffer);
      if (data.length < 22) return false;
      const view = new DataView(this.buffer);
      const dec = new TextDecoder();

      // Find End of Central Directory signature (0x06054b50)
      let eocdOffset = -1;
      const maxSearch = Math.min(data.length, 65535 + 22);
      for (let i = data.length - 22; i >= data.length - maxSearch; i--) {
        if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x05 && data[i + 3] === 0x06) {
          eocdOffset = i;
          break;
        }
      }
      if (eocdOffset === -1 || eocdOffset + 22 > data.length) return false;

      const cdOffset = view.getUint32(eocdOffset + 16, true);
      const cdSize = view.getUint32(eocdOffset + 12, true);
      if (cdOffset >= data.length || cdOffset + cdSize > data.length) return false;

      let pos = cdOffset;
      while (pos + 46 <= cdOffset + cdSize && pos + 46 <= data.length) {
        if (view.getUint32(pos, true) !== 0x02014b50) break;
        const method = view.getUint16(pos + 10, true);
        const compSize = view.getUint32(pos + 20, true);
        const uncompSize = view.getUint32(pos + 24, true);
        const nameLen = view.getUint16(pos + 28, true);
        const extraLen = view.getUint16(pos + 30, true);
        const commentLen = view.getUint16(pos + 32, true);
        const localOffset = view.getUint32(pos + 42, true);

        if (pos + 46 + nameLen > data.length) break;
        let rawName = dec.decode(data.slice(pos + 46, pos + 46 + nameLen));
        // Normalize slashes
        rawName = rawName.replace(/\\/g, "/").replace(/^\/+/, "");

        this.entries.set(rawName.toLowerCase(), {
          compSize,
          uncompSize,
          method,
          localOffset,
        });

        const entryLen = 46 + nameLen + extraLen + commentLen;
        if (entryLen <= 0) break;
        pos += entryLen;
      }

      this.isLoaded = true;
      return true;
    } catch (e) {
      console.warn("Failed to parse zip central directory:", e);
      return false;
    }
  }

  public getEntryNames(): string[] {
    return Array.from(this.entries.keys());
  }

  public async readBytes(targetPath: string): Promise<Uint8Array | null> {
    if (!this.isLoaded) await this.init();
    const cleanTarget = targetPath.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
    
    // Find entry either exact or ending with target
    let entry = this.entries.get(cleanTarget);
    if (!entry) {
      for (const [key, val] of this.entries.entries()) {
        if (key === cleanTarget || key.endsWith("/" + cleanTarget) || cleanTarget.endsWith("/" + key)) {
          entry = val;
          break;
        }
      }
    }
    if (!entry) return null;

    try {
      const data = new Uint8Array(this.buffer);
      const view = new DataView(this.buffer);
      const localOffset = entry.localOffset;
      if (localOffset + 30 > data.length) return null;

      // Verify Local Header Signature (0x04034b50)
      if (view.getUint32(localOffset, true) !== 0x04034b50) return null;

      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      if (dataStart + entry.compSize > data.length) return null;

      const rawBytes = data.slice(dataStart, dataStart + entry.compSize);

      if (entry.method === 0) {
        return rawBytes;
      } else if (entry.method === 8) {
        // Decompress Deflate
        if (typeof DecompressionStream !== "undefined") {
          try {
            const ds = new DecompressionStream("deflate-raw");
            const stream = new Response(new Blob([rawBytes]).stream().pipeThrough(ds));
            const buf = await stream.arrayBuffer();
            return new Uint8Array(buf);
          } catch {
            try {
              const ds2 = new DecompressionStream("deflate");
              const stream2 = new Response(new Blob([rawBytes]).stream().pipeThrough(ds2));
              const buf2 = await stream2.arrayBuffer();
              return new Uint8Array(buf2);
            } catch {
              return null;
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  public async readText(targetPath: string): Promise<string | null> {
    const bytes = await this.readBytes(targetPath);
    if (!bytes) return null;
    return new TextDecoder().decode(bytes);
  }

  public async readDataUrl(targetPath: string, mime?: string): Promise<string | null> {
    const bytes = await this.readBytes(targetPath);
    if (!bytes) return null;
    const determinedMime = mime || getMimeFromPath(targetPath);
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      const b = bytes[i];
      if (b !== undefined) {
        binary += String.fromCharCode(b);
      }
    }
    const b64 = btoa(binary);
    return `data:${determinedMime};base64,${b64}`;
  }
}

const getMimeFromPath = (path: string): string => {
  const p = path.toLowerCase();
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
  if (p.endsWith(".svg")) return "image/svg+xml";
  if (p.endsWith(".gif")) return "image/gif";
  if (p.endsWith(".webp")) return "image/webp";
  if (p.endsWith(".xml")) return "text/xml";
  return "application/octet-stream";
};

// ── 2. PPTX Metadata and Relationship Resolver ──────────────────────────────
export const getPptxMetadata = async (buffer: ArrayBuffer): Promise<PptxMetadata> => {
  const zip = new PptxZipReader(buffer);
  await zip.init();

  let slideWidthEMU = 12192000; // 16:9 widescreen default (13.33 inches)
  let slideHeightEMU = 6858000; // 7.5 inches
  const slidePaths: string[] = [];
  const slideTitles: string[] = [];
  const themeColors: Record<string, string> = {
    dk1: "#000000",
    lt1: "#ffffff",
    dk2: "#1f2937",
    lt2: "#f3f4f6",
    accent1: "#3b82f6",
    accent2: "#ef4444",
    accent3: "#10b981",
    accent4: "#f59e0b",
    accent5: "#8b5cf6",
    accent6: "#06b6d4",
    hlink: "#2563eb",
    folHlink: "#7c3aed",
  };

  // 1. Read Presentation XML for dimensions and slide listing
  try {
    const presXml = await zip.readText("ppt/presentation.xml");
    if (presXml) {
      const dom = new DOMParser().parseFromString(presXml, "text/xml");
      const sldSz = dom.getElementsByTagName("p:sldSz")[0] || dom.getElementsByTagName("sldSz")[0];
      if (sldSz) {
        const cx = parseInt(sldSz.getAttribute("cx") || "0", 10);
        const cy = parseInt(sldSz.getAttribute("cy") || "0", 10);
        if (cx > 0 && cy > 0) {
          slideWidthEMU = cx;
          slideHeightEMU = cy;
        }
      }

      // Read slides from presentation rels
      const presRelsXml = await zip.readText("ppt/_rels/presentation.xml.rels");
      if (presRelsXml) {
        const relsDom = new DOMParser().parseFromString(presRelsXml, "text/xml");
        const relNodes = Array.from(relsDom.getElementsByTagName("Relationship"));
        const relMap: Record<string, string> = {};
        relNodes.forEach((rel) => {
          const id = rel.getAttribute("Id");
          const target = rel.getAttribute("Target");
          if (id && target) {
            const cleanTarget = target.startsWith("/") ? target.slice(1) : target.startsWith("ppt/") ? target : `ppt/${target}`;
            relMap[id] = cleanTarget;
          }
        });

        const sldIdNodes = Array.from(dom.getElementsByTagName("p:sldId") || dom.getElementsByTagName("sldId"));
        sldIdNodes.forEach((node) => {
          const rId = node.getAttribute("r:id") || node.getAttribute("id");
          if (rId && relMap[rId]) {
            slidePaths.push(relMap[rId] as string);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Presentation XML parse error:", e);
  }

  // Fallback slide scan if rels mapping was empty
  if (slidePaths.length === 0) {
    const allNames = zip.getEntryNames();
    const slideEntries = allNames
      .filter((n) => n.match(/^ppt\/slides\/slide\d+\.xml$/i) || n.match(/^slides\/slide\d+\.xml$/i))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return numA - numB;
      });
    slidePaths.push(...slideEntries);
  }

  // Ensure at least slide1.xml is present as fallback
  if (slidePaths.length === 0) {
    slidePaths.push("ppt/slides/slide1.xml");
  }

  // 2. Read Theme colors from ppt/theme/theme1.xml
  try {
    const themeXml = await zip.readText("ppt/theme/theme1.xml");
    if (themeXml) {
      const themeDom = new DOMParser().parseFromString(themeXml, "text/xml");
      const clrScheme = themeDom.getElementsByTagName("a:clrScheme")[0] || themeDom.getElementsByTagName("clrScheme")[0];
      if (clrScheme) {
        const childNodes = Array.from(clrScheme.children);
        childNodes.forEach((child) => {
          const tagName = child.tagName.replace(/^a:/, "");
          const srgb = child.getElementsByTagName("a:srgbClr")[0] || child.getElementsByTagName("srgbClr")[0];
          const sys = child.getElementsByTagName("a:sysClr")[0] || child.getElementsByTagName("sysClr")[0];
          if (srgb) {
            const val = srgb.getAttribute("val");
            if (val) themeColors[tagName] = `#${val}`;
          } else if (sys) {
            const lastClr = sys.getAttribute("lastClr");
            if (lastClr) themeColors[tagName] = `#${lastClr}`;
          }
        });
      }
    }
  } catch (e) {
    console.warn("Theme parse warning:", e);
  }

  // 3. Extract Titles for each slide
  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    if (slidePath) {
      try {
        const sXml = await zip.readText(slidePath);
        if (sXml) {
          const sDom = new DOMParser().parseFromString(sXml, "text/xml");
          const allTexts = Array.from(sDom.getElementsByTagName("a:t") || sDom.getElementsByTagName("t"))
            .map((n) => (n.textContent || "").trim())
            .filter((t) => t.length > 0);
          slideTitles.push(allTexts[0] || `Slide ${i + 1}`);
        } else {
          slideTitles.push(`Slide ${i + 1}`);
        }
      } catch {
        slideTitles.push(`Slide ${i + 1}`);
      }
    } else {
      slideTitles.push(`Slide ${i + 1}`);
    }
  }

  const canvasWidth = 1920;
  const aspect = slideHeightEMU / slideWidthEMU;
  const canvasHeight = Math.round(canvasWidth * aspect) || 1080;
  const isWidescreen = Math.abs(slideWidthEMU / slideHeightEMU - 16 / 9) < 0.2;
  const aspectRatioLabel = isWidescreen ? "16:9 Widescreen" : "4:3 Standard";

  return {
    totalSlides: slidePaths.length,
    slidePaths,
    slideWidthEMU,
    slideHeightEMU,
    canvasWidth,
    canvasHeight,
    aspectRatioLabel,
    themeColors,
    slideTitles,
  };
};

// ── 3. Slide Visual Element Interfaces ──────────────────────────────────────
interface TextRun {
  text: string;
  sizePt: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  typeface: string;
}

interface TextParagraph {
  align: "left" | "center" | "right" | "justify";
  isBullet: boolean;
  level: number;
  runs: TextRun[];
}

interface ShapeItem {
  type: "shape" | "picture" | "table";
  x: number;
  y: number;
  w: number;
  h: number;
  fillColor?: string | undefined;
  strokeColor?: string | undefined;
  strokeWidth?: number | undefined;
  paragraphs?: TextParagraph[] | undefined;
  vAlign?: ("top" | "middle" | "bottom") | undefined;
  imageDataUrl?: string | undefined;
  tableData?: { rows: { cells: { text: string; fill?: string | undefined; border?: string | undefined }[] }[] } | undefined;
}

// ── 4. Main Slide Canvas Renderer ───────────────────────────────────────────
export const renderPptSlideToImage = async (
  buffer: ArrayBuffer,
  fileName: string,
  themeOverride: "original" | "clean" | "indigo" | "dark" = "original",
  format: "PNG" | "JPG" = "PNG",
  slideNum: number = 1
): Promise<PptxRenderResult> => {
  const zip = new PptxZipReader(buffer);
  await zip.init();

  const metadata = await getPptxMetadata(buffer);
  const totalSlides = Math.max(1, metadata.totalSlides);
  const currentSlide = Math.max(1, Math.min(slideNum, totalSlides));
  const slidePath = metadata.slidePaths[currentSlide - 1] || "ppt/slides/slide1.xml";
  const slideTitle = metadata.slideTitles[currentSlide - 1] || `Slide ${currentSlide}`;

  const canvasW = metadata.canvasWidth || 1920;
  const canvasH = metadata.canvasHeight || 1080;
  const slideW_EMU = metadata.slideWidthEMU || 12192000;
  const slideH_EMU = metadata.slideHeightEMU || 6858000;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D Canvas context.");

  // 1. Resolve Theme Color Helper
  const resolveColor = (node: Element | null | undefined, defaultColor: string): string => {
    if (!node) return defaultColor;
    const srgb = node.getElementsByTagName("a:srgbClr")[0] || node.getElementsByTagName("srgbClr")[0];
    if (srgb) {
      const val = srgb.getAttribute("val");
      if (val) return `#${val}`;
    }
    const scheme = node.getElementsByTagName("a:schemeClr")[0] || node.getElementsByTagName("schemeClr")[0];
    if (scheme) {
      const val = scheme.getAttribute("val");
      if (val && metadata.themeColors[val]) return metadata.themeColors[val] as string;
    }
    return defaultColor;
  };

  // 2. Read Slide Rel Map for Images (ppt/slides/_rels/slide{N}.xml.rels)
  const relMap: Record<string, string> = {};
  try {
    const slideRelPath = slidePath.replace(/slides\/(slide\d+\.xml)$/i, "slides/_rels/$1.rels");
    const relsXml = await zip.readText(slideRelPath);
    if (relsXml) {
      const relDom = new DOMParser().parseFromString(relsXml, "text/xml");
      const relNodes = Array.from(relDom.getElementsByTagName("Relationship"));
      relNodes.forEach((r) => {
        const id = r.getAttribute("Id");
        let target = r.getAttribute("Target");
        if (id && target) {
          if (target.startsWith("../")) target = "ppt/" + target.replace(/^\.\.\//, "");
          else if (!target.startsWith("ppt/")) target = "ppt/slides/" + target;
          relMap[id] = target;
        }
      });
    }
  } catch (e) {
    console.warn("Slide rels parse warning:", e);
  }

  // 3. Preload all images referenced in slide
  const preloadedImages: Record<string, HTMLImageElement> = {};
  for (const [rId, target] of Object.entries(relMap)) {
    if (target.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
      try {
        const dataUrl = await zip.readDataUrl(target);
        if (dataUrl) {
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = dataUrl;
          });
          preloadedImages[rId] = img;
        }
      } catch (e) {
        console.warn("Failed to load slide media:", target, e);
      }
    }
  }

  // 4. Parse Slide Background
  let slideBgColor = metadata.themeColors["lt1"] || "#ffffff";
  let isDarkSlide = false;

  const slideXml = await zip.readText(slidePath);
  const slideDom = slideXml ? new DOMParser().parseFromString(slideXml, "text/xml") : null;

  if (slideDom) {
    const bgNode = slideDom.getElementsByTagName("p:bg")[0] || slideDom.getElementsByTagName("bg")[0];
    if (bgNode) {
      const solid = bgNode.getElementsByTagName("a:solidFill")[0] || bgNode.getElementsByTagName("solidFill")[0];
      if (solid) {
        slideBgColor = resolveColor(solid, slideBgColor);
      }
    }
  }

  // Check if background is dark
  if (slideBgColor.startsWith("#") && slideBgColor.length === 7) {
    const r = parseInt(slideBgColor.slice(1, 3), 16);
    const g = parseInt(slideBgColor.slice(3, 5), 16);
    const b = parseInt(slideBgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    isDarkSlide = brightness < 128;
  }

  // 5. Draw Base Slide Background
  if (themeOverride === "indigo") {
    const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(1, "#312e81");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
    isDarkSlide = true;
  } else if (themeOverride === "dark") {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvasW, canvasH);
    isDarkSlide = true;
  } else if (themeOverride === "clean") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);
    isDarkSlide = false;
  } else {
    // Original presentation theme background
    ctx.fillStyle = slideBgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // 6. Parse Elements in Shape Tree
  const items: ShapeItem[] = [];

  if (slideDom) {
    const spTree = slideDom.getElementsByTagName("p:spTree")[0] || slideDom.getElementsByTagName("spTree")[0];
    if (spTree) {
      const childElements = Array.from(spTree.children);

      for (const el of childElements) {
        const tagName = el.tagName.replace(/^p:/, "");

        // A. Transform Position Coordinates (a:xfrm)
        const xfrm = el.getElementsByTagName("a:xfrm")[0] || el.getElementsByTagName("xfrm")[0];
        let x = 80;
        let y = 80;
        let w = canvasW - 160;
        let h = 200;

        if (xfrm) {
          const off = xfrm.getElementsByTagName("a:off")[0] || xfrm.getElementsByTagName("off")[0];
          const ext = xfrm.getElementsByTagName("a:ext")[0] || xfrm.getElementsByTagName("ext")[0];
          if (off && ext) {
            const offX = parseInt(off.getAttribute("x") || "0", 10);
            const offY = parseInt(off.getAttribute("y") || "0", 10);
            const extCX = parseInt(ext.getAttribute("cx") || "0", 10);
            const extCY = parseInt(ext.getAttribute("cy") || "0", 10);

            x = Math.round((offX / slideW_EMU) * canvasW);
            y = Math.round((offY / slideH_EMU) * canvasH);
            w = Math.round((extCX / slideW_EMU) * canvasW);
            h = Math.round((extCY / slideH_EMU) * canvasH);
          }
        }

        // B. Shapes & Text Boxes (p:sp)
        if (tagName === "sp") {
          const spPr = el.getElementsByTagName("p:spPr")[0] || el.getElementsByTagName("spPr")[0];
          let fillColor: string | undefined = undefined;
          let strokeColor: string | undefined = undefined;
          let strokeWidth: number | undefined = undefined;

          if (spPr) {
            const solid = spPr.getElementsByTagName("a:solidFill")[0] || spPr.getElementsByTagName("solidFill")[0];
            if (solid) {
              fillColor = resolveColor(solid, "#f1f5f9");
            }
            const ln = spPr.getElementsByTagName("a:ln")[0] || spPr.getElementsByTagName("ln")[0];
            if (ln) {
              const lnSolid = ln.getElementsByTagName("a:solidFill")[0] || ln.getElementsByTagName("solidFill")[0];
              if (lnSolid) strokeColor = resolveColor(lnSolid, "#cbd5e1");
              const lnW = parseInt(ln.getAttribute("w") || "12700", 10);
              strokeWidth = Math.max(1, Math.round((lnW / 12700) * (canvasH / 1080)));
            }
          }

          // Parse Text Body
          const txBody = el.getElementsByTagName("p:txBody")[0] || el.getElementsByTagName("txBody")[0];
          const paragraphs: TextParagraph[] = [];

          if (txBody) {
            const pNodes = Array.from(txBody.getElementsByTagName("a:p") || txBody.getElementsByTagName("p"));
            pNodes.forEach((pNode) => {
              const pPr = pNode.getElementsByTagName("a:pPr")[0] || pNode.getElementsByTagName("pPr")[0];
              const algn = pPr?.getAttribute("algn") || "l";
              const align = algn === "ctr" ? "center" : algn === "r" ? "right" : algn === "just" ? "justify" : "left";
              const isBullet = !!pPr?.getElementsByTagName("a:buChar")[0] || !!pPr?.getElementsByTagName("buChar")[0] || (pPr?.getAttribute("lvl") ? true : false);
              const level = parseInt(pPr?.getAttribute("lvl") || "0", 10);

              const runs: TextRun[] = [];
              const rNodes = Array.from(pNode.children).filter((c) => c.tagName.endsWith(":r") || c.tagName === "r" || c.tagName.endsWith(":fld"));

              rNodes.forEach((rNode) => {
                const tNode = rNode.getElementsByTagName("a:t")[0] || rNode.getElementsByTagName("t")[0];
                const text = tNode?.textContent || "";
                if (!text) return;

                const rPr = rNode.getElementsByTagName("a:rPr")[0] || rNode.getElementsByTagName("rPr")[0];
                const sz = parseInt(rPr?.getAttribute("sz") || "1800", 10);
                const sizePt = Math.max(12, Math.round((sz / 100) * (canvasH / 1080) * 1.05));
                const bold = rPr?.getAttribute("b") === "1";
                const italic = rPr?.getAttribute("i") === "1";
                const underline = !!rPr?.getAttribute("u");
                const typeface = rPr?.getElementsByTagName("a:latin")[0]?.getAttribute("typeface") || "Segoe UI, Inter, Arial, sans-serif";
                
                const defaultRunColor = isDarkSlide ? "#f8fafc" : "#0f172a";
                const solid = rPr?.getElementsByTagName("a:solidFill")[0] || rPr?.getElementsByTagName("solidFill")[0];
                const color = resolveColor(solid, defaultRunColor);

                runs.push({ text, sizePt, bold, italic, underline, color, typeface });
              });

              if (runs.length > 0) {
                paragraphs.push({ align, isBullet, level, runs });
              }
            });
          }

          items.push({
            type: "shape",
            x,
            y,
            w: Math.max(20, w),
            h: Math.max(20, h),
            fillColor,
            strokeColor,
            strokeWidth,
            paragraphs,
          });
        }

        // C. Picture / Embedded Media (p:pic)
        else if (tagName === "pic") {
          const blip = el.getElementsByTagName("a:blip")[0] || el.getElementsByTagName("blip")[0];
          const embedId = blip?.getAttribute("r:embed");
          const img = embedId ? preloadedImages[embedId] : undefined;

          items.push({
            type: "picture",
            x,
            y,
            w: Math.max(40, w),
            h: Math.max(40, h),
            imageDataUrl: img?.src,
          });
        }

        // D. Graphic Frame / Table (p:graphicFrame -> a:tbl)
        else if (tagName === "graphicFrame") {
          const tbl = el.getElementsByTagName("a:tbl")[0] || el.getElementsByTagName("tbl")[0];
          if (tbl) {
            const trNodes = Array.from(tbl.getElementsByTagName("a:tr") || tbl.getElementsByTagName("tr"));
            const tableRows: { cells: { text: string; fill?: string | undefined; border?: string | undefined }[] }[] = [];

            trNodes.forEach((tr) => {
              const tcNodes = Array.from(tr.getElementsByTagName("a:tc") || tr.getElementsByTagName("tc"));
              const cells = tcNodes.map((tc) => {
                const textNodes = Array.from(tc.getElementsByTagName("a:t") || tc.getElementsByTagName("t"));
                const text = textNodes.map((t) => t.textContent || "").join(" ").trim();
                const solid = tc.getElementsByTagName("a:solidFill")[0] || tc.getElementsByTagName("solidFill")[0];
                const fill = solid ? resolveColor(solid, "#ffffff") : undefined;
                return { text, fill };
              });
              tableRows.push({ cells });
            });

            items.push({
              type: "table",
              x,
              y,
              w: Math.max(100, w),
              h: Math.max(60, h),
              tableData: { rows: tableRows },
            });
          }
        }
      }
    }
  }

  // 7. Render Parsed Visual Items to Canvas
  let hasRenderedContent = false;

  for (const item of items) {
    // 7A. Draw Shapes & Background
    if (item.fillColor) {
      ctx.fillStyle = item.fillColor;
      ctx.fillRect(item.x, item.y, item.w, item.h);
      hasRenderedContent = true;
    }
    if (item.strokeColor && item.strokeWidth) {
      ctx.strokeStyle = item.strokeColor;
      ctx.lineWidth = item.strokeWidth;
      ctx.strokeRect(item.x, item.y, item.w, item.h);
      hasRenderedContent = true;
    }

    // 7B. Draw Picture
    if (item.type === "picture" && item.imageDataUrl) {
      const img = new Image();
      img.src = item.imageDataUrl;
      try {
        ctx.drawImage(img, item.x, item.y, item.w, item.h);
        hasRenderedContent = true;
      } catch (e) {
        console.warn("Error drawing slide image:", e);
      }
    }

    // 7C. Draw Table
    if (item.type === "table" && item.tableData && item.tableData.rows.length > 0) {
      const rows = item.tableData.rows;
      const numRows = rows.length;
      const numCols = Math.max(1, ...rows.map((r) => r.cells.length));
      const colW = item.w / numCols;
      const rowH = item.h / numRows;

      rows.forEach((r, ri) => {
        r.cells.forEach((cell, ci) => {
          const cx = item.x + ci * colW;
          const cy = item.y + ri * rowH;

          ctx.fillStyle = cell.fill || (ri === 0 ? (isDarkSlide ? "#1e293b" : "#e2e8f0") : ri % 2 === 0 ? (isDarkSlide ? "#0f172a" : "#f8fafc") : (isDarkSlide ? "#020617" : "#ffffff"));
          ctx.fillRect(cx, cy, colW, rowH);

          ctx.strokeStyle = isDarkSlide ? "#334155" : "#cbd5e1";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, colW, rowH);

          if (cell.text) {
            ctx.fillStyle = isDarkSlide ? "#f8fafc" : "#0f172a";
            ctx.font = ri === 0 ? "bold 18px 'Segoe UI', sans-serif" : "16px 'Segoe UI', sans-serif";
            ctx.fillText(cell.text, cx + 12, cy + rowH / 2 + 6, colW - 24);
          }
        });
      });
      hasRenderedContent = true;
    }

    // 7D. Draw Text Paragraphs with Word Wrap
    if (item.paragraphs && item.paragraphs.length > 0) {
      let curY = item.y + 24;
      const padX = 14;

      item.paragraphs.forEach((para) => {
        let fullParaText = "";
        let maxFontSize = 18;
        let pColor = isDarkSlide ? "#f8fafc" : "#0f172a";
        let isBold = false;
        let isItalic = false;
        let typeface = "Segoe UI, Inter, Arial, sans-serif";

        para.runs.forEach((r) => {
          fullParaText += r.text;
          if (r.sizePt > maxFontSize) maxFontSize = r.sizePt;
          if (r.color) pColor = r.color;
          if (r.bold) isBold = true;
          if (r.italic) isItalic = true;
          if (r.typeface) typeface = r.typeface;
        });

        if (!fullParaText.trim()) {
          curY += Math.round(maxFontSize * 0.8);
          return;
        }

        const fontStyle = `${isItalic ? "italic " : ""}${isBold ? "bold " : ""}${maxFontSize}px '${typeface}', 'Segoe UI', sans-serif`;
        ctx.font = fontStyle;
        ctx.fillStyle = themeOverride === "clean" ? "#0f172a" : themeOverride === "dark" || themeOverride === "indigo" ? "#ffffff" : pColor;

        const bulletPrefix = para.isBullet ? "•  " : "";
        const availWidth = Math.max(100, item.w - padX * 2 - (para.isBullet ? 24 : 0));
        const words = (bulletPrefix + fullParaText).split(" ");
        let line = "";
        const lineH = Math.round(maxFontSize * 1.35);

        for (let n = 0; n < words.length; n++) {
          const testLine = line + (words[n] ?? "") + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > availWidth && n > 0) {
            let drawX = item.x + padX + (para.isBullet ? 20 : 0);
            if (para.align === "center") {
              drawX = item.x + (item.w - ctx.measureText(line).width) / 2;
            } else if (para.align === "right") {
              drawX = item.x + item.w - padX - ctx.measureText(line).width;
            }
            ctx.fillText(line.trim(), drawX, curY);
            line = (words[n] ?? "") + " ";
            curY += lineH;
          } else {
            line = testLine;
          }
        }

        if (line.trim().length > 0) {
          let drawX = item.x + padX + (para.isBullet ? 20 : 0);
          if (para.align === "center") {
            drawX = item.x + (item.w - ctx.measureText(line).width) / 2;
          } else if (para.align === "right") {
            drawX = item.x + item.w - padX - ctx.measureText(line).width;
          }
          ctx.fillText(line.trim(), drawX, curY);
          curY += lineH + 6;
        }
      });

      hasRenderedContent = true;
    }
  }

  // 8. Elegant Fallback Presentation Template (if no shapes were found or text was extracted flat)
  if (!hasRenderedContent) {
    let slideTexts: string[] = [];
    if (slideDom) {
      const textNodes = Array.from(slideDom.getElementsByTagName("a:t") || slideDom.getElementsByTagName("t"));
      slideTexts = textNodes
        .map((n) => (n.textContent || "").trim())
        .filter((s) => s.length > 0);
    }

    if (slideTexts.length === 0) {
      slideTexts = [
        fileName.replace(/\.[^.]+$/, "") || "PowerPoint Presentation",
        `Slide ${currentSlide} of ${totalSlides}`,
        "High-Resolution Presentation Slide Converted with BG Tool",
      ];
    }

    // Badge
    ctx.fillStyle = isDarkSlide ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.1)";
    ctx.fillRect(100, 100, 240, 48);
    ctx.fillStyle = isDarkSlide ? "#818cf8" : "#4f46e5";
    ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`SLIDE ${currentSlide} OF ${totalSlides} · PPTX`, 126, 131);

    // Title
    ctx.fillStyle = isDarkSlide ? "#ffffff" : "#0f172a";
    ctx.font = "bold 56px 'Segoe UI', Arial, sans-serif";
    const title = slideTexts[0] || `Presentation Slide ${currentSlide}`;
    ctx.fillText(title, 100, 240, canvasW - 200);

    // Body Lines
    ctx.fillStyle = isDarkSlide ? "#cbd5e1" : "#475569";
    ctx.font = "28px 'Segoe UI', Arial, sans-serif";
    let curY = 340;
    slideTexts.slice(1, 9).forEach((st) => {
      ctx.fillText(`•  ${st}`, 110, curY, canvasW - 220);
      curY += 56;
    });

    // Footer
    ctx.fillStyle = isDarkSlide ? "#64748b" : "#94a3b8";
    ctx.font = "18px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${fileName}  |  Slide ${currentSlide} of ${totalSlides}`, 100, canvasH - 80);
  }

  const mime = format === "JPG" ? "image/jpeg" : "image/png";
  const dataUrl = canvas.toDataURL(mime, 0.95);

  return {
    dataUrl,
    width: canvasW,
    height: canvasH,
    totalSlides,
    currentSlide,
    slideTitle,
  };
};

// ── 5. Render All Slides to ZIP ─────────────────────────────────────────────
export const renderAllPptSlidesToZip = async (
  buffer: ArrayBuffer,
  fileName: string,
  totalSlides: number,
  themeOverride: "original" | "clean" | "indigo" | "dark" = "original",
  format: "PNG" | "JPG" = "PNG",
  onProgress?: ((current: number, total: number) => void) | undefined
): Promise<{ zipBlob: Blob; firstPageDataUrl: string; width: number; height: number }> => {
  const ext = format === "JPG" ? "jpg" : "png";
  const baseName = fileName.replace(/\.[^.]+$/, "") || "presentation";
  const zipEntries: { name: string; data: Uint8Array }[] = [];
  let firstPageDataUrl = "";
  let width = 1920;
  let height = 1080;

  for (let s = 1; s <= totalSlides; s++) {
    onProgress?.(s, totalSlides);
    const res = await renderPptSlideToImage(buffer, fileName, themeOverride, format, s);
    if (s === 1) {
      firstPageDataUrl = res.dataUrl;
      width = res.width;
      height = res.height;
    }

    const base64 = res.dataUrl.split(",")[1] || "";
    const binaryStr = atob(base64);
    const uint8 = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      uint8[i] = binaryStr.charCodeAt(i);
    }

    const slideNumStr = String(s).padStart(totalSlides >= 10 ? 2 : 1, "0");
    zipEntries.push({
      name: `${baseName}_slide_${slideNumStr}.${ext}`,
      data: uint8,
    });
  }

  // Use zip builder logic
  const zipUint8 = buildCustomZip(zipEntries);
  const zipBlob = new Blob([zipUint8 as BlobPart], { type: "application/zip" });

  return {
    zipBlob,
    firstPageDataUrl,
    width,
    height,
  };
};

// Helper zip builder for bundling all slide images
const buildCustomZip = (files: { name: string; data: Uint8Array }[]): Uint8Array => {
  const enc = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const cdEntries: Uint8Array[] = [];
  let offset = 0;

  // CRC-32 Lookup Table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  const calcCRC = (buf: Uint8Array): number => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      const byteVal = buf[i] ?? 0;
      const tableVal = crcTable[(crc ^ byteVal) & 0xff] ?? 0;
      crc = tableVal ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  files.forEach((file) => {
    const nameBytes = enc.encode(file.name);
    const crc = calcCRC(file.data);
    const size = file.data.length;

    // Local Header (30 bytes + name length)
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // No compression (STORE)
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    localHeaders.push(local, file.data);

    // Central Directory Entry (46 bytes + name length)
    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);

    cdEntries.push(cd);
    offset += local.length + file.data.length;
  });

  const cdOffset = offset;
  let cdSize = 0;
  cdEntries.forEach((c) => (cdSize += c.length));

  // End of Central Directory (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);

  const totalLen = offset + cdSize + 22;
  const out = new Uint8Array(totalLen);
  let cur = 0;
  localHeaders.forEach((part) => {
    out.set(part, cur);
    cur += part.length;
  });
  cdEntries.forEach((part) => {
    out.set(part, cur);
    cur += part.length;
  });
  out.set(eocd, cur);

  return out;
};
