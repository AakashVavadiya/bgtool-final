export interface PageTextItem {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocumentContext {
  filename: string;
  fileType: "pdf" | "image" | "docx" | "spreadsheet" | "text" | "unknown";
  totalPages?: number;
  pages?: PageTextItem[];
  fullText?: string;
  metadata?: Record<string, any>;
  isScanned?: boolean;
  structureSummary?: string;
  error?: string;
}

function parseBase64ToUint8Array(dataUrl: string): Uint8Array {
  let b64 = dataUrl;
  if (dataUrl.includes(";base64,")) {
    b64 = dataUrl.split(";base64,")[1] || "";
  }
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export async function extractDocumentContext(
  dataUrl: string,
  filename = "document"
): Promise<ExtractedDocumentContext> {
  const lowerName = filename.toLowerCase();
  const isPdf =
    lowerName.endsWith(".pdf") ||
    dataUrl.startsWith("data:application/pdf") ||
    dataUrl.startsWith("data:application/x-pdf");

  const isImage =
    /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(lowerName) ||
    dataUrl.startsWith("data:image/");

  const isText =
    /\.(txt|csv|json|md|html|xml)$/i.test(lowerName) ||
    dataUrl.startsWith("data:text/");

  // 1. PDF EXTRACTION
  if (isPdf) {
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const bytes = parseBase64ToUint8Array(dataUrl);

      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        disableFontFace: true,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const pages: PageTextItem[] = [];

      let totalChars = 0;
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str || "")
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          pages.push({
            pageNumber: pageNum,
            text: pageText,
          });
          totalChars += pageText.length;
        } catch (pageErr) {
          pages.push({
            pageNumber: pageNum,
            text: `[Page ${pageNum} text extraction failed]`,
          });
        }
      }

      // Format full structured text with clear page markers
      const fullText = pages
        .map((p) => `--- [Page ${p.pageNumber}] ---\n${p.text}`)
        .join("\n\n");

      const isScanned = totalChars < 50 * totalPages;
      const metadata = await pdf.getMetadata().catch(() => ({}));

      return {
        filename,
        fileType: "pdf",
        totalPages,
        pages,
        fullText,
        metadata: (metadata as any)?.info || {},
        isScanned,
        structureSummary: `PDF document with ${totalPages} page(s), approx ${Math.round(totalChars / 5)} words.${isScanned ? " Appears to be scanned or contains minimal text layer." : " Clear embedded text layer available."}`,
      };
    } catch (err: any) {
      return {
        filename,
        fileType: "pdf",
        error: `Could not parse PDF: ${err?.message || "Unknown error"}`,
        structureSummary: "PDF file could not be parsed.",
      };
    }
  }

  // 2. PLAIN TEXT / CSV / JSON
  if (isText) {
    try {
      let b64 = dataUrl;
      if (dataUrl.includes(";base64,")) {
        b64 = dataUrl.split(";base64,")[1] || "";
      }
      const rawText = Buffer.from(b64, "base64").toString("utf-8");
      return {
        filename,
        fileType: "text",
        totalPages: 1,
        pages: [{ pageNumber: 1, text: rawText }],
        fullText: rawText,
        structureSummary: `Text file with ${rawText.length} characters.`,
      };
    } catch (err: any) {
      return {
        filename,
        fileType: "text",
        error: `Could not read text file: ${err?.message}`,
      };
    }
  }

  // 3. IMAGE CONTEXT
  if (isImage) {
    return {
      filename,
      fileType: "image",
      structureSummary: `Image file (${filename}). Supported operations: remove background, resize, compress, crop, convert format, rotate, square, analyze palette.`,
    };
  }

  // 4. OTHER
  return {
    filename,
    fileType: "unknown",
    structureSummary: `Attached file "${filename}".`,
  };
}

/**
 * Searches within extracted document pages for specific keywords or questions
 */
export function searchInExtractedDoc(
  doc: ExtractedDocumentContext,
  query: string
): Array<{ pageNumber: number; snippet: string }> {
  if (!doc.pages || doc.pages.length === 0) return [];

  const lowerQuery = query.toLowerCase().trim();
  const queryTerms = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
  const results: Array<{ pageNumber: number; snippet: string }> = [];

  for (const page of doc.pages) {
    const pageLower = page.text.toLowerCase();
    const hasMatch =
      pageLower.includes(lowerQuery) ||
      (queryTerms.length > 0 && queryTerms.some((t) => pageLower.includes(t)));

    if (hasMatch) {
      // Find position of match to generate snippet
      let matchIdx = pageLower.indexOf(lowerQuery);
      if (matchIdx === -1 && queryTerms.length > 0) {
        matchIdx = pageLower.indexOf(queryTerms[0] || "");
      }
      const start = Math.max(0, matchIdx - 100);
      const end = Math.min(page.text.length, matchIdx + 200);
      const snippet = (start > 0 ? "..." : "") + page.text.slice(start, end) + (end < page.text.length ? "..." : "");

      results.push({
        pageNumber: page.pageNumber,
        snippet,
      });
    }
  }

  return results;
}
