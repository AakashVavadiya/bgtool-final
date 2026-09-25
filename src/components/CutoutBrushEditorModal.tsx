import { useState, useRef, useEffect, useCallback } from "react";
import {
  Eraser,
  Paintbrush,
  Wand2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export interface CutoutBrushEditorModalProps {
  originalImageSrc: string; // beforeImage (needed to restore original pixels)
  cutoutImageSrc: string;   // afterImage (current transparent cutout)
  filename?: string;
  onClose: () => void;
  onSave: (newCutoutSrc: string) => void;
  onDownload?: (newCutoutSrc: string, filename: string) => void;
}

type ToolMode = "erase" | "restore" | "magic";

export function CutoutBrushEditorModal({
  originalImageSrc,
  cutoutImageSrc,
  filename = "cutout.png",
  onClose,
  onSave,
  onDownload,
}: CutoutBrushEditorModalProps) {
  const [activeTool, setActiveTool] = useState<ToolMode>("erase");
  const [brushSize, setBrushSize] = useState<number>(32);
  const [magicTolerance, setMagicTolerance] = useState<number>(32);
  const [contiguousOnly, setContiguousOnly] = useState<boolean>(true);
  const [bgPreview, setBgPreview] = useState<"checker" | "white" | "black" | "green">("checker");
  const [zoom, setZoom] = useState<number>(1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Mouse cursor indicator
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // History stack for undo/redo
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const maxHistory = 20;

  // Push state to history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(imgData);
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch (e) {
      console.error("Failed to push history", e);
    }
  }, []);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    historyIndexRef.current -= 1;
    const imgData = historyRef.current[historyIndexRef.current];
    if (imgData) {
      ctx.putImageData(imgData, 0, 0);
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    historyIndexRef.current += 1;
    const imgData = historyRef.current[historyIndexRef.current];
    if (imgData) {
      ctx.putImageData(imgData, 0, 0);
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Reset to initial cutout
  const handleResetToCutout = () => {
    if (historyRef.current.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const initial = historyRef.current[0];
      if (initial) {
        ctx.putImageData(initial, 0, 0);
        pushHistory();
        toast.info("Reset to initial cutout.");
      }
    }
  };

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, onClose]);

  // Initialize Canvas with Cutout and Preload Original
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load original image in background
    const origImg = new Image();
    origImg.crossOrigin = "anonymous";
    origImg.src = originalImageSrc;
    origImg.onload = () => {
      originalImgRef.current = origImg;
    };

    // Load cutout onto canvas
    const cutoutImg = new Image();
    cutoutImg.crossOrigin = "anonymous";
    cutoutImg.src = cutoutImageSrc;
    cutoutImg.onload = () => {
      canvas.width = cutoutImg.width;
      canvas.height = cutoutImg.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cutoutImg, 0, 0);

      // Record first snapshot
      historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    };
  }, [cutoutImageSrc, originalImageSrc]);

  // Coordinate conversion helper (Client -> Canvas Pixel)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // 1. DRAW BRUSH (Erase or Restore)
  const drawBrushLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = brushSize / 2;

    if (activeTool === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Circle at endpoint
      ctx.beginPath();
      ctx.arc(to.x, to.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (activeTool === "restore" && originalImgRef.current) {
      const orig = originalImgRef.current;
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(to.x, to.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Clip to brush path and draw original image pixels back
      ctx.clip();
      ctx.drawImage(orig, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  // 2. MAGIC BRUSH: ONE-CLICK REMOVE PART / COLOR
  const handleMagicClick = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const pxX = Math.floor(startX);
    const pxY = Math.floor(startY);

    if (pxX < 0 || pxX >= width || pxY < 0 || pxY >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const startIdx = (pxY * width + pxX) * 4;
    const targetR = data[startIdx] ?? 0;
    const targetG = data[startIdx + 1] ?? 0;
    const targetB = data[startIdx + 2] ?? 0;
    const targetA = data[startIdx + 3] ?? 0;

    // Already transparent -> nothing to remove
    if (targetA === 0) {
      toast.info("This area is already transparent.");
      return;
    }

    const tolerance = magicTolerance * 2.5; // Scale tolerance (0-250)

    if (contiguousOnly) {
      // Fast Flood-Fill (BFS) with typed array visited map
      const visited = new Uint8Array(width * height);
      const queue: number[] = [pxX, pxY];
      visited[pxY * width + pxX] = 1;

      while (queue.length > 0) {
        const curY = queue.pop()!;
        const curX = queue.pop()!;
        const idx = (curY * width + curX) * 4;

        // Erase pixel
        data[idx + 3] = 0;

        // Check 4-connected neighbors
        const neighbors = [
          [curX + 1, curY],
          [curX - 1, curY],
          [curX, curY + 1],
          [curX, curY - 1],
        ];

        for (let i = 0; i < 4; i++) {
          const nx = neighbors[i]![0]!;
          const ny = neighbors[i]![1]!;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const pos = ny * width + nx;
            if (!visited[pos]) {
              visited[pos] = 1;
              const nIdx = pos * 4;
              const nA = data[nIdx + 3]!;
              if (nA > 0) {
                const nR = data[nIdx]!;
                const nG = data[nIdx + 1]!;
                const nB = data[nIdx + 2]!;

                const dr = nR - targetR;
                const dg = nG - targetG;
                const db = nB - targetB;
                const dist = Math.sqrt(dr * dr + dg * dg + db * db);

                if (dist <= tolerance) {
                  queue.push(nx, ny);
                }
              }
            }
          }
        }
      }
    } else {
      // Global Color Match Removal across the entire image
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3]! > 0) {
          const dr = data[i]! - targetR;
          const dg = data[i + 1]! - targetG;
          const db = data[i + 2]! - targetB;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist <= tolerance) {
            data[i + 3] = 0;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    pushHistory();
    toast.success("Magic Brush removed selected part!");
  };

  // Pointer event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === "magic") {
      handleMagicClick(coords.x, coords.y);
      return;
    }

    isDrawingRef.current = true;
    lastPosRef.current = coords;
    drawBrushLine(coords, coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Update cursor indicator position
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });

    if (!isDrawingRef.current || !lastPosRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    drawBrushLine(lastPosRef.current, coords);
    lastPosRef.current = coords;
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      pushHistory();
    }
  };

  const handleMouseLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      pushHistory();
    }
  };

  // Save changes
  const handleSaveAndApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newSrc = canvas.toDataURL("image/png");
    onSave(newSrc);
    toast.success("Cutout edits applied successfully!");
    onClose();
  };

  // Download directly
  const handleDirectDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newSrc = canvas.toDataURL("image/png");
    if (onDownload) {
      onDownload(newSrc, filename.replace(/\.[^.]+$/, "") + "_edited.png");
    } else {
      const a = document.createElement("a");
      a.href = newSrc;
      a.download = filename.replace(/\.[^.]+$/, "") + "_edited.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloaded edited PNG!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="flex flex-col h-full max-h-[96vh] w-full max-w-6xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* ─── 1. TOP HEADER TOOLBAR ─────────────────────────────────── */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-background/80 px-4 sm:px-6 py-3 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background font-bold shadow-md">
              <Paintbrush className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm sm:text-base text-foreground leading-tight">
                Refine Cutout Editor
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                Erase brush · Restore original · Magic one-click clean
              </p>
            </div>
          </div>

          {/* Action buttons: Undo, Redo, Reset, Save, Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
              <button
                type="button"
                disabled={!canUndo}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-lg text-foreground hover:bg-muted disabled:opacity-40 transition-all cursor-pointer"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!canRedo}
                onClick={handleRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-lg text-foreground hover:bg-muted disabled:opacity-40 transition-all cursor-pointer"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToCutout}
              title="Reset to initial cutout"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>

            <button
              type="button"
              onClick={handleDirectDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-foreground text-background text-xs font-extrabold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <Check className="h-4 w-4 text-emerald-400" /> Save & Apply
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Close editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ─── 2. MAIN WORKSPACE: CANVAS + LEFT TOOLBAR ──────────────── */}
        <div className="flex flex-1 min-h-0 relative overflow-hidden bg-neutral-950/20">
          {/* LEFT FLOATING DOCK: TOOLS */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-2 shadow-2xl">
            {/* Tool 1: Erase Brush */}
            <button
              type="button"
              onClick={() => setActiveTool("erase")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTool === "erase"
                  ? "bg-foreground text-background shadow-md scale-102"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Remove Brush — Brush over areas to erase them transparent"
            >
              <Eraser className="h-4 w-4" />
              <span>Remove Brush</span>
            </button>

            {/* Tool 2: Restore Brush */}
            <button
              type="button"
              onClick={() => setActiveTool("restore")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTool === "restore"
                  ? "bg-foreground text-background shadow-md scale-102"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Restore Brush — Paint back parts from original photo"
            >
              <Paintbrush className="h-4 w-4 text-amber-500" />
              <span>Restore Brush</span>
            </button>

            {/* Tool 3: Magic Brush */}
            <button
              type="button"
              onClick={() => setActiveTool("magic")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTool === "magic"
                  ? "bg-foreground text-background shadow-md scale-102"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title="Magic Brush — Click any color/part to remove it in one click"
            >
              <Wand2 className="h-4 w-4 text-cyan-400" />
              <span>Magic Brush</span>
            </button>

            <div className="h-px bg-border/60 my-1" />

            {/* Tool Controls depending on Active Tool */}
            {activeTool !== "magic" ? (
              <div className="px-1 py-1 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-foreground">Brush Size</span>
                  <span className="font-mono text-muted-foreground font-bold">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="120"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-1.5 accent-primary bg-muted rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <div className="px-1 py-1 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-foreground">Magic Tolerance</span>
                  <span className="font-mono text-muted-foreground font-bold">{magicTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={magicTolerance}
                  onChange={(e) => setMagicTolerance(Number(e.target.value))}
                  className="w-full h-1.5 accent-cyan-400 bg-muted rounded-lg cursor-pointer"
                />

                <label className="flex items-center gap-2 text-[11px] font-semibold text-foreground cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={contiguousOnly}
                    onChange={(e) => setContiguousOnly(e.target.checked)}
                    className="rounded accent-cyan-400 cursor-pointer"
                  />
                  <span>Contiguous area</span>
                </label>
              </div>
            )}
          </div>

          {/* RIGHT FLOATING DOCK: BACKDROP PREVIEW & ZOOM */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-1.5 shadow-2xl">
            {/* Background preview modes */}
            <button
              type="button"
              onClick={() => setBgPreview("checker")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bgPreview === "checker" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Checkerboard transparent preview"
            >
              Checker
            </button>
            <button
              type="button"
              onClick={() => setBgPreview("white")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bgPreview === "white" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              title="White backdrop preview"
            >
              White
            </button>
            <button
              type="button"
              onClick={() => setBgPreview("black")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bgPreview === "black" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Black backdrop preview"
            >
              Black
            </button>
            <button
              type="button"
              onClick={() => setBgPreview("green")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bgPreview === "green" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Chroma Green backdrop preview"
            >
              Green
            </button>

            <div className="w-px h-4 bg-border/60 mx-1" />

            {/* Zoom Controls */}
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs font-bold text-foreground px-1">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* ─── CANVAS SCROLL CONTAINER ──────────────────────────────── */}
          <div
            ref={containerRef}
            className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-6 sm:p-12 relative cursor-crosshair"
            style={{
              backgroundColor:
                bgPreview === "white"
                  ? "#ffffff"
                  : bgPreview === "black"
                  ? "#0a0a0c"
                  : bgPreview === "green"
                  ? "#00ff33"
                  : undefined,
              backgroundImage:
                bgPreview === "checker"
                  ? "linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.08) 75%)"
                  : undefined,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            <div
              className="relative shadow-2xl rounded-lg transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="max-h-[72vh] max-w-[85vw] object-contain rounded-lg block"
              />

              {/* Dynamic Brush Size Ring Cursor */}
              {cursorPos.visible && activeTool !== "magic" && (
                <div
                  className="pointer-events-none absolute rounded-full border-2 border-white/80 shadow-[0_0_8px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    width: `${brushSize}px`,
                    height: `${brushSize}px`,
                    backgroundColor:
                      activeTool === "erase"
                        ? "rgba(239, 68, 68, 0.2)"
                        : "rgba(245, 158, 11, 0.2)",
                  }}
                />
              )}

              {/* Magic Wand cursor indicator */}
              {cursorPos.visible && activeTool === "magic" && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-cyan-500/30 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  style={{
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 3. BOTTOM FOOTER BAR WITH HELPFUL TIP ────────────────── */}
        <footer className="border-t border-border/70 bg-card px-6 py-2.5 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {activeTool === "erase"
                ? "Remove Brush active: Drag to erase unwanted leftover background."
                : activeTool === "restore"
                ? "Restore Brush active: Drag to restore details or edges from the original photo."
                : "Magic Brush active: Click on any background artifact or halo color to remove it in one click."}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium">
            <span>Shortcuts: Ctrl+Z (Undo) · Ctrl+Y (Redo)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
