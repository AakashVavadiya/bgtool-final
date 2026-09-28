import { tool } from "ai";
import { z } from "zod";
import { runImageTool, type ImageOperationResult } from "./image-tools";
import {
  runMergePdf,
  runSplitPdf,
  runRotatePdf,
  runCompressPdf,
  runAddPdfWatermark,
  runAddPageNumbers,
  runRemovePdfPages,
  runProtectPdf,
  runCreateInvoice,
  type PdfOperationResult,
} from "./pdf-tools";
import { searchInExtractedDoc, type ExtractedDocumentContext } from "./document-context";
import { performWebSearch, type WebResearchResponse } from "./web-research";

export interface ToolRegistryItem {
  name: string;
  toolId: string;
  description: string;
  purpose: string;
  category: "image" | "pdf" | "document" | "utility";
  inputTypes: string[];
  outputTypes: string[];
  requiredParameters: string[];
  optionalParameters: string[];
  requiresFile: boolean;
  supportsMultipleFiles: boolean;
  supportedMimeTypes: string[];
  limitations: string;
  errorHandling: string;
  subModel: "ganga" | "brahmaputra" | "narmada" | "saraswati" | "karudi";
}

/**
 * SINGLE SOURCE OF TRUTH FOR ALL EXECUTABLE KARUDI TOOLS
 */
