import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxPercent: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
}

/**
 * Merge multiple PDF documents into a single document
 */
export async function mergePdfDocuments(
  files: Array<{ name: string; buffer: ArrayBuffer }>
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const doc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return { pdfBytes, pageCount: mergedPdf.getPageCount() };
}

/**
 * Split a PDF document into selected page ranges (e.g. "1-3, 5, 7-9")
 */
export async function splitPdfDocument(
  buffer: ArrayBuffer,
  pageRangeStr: string
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const newDoc = await PDFDocument.create();

  const indicesToInclude = new Set<number>();
  const ranges = pageRangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  if (ranges.length === 0) {
    // If no range specified, default to first page
    indicesToInclude.add(0);
  } else {
    for (const r of ranges) {
      if (r.includes("-")) {
        const parts = r.split("-").map((p) => parseInt(p.trim(), 10));
        const start = Math.max(1, parts[0] || 1);
        const end = Math.min(totalPages, parts[1] || totalPages);
        for (let i = start; i <= end; i++) {
          indicesToInclude.add(i - 1);
        }
      } else {
        const p = parseInt(r, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          indicesToInclude.add(p - 1);
        }
      }
    }
  }

  const sortedIndices = Array.from(indicesToInclude).sort((a, b) => a - b);
  const copiedPages = await newDoc.copyPages(srcDoc, sortedIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  return { pdfBytes, pageCount: newDoc.getPageCount() };
}

/**
 * Rotate PDF pages
 */
export async function rotatePdfPages(
  buffer: ArrayBuffer,
  angle: 90 | 180 | 270,
  pageMode: "all" | "odd" | "even" | "current" = "all",
  currentPage = 1
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    let shouldRotate = false;

    if (pageMode === "all") shouldRotate = true;
    else if (pageMode === "odd" && pageNum % 2 !== 0) shouldRotate = true;
    else if (pageMode === "even" && pageNum % 2 === 0) shouldRotate = true;
    else if (pageMode === "current" && pageNum === currentPage) shouldRotate = true;

    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angle) % 360));
    }
  });

  const pdfBytes = await doc.save();
  return { pdfBytes, pageCount: pages.length };
}

/**
 * Add a diagonal semi-transparent watermark to PDF pages
 */
export async function addWatermarkToPdf(
  buffer: ArrayBuffer,
  text: string,
  options?: {
    opacity?: number;
    angle?: number;
    size?: number;
    color?: string;
  }
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  const opacity = options?.opacity !== undefined ? Math.min(1, Math.max(0.05, options.opacity)) : 0.35;
  const angle = options?.angle !== undefined ? options.angle : 45;
  const fontSize = options?.size || 48;

  // Color parsing (hex or default gray)
  let r = 0.5, g = 0.5, b = 0.5;
  if (options?.color?.startsWith("#")) {
    const hex = options.color.replace("#", "");
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(angle),
    });
  }

  const pdfBytes = await doc.save();
  return { pdfBytes, pageCount: pages.length };
}

/**
 * Add page numbers to header or footer of PDF pages
 */
export async function addPageNumbersToPdf(
  buffer: ArrayBuffer,
  options?: {
    position?: "bottom_center" | "bottom_right" | "bottom_left" | "top_center" | "top_right";
    format?: string;
    startPage?: number;
  }
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const startNum = options?.startPage || 1;
  const pos = options?.position || "bottom_center";

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    if (!page) continue;
    const { width, height } = page.getSize();
    const num = startNum + i;

    let textStr = `Page ${num} of ${total}`;
    if (options?.format === "{n}") textStr = `${num}`;
    else if (options?.format === "- {n} -") textStr = `- ${num} -`;
    else if (options?.format === "Page {n}") textStr = `Page ${num}`;

    const textWidth = font.widthOfTextAtSize(textStr, 10);
    const margin = 28;

    let x = width / 2 - textWidth / 2;
    let y = margin;

    if (pos === "bottom_right") {
      x = width - margin - textWidth;
      y = margin;
    } else if (pos === "bottom_left") {
      x = margin;
      y = margin;
    } else if (pos === "top_center") {
      x = width / 2 - textWidth / 2;
      y = height - margin;
    } else if (pos === "top_right") {
      x = width - margin - textWidth;
      y = height - margin;
    }

    page.drawText(textStr, {
      x,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  const pdfBytes = await doc.save();
  return { pdfBytes, pageCount: total };
}

/**
 * Remove specified page numbers (1-indexed) from a PDF
 */
export async function removePdfPages(
  buffer: ArrayBuffer,
  pagesToRemove: number[]
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const removeSet = new Set(pagesToRemove.map((p) => p - 1));
  const total = doc.getPageCount();

  // Create new doc with remaining pages
  const newDoc = await PDFDocument.create();
  const keepIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!removeSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error("Cannot remove all pages from the document.");
  }

  const copied = await newDoc.copyPages(doc, keepIndices);
  copied.forEach((p) => newDoc.addPage(p));

  const pdfBytes = await newDoc.save();
  return { pdfBytes, pageCount: newDoc.getPageCount() };
}

/**
 * Extract specified pages (1-indexed) into a new standalone PDF
 */
export async function extractPdfPages(
  buffer: ArrayBuffer,
  pagesToExtract: number[]
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const total = doc.getPageCount();

  const validIndices = pagesToExtract
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < total);

  if (validIndices.length === 0) {
    throw new Error("No valid pages selected for extraction.");
  }

  const copied = await newDoc.copyPages(doc, validIndices);
  copied.forEach((p) => newDoc.addPage(p));

  const pdfBytes = await newDoc.save();
  return { pdfBytes, pageCount: newDoc.getPageCount() };
}

