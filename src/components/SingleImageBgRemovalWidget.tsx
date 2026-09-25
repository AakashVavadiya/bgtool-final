import { useState, useRef, useEffect } from "react";
import {
  Pencil,
  Download,
  Info,
  X,
  RotateCw,
  Sliders,
  Check,
  ExternalLink,
  Loader2,
  Undo2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CutoutBrushEditorModal } from "@/components/CutoutBrushEditorModal";

export interface SingleImageBgRemovalWidgetProps {
  task: {
    id: string;
    status: "waiting_file" | "processing" | "done" | "error";
    originalImageSrc?: string | undefined;
    resultImageSrc?: string | undefined;
    originalFilename?: string | undefined;
    progressMessage?: string | undefined;
    error?: string | undefined;
    uploadedFile?: {
      name: string;
      dataUrl: string;
      size: number;
    } | undefined;
  };
  onDownload: (url: string, filename: string) => void;
  onUpdateImage?: ((id: string, newSrc: string) => void) | undefined;
}

export function SingleImageBgRemovalWidget({
  task,
  onDownload,
  onUpdateImage,
}: SingleImageBgRemovalWidgetProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Edit controls state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const displayImageSrc =
    task.status === "done" && task.resultImageSrc
      ? task.resultImageSrc
      : task.originalImageSrc || task.uploadedFile?.dataUrl;

  const baseFileName =
    task.originalFilename?.replace(/\.[^.]+$/, "") ||
    task.uploadedFile?.name?.replace(/\.[^.]+$/, "") ||
    "image";

  const downloadFilename = `${baseFileName}_cutout.png`;

  // Calculate estimated file size in KB/MB
  const estimateSize = (src?: string) => {
    if (!src) return "0 KB";
    if (src.startsWith("data:")) {
      const stringLength = src.length - src.indexOf(",") - 1;
      const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383615;
      const sizeInKb = sizeInBytes / 1024;
      if (sizeInKb > 1024) {
        return `${(sizeInKb / 1024).toFixed(2)} MB`;
      }
      return `${Math.round(sizeInKb)} KB`;
    }
    return "1.2 MB";
  };

  const handleApplyEdits = () => {
    if (!task.resultImageSrc) return;
    setIsApplying(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = task.resultImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const is90or270 = rotation % 180 !== 0;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsApplying(false);
        return;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, 1);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const newUrl = canvas.toDataURL("image/png");
      if (onUpdateImage) {
        onUpdateImage(task.id, newUrl);
      }
      setIsApplying(false);
      setShowEditModal(false);
    };
    img.onerror = () => {
      setIsApplying(false);
    };
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
  };

  return (
    <div className="my-1 select-none">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. PROCESSING STATE (Animated Scanline & Pulse)             */}
      {/* ────────────────────────────────────────────────────────── */}
      {task.status === "processing" && (
        <div className="relative inline-block overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-lg max-w-sm sm:max-w-md">
          {displayImageSrc ? (
            <div className="relative overflow-hidden flex items-center justify-center p-1.5">
              <img
                src={displayImageSrc}
                alt="Removing background..."
                className="max-h-72 sm:max-h-80 w-auto max-w-full rounded-xl object-contain opacity-90 filter brightness-95"
              />

              {/* Animated high-tech laser scanline */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {/* Subtle shimmer background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-cyan-500/15 to-transparent animate-pulse" />

                {/* Laser beam moving up and down */}
                <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)] animate-laser-sweep" />
              </div>

              {/* Animated progress status badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-xl text-xs font-semibold text-foreground whitespace-nowrap animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-500" />
                <span>Removing background, please wait some time...</span>
              </div>
            </div>
          ) : (
            <div className="flex h-56 w-72 items-center justify-center p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-cyan-500" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Removing background, please wait some time...
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DONE STATE (Final Proceeded File + Hover 3 Icon Buttons) */}
      {/* ────────────────────────────────────────────────────────── */}
      {task.status === "done" && task.resultImageSrc && (
        <div className="relative group inline-block overflow-hidden rounded-2xl border-2 border-border/80 bg-card/90 shadow-lg max-w-sm sm:max-w-md transition-all hover:border-foreground/30">
          {/* Transparent Checkered Canvas Pattern */}
          <div
            className="relative overflow-hidden flex items-center justify-center p-2 rounded-xl"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          >
            <img
              src={task.resultImageSrc}
              alt="Background removed result"
              className="max-h-72 sm:max-h-80 w-auto max-w-full rounded-xl object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
              onLoad={(e) => {
                const img = e.currentTarget;
                setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              }}
            />

            {/* 
              Hover Overlay with ONLY 3 Icon Buttons:
              1. Edit
              2. Download
              3. Details
            */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-200">
                {/* 1. EDIT ICON BUTTON */}
                <button
                  type="button"
                  title="Edit"
                  aria-label="Edit"
                  onClick={() => setShowEditModal(true)}
                  className="p-2.5 rounded-xl text-foreground hover:bg-muted/90 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {/* 2. DOWNLOAD ICON BUTTON */}
                <button
                  type="button"
                  title="Download"
                  aria-label="Download"
                  onClick={() => onDownload(task.resultImageSrc!, downloadFilename)}
                  className="p-2.5 rounded-xl text-foreground hover:bg-muted/90 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* 3. DETAILS ICON BUTTON */}
                <button
                  type="button"
                  title="Details"
                  aria-label="Details"
                  onClick={() => setShowDetailsModal(true)}
                  className="p-2.5 rounded-xl text-foreground hover:bg-muted/90 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. ERROR STATE                                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {task.status === "error" && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-semibold text-rose-500 max-w-sm">
          Failed to remove background. Please try another image.
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* DETAILS MODAL                                              */}
      {/* ────────────────────────────────────────────────────────── */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h3 className="font-display font-extrabold text-sm text-foreground">Image Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">File Name</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">
                  {downloadFilename}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Dimensions</span>
                <span className="font-semibold text-foreground">
                  {dimensions ? `${dimensions.width} × ${dimensions.height} px` : "High Definition"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Format</span>
                <span className="font-semibold text-foreground">PNG (Transparent)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Background</span>
                <span className="font-semibold text-emerald-500 font-bold">Removed (Transparent)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Est. Size</span>
                <span className="font-semibold text-foreground">{estimateSize(task.resultImageSrc)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="font-semibold text-foreground">Processed & Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDownload(task.resultImageSrc!, downloadFilename);
                  setShowDetailsModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-foreground text-background font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="py-2 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* EDIT MODAL: BRUSH RESTORE, REMOVE BRUSH & MAGIC BRUSH     */}
      {/* ────────────────────────────────────────────────────────── */}
      {showEditModal && task.resultImageSrc && (
        <CutoutBrushEditorModal
          originalImageSrc={task.originalImageSrc || task.uploadedFile?.dataUrl || task.resultImageSrc}
          cutoutImageSrc={task.resultImageSrc}
          filename={downloadFilename}
          onClose={() => setShowEditModal(false)}
          onSave={(newSrc) => {
            if (onUpdateImage) {
              onUpdateImage(task.id, newSrc);
            }
          }}
          onDownload={onDownload}
        />
      )}
    </div>
  );
}
