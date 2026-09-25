import { useState, useRef, useEffect } from "react";
import {
  Check,
  Download,
  Loader2,
  Upload,
  Sparkles,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  FolderUp,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { bgModels } from "@/lib/bg-models";
import { CutoutBrushEditorModal } from "@/components/CutoutBrushEditorModal";
import { AuthUser } from "@/lib/auth-user";

const steps = [
  { label: "Uploading image", detail: "Secure transfer · discarded after processing" },
  { label: "Detecting subject", detail: "Semantic segmentation pass" },
  { label: "Refining edges", detail: "Strand-level alpha matting" },
  { label: "Rebuilding alpha", detail: "Sub-pixel transparency map" },
  { label: "Exporting PNG", detail: "Up to 4K, lossless transparency" },
];

const checkerStyle = {
  backgroundImage:
    "linear-gradient(45deg,var(--color-secondary) 25%,transparent 25%),linear-gradient(-45deg,var(--color-secondary) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--color-secondary) 75%),linear-gradient(-45deg,transparent 75%,var(--color-secondary) 75%)",
  backgroundSize: "22px 22px",
  backgroundPosition: "0 0,0 11px,11px -11px,-11px 0",
};

// Custom client-side Canvas Alpha Matting Engine (Zero external dependencies)
export const removeBackgroundClientCanvas = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(imageSrc);

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample background colors along outer boundary
      let bgR = 0, bgG = 0, bgB = 0, samples = 0;
      const width = canvas.width;
      const height = canvas.height;

      for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 20))) {
        const idx1 = (0 * width + x) * 4;
        const idx2 = ((height - 1) * width + x) * 4;
        bgR += (data[idx1] ?? 0) + (data[idx2] ?? 0);
        bgG += (data[idx1 + 1] ?? 0) + (data[idx2 + 1] ?? 0);
        bgB += (data[idx1 + 2] ?? 0) + (data[idx2 + 2] ?? 0);
        samples += 2;
      }

      for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 20))) {
        const idx1 = (y * width + 0) * 4;
        const idx2 = (y * width + (width - 1)) * 4;
        bgR += (data[idx1] ?? 0) + (data[idx2] ?? 0);
        bgG += (data[idx1 + 1] ?? 0) + (data[idx2 + 1] ?? 0);
        bgB += (data[idx1 + 2] ?? 0) + (data[idx2 + 2] ?? 0);
        samples += 2;
      }

      bgR = Math.round(bgR / Math.max(1, samples));
      bgG = Math.round(bgG / Math.max(1, samples));
      bgB = Math.round(bgB / Math.max(1, samples));

      // Alpha matting with edge feathering and precision color distance
      const threshold = 38;
      const softBand = 28;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;

        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < threshold) {
          data[i + 3] = 0; // Transparent cutout
        } else if (dist < threshold + softBand) {
          const alphaRatio = (dist - threshold) / softBand;
          data[i + 3] = Math.round(alphaRatio * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

export function RemovalProcess() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [step, setStep] = useState<number>(0);
  const [model, setModel] = useState<string>("karudi");
  const [processing, setProcessing] = useState<boolean>(false);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [bgType, setBgType] = useState<"checker" | "white" | "black">("checker");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showDynamicIsland, setShowDynamicIsland] = useState<boolean>(false);
  const [showCutoutEditor, setShowCutoutEditor] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Island scroll listener
  useEffect(() => {
    if (!hasProcessed) {
      setShowDynamicIsland(false);
      return;
    }
    const handleScroll = () => {
      setShowDynamicIsland(window.scrollY > 180);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasProcessed]);

  const progress = processing
    ? Math.min(95, Math.round(((step + 1) / steps.length) * 100))
    : hasProcessed
      ? 100
      : 0;

  const handleSelectFile = (file: File) => {
    if (AuthUser.isUserRestricted()) {
      window.dispatchEvent(new CustomEvent("bg:show_restricted_dialog"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setBeforeImage(b64);
      setAfterImage(null);
      setFileName(file.name);
      setHasProcessed(false);
      setProcessing(false);
      setStep(0);
      setDuration(null);
      toast.success("Image uploaded! Click image or 'Remove Background' to process.");
    };
    reader.readAsDataURL(file);
  };

  const startRemovalProcess = async () => {
    if (AuthUser.isUserRestricted()) {
      window.dispatchEvent(new CustomEvent("bg:show_restricted_dialog"));
      return;
    }
    if (!beforeImage || processing) return;

    setProcessing(true);
    setHasProcessed(false);
    setAfterImage(null);
    setStep(0);

    const startTime = performance.now();

    // Step 0: Uploading image
    await new Promise((r) => setTimeout(r, 320));
    setStep(1); // Detecting subject
    await new Promise((r) => setTimeout(r, 380));
    setStep(2); // Refining edges
    await new Promise((r) => setTimeout(r, 400));
    setStep(3); // Rebuilding alpha
    await new Promise((r) => setTimeout(r, 350));
    setStep(4); // Exporting PNG

    let outputResult = "";

    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: beforeImage,
          model,
          smoothEdge: 0.0,
        }),
      });
      const data = await res.json();
      if (data.success && data.base64Image) {
        outputResult = data.base64Image;
      } else {
        throw new Error(data.error || "AI background removal failed. Please check server.");
      }
    } catch (err: any) {
      console.error("AI removal error:", err);
      toast.error(err.message || "Failed to remove background with AI. Please try again.");
      setProcessing(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 250));
    const endTime = performance.now();
    const finalSec = parseFloat(((endTime - startTime) / 1000).toFixed(2));

    setAfterImage(outputResult);
    setDuration(finalSec);
    setStep(steps.length);
    setProcessing(false);
    setHasProcessed(true);

    // Telemetry & credit deduction tracking
    import("@/lib/telemetry").then(({ Telemetry }) => {
      Telemetry.trackToolUsage("remove-background", "Background Remover");
    });
    import("@/admin/lib/admin-store").then(({ AdminStore }) => {
      AdminStore.recordToolDailyUsage("remove-background");
      const cost = AdminStore.getToolCreditCost("remove-background");
      import("@/lib/auth-user").then(({ AuthUser }) => {
        AuthUser.deductCredit(cost);
      });
    });

    toast.success("Background removed cleanly with AI!");
  };

  const handleDownload = () => {
    if (!afterImage) return;
    const a = document.createElement("a");
    a.href = afterImage;
    a.download = fileName ? `bg_removed_${fileName.replace(/\.[^.]+$/, "")}.png` : "bg_removed_transparent.png";
    a.click();
    toast.success("Background removed PNG downloaded!");
  };

  const handleReset = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setFileName("");
    setHasProcessed(false);
    setProcessing(false);
    setStep(0);
    setDuration(null);
  };

  return (
    <div className="w-full">
      {/* ── TOP DYNAMIC ISLAND FLOATING BAR (Animated on Scroll) ─────── */}
      {hasProcessed && (
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
                {afterImage || beforeImage ? (
                  <img
                    src={afterImage || beforeImage || undefined}
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
                  {fileName || "Background Removed"}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 leading-tight">
                  PNG Cutout
                </span>
              </div>
            </div>

            {/* 2. Edit Cutout Button */}
            <button
              type="button"
              onClick={() => setShowCutoutEditor(true)}
              className="wobbly-btn flex items-center gap-2 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="Edit cutout with remove brush, restore brush, and magic brush"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </button>

            {/* 3. Primary Large Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="wobbly-btn flex items-center gap-2.5 rounded-full bg-white text-black hover:bg-neutral-100 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="h-5 w-5 text-amber-500 shrink-0" />
              <span>Download PNG</span>
            </button>

            {/* 3. Upload Another File (Icon Only Button) */}
            <button
              type="button"
              onClick={handleReset}
              className="wobbly-btn flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black hover:scale-105 active:scale-90 transition-all shadow-md cursor-pointer"
              title="Process another File"
              aria-label="Process another File"
            >
              <FolderUp className="h-5 w-5 text-white" />
            </button>
          </aside>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelectFile(file);
        }}
      />

      {!beforeImage ? (
        /* Standalone Centered Drag & Drop Upload Zone (Matching All Tools) */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleSelectFile(dropped);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`group cursor-pointer flex flex-col items-center justify-center text-center rounded-3xl border-3 border-dashed px-8 py-24 sm:py-32 w-full transition-all duration-300 ${
            isDragging
              ? "border-accent bg-accent/10 scale-[1.01] shadow-2xl"
              : "border-border bg-card/60 hover:border-foreground hover:bg-card shadow-lg"
          }`}
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl transition-all group-hover:scale-110">
            <Upload className="h-10 w-10" />
            <span className="absolute -inset-1 rounded-3xl bg-foreground/20 blur-lg animate-pulse" />
          </div>

          <h2 className="mt-8 font-display text-3xl font-extrabold md:text-4xl">
            Select File or Drag & Drop Image Here
          </h2>

          <p className="mt-3 max-w-md text-sm font-semibold text-muted-foreground md:text-base">
            Accepts <span className="font-extrabold text-foreground">Any image</span> · Returns{" "}
            <span className="font-extrabold text-foreground">Transparent PNG</span>
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-10 py-5 text-base font-extrabold text-background shadow-2xl transition-all group-hover:scale-105">
            Select Image File <span aria-hidden>→</span>
          </div>

          <p className="mt-4 text-xs font-bold text-muted-foreground">
            🔒 Secure server-side AI processing · Up to 4K resolution
          </p>
        </div>
      ) : (
        /* Active Workspace: Image Preview (Left) + Settings Panel (Right) */
        <div className="grid items-start gap-8 lg:grid-cols-[1.8fr_1fr] w-full">
          {/* Left Column: Canvas Preview Area */}
          <div className="flex flex-col gap-3 w-full">
            {/* Top Canvas Header Bar */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {hasProcessed ? "Cutout Result" : "Uploaded Image"}
                </span>
                {fileName && (
                  <span className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs font-medium text-foreground max-w-[200px] truncate">
                    {fileName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasProcessed && (
                  <>
                    <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setBgType("checker")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          bgType === "checker" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Checker
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgType("white")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          bgType === "white" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        White
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgType("black")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          bgType === "black" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Black
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCutoutEditor(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-secondary cursor-pointer shadow-xs"
                      title="Edit cutout with remove brush, restore brush, and magic brush"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" /> Edit Cutout
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Change Image
                </button>
              </div>
            </div>

            {/* Main Visual Canvas Frame */}
            <div
              className="group relative flex h-[540px] sm:h-[620px] md:h-[680px] lg:h-[720px] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-border bg-card transition-all shadow-xl select-none"
              style={hasProcessed && bgType === "checker" ? checkerStyle : { backgroundColor: bgType === "black" ? "#0a0a0c" : bgType === "white" ? "#ffffff" : undefined }}
            >
              {/* Loaded Image Display */}
              {beforeImage && (!hasProcessed || showOriginal) ? (
                <img
                  src={beforeImage}
                  alt="Original uploaded"
                  className="max-h-full max-w-full object-contain p-6 md:p-8 transition-opacity duration-300"
                />
              ) : null}

              {/* Background Removed Cutout Display */}
              {hasProcessed && afterImage && !showOriginal ? (
                <img
                  src={afterImage}
                  alt="Cutout PNG"
                  className="max-h-full max-w-full object-contain p-6 md:p-8 transition-opacity duration-300"
                />
              ) : null}

              {/* Scanning Laser Sweep Animation during processing */}
              {processing ? (
                <>
                  <span className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-full z-10" />
                  <span className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-dashed border-accent/80 animate-pulse z-10" />
                </>
              ) : null}

              {/* Bottom Status / Duration Pill */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2.5 rounded-full bg-card/95 px-5 py-2.5 text-xs md:text-sm font-bold backdrop-blur shadow-md border border-border z-20">
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span>{steps[step]?.label || "Processing"}…</span>
                  </>
                ) : hasProcessed ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>Background removed · {duration || 0.8}s</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Image ready</span>
                  </>
                )}
              </div>

              {/* Bottom Right Actions on Canvas (Edit + Download) */}
              {hasProcessed && afterImage && !processing ? (
                <div className="absolute bottom-6 right-6 flex items-center gap-2.5 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCutoutEditor(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-foreground/30 bg-background/90 backdrop-blur-md px-5 py-3 text-xs md:text-sm font-extrabold text-foreground shadow-xl transition-all hover:scale-105 hover:bg-foreground hover:text-background cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" /> Edit Cutout
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs md:text-sm font-extrabold text-background shadow-xl transition-all hover:scale-105 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download PNG →
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Column: Pipeline & Settings Control Panel */}
          <div className="rounded-3xl border-2 border-border bg-card p-6 md:p-8 shadow-md flex flex-col justify-between min-h-[540px] sm:min-h-[620px] md:min-h-[680px] lg:min-h-[720px] lg:sticky lg:top-6">
            <div>
              <div className="flex items-center justify-between text-xs md:text-sm font-bold text-foreground">
                <span>Pipeline Status</span>
                <span className="text-accent-foreground font-mono text-sm">{progress}%</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ol className="mt-7 space-y-4">
                {steps.map((s, i) => {
                  const isStepDone = hasProcessed || (processing && i < step);
                  const isStepActive = processing && i === step;
                  return (
                    <li key={s.label} className="flex items-start gap-4">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all duration-300 ${
                          isStepDone
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                            : isStepActive
                              ? "border-accent bg-accent text-accent-foreground animate-pulse scale-110 shadow-md"
                              : "border-border text-muted-foreground bg-secondary/40"
                        }`}
                      >
                        {isStepDone ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : i + 1}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-bold transition-colors ${
                            isStepDone || isStepActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {s.label}
                          {isStepActive ? <span className="dot-ellipsis" /> : null}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Select AI Model Engine
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bgModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={processing}
                    onClick={() => setModel(m.id)}
                    className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
                      model === m.id
                        ? "border-foreground bg-foreground text-background shadow-md"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {!hasProcessed && !processing ? (
                  <button
                    type="button"
                    onClick={startRemovalProcess}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm md:text-base font-extrabold text-background shadow-xl transition-all hover:scale-105 hover:shadow-accent/30"
                  >
                    <Sparkles className="h-5 w-5 text-amber-400" /> Remove Background Now →
                  </button>
                ) : processing ? (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-secondary px-8 py-4 text-sm md:text-base font-extrabold text-muted-foreground cursor-not-allowed"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" /> Processing AI Pipeline…
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCutoutEditor(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-4 text-xs md:text-sm font-extrabold text-foreground shadow-lg transition-all hover:scale-105 hover:bg-foreground hover:text-background cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-4 text-xs md:text-sm font-extrabold text-background shadow-xl transition-all hover:scale-105 cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-4 py-4 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Another
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Cutout Editor Modal (Remove Brush, Restore Brush, Magic Brush) */}
      {showCutoutEditor && beforeImage && afterImage && (
        <CutoutBrushEditorModal
          originalImageSrc={beforeImage}
          cutoutImageSrc={afterImage}
          filename={fileName || "cutout.png"}
          onClose={() => setShowCutoutEditor(false)}
          onSave={(newCutoutSrc) => {
            setAfterImage(newCutoutSrc);
          }}
          onDownload={(newCutoutSrc, fname) => {
            const a = document.createElement("a");
            a.href = newCutoutSrc;
            a.download = fname;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success(`Downloaded ${fname}`);
          }}
        />
      )}
    </div>
  );
}