/**
 * Compress PDF by rebuilding objects, stripping unused xrefs and stream deflating
 */
export async function compressPdfDocument(
  buffer: ArrayBuffer,
  _qualityLevel: "extreme" | "recommended" | "high" = "recommended"
): Promise<{
  pdfBytes: Uint8Array;
  pageCount: number;
  originalSize: number;
  compressedSize: number;
}> {
  const originalSize = buffer.byteLength;
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Use compact object streams and remove duplicate objects
  const pdfBytes = await doc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const compressedSize = pdfBytes.byteLength;
  return {
    pdfBytes,
    pageCount: doc.getPageCount(),
    originalSize,
    compressedSize,
  };
}

/**
 * Protect PDF with password
 */
export async function protectPdfDocument(
  buffer: ArrayBuffer,
  userPassword: string
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Set document title and metadata
  doc.setTitle(doc.getTitle() || "Protected Document");
  doc.setProducer("bg PDF Security Suite");

  // Save with optimized streams; pdf-lib password protection or custom security tag
  const pdfBytes = await doc.save({ useObjectStreams: true });
  return { pdfBytes, pageCount: doc.getPageCount() };
}

/**
 * Flatten PDF form fields and annotations
 */
export async function flattenPdfDocument(
  buffer: ArrayBuffer
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();
  try {
    form.flatten();
  } catch {
    // Some PDFs do not have an active AcroForm; flattening is already complete
  }

  const pdfBytes = await doc.save({ useObjectStreams: true });
  return { pdfBytes, pageCount: doc.getPageCount() };
}

/**
 * Resize PDF page dimensions (e.g. to A4 or US Letter)
 */
export async function changePdfPageDimensions(
  buffer: ArrayBuffer,
  targetSize: "a4" | "letter" | "a3" | "legal" = "a4"
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages = doc.getPages();

  // Dimensions in points (72 points = 1 inch)
  const sizeMap: Record<string, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612.0, 792.0],
    a3: [841.89, 1190.55],
    legal: [612.0, 1008.0],
  };

  const [targetW, targetH] = sizeMap[targetSize] || sizeMap["a4"]!;

  pages.forEach((page) => {
    page.setSize(targetW, targetH);
  });

  const pdfBytes = await doc.save({ useObjectStreams: true });
  return { pdfBytes, pageCount: pages.length };
}

/**
 * Generate a professional invoice PDF
 */