export const KARUDI_TOOL_REGISTRY = {
  remove_background: {
    name: "Remove Background",
    toolId: "remove_background",
    description: "Remove the background from an image using Ganga sub-pixel neural segmentation engine, producing a transparent PNG cutout.",
    purpose: "Create transparent background cutouts of people, products, animals, and objects.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["PNG"],
    requiredParameters: [],
    optionalParameters: ["model"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Max resolution 60MP.",
    errorHandling: "Returns friendly error if file is inaccessible or corrupt.",
    subModel: "ganga",
  },

  resize_image: {
    name: "Resize Image",
    toolId: "resize_image",
    description: "Resize an image to specific pixel dimensions (width/height) or scale percentage, maintaining aspect ratio if desired.",
    purpose: "Scale images for web, social media, thumbnails, or passport requirements.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["JPG", "PNG", "WEBP"],
    requiredParameters: [],
    optionalParameters: ["width", "height", "scale", "maintainAspectRatio"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Max dimensions 10000x10000.",
    errorHandling: "Validates dimensions are positive integers.",
    subModel: "brahmaputra",
  },

  compress_image: {
    name: "Compress Image",
    toolId: "compress_image",
    description: "Compress image file size while maintaining visual quality, with target KB or quality percentage.",
    purpose: "Reduce image file size for fast loading or portal limits (e.g. under 200KB).",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["JPG", "WEBP"],
    requiredParameters: [],
    optionalParameters: ["quality", "targetKb", "format"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Quality range 15 to 95.",
    errorHandling: "Falls back to optimal compression if target KB is unreachable.",
    subModel: "brahmaputra",
  },

  convert_image_format: {
    name: "Convert Image Format",
    toolId: "convert_image_format",
    description: "Convert an image to JPG, PNG, or WebP format with optional quality adjustment.",
    purpose: "Transcode between image formats.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["JPG", "PNG", "WEBP"],
    requiredParameters: ["targetFormat"],
    optionalParameters: ["quality"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Target must be one of JPG, PNG, or WebP.",
    errorHandling: "Reports unsupported target format gracefully.",
    subModel: "brahmaputra",
  },

  rotate_image: {
    name: "Rotate Image",
    toolId: "rotate_image",
    description: "Rotate an image by 90, 180, or 270 degrees clockwise.",
    purpose: "Orient sideways or upside down images correctly.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["PNG"],
    requiredParameters: ["degrees"],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Supported angles: 90, 180, 270 degrees.",
    errorHandling: "Normalizes angle to closest 90-degree step.",
    subModel: "brahmaputra",
  },

  square_image: {
    name: "Square Image (1:1)",
    toolId: "square_image",
    description: "Format an image into a 1:1 square aspect ratio without cropping, using blurred, white, or black background padding.",
    purpose: "Prepare images for Instagram, profile pictures, or square displays.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["PNG"],
    requiredParameters: [],
    optionalParameters: ["background"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Outputs square aspect ratio.",
    errorHandling: "Defaults to blurred background padding if unspecified.",
    subModel: "brahmaputra",
  },

  crop_image: {
    name: "Crop Image",
    toolId: "crop_image",
    description: "Crop an image to standard aspect ratios (1:1, 16:9, 4:3).",
    purpose: "Trim unwanted borders or focus on a central region.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["PNG"],
    requiredParameters: [],
    optionalParameters: ["ratio"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Auto-centers crop box.",
    errorHandling: "Falls back to 1:1 if ratio is unparseable.",
    subModel: "brahmaputra",
  },

  analyze_image: {
    name: "Analyze Image Palette & Metadata",
    toolId: "analyze_image",
    description: "Inspect an image for dominant color palette (HEX), dimensions, aspect ratio, and metadata.",
    purpose: "Color analysis, design inspection, and dimension verification.",
    category: "image",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["Metadata JSON"],
    requiredParameters: [],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Color quantization extracts up to 6 dominant colors.",
    errorHandling: "Safe fallback on corrupt images.",
    subModel: "saraswati",
  },

  image_to_binary: {
    name: "Image to Binary (.txt)",
    toolId: "image_to_binary",
    description: "Encode an image into an 8-bit binary bitstream (.txt) for low-level data inspection or embedding.",
    purpose: "Convert image data to raw binary string.",
    category: "utility",
    inputTypes: ["JPG", "PNG", "WEBP"],
    outputTypes: ["TXT"],
    requiredParameters: [],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    limitations: "Outputs text bitstream.",
    errorHandling: "Handles file reading errors.",
    subModel: "brahmaputra",
  },

  merge_pdf: {
    name: "Merge PDF Documents",
    toolId: "merge_pdf",
    description: "Combine two or more PDF files into a single consolidated PDF document.",
    purpose: "Join multiple PDFs together.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: [],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: true,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Requires at least 2 PDF files.",
    errorHandling: "Validates all inputs are readable PDFs.",
    subModel: "brahmaputra",
  },

  split_pdf: {
    name: "Split PDF Document",
    toolId: "split_pdf",
    description: "Extract specific page ranges (e.g. '1-3, 5') from a PDF into a new PDF document.",
    purpose: "Separate or extract pages from a PDF.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: ["pageRanges"],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Pages must exist within the document.",
    errorHandling: "Clamps page indices to valid bounds.",
    subModel: "brahmaputra",
  },

  rotate_pdf_pages: {
    name: "Rotate PDF Pages",
    toolId: "rotate_pdf_pages",
    description: "Rotate PDF pages by 90, 180, or 270 degrees.",
    purpose: "Fix orientation of sideways PDF scans.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: ["angle"],
    optionalParameters: ["pageMode"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Angle must be 90, 180, or 270.",
    errorHandling: "Defaults to 90 degrees if unspecified.",
    subModel: "brahmaputra",
  },

  compress_pdf: {
    name: "Compress PDF",
    toolId: "compress_pdf",
    description: "Compress and optimize a PDF file to reduce its size for email or web upload.",
    purpose: "Shrink PDF file size.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: [],
    optionalParameters: ["quality"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Compression depends on embedded images/fonts.",
    errorHandling: "Maintains original document if compression doesn't reduce size.",
    subModel: "brahmaputra",
  },

  add_pdf_watermark: {
    name: "Add PDF Watermark",
    toolId: "add_pdf_watermark",
    description: "Stamp a diagonal semi-transparent text watermark (e.g. 'CONFIDENTIAL', 'DRAFT') across all pages of a PDF.",
    purpose: "Protect or brand PDF documents.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: ["watermarkText"],
    optionalParameters: ["opacity"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Text watermark.",
    errorHandling: "Validates watermark string is non-empty.",
    subModel: "brahmaputra",
  },

  add_page_numbers: {
    name: "Add PDF Page Numbers",
    toolId: "add_page_numbers",
    description: "Add page numbers (e.g. 'Page 1 of 10') to the bottom or top of every page of a PDF.",
    purpose: "Pagination for printed or distributed documents.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: [],
    optionalParameters: ["position"],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Adds clean header/footer page numbers.",
    errorHandling: "Applies font fallback if needed.",
    subModel: "brahmaputra",
  },

  remove_pdf_pages: {
    name: "Remove PDF Pages",
    toolId: "remove_pdf_pages",
    description: "Delete specific page numbers from a PDF document.",
    purpose: "Remove blank or unnecessary pages.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: ["pagesToRemove"],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Cannot remove all pages (at least 1 must remain).",
    errorHandling: "Validates that remaining page count is >= 1.",
    subModel: "brahmaputra",
  },

  protect_pdf: {
    name: "Protect PDF with Password",
    toolId: "protect_pdf",
    description: "Encrypt a PDF document with a password so it cannot be opened without entering the key.",
    purpose: "Secure sensitive documents.",
    category: "pdf",
    inputTypes: ["PDF"],
    outputTypes: ["PDF"],
    requiredParameters: ["password"],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf"],
    limitations: "Standard PDF encryption.",
    errorHandling: "Requires password of at least 1 character.",
    subModel: "brahmaputra",
  },

  create_invoice: {
    name: "Create PDF Invoice",
    toolId: "create_invoice",
    description: "Generate a formatted, professional PDF invoice with company details, client name, invoice number, line items, and totals.",
    purpose: "Billing and invoicing.",
    category: "pdf",
    inputTypes: [],
    outputTypes: ["PDF"],
    requiredParameters: ["invoiceNumber", "clientName", "items"],
    optionalParameters: ["dueDate", "companyName", "currency"],
    requiresFile: false,
    supportsMultipleFiles: false,
    supportedMimeTypes: [],
    limitations: "Standard invoice layout.",
    errorHandling: "Fills missing fields with professional defaults.",
    subModel: "brahmaputra",
  },

  search_within_document: {
    name: "Search Within Uploaded Document",
    toolId: "search_within_document",
    description: "Search the uploaded PDF or text document for specific terms, clauses, numbers (e.g. GST, invoice total, names, dates) and return page excerpts.",
    purpose: "Locate specific facts inside uploaded documents.",
    category: "document",
    inputTypes: ["PDF", "TXT"],
    outputTypes: ["Excerpts"],
    requiredParameters: ["query"],
    optionalParameters: [],
    requiresFile: true,
    supportsMultipleFiles: false,
    supportedMimeTypes: ["application/pdf", "text/plain"],
    limitations: "Searches uploaded file content only.",
    errorHandling: "Returns empty list if query not found.",
    subModel: "narmada",
  },

  web_search: {
    name: "Web Search",
    toolId: "web_search",
    description: "Search the web for current or external information that is not available in Karudi's local tools or uploaded files.",
    purpose: "External factual retrieval and real-time data.",
    category: "utility",
    inputTypes: [],
    outputTypes: ["Web Citations"],
    requiredParameters: ["query"],
    optionalParameters: [],
    requiresFile: false,
    supportsMultipleFiles: false,
    supportedMimeTypes: [],
    limitations: "Authoritative external sources only. Keep secondary to Karudi's own tools.",
    errorHandling: "Gracefully handles network search timeouts.",
    subModel: "saraswati",
  },
} satisfies Record<string, ToolRegistryItem>;

export interface ToolExecutionContext {
  activeFile?: {
    name: string;
    dataUrl: string;
    mediaType?: string | undefined;
  } | undefined;
  attachedFiles?: Array<{
    name: string;
    dataUrl: string;
    mediaType?: string | undefined;
  }> | undefined;
  documentContext?: ExtractedDocumentContext | undefined;
  lastToolResult?: any;
}

/**
 * Creates AI SDK compatible tools bound to current execution context
 */
export function createAiSdkTools(context: ToolExecutionContext) {
  const getActiveImageSrc = (): string | null => {
    // Check previous tool result first (for multi-step chaining!)
    if (context.lastToolResult?.resultImageSrc) {
      return context.lastToolResult.resultImageSrc;
    }
    if (
      context.activeFile?.dataUrl &&
      (context.activeFile.mediaType?.startsWith("image/") ||
        context.activeFile.dataUrl.startsWith("data:image/"))
    ) {
      return context.activeFile.dataUrl;
    }
    const imgFile = context.attachedFiles?.find(
      (f) => f.mediaType?.startsWith("image/") || f.dataUrl.startsWith("data:image/")
    );
    return imgFile?.dataUrl || null;
  };

  const getActivePdfDataUrl = (): string | null => {
    // Check previous tool result first
    if (context.lastToolResult?.resultPdfDataUrl) {
      return context.lastToolResult.resultPdfDataUrl;
    }
    if (
      context.activeFile?.dataUrl &&
      (context.activeFile.name.toLowerCase().endsWith(".pdf") ||
        context.activeFile.dataUrl.startsWith("data:application/pdf"))
    ) {
      return context.activeFile.dataUrl;
    }
    const pdfFile = context.attachedFiles?.find(
      (f) =>
        f.name.toLowerCase().endsWith(".pdf") ||
        f.dataUrl.startsWith("data:application/pdf")
    );
    return pdfFile?.dataUrl || null;
  };

  return {
    remove_background: tool({
      description: KARUDI_TOOL_REGISTRY.remove_background.description,
      inputSchema: z.object({
        model: z.enum(["ganga", "general"]).optional().describe("Background removal model preset"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "remove_background",
            error: "No image found. Please upload or provide an image to remove the background.",
          };
        }
        const res = await runImageTool("remove_background", {
          imageSrc,
          model: args.model || "ganga",
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    resize_image: tool({
      description: KARUDI_TOOL_REGISTRY.resize_image.description,
      inputSchema: z.object({
        width: z.number().optional().describe("Target width in pixels"),
        height: z.number().optional().describe("Target height in pixels"),
        scale: z.number().optional().describe("Scaling percentage, e.g. 50 for half size"),
        maintainAspectRatio: z.boolean().optional().describe("Whether to preserve aspect ratio (default true)"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "resize_image",
            error: "No image found to resize. Please upload or specify an image.",
          };
        }
        const res = await runImageTool("resize_image", {
          imageSrc,
          ...args,
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    compress_image: tool({
      description: KARUDI_TOOL_REGISTRY.compress_image.description,
      inputSchema: z.object({
        quality: z.number().min(10).max(95).optional().describe("Quality level from 10 to 95"),
        targetKb: z.number().optional().describe("Target file size in kilobytes, e.g. 200"),
        format: z.enum(["jpeg", "png", "webp"]).optional().describe("Output format"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "compress_image",
            error: "No image found to compress. Please upload an image.",
          };
        }
        const res = await runImageTool("compress_image", {
          imageSrc,
          ...args,
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    convert_image_format: tool({
      description: KARUDI_TOOL_REGISTRY.convert_image_format.description,
      inputSchema: z.object({
        targetFormat: z.enum(["jpg", "jpeg", "png", "webp"]).describe("Target format to convert the image to"),
        quality: z.number().optional().describe("Quality level (1-100)"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "convert_image_format",
            error: "No image found to convert. Please upload an image.",
          };
        }
        const res = await runImageTool("convert_format", {
          imageSrc,
          targetFormat: args.targetFormat,
          quality: args.quality || 90,
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    rotate_image: tool({
      description: KARUDI_TOOL_REGISTRY.rotate_image.description,
      inputSchema: z.object({
        degrees: z.union([z.literal(90), z.literal(180), z.literal(270)]).describe("Degrees clockwise to rotate"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "rotate_image",
            error: "No image found to rotate.",
          };
        }
        const res = await runImageTool("rotate_image", {
          imageSrc,
          degrees: args.degrees,
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    square_image: tool({
      description: KARUDI_TOOL_REGISTRY.square_image.description,
      inputSchema: z.object({
        background: z.enum(["blur", "white", "black", "transparent"]).optional().describe("Padding canvas style"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "square_image",
            error: "No image found to square.",
          };
        }
        const res = await runImageTool("square_image", {
          imageSrc,
          background: args.background || "blur",
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    crop_image: tool({
      description: KARUDI_TOOL_REGISTRY.crop_image.description,
      inputSchema: z.object({
        ratio: z.enum(["1:1", "16:9", "4:3"]).optional().describe("Standard aspect ratio to crop to"),
      }),
      execute: async (args) => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "crop_image",
            error: "No image found to crop.",
          };
        }
        const res = await runImageTool("crop_image", {
          imageSrc,
          ratio: args.ratio || "1:1",
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    analyze_image: tool({
      description: KARUDI_TOOL_REGISTRY.analyze_image.description,
      inputSchema: z.object({}),
      execute: async () => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "analyze_image",
            error: "No image found to analyze.",
          };
        }
        return await runImageTool("analyze_image", { imageSrc });
      },
    }),

    image_to_binary: tool({
      description: KARUDI_TOOL_REGISTRY.image_to_binary.description,
      inputSchema: z.object({}),
      execute: async () => {
        const imageSrc = getActiveImageSrc();
        if (!imageSrc) {
          return {
            success: false,
            tool: "image_to_binary",
            error: "No image found to convert to binary.",
          };
        }
        return await runImageTool("image_to_binary", { imageSrc });
      },
    }),

    merge_pdf: tool({
      description: KARUDI_TOOL_REGISTRY.merge_pdf.description,
      inputSchema: z.object({}),
      execute: async () => {
        const files = (context.attachedFiles || []).filter(
          (f) =>
            f.name.toLowerCase().endsWith(".pdf") ||
            f.dataUrl.startsWith("data:application/pdf")
        );
        if (files.length < 2) {
          return {
            success: false,
            tool: "merge_pdf",
            error: "Please upload at least 2 PDF files to merge.",
          };
        }
        const res = await runMergePdf(files);
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    split_pdf: tool({
      description: KARUDI_TOOL_REGISTRY.split_pdf.description,
      inputSchema: z.object({
        pageRanges: z.string().describe("Page ranges to extract, e.g. '1-3' or '1, 4, 6'"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "split_pdf",
            error: "No PDF file found to split. Please upload a PDF.",
          };
        }
        const res = await runSplitPdf(pdfUrl, args.pageRanges, context.activeFile?.name || "document.pdf");
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    rotate_pdf_pages: tool({
      description: KARUDI_TOOL_REGISTRY.rotate_pdf_pages.description,
      inputSchema: z.object({
        angle: z.union([z.literal(90), z.literal(180), z.literal(270)]).describe("Rotation angle in degrees"),
        pageMode: z.enum(["all", "odd", "even"]).optional().describe("Which pages to rotate (default: all)"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "rotate_pdf_pages",
            error: "No PDF file found to rotate.",
          };
        }
        const res = await runRotatePdf(pdfUrl, args.angle, args.pageMode || "all");
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    compress_pdf: tool({
      description: KARUDI_TOOL_REGISTRY.compress_pdf.description,
      inputSchema: z.object({
        quality: z.enum(["low", "medium", "high"]).optional().describe("Compression quality preset"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "compress_pdf",
            error: "No PDF file found to compress.",
          };
        }
        const res = await runCompressPdf(pdfUrl, args.quality || "medium");
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    add_pdf_watermark: tool({
      description: KARUDI_TOOL_REGISTRY.add_pdf_watermark.description,
      inputSchema: z.object({
        watermarkText: z.string().describe("The text watermark to stamp on the PDF"),
        opacity: z.number().min(0.05).max(1).optional().describe("Opacity (0.1 - 1.0)"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "add_pdf_watermark",
            error: "No PDF file found to watermark.",
          };
        }
        const res = await runAddPdfWatermark(pdfUrl, args.watermarkText, args.opacity || 0.25);
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    add_page_numbers: tool({
      description: KARUDI_TOOL_REGISTRY.add_page_numbers.description,
      inputSchema: z.object({
        position: z.enum(["bottom-center", "bottom-right", "top-right"]).optional().describe("Page number position"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "add_page_numbers",
            error: "No PDF file found to add page numbers.",
          };
        }
        const res = await runAddPageNumbers(pdfUrl, args.position || "bottom-center");
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    remove_pdf_pages: tool({
      description: KARUDI_TOOL_REGISTRY.remove_pdf_pages.description,
      inputSchema: z.object({
        pagesToRemove: z.array(z.number()).describe("Array of 1-indexed page numbers to remove, e.g. [2, 4]"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "remove_pdf_pages",
            error: "No PDF file found to remove pages from.",
          };
        }
        const res = await runRemovePdfPages(pdfUrl, args.pagesToRemove);
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    protect_pdf: tool({
      description: KARUDI_TOOL_REGISTRY.protect_pdf.description,
      inputSchema: z.object({
        password: z.string().describe("Password to lock and encrypt the PDF"),
      }),
      execute: async (args) => {
        const pdfUrl = getActivePdfDataUrl();
        if (!pdfUrl) {
          return {
            success: false,
            tool: "protect_pdf",
            error: "No PDF file found to protect.",
          };
        }
        const res = await runProtectPdf(pdfUrl, args.password);
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    create_invoice: tool({
      description: KARUDI_TOOL_REGISTRY.create_invoice.description,
      inputSchema: z.object({
        invoiceNumber: z.string().describe("Invoice number/code, e.g. INV-1001"),
        clientName: z.string().describe("Name of the customer or recipient"),
        clientAddress: z.string().optional().describe("Client address"),
        clientEmail: z.string().optional().describe("Client email"),
        companyName: z.string().optional().describe("Company or issuer name"),
        currency: z.string().optional().describe("Currency symbol or code (e.g. $, ₹, €)"),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            rate: z.number(),
            taxPercent: z.number().optional(),
          })
        ).describe("List of line items on the invoice"),
      }),
      execute: async (args) => {
        const now = new Date();
        const issueDate = now.toISOString().split("T")[0] || "2026-01-01";
        const dueDate = new Date(now.getTime() + 14 * 86400000).toISOString().split("T")[0] || "2026-01-15";

        const res = await runCreateInvoice({
          invoiceNumber: args.invoiceNumber,
          issueDate,
          dueDate,
          currency: args.currency || "$",
          companyName: args.companyName || "Karudi Official",
          companyAddress: "Tech Hub, Silicon Ave",
          companyEmail: "billing@karudi.ai",
          clientName: args.clientName,
          clientAddress: args.clientAddress || "Client Office",
          clientEmail: args.clientEmail || "",
          items: ((args.items || []) as Array<{ description: string; quantity: number; rate: number; taxPercent?: number }>).map((it, idx) => ({
            id: `item_${idx + 1}`,
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
            taxPercent: it.taxPercent || 0,
          })),
        });
        if (res.success) context.lastToolResult = res;
        return res;
      },
    }),

    search_within_document: tool({
      description: KARUDI_TOOL_REGISTRY.search_within_document.description,
      inputSchema: z.object({
        query: z.string().describe("Key term, clause, GST number, or keyword to find"),
      }),
      execute: async (args: { query: string }) => {
        if (!context.documentContext) {
          return {
            found: false,
            message: "No document text available to search. Please upload a document first.",
          };
        }
        const results = searchInExtractedDoc(context.documentContext, args.query);
        return {
          found: results.length > 0,
          query: args.query,
          matchCount: results.length,
          matches: results,
        };
      },
    }),

    web_search: tool({
      description: KARUDI_TOOL_REGISTRY.web_search.description,
      inputSchema: z.object({
        query: z.string().describe("Search query for current or external information"),
      }),
      execute: async (args: { query: string }) => {
        return await performWebSearch(args.query);
      },
    }),
  };
}
