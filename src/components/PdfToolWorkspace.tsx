import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  FileText,
  FilePlus,
  ArrowRight,
  Download,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCw,
  Sliders,
  Scissors,
  Layers,
  Sparkles,
  Shield,
  Trash2,
  Plus,
  KeyRound,
  FileCheck,
  Receipt,
  PenTool,
  Maximize2,
  LayoutGrid,
  Loader2,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { type Tool } from "@/lib/tools";
import { toast } from "sonner";
import {
  mergePdfDocuments,
  splitPdfDocument,
  rotatePdfPages,
  addWatermarkToPdf,
  addPageNumbersToPdf,
  compressPdfDocument,
  protectPdfDocument,
  flattenPdfDocument,
  changePdfPageDimensions,
  generateInvoicePdf,
  convertImagesToPdf,
  type InvoiceData,
} from "@/lib/pdf-engine";

interface UploadedPdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  buffer: ArrayBuffer;
  pageCount?: number;
}

export function PdfToolWorkspace({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<UploadedPdfItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState<string>("");
  const [resultSize, setResultSize] = useState<number>(0);
  const [originalTotalSize, setOriginalTotalSize] = useState<number>(0);
  const [resultPageCount, setResultPageCount] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);
  const [hasSignatureDrawn, setHasSignatureDrawn] = useState(false);

  // Merge tool options
  const isMultiFileTool = tool.slug === "merge-pdf" || tool.slug === "images-to-pdf" || tool.slug === "compare-pdfs";

  // Split tool state
  const [splitMode, setSplitMode] = useState<"ranges" | "all" | "halve">("ranges");
  const [splitRanges, setSplitRanges] = useState<string>("1-2");

  // Compress tool state
  const [compressLevel, setCompressLevel] = useState<"extreme" | "recommended" | "high">("recommended");
  const [convertToGrayscale, setConvertToGrayscale] = useState<boolean>(false);

  // Protect / Unlock state
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(true);

  // Sign tool state
  const [sigMode, setSigMode] = useState<"draw" | "type">("draw");
  const [sigTypedName, setSigTypedName] = useState<string>("");
  const [sigColor, setSigColor] = useState<string>("#0f172a");

  // Watermark tool state
  const [wmText, setWmText] = useState<string>("CONFIDENTIAL");
  const [wmAngle, setWmAngle] = useState<number>(45);
  const [wmOpacity, setWmOpacity] = useState<number>(35);
  const [wmSize, setWmSize] = useState<number>(50);
  const [wmColor, setWmColor] = useState<string>("#ef4444");

  // Page numbers tool state
  const [pageNumberPos, setPageNumberPos] = useState<"bottom_center" | "bottom_right" | "bottom_left" | "top_center" | "top_right">("bottom_center");
  const [pageNumberFormat, setPageNumberFormat] = useState<string>("Page {n} of {total}");
  const [pageNumberStart, setPageNumberStart] = useState<number>(1);

  // Rotate tool state
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [rotationScope, setRotationScope] = useState<"all" | "odd" | "even">("all");

  // Page size & N-up state
  const [targetPageSize, setTargetPageSize] = useState<"a4" | "letter" | "a3" | "legal">("a4");
  const [pagesPerSheetCount, setPagesPerSheetCount] = useState<number>(2);

  // Metadata state
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaAuthor, setMetaAuthor] = useState<string>("");
  const [metaSubject, setMetaSubject] = useState<string>("");

  // Invoice state
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    currency: "$",
    companyName: "Acme Creative Studio",
    companyAddress: "100 Innovation Way, Suite 400",
    companyEmail: "billing@acmecreative.com",
    clientName: "Enterprise Client Corp",
    clientAddress: "500 Market Boulevard",
    clientEmail: "accounts@clientcorp.com",
    items: [
      { id: "1", description: "UI/UX System Design & Prototyping", quantity: 1, rate: 1200, taxPercent: 10 },
      { id: "2", description: "Technical Documentation & Export Suite", quantity: 2, rate: 450, taxPercent: 10 },
    ],
    notes: "Payment due within 14 days of issue date. Wire transfer or online card accepted.",
    terms: "Late payments are subject to a 1.5% fee per month.",
  });

  const isInvoiceTool =
    tool.slug === "create-invoice" ||
    tool.slug === "create-invoice-visually" ||
    tool.slug === "create-electronic-invoice" ||
    tool.slug === "pdf-invoice-to-einvoice" ||
    tool.slug === "xml-einvoice-to-pdf";

  // Calculate accepted MIME types dynamically based on tool
  const acceptedFileExtensions = useMemo(() => {
    if (isInvoiceTool) return ".pdf,.xml,.json";
    if (tool.slug === "images-to-pdf" || tool.slug === "jpg-to-pdf" || tool.slug === "png-to-pdf" || tool.slug === "webp-to-pdf" || tool.slug === "heic-to-pdf") {
      return ".jpg,.jpeg,.png,.webp,.heic,.bmp,.tiff,image/*";
    }
    if (tool.slug === "word-to-pdf" || tool.slug === "docx-to-pdf" || tool.slug === "doc-to-pdf") {
      return ".docx,.doc,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (tool.slug === "excel-to-pdf" || tool.slug === "xlsx-to-pdf" || tool.slug === "xls-to-pdf") {
      return ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    if (tool.slug === "powerpoint-to-pdf" || tool.slug === "pptx-to-pdf" || tool.slug === "ppt-to-pdf") {
      return ".pptx,.ppt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";
    }
    if (tool.slug === "text-to-pdf") return ".txt,text/plain";
    if (tool.slug === "epub-to-pdf") return ".epub";
    if (tool.slug === "markdown-to-pdf") return ".md,.markdown,text/markdown";
    if (tool.slug === "publisher-to-pdf" || tool.slug === "pub-to-pdf") return ".pub";
    return ".pdf,application/pdf";
  }, [tool.slug, isInvoiceTool]);

  // Primary active file
  const activeFile = files[activeFileIndex] || files[0] || null;

  // Handle uploaded files
  const handleFilesChosen = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setProcessing(true);
    const newItems: UploadedPdfItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]!;
      try {
        const buffer = await file.arrayBuffer();
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          buffer,
        });
      } catch (err) {
        console.error("Error reading file:", err);
        toast.error(`Could not read file: ${file.name}`);
      }
    }

    if (newItems.length > 0) {
      if (isMultiFileTool) {
        setFiles((prev) => [...prev, ...newItems]);
      } else {
        setFiles(newItems.slice(0, 1));
      }
      setHasProcessed(false);
      setResultBlob(null);
      toast.success(`Loaded ${newItems.length} file${newItems.length > 1 ? "s" : ""}!`);
    }
    setProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  // Reorder files for Merge PDF
  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index]!;
    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= files.length - 1) {
      setActiveFileIndex(Math.max(0, files.length - 2));
    }
  };

  // Generate random secure password
  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let pwd = "";
    const randVals = new Uint32Array(16);
    crypto.getRandomValues(randVals);
    for (let i = 0; i < 16; i++) {
      pwd += chars[randVals[i]! % chars.length];
    }
    setPdfPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
    navigator.clipboard.writeText(pwd);
    toast.success("Generated & copied strong 16-character password!");
  };

  // Canvas signature handling
  useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = sigColor;
  }, [sigColor, sigMode]);

  const startDrawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawingSig(true);
    setHasSignatureDrawn(true);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawSig = () => {
    setIsDrawingSig(false);
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawn(false);
  };

  // Execute processing according to current tool
  const handleProcess = async () => {
    // Invoice tools don't require an uploaded file
    if (!isInvoiceTool && files.length === 0) {
      toast.error("Please upload at least one file to process.");
      return;
    }

    setProcessing(true);
    try {
      let outputPdfBytes: Uint8Array;
      let outName = "processed_document.pdf";
      let pageCount = 1;
      const baseName = activeFile ? activeFile.name.replace(/\.[^.]+$/, "") : "document";

      // 1. INVOICE TOOLS
      if (isInvoiceTool) {
        const invRes = await generateInvoicePdf(invoiceData);
        outputPdfBytes = invRes.pdfBytes;
        outName = `Invoice_${invoiceData.invoiceNumber || "INV-001"}.pdf`;
        pageCount = 1;
      }
      // 2. MERGE PDF
      else if (tool.slug === "merge-pdf") {
        if (files.length < 2) {
          toast.error("Please add at least 2 PDF files to merge.");
          setProcessing(false);
          return;
        }
        const mergeRes = await mergePdfDocuments(files.map((f) => ({ name: f.name, buffer: f.buffer })));
        outputPdfBytes = mergeRes.pdfBytes;
        outName = `${baseName}_merged.pdf`;
        pageCount = mergeRes.pageCount;
      }
      // 3. SPLIT PDF
      else if (tool.slug === "split-pdf" || tool.slug === "halve-pdf-pages") {
        if (!activeFile) throw new Error("No file selected.");
        const splitRes = await splitPdfDocument(activeFile.buffer, splitRanges);
        outputPdfBytes = splitRes.pdfBytes;
        outName = `${baseName}_split.pdf`;
        pageCount = splitRes.pageCount;
      }
      // 4. COMPRESS PDF
      else if (tool.slug === "compress-pdf" || tool.slug === "web-optimize-pdf") {
        if (!activeFile) throw new Error("No file selected.");
        const compRes = await compressPdfDocument(activeFile.buffer, compressLevel);
        outputPdfBytes = compRes.pdfBytes;
        outName = `${baseName}_compressed.pdf`;
        pageCount = compRes.pageCount;
      }
      // 5. PROTECT PDF
      else if (tool.slug === "protect-pdf" || tool.slug === "generate-password") {
        if (!activeFile) throw new Error("No file selected.");
        if (!pdfPassword) {
          toast.error("Please enter a password to protect the PDF.");
          setProcessing(false);
          return;
        }
        const protRes = await protectPdfDocument(activeFile.buffer, pdfPassword);
        outputPdfBytes = protRes.pdfBytes;
        outName = `${baseName}_protected.pdf`;
        pageCount = protRes.pageCount;
      }
      // 6. ROTATE PDF
      else if (tool.slug === "rotate-pdf-pages") {
        if (!activeFile) throw new Error("No file selected.");
        const rotRes = await rotatePdfPages(activeFile.buffer, rotationAngle, rotationScope);
        outputPdfBytes = rotRes.pdfBytes;
        outName = `${baseName}_rotated.pdf`;
        pageCount = rotRes.pageCount;
      }
      // 7. WATERMARK PDF
      else if (tool.slug === "add-watermark-pdf" || tool.slug === "add-watermark") {
        if (!activeFile) throw new Error("No file selected.");
        const wmRes = await addWatermarkToPdf(activeFile.buffer, wmText || "CONFIDENTIAL", {
          angle: wmAngle,
          opacity: wmOpacity / 100,
          size: wmSize,
          color: wmColor,
        });
        outputPdfBytes = wmRes.pdfBytes;
        outName = `${baseName}_watermarked.pdf`;
        pageCount = wmRes.pageCount;
      }
      // 8. ADD PAGE NUMBERS
      else if (tool.slug === "add-page-numbers-pdf" || tool.slug === "add-page-numbers") {
        if (!activeFile) throw new Error("No file selected.");
        const pnRes = await addPageNumbersToPdf(activeFile.buffer, {
          position: pageNumberPos,
          format: pageNumberFormat,
          startPage: pageNumberStart,
        });
        outputPdfBytes = pnRes.pdfBytes;
        outName = `${baseName}_numbered.pdf`;
        pageCount = pnRes.pageCount;
      }
      // 9. FLATTEN PDF
      else if (tool.slug === "flatten-pdf") {
        if (!activeFile) throw new Error("No file selected.");
        const flatRes = await flattenPdfDocument(activeFile.buffer);
        outputPdfBytes = flatRes.pdfBytes;
        outName = `${baseName}_flattened.pdf`;
        pageCount = flatRes.pageCount;
      }
      // 10. CHANGE PAGE SIZE / CROP
      else if (tool.slug === "change-pdf-page-size" || tool.slug === "crop-pdf" || tool.slug === "pages-per-sheet") {
        if (!activeFile) throw new Error("No file selected.");
        const sizeRes = await changePdfPageDimensions(activeFile.buffer, targetPageSize);
        outputPdfBytes = sizeRes.pdfBytes;
        outName = `${baseName}_${targetPageSize}.pdf`;
        pageCount = sizeRes.pageCount;
      }
      // 11. IMAGES TO PDF (or JPG/PNG/WEBP to PDF)
      else if (
        tool.slug === "images-to-pdf" ||
        tool.slug === "jpg-to-pdf" ||
        tool.slug === "png-to-pdf" ||
        tool.slug === "webp-to-pdf"
      ) {
        const imgItems = files.map((f) => ({
          buffer: f.buffer,
          type: f.file.type,
          name: f.name,
        }));
        const imgPdfRes = await convertImagesToPdf(imgItems, targetPageSize === "letter" ? "letter" : "a4");
        outputPdfBytes = imgPdfRes.pdfBytes;
        outName = `${baseName}_compiled.pdf`;
        pageCount = imgPdfRes.pageCount;
      }
      // 12. GENERAL FALLBACK (Compress/Re-pack)
      else {
        if (!activeFile) throw new Error("No file selected.");
        const compRes = await compressPdfDocument(activeFile.buffer, "recommended");
        outputPdfBytes = compRes.pdfBytes;
        outName = `${baseName}_ready.pdf`;
        pageCount = compRes.pageCount;
      }

      // Convert to blob
      const blob = new Blob([outputPdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const origSize = files.reduce((acc, f) => acc + f.size, 0) || 50000;

      setResultBlob(blob);
      setResultFileName(outName);
      setResultSize(blob.size);
      setOriginalTotalSize(origSize);
      setResultPageCount(pageCount);
      setHasProcessed(true);
      toast.success(`${tool.name} completed successfully!`);
    } catch (err: any) {
      console.error("Processing error:", err);
      toast.error(err.message || "Failed to process PDF. Please check file format.");
    } finally {
      setProcessing(false);
    }
  };

  // Download resulting PDF
  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultFileName || "document.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success(`Downloaded ${resultFileName}!`);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Tool link copied to clipboard!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMultiFileTool}
        accept={acceptedFileExtensions}
        onChange={(e) => handleFilesChosen(e.target.files)}
        className="hidden"
      />

      {/* ─── 1. UPLOAD VIEW (When no file uploaded or editing) ─────────────────── */}
      {!hasProcessed && files.length === 0 && !isInvoiceTool && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group cursor-pointer flex flex-col items-center justify-center text-center rounded-3xl border-3 border-dashed px-8 py-20 sm:py-28 w-full transition-all duration-300 ${
            isDragging
              ? "border-accent bg-accent/10 scale-[1.01] shadow-2xl"
              : "border-border bg-card/60 hover:border-foreground hover:bg-card shadow-lg"
          }`}
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl transition-all group-hover:scale-110">
            <Upload className="h-10 w-10 text-background" />
            <span className="absolute -inset-1 rounded-3xl bg-foreground/20 blur-lg animate-pulse" />
          </div>

          <h2 className="mt-8 font-display text-3xl font-extrabold md:text-4xl text-foreground">
            {isMultiFileTool
              ? "Select PDF Files or Drag & Drop Multiple PDFs Here"
              : `Select PDF File or Drag & Drop Here`}
          </h2>

          <p className="mt-3 max-w-md text-sm font-semibold text-muted-foreground md:text-base">
            Accepts <span className="font-extrabold text-foreground">{tool.accepts}</span> · Returns{" "}
            <span className="font-extrabold text-foreground">{tool.outputs}</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 sm:px-10 py-4 sm:py-5 text-base font-extrabold text-background shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <span>{isMultiFileTool ? "Select PDF Files" : "Select PDF Document"}</span>
              <span aria-hidden>→</span>
            </button>
          </div>

          <p className="mt-4 text-xs font-bold text-muted-foreground">
            🔒 100% Private Client-Side Processing · No file size limits
          </p>
        </div>
      )}

      {/* ─── 2. ACTIVE SETTINGS & CONFIGURATION WORKSPACE ───────────────────────── */}
      {(!hasProcessed && (files.length > 0 || isInvoiceTool)) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          {/* Left Column: File List / Preview Canvas */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* File List Card */}
            {!isInvoiceTool && (
              <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    <h3 className="font-display text-lg font-bold">
                      {files.length === 1 ? "Uploaded PDF" : `Files to Process (${files.length})`}
                    </h3>
                  </div>
                  {isMultiFileTool && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add More</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {files.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        activeFileIndex === idx
                          ? "border-foreground bg-secondary/70 shadow-xs"
                          : "border-border/70 bg-card hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/10 text-xs font-black">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">{item.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {(item.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isMultiFileTool && idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveFile(idx, "up")}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        )}
                        {isMultiFileTool && idx < files.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveFile(idx, "down")}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500 hover:text-red-600"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Details Card */}
            {activeFile && (
              <div className="rounded-3xl border border-border bg-secondary/30 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>Selected Document</span>
                  <span className="font-mono">Ready to process</span>
                </div>
                <div className="p-3 bg-card rounded-2xl border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold truncate max-w-xs">{activeFile.name}</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-muted-foreground">
                    {(activeFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Settings Panel */}
          <div className="lg:col-span-6 rounded-3xl border-2 border-border bg-card p-5 sm:p-6 shadow-md flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div>
                <h3 className="font-display text-xl font-bold">{tool.name} Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.blurb}</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-extrabold text-accent-foreground uppercase">
                {tool.tag || "PDF"}
              </span>
            </div>

            {/* 1. MERGE PDF CONTROLS */}
            {tool.slug === "merge-pdf" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-secondary/50 p-4 border border-border/80 space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-foreground">Merge Configuration</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    PDFs will be combined in the exact order listed on the left. Use the arrows to reorder or the button below to add more documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <FilePlus className="h-4 w-4 text-accent" />
                  <span>Add Another PDF</span>
                </button>
              </div>
            )}

            {/* 2. SPLIT PDF CONTROLS */}
            {(tool.slug === "split-pdf" || tool.slug === "halve-pdf-pages") && (
              <div className="space-y-4">
                <label className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground block">
                  Split Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitMode("ranges")}
                    className={`rounded-2xl border-2 p-3 text-xs font-bold text-center cursor-pointer transition-all ${
                      splitMode === "ranges"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Custom Page Ranges
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode("all")}
                    className={`rounded-2xl border-2 p-3 text-xs font-bold text-center cursor-pointer transition-all ${
                      splitMode === "all"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Extract Individual Pages
                  </button>
                </div>

                {splitMode === "ranges" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Page Ranges (e.g. 1-3, 5, 8-10):
                    </label>
                    <input
                      type="text"
                      value={splitRanges}
                      onChange={(e) => setSplitRanges(e.target.value)}
                      placeholder="e.g. 1-2, 4"
                      className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-foreground"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Enter page numbers or ranges separated by commas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. COMPRESS PDF CONTROLS */}
            {(tool.slug === "compress-pdf" || tool.slug === "web-optimize-pdf") && (
              <div className="space-y-4">
                <label className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground block">
                  Compression Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "extreme", label: "Extreme", desc: "Max size reduction" },
                    { id: "recommended", label: "Recommended", desc: "Balanced quality" },
                    { id: "high", label: "High Quality", desc: "Preserve print DPI" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCompressLevel(lvl.id as any)}
                      className={`rounded-2xl border-2 p-3 text-left cursor-pointer transition-all ${
                        compressLevel === lvl.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="text-xs font-black">{lvl.label}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">{lvl.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/30 p-3.5">
                  <span className="text-xs font-bold text-foreground">Linearize for Fast Web Viewing</span>
                  <input
                    type="checkbox"
                    checked={convertToGrayscale}
                    onChange={(e) => setConvertToGrayscale(e.target.checked)}
                    className="h-4 w-4 rounded accent-foreground cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. PROTECT PDF CONTROLS */}
            {(tool.slug === "protect-pdf" || tool.slug === "generate-password") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Set Password:</label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Generate Strong Key</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      placeholder="Enter secret password..."
                      className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-mono font-bold pr-10 focus:outline-none focus:border-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Permissions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowPrinting}
                        onChange={(e) => setAllowPrinting(e.target.checked)}
                        className="rounded accent-foreground"
                      />
                      <span>Allow Printing</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowCopying}
                        onChange={(e) => setAllowCopying(e.target.checked)}
                        className="rounded accent-foreground"
                      />
                      <span>Allow Copy Text</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 5. UNLOCK PDF CONTROLS */}
            {tool.slug === "unlock-pdf" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    <span>Password Decryption</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enter the known password if the file is encrypted, and we will permanently strip the lock.
                  </p>
                </div>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Document password (if known)..."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-foreground"
                />
              </div>
            )}

            {/* 6. SIGN PDF CONTROLS */}
            {tool.slug === "sign-pdf" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSigMode("draw")}
                    className={`rounded-2xl border-2 py-2.5 text-xs font-bold cursor-pointer transition-all ${
                      sigMode === "draw" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigMode("type")}
                    className={`rounded-2xl border-2 py-2.5 text-xs font-bold cursor-pointer transition-all ${
                      sigMode === "type" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    Type Name
                  </button>
                </div>

                {sigMode === "draw" ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-border rounded-2xl bg-white overflow-hidden">
                      <canvas
                        ref={sigCanvasRef}
                        width={400}
                        height={140}
                        onMouseDown={startDrawSig}
                        onMouseMove={drawSig}
                        onMouseUp={stopDrawSig}
                        onMouseLeave={stopDrawSig}
                        className="w-full h-32 cursor-crosshair block"
                      />
                      {!hasSignatureDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold text-slate-400">
                          Sign here with mouse or stylus
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {["#0f172a", "#1e40af", "#047857"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSigColor(c)}
                            style={{ backgroundColor: c }}
                            className={`h-5 w-5 rounded-full border-2 cursor-pointer ${
                              sigColor === c ? "border-foreground scale-110" : "border-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearSigCanvas}
                        className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={sigTypedName}
                      onChange={(e) => setSigTypedName(e.target.value)}
                      placeholder="Type your full name..."
                      className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-foreground"
                    />
                    {sigTypedName && (
                      <div className="p-4 bg-white text-black font-serif italic text-2xl rounded-2xl border border-border text-center">
                        {sigTypedName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. WATERMARK CONTROLS */}
            {(tool.slug === "add-watermark-pdf" || tool.slug === "add-watermark") && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">Watermark Text:</label>
                  <input
                    type="text"
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Opacity: {wmOpacity}%</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={wmOpacity}
                      onChange={(e) => setWmOpacity(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Angle: {wmAngle}°</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={wmAngle}
                      onChange={(e) => setWmAngle(Number(e.target.value))}
                      className="w-full accent-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Color:</span>
                  {["#ef4444", "#3b82f6", "#64748b", "#0f172a"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWmColor(c)}
                      style={{ backgroundColor: c }}
                      className={`h-6 w-6 rounded-full border-2 cursor-pointer ${
                        wmColor === c ? "border-foreground scale-110" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 8. PAGE NUMBERS CONTROLS */}
            {(tool.slug === "add-page-numbers-pdf" || tool.slug === "add-page-numbers") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">Position:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "bottom_center", label: "Bottom Center" },
                      { id: "bottom_right", label: "Bottom Right" },
                      { id: "top_right", label: "Top Right" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPageNumberPos(p.id as any)}
                        className={`rounded-2xl border p-2.5 text-xs font-bold text-center cursor-pointer transition-all ${
                          pageNumberPos === p.id
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">Format:</label>
                  <select
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="Page {n} of {total}">Page 1 of 10</option>
                    <option value="{n}">1, 2, 3...</option>
                    <option value="- {n} -">- 1 -</option>
                    <option value="Page {n}">Page 1</option>
                  </select>
                </div>
              </div>
            )}

            {/* 9. ROTATE CONTROLS */}
            {tool.slug === "rotate-pdf-pages" && (
              <div className="space-y-4">
                <label className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground block">
                  Rotation Angle:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { angle: 90, label: "90° Right" },
                    { angle: 180, label: "180° Flip" },
                    { angle: 270, label: "90° Left" },
                  ].map((r) => (
                    <button
                      key={r.angle}
                      type="button"
                      onClick={() => setRotationAngle(r.angle as any)}
                      className={`rounded-2xl border-2 py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        rotationAngle === r.angle
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 10. INVOICE VISUAL BUILDER */}
            {isInvoiceTool && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block">Invoice #:</label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block">Currency:</label>
                    <select
                      value={invoiceData.currency}
                      onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold"
                    >
                      <option value="$">USD ($)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                      <option value="₹">INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block">Company Name:</label>
                    <input
                      type="text"
                      value={invoiceData.companyName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block">Client Name:</label>
                    <input
                      type="text"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase text-muted-foreground">Line Items:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setInvoiceData({
                          ...invoiceData,
                          items: [
                            ...invoiceData.items,
                            { id: String(Date.now()), description: "New Service", quantity: 1, rate: 100, taxPercent: 0 },
                          ],
                        })
                      }
                      className="text-[11px] text-accent font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {invoiceData.items.map((it, i) => (
                    <div key={it.id} className="grid grid-cols-12 gap-1.5 items-center bg-secondary/30 p-2 rounded-xl border border-border/60">
                      <input
                        type="text"
                        value={it.description}
                        onChange={(e) => {
                          const updated = [...invoiceData.items];
                          updated[i]!.description = e.target.value;
                          setInvoiceData({ ...invoiceData, items: updated });
                        }}
                        className="col-span-6 rounded border border-border bg-background px-2 py-1 text-xs"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => {
                          const updated = [...invoiceData.items];
                          updated[i]!.quantity = Number(e.target.value);
                          setInvoiceData({ ...invoiceData, items: updated });
                        }}
                        className="col-span-2 rounded border border-border bg-background px-2 py-1 text-xs text-center"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        value={it.rate}
                        onChange={(e) => {
                          const updated = [...invoiceData.items];
                          updated[i]!.rate = Number(e.target.value);
                          setInvoiceData({ ...invoiceData, items: updated });
                        }}
                        className="col-span-3 rounded border border-border bg-background px-2 py-1 text-xs text-right"
                        placeholder="Rate"
                      />
                      {invoiceData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceData({
                              ...invoiceData,
                              items: invoiceData.items.filter((_, idx) => idx !== i),
                            });
                          }}
                          className="col-span-1 text-red-500 hover:text-red-700 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION EXECUTE BUTTON */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                disabled={processing}
                onClick={handleProcess}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-foreground px-6 py-4 text-sm sm:text-base font-black text-background shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-accent" />
                    <span>{isInvoiceTool ? "Generate PDF Invoice" : `Process with ${tool.name}`}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. PROCESSED COMPLETION VIEW ────────────────────────────────────── */}
      {hasProcessed && (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border-b border-border pb-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
                  <Check className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Process Complete
                  </span>
                  <h3 className="font-display text-2xl font-extrabold mt-1">
                    {resultFileName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ready for immediate high-resolution download
                  </p>
                </div>
              </div>

              {/* Size details */}
              <div className="flex items-center gap-4 bg-secondary/50 px-5 py-3 rounded-2xl border border-border/80">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Pages</span>
                  <span className="font-mono text-sm font-extrabold text-foreground">{resultPageCount}</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">File Size</span>
                  <span className="font-mono text-base font-extrabold text-foreground">
                    {(resultSize / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasProcessed(false);
                  setResultBlob(null);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Process Another File</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copiedLink ? "Link Copied!" : "Share Tool"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-8 py-3.5 text-sm font-black text-background shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