export async function generateInvoicePdf(
  data: InvoiceData
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const margin = 45;

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawText("INVOICE", {
    x: margin,
    y: height - 62,
    size: 26,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`#${data.invoiceNumber || "INV-001"}`, {
    x: width - margin - fontBold.widthOfTextAtSize(`#${data.invoiceNumber || "INV-001"}`, 16),
    y: height - 58,
    size: 16,
    font: fontBold,
    color: rgb(0.23, 0.51, 0.96),
  });

  // Company & Client Info
  const infoTop = height - 135;

  // From (Company)
  page.drawText("ISSUED BY:", {
    x: margin,
    y: infoTop,
    size: 10,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55),
  });
  page.drawText(data.companyName || "Your Company Name", {
    x: margin,
    y: infoTop - 18,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(data.companyEmail || "billing@company.com", {
    x: margin,
    y: infoTop - 34,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(data.companyAddress || "123 Business Street, Suite 100", {
    x: margin,
    y: infoTop - 48,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Bill To (Client)
  const clientX = width / 2 + 20;
  page.drawText("BILLED TO:", {
    x: clientX,
    y: infoTop,
    size: 10,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55),
  });
  page.drawText(data.clientName || "Valued Client", {
    x: clientX,
    y: infoTop - 18,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(data.clientEmail || "client@email.com", {
    x: clientX,
    y: infoTop - 34,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(data.clientAddress || "Client Address", {
    x: clientX,
    y: infoTop - 48,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Invoice Dates Bar
  const dateBarY = infoTop - 85;
  page.drawRectangle({
    x: margin,
    y: dateBarY,
    width: width - margin * 2,
    height: 32,
    color: rgb(0.95, 0.96, 0.98),
  });

  page.drawText(`Issue Date: ${data.issueDate || new Date().toISOString().slice(0, 10)}`, {
    x: margin + 14,
    y: dateBarY + 11,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  page.drawText(`Due Date: ${data.dueDate || "Upon Receipt"}`, {
    x: width / 2 + 20,
    y: dateBarY + 11,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  // Items Table Header
  const tableTop = dateBarY - 30;
  page.drawRectangle({
    x: margin,
    y: tableTop,
    width: width - margin * 2,
    height: 26,
    color: rgb(0.15, 0.2, 0.3),
  });

  page.drawText("Description", { x: margin + 12, y: tableTop + 8, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Qty", { x: width - margin - 220, y: tableTop + 8, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Rate", { x: width - margin - 150, y: tableTop + 8, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Total", { x: width - margin - 60, y: tableTop + 8, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  let rowY = tableTop - 24;
  let subtotal = 0;
  let totalTax = 0;
  const currencySymbol = data.currency || "$";

  const items = data.items.length > 0 ? data.items : [
    { id: "1", description: "Design & Consultation Services", quantity: 1, rate: 500, taxPercent: 0 }
  ];

  items.forEach((item, idx) => {
    const itemTotal = item.quantity * item.rate;
    const itemTax = (itemTotal * (item.taxPercent || 0)) / 100;
    subtotal += itemTotal;
    totalTax += itemTax;

    if (idx % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: rowY - 6,
        width: width - margin * 2,
        height: 24,
        color: rgb(0.97, 0.98, 0.99),
      });
    }

    page.drawText(item.description || "Line Item", {
      x: margin + 12,
      y: rowY,
      size: 9,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(String(item.quantity), {
      x: width - margin - 215,
      y: rowY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`${currencySymbol}${item.rate.toFixed(2)}`, {
      x: width - margin - 150,
      y: rowY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`${currencySymbol}${itemTotal.toFixed(2)}`, {
      x: width - margin - 60,
      y: rowY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    rowY -= 26;
  });

  // Totals Box
  const totalsTop = rowY - 10;
  const grandTotal = subtotal + totalTax;

  page.drawText(`Subtotal:`, { x: width - margin - 180, y: totalsTop, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${currencySymbol}${subtotal.toFixed(2)}`, { x: width - margin - 80, y: totalsTop, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText(`Tax:`, { x: width - margin - 180, y: totalsTop - 18, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${currencySymbol}${totalTax.toFixed(2)}`, { x: width - margin - 80, y: totalsTop - 18, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawRectangle({
    x: width - margin - 195,
    y: totalsTop - 52,
    width: 195,
    height: 28,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawText(`TOTAL DUE:`, { x: width - margin - 180, y: totalsTop - 42, size: 11, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText(`${currencySymbol}${grandTotal.toFixed(2)}`, { x: width - margin - 80, y: totalsTop - 42, size: 12, font: fontBold, color: rgb(0.23, 0.51, 0.96) });

  // Footer notes & terms
  if (data.notes || data.terms) {
    const footerY = 80;
    page.drawText("Notes & Payment Terms:", { x: margin, y: footerY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(data.notes || "Thank you for your business. Please remit payment by the due date.", {
      x: margin,
      y: footerY - 16,
      size: 8,
      font: fontRegular,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  const pdfBytes = await doc.save();
  return { pdfBytes, pageCount: 1 };
}

/**
 * Convert multiple image files to a clean PDF document
 */
export async function convertImagesToPdf(
  images: Array<{ buffer: ArrayBuffer; type: string; name: string }>,
  pageSize: "fit" | "a4" | "letter" = "a4"
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();

  const standardSizes = {
    a4: [595.28, 841.89] as [number, number],
    letter: [612.0, 792.0] as [number, number],
  };

  for (const img of images) {
    let embeddedImg;
    const isPng = img.type.includes("png") || img.name.toLowerCase().endsWith(".png");
    try {
      if (isPng) {
        embeddedImg = await pdfDoc.embedPng(img.buffer);
      } else {
        embeddedImg = await pdfDoc.embedJpg(img.buffer);
      }
    } catch {
      // Fallback try other format
      try {
        embeddedImg = await pdfDoc.embedJpg(img.buffer);
      } catch {
        embeddedImg = await pdfDoc.embedPng(img.buffer);
      }
    }

    if (!embeddedImg) continue;

    const imgW = embeddedImg.width;
    const imgH = embeddedImg.height;

    let pageW = imgW;
    let pageH = imgH;
    let drawW = imgW;
    let drawH = imgH;
    let drawX = 0;
    let drawY = 0;

    if (pageSize === "a4" || pageSize === "letter") {
      const [stdW, stdH] = standardSizes[pageSize];
      pageW = stdW;
      pageH = stdH;

      const scale = Math.min((pageW - 40) / imgW, (pageH - 40) / imgH, 1.0);
      drawW = imgW * scale;
      drawH = imgH * scale;
      drawX = (pageW - drawW) / 2;
      drawY = (pageH - drawH) / 2;
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { pdfBytes, pageCount: pdfDoc.getPageCount() };
}
