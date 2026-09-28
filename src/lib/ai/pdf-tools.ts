import {
  mergePdfDocuments,
  splitPdfDocument,
  rotatePdfPages,
  compressPdfDocument,
  addWatermarkToPdf,
  addPageNumbersToPdf,
  removePdfPages,
  extractPdfPages,
  protectPdfDocument,
  generateInvoicePdf,
  type InvoiceData,
} from "../pdf-engine";

export interface PdfOperationResult {
  success: boolean;
  tool: string;
  action: string;
  resultPdfDataUrl?: string;
  resultPdfBase64?: string;
  pageCount?: number;
  filename?: string;
  message?: string;
  error?: string;
  totalPages?: number;
  firstImage?: string;
}

function parseBase64ToArrayBuffer(src: string): ArrayBuffer {
  let b64 = src;
  if (src.includes(";base64,")) {
    b64 = src.split(";base64,")[1] || "";
  }
  const buf = Buffer.from(b64, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function uint8ArrayToDataUrl(bytes: Uint8Array, mime = "application/pdf"): string {
  const b64 = Buffer.from(bytes).toString("base64");
  return `data:${mime};base64,${b64}`;
}

export async function runMergePdf(
  files: Array<{ name: string; dataUrl: string }>
): Promise<PdfOperationResult> {
  try {
    if (!files || files.length < 2) {
      return {
        success: false,
        tool: "merge_pdf",
        action: "merge_pdf",
        error: "At least two PDF files are required for merging.",
      };
    }

    const prepared = files.map((f) => ({
      name: f.name,
      buffer: parseBase64ToArrayBuffer(f.dataUrl),
    }));

    const result = await mergePdfDocuments(prepared);
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "merge_pdf",
      action: "merge_pdf",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "merged_document.pdf",
      message: `Successfully merged ${files.length} PDFs into a single document (${result.pageCount} pages).`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "merge_pdf",
      action: "merge_pdf",
      error: `Merge PDF failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runSplitPdf(
  pdfDataUrl: string,
  pageRangeStr = "1-1",
  filename = "document.pdf"
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const result = await splitPdfDocument(buffer, pageRangeStr);
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "split_pdf",
      action: "split_pdf",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: `split_${filename}`,
      message: `Extracted pages (${pageRangeStr}) into a new PDF (${result.pageCount} pages).`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "split_pdf",
      action: "split_pdf",
      error: `Split PDF failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runRotatePdf(
  pdfDataUrl: string,
  angle: 90 | 180 | 270 = 90,
  pageMode: "all" | "odd" | "even" = "all"
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const result = await rotatePdfPages(buffer, angle, pageMode);
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "rotate_pdf_pages",
      action: "rotate_pdf_pages",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: `rotated_${angle}deg.pdf`,
      message: `Rotated ${pageMode === "all" ? "all" : pageMode} pages by ${angle}°.`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "rotate_pdf_pages",
      action: "rotate_pdf_pages",
      error: `Rotate PDF failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runCompressPdf(
  pdfDataUrl: string,
  quality: "low" | "medium" | "high" = "medium"
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const qualityMap: Record<string, "extreme" | "recommended" | "high"> = {
      low: "extreme",
      medium: "recommended",
      high: "high",
    };
    const result = await compressPdfDocument(buffer, qualityMap[quality] || "recommended");
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "compress_pdf",
      action: "compress_pdf",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "compressed_document.pdf",
      message: `Compressed PDF successfully (${quality} profile).`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "compress_pdf",
      action: "compress_pdf",
      error: `Compress PDF failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runAddPdfWatermark(
  pdfDataUrl: string,
  watermarkText = "CONFIDENTIAL",
  opacity = 0.25
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const result = await addWatermarkToPdf(buffer, watermarkText, { opacity });
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "add_pdf_watermark",
      action: "add_pdf_watermark",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "watermarked_document.pdf",
      message: `Watermark "${watermarkText}" stamped on all ${result.pageCount} pages.`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "add_pdf_watermark",
      action: "add_pdf_watermark",
      error: `Watermarking failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runAddPageNumbers(
  pdfDataUrl: string,
  position: "bottom-center" | "bottom-right" | "top-right" = "bottom-center"
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const posMap: Record<string, "bottom_center" | "bottom_right" | "top_right"> = {
      "bottom-center": "bottom_center",
      "bottom-right": "bottom_right",
      "top-right": "top_right",
    };
    const result = await addPageNumbersToPdf(buffer, {
      position: posMap[position] || "bottom_center",
    });
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "add_page_numbers",
      action: "add_page_numbers",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "numbered_document.pdf",
      message: `Page numbers added across ${result.pageCount} pages.`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "add_page_numbers",
      action: "add_page_numbers",
      error: `Adding page numbers failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runRemovePdfPages(
  pdfDataUrl: string,
  pagesToRemove: number[]
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const result = await removePdfPages(buffer, pagesToRemove);
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "remove_pdf_pages",
      action: "remove_pdf_pages",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "pages_removed.pdf",
      message: `Removed page(s) ${pagesToRemove.join(", ")}. Remaining: ${result.pageCount} pages.`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "remove_pdf_pages",
      action: "remove_pdf_pages",
      error: `Removing PDF pages failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runProtectPdf(
  pdfDataUrl: string,
  userPassword = "password"
): Promise<PdfOperationResult> {
  try {
    const buffer = parseBase64ToArrayBuffer(pdfDataUrl);
    const result = await protectPdfDocument(buffer, userPassword);
    const dataUrl = uint8ArrayToDataUrl(result.pdfBytes);

    return {
      success: true,
      tool: "protect_pdf",
      action: "protect_pdf",
      resultPdfDataUrl: dataUrl,
      pageCount: result.pageCount,
      filename: "protected_document.pdf",
      message: "PDF encrypted and password-protected successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "protect_pdf",
      action: "protect_pdf",
      error: `Protecting PDF failed: ${err?.message || "Unknown error"}`,
    };
  }
}

export async function runCreateInvoice(invoiceData: InvoiceData): Promise<PdfOperationResult> {
  try {
    const res = await generateInvoicePdf(invoiceData);
    const dataUrl = uint8ArrayToDataUrl(res.pdfBytes);

    return {
      success: true,
      tool: "create_invoice",
      action: "create_invoice",
      resultPdfDataUrl: dataUrl,
      filename: `invoice_${invoiceData.invoiceNumber || "new"}.pdf`,
      message: `Professional invoice #${invoiceData.invoiceNumber} generated for ${invoiceData.clientName}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      tool: "create_invoice",
      action: "create_invoice",
      error: `Invoice generation failed: ${err?.message || "Unknown error"}`,
    };
  }
}
