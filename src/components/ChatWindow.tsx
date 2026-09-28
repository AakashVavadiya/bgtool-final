import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import {
  Scissors,
  RefreshCw,
  Wand2,
  BookOpen,
  Crown,
  Download,
  UploadCloud,
  CheckCircle2,
  Loader2,
  FileText,
  FileImage,
  Palette,
  ArrowUp,
  ArrowRight,
  Plus,
  Paperclip,
  Mic,
  Brain,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Lock,
  Binary,
  Scaling,
  RotateCw,
  Square,
  Archive,
  ArrowDownToLine,
  FileSpreadsheet,
  ScanText,
  Image as ImageIcon,
  Globe,
} from "lucide-react";
import karudiKLogo from "@/assets/karudi-k-logo.png";
import { SingleImageBgRemovalWidget } from "@/components/SingleImageBgRemovalWidget";
import { KarudiAvatar } from "@/components/KarudiAvatar";
import {
  acceptedChatFiles,
  karudiModels,
  getStoredTier,
  setStoredTier,
  type KarudiTier,
} from "@/lib/krishna";
import { titleFrom, upsertThread, newId, type ChatThread } from "@/lib/chat-threads";
import { notifyThreadsChanged } from "@/hooks/use-threads";
import { TypewriterMessage } from "@/components/TypewriterMessage";
import { MessageFeedbackToolbar } from "@/components/MessageFeedbackToolbar";
import { AuthUser } from "@/lib/auth-user";
import { Telemetry } from "@/lib/telemetry";
import {
  SUB_MODELS,
  analyzeKarudiIntent,
  executeRemoveBackground,
  executeCompositeBackground,
  executeImageToWord,
  executeImageToExcel,
  executeImageToPdf,
  executePdfToImages,
  executeConvertImageFormat,
  executeImageToBinary,
  executeAnalyzeImage,
  executeResizeImage,
  executeCompressImage,
  executeRotateImage,
  executeSquareImage,
  type SubModelId,
  type KarudiActionType,
} from "@/lib/karudi-agent";

// ============================================================================
// Interactive Task Types
// ============================================================================
export interface InlineTaskState {
  id: string;
  userPrompt: string;
  action: KarudiActionType;
  primaryModel: SubModelId;
  secondaryModel?: SubModelId | undefined;
  toolName: string;
  status: "waiting_file" | "processing" | "done" | "error";
  progressMessage: string;
  error?: string | undefined;
  originalImageSrc?: string | undefined;
  originalFilename?: string | undefined;
  resultImageSrc?: string | undefined;
  resultDocxBlob?: Blob | undefined;
  resultDocxFilename?: string | undefined;
  resultXlsxBlob?: Blob | undefined;
  resultXlsxFilename?: string | undefined;
  resultPdfBlob?: Blob | undefined;
  resultPdfFilename?: string | undefined;
  resultBinaryText?: string | undefined;
  resultBinaryPreview?: string | undefined;
  resultBinaryBlob?: Blob | undefined;
  resultBinaryFilename?: string | undefined;
  resultRawBinBlob?: Blob | undefined;
  resultRawBinFilename?: string | undefined;
  totalBinaryBytes?: number | undefined;
  totalBinaryBits?: number | undefined;
  extractedText?: string | undefined;
  currentBgType?: ("transparent" | "white" | "black" | "blue" | "blur" | "custom") | undefined;
  customColor?: string | undefined;
  selectedFormat?: string | undefined;
  targetWidth?: number | undefined;
  targetHeight?: number | undefined;
  originalWidth?: number | undefined;
  originalHeight?: number | undefined;
  compressedSize?: number | undefined;
  originalSize?: number | undefined;
  rotationDegrees?: number | undefined;
  turnIndex?: number | undefined;
  analysisPalette?: string[] | undefined;
  analysisDimensions?: string | undefined;
  analysisAspectRatio?: string | undefined;
  analysisBytes?: number | undefined;
  uploadedFileType?: "pdf" | "image" | "docx" | "other" | undefined;
  uploadedFile?: { name: string; size: number; dataUrl: string } | undefined;
  completionMessage?: string | undefined;
}

export const WORK_DONE_MESSAGES: readonly string[] = [
  "Done — your file is ready.",
  "Done — your document is ready.",
  "Done — processing complete.",
];

export function getWorkDoneMessage(actionOrId?: string): string {
  if (!actionOrId) return "Done — your file is ready.";
  if (actionOrId === "image_to_pdf") return "Done — your PDF is ready.";
  if (actionOrId === "jpg_to_word" || actionOrId === "pdf_to_word") return "Done — your Word document is ready.";
  if (actionOrId === "jpg_to_excel" || actionOrId === "pdf_to_excel") return "Done — your Excel spreadsheet is ready.";
  if (actionOrId === "pdf_to_image") return "Done — your images are ready.";
  if (actionOrId === "remove_background") return "Done — background removed.";
  if (actionOrId === "compress_image") return "Done — your file is compressed.";
  if (actionOrId === "resize_image") return "Done — your image is resized.";
  if (actionOrId === "rotate_image") return "Done — your rotated image is ready.";
  if (actionOrId === "square_image") return "Done — your square image is ready.";
  if (actionOrId === "convert_format") return "Done — your converted image is ready.";
  if (actionOrId === "image_to_binary") return "Done — your binary file is ready.";
  if (actionOrId === "analyze_image") return "Done — color palette analysis complete.";
  return "Done — your file is ready.";
}

export function getProcessedFileInfo(
  task: InlineTaskState,
  fallbackFilename: string | null,
  downloadBlob: (blob: Blob, name: string) => void,
  downloadDataUrl: (url: string, name: string) => void
) {
  const baseName =
    task.originalFilename?.replace(/\.[^.]+$/, "") ||
    task.uploadedFile?.name?.replace(/\.[^.]+$/, "") ||
    fallbackFilename?.replace(/\.[^.]+$/, "") ||
    "file";

  switch (task.action) {
    case "image_to_pdf": {
      const filename = task.resultPdfFilename || `${baseName}.pdf`;
      return {
        filename,
        subtitle: "Open file • PDF Document",
        fileType: "pdf" as const,
        onDownload: () => {
          if (task.resultPdfBlob) downloadBlob(task.resultPdfBlob, filename);
        },
      };
    }
    case "jpg_to_word":
    case "pdf_to_word": {
      const filename = task.resultDocxFilename || `${baseName}.docx`;
      return {
        filename,
        subtitle: "Open file • Word Document (.docx)",
        fileType: "word" as const,
        onDownload: () => {
          if (task.resultDocxBlob) downloadBlob(task.resultDocxBlob, filename);
        },
      };
    }
    case "jpg_to_excel":
    case "pdf_to_excel": {
      const filename = task.resultXlsxFilename || `${baseName}.xlsx`;
      return {
        filename,
        subtitle: "Open file • Excel Spreadsheet (.xlsx)",
        fileType: "excel" as const,
        onDownload: () => {
          if (task.resultXlsxBlob) downloadBlob(task.resultXlsxBlob, filename);
        },
      };
    }
    case "remove_background": {
      const filename = `${baseName}_cutout.png`;
      return {
        filename,
        subtitle: "Open file • PNG Cutout",
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "compress_image": {
      const filename = `${baseName}_compressed.jpg`;
      const sizeStr = task.compressedSize
        ? `${(task.compressedSize / 1024).toFixed(1)} KB`
        : "Compressed JPG";
      return {
        filename,
        subtitle: `Open file • ${sizeStr}`,
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "resize_image": {
      const filename = `${baseName}_${task.targetWidth || 1000}x${task.targetHeight || 1000}.png`;
      return {
        filename,
        subtitle: `Open file • ${task.targetWidth || 1000}×${task.targetHeight || 1000} px`,
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "rotate_image": {
      const filename = `${baseName}_rotated.png`;
      return {
        filename,
        subtitle: `Open file • Rotated ${task.rotationDegrees || 90}°`,
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "square_image": {
      const filename = `${baseName}_square.png`;
      return {
        filename,
        subtitle: "Open file • 1:1 Square Image",
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "convert_format":
    case "pdf_to_image": {
      const ext = task.selectedFormat || "jpg";
      const filename = `${baseName}.${ext}`;
      return {
        filename,
        subtitle: `Open file • ${ext.toUpperCase()} Image`,
        fileType: "image" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
    case "image_to_binary": {
      const filename = task.resultBinaryFilename || `${baseName}_binary.txt`;
      return {
        filename,
        subtitle: "Open file • Binary Bitstream (.txt)",
        fileType: "binary" as const,
        onDownload: () => {
          if (task.resultBinaryBlob) downloadBlob(task.resultBinaryBlob, filename);
        },
      };
    }
    default: {
      const filename = `${baseName}.file`;
      return {
        filename,
        subtitle: "Open file",
        fileType: "file" as const,
        onDownload: () => {
          if (task.resultImageSrc) downloadDataUrl(task.resultImageSrc, filename);
        },
      };
    }
  }
}

const AVAILABLE_MODELS = [
  {
    id: "karudi-prime",
    name: "Karudi 1.0 Prime",
    desc: "Flagship master orchestrator for complex workflows",
    icon: Crown,
    useLogo: true,
    iconColor: "text-blue-500",
    bgClass: "bg-blue-500/10 border border-blue-500/20 text-blue-500",
    tier: "prime-1.0" as KarudiTier,
    selectable: true,
  },
  {
    id: "ganga-matting",
    name: "Ganga 1.0",
    desc: "Specialized sub-pixel alpha matting & background cutout",
    icon: Scissors,
    useLogo: false,
    iconColor: "text-emerald-500",
    bgClass: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500",
    tier: "ganga-matting" as KarudiTier,
    selectable: false,
    badge: "Auto-Managed",
  },
  {
    id: "brahmaputra-transcode",
    name: "Brahmaputra 1.0",
    desc: "Universal PDF, Word (.docx) & format transcoding",
    icon: FileText,
    useLogo: false,
    iconColor: "text-purple-500",
    bgClass: "bg-purple-500/10 border border-purple-500/20 text-purple-500",
    tier: "brahmaputra-transcode" as KarudiTier,
    selectable: false,
    badge: "Auto-Managed",
  },
  {
    id: "narmada-vision",
    name: "Narmada 1.0",
    desc: "Multilingual OCR & neural document intelligence",
    icon: ScanText,
    useLogo: false,
    iconColor: "text-cyan-500",
    bgClass: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-500",
    tier: "narmada-vision" as KarudiTier,
    selectable: false,
    badge: "Auto-Managed",
  },
  {
    id: "saraswati-deep",
    name: "Saraswati 1.0",
    desc: "Deep research, palette analysis & knowledge synthesis",
    icon: BookOpen,
    useLogo: false,
    iconColor: "text-amber-500",
    bgClass: "bg-amber-500/10 border border-amber-500/20 text-amber-500",
    tier: "saraswati-deep" as KarudiTier,
    selectable: false,
    badge: "Auto-Managed",
  },
];

function InlineAttachmentThumbnail({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="relative group/thumb inline-flex items-center justify-center rounded-xl overflow-hidden border border-border/70 bg-card/60 shadow-xs">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-13 w-13 md:h-14 md:w-14 object-cover rounded-xl"
        />
      ) : (
        <div className="flex h-13 w-13 md:h-14 md:w-14 flex-col items-center justify-center p-1 bg-muted/40 text-center">
          <FileText className="h-5 w-5 text-muted-foreground mb-0.5" />
          <span className="text-[10px] font-semibold text-foreground/80 truncate max-w-[50px]">
            {file.name.split(".").pop()?.toUpperCase()}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white opacity-80 md:opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-black text-[10px] leading-none"
        title="Remove attachment"
      >
        ✕
      </button>
    </div>
  );
}

export function ChatWindow({ thread }: { thread: ChatThread }) {
  const [currentTier, setCurrentTier] = useState<KarudiTier>("prime-1.0");
  const [selectedModelName, setSelectedModelName] = useState("Karudi 1.0 Prime");
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedModelName("Karudi 1.0 Prime");
    setCurrentTier("prime-1.0");
    setStoredTier("prime-1.0");
  }, []);

  const activeModelInfo = karudiModels.find((m) => m.id === currentTier) || karudiModels[0];

  useEffect(() => {
    if (!isModelPickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setIsModelPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModelPickerOpen]);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Input & Attachments state
  const [inputText, setInputText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);

  // Active Session Assets & Map of UserMsgId -> InlineTaskState
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(null);
  const [activeCutoutSrc, setActiveCutoutSrc] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string>("image.png");
  const [taskMap, setTaskMap] = useState<Record<string, InlineTaskState>>({});
  const [selectedCustomColor, setSelectedCustomColor] = useState<string>("#3b82f6");
  const [regeneratingMsgId, setRegeneratingMsgId] = useState<string | null>(null);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: m, id }) => ({
        body: { messages: m, tier: currentTier, id, isThinking: isThinkingEnabled },
      }),
    }),
    onError: (err) => toast.error(err.message || "Karudi could not reply."),
  });

  const handleRegenerateMessage = async (targetMsgId: string) => {
    if (isBusy || regeneratingMsgId) return;

    const targetIndex = messages.findIndex((m) => m.id === targetMsgId);
    if (targetIndex === -1) return;

    // The conversation up to this specific assistant response (up to the user query that triggered it)
    const conversationUpToTurn = messages.slice(0, targetIndex);
    if (conversationUpToTurn.length === 0) return;

    setRegeneratingMsgId(targetMsgId);
    toast.info("Regenerating answer…");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationUpToTurn,
          tier: currentTier,
          id: thread.id,
          isThinking: isThinkingEnabled,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Failed to regenerate: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      // Initialize target message with empty text to allow typewriter / streaming to start fresh
      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetMsgId
            ? {
                ...m,
                parts: [{ type: "text", text: "" }],
              }
            : m
        )
      );

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
              accumulatedText += parsed.delta;
              const currentText = accumulatedText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === targetMsgId
                    ? {
                        ...m,
                        parts: [{ type: "text", text: currentText }],
                      }
                    : m
                )
              );
            }
          } catch {
            // Non-JSON or streaming protocol line
          }
        }
      }

      if (accumulatedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === targetMsgId
              ? {
                  ...m,
                  parts: [{ type: "text", text: accumulatedText }],
                }
              : m
          )
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to regenerate answer.");
    } finally {
      setRegeneratingMsgId(null);
    }
  };

  const handleBranchInNewChat = (targetMsgId: string) => {
    const targetIndex = messages.findIndex((m) => m.id === targetMsgId);
    if (targetIndex === -1) return;
    const subMessages = messages.slice(0, targetIndex + 1);
    const newThreadId = newId();
    upsertThread({
      id: newThreadId,
      title: `${titleFrom(subMessages as UIMessage[])} (Branch)`,
      updatedAt: Date.now(),
      tier: currentTier,
      messages: subMessages as UIMessage[],
    });
    notifyThreadsChanged();
    toast.success("Branched into a new chat!");
    window.location.href = `/chat/${newThreadId}`;
  };

  const isBusy = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, taskMap, status]);

  // Persist this thread whenever its messages settle
  useEffect(() => {
    if (messages.length === 0) return;
    upsertThread({
      id: thread.id,
      title: titleFrom(messages as UIMessage[]),
      updatedAt: Date.now(),
      tier: currentTier,
      messages: messages as UIMessage[],
    });
    notifyThreadsChanged();
  }, [messages, status, thread.id]);

  useEffect(() => {
    taRef.current?.focus();
    setTaskMap({});
    setActiveImageSrc(null);
    setActiveCutoutSrc(null);
    setActiveFilename("image.png");
  }, [thread.id]);

  // Handler for quick actions triggered from sidebar or empty state
  const handleTriggerQuickWorkflow = (actionType: "remove_bg" | "convert_files" | "analyze_image") => {
    let userPrompt = "Remove background";
    let assistantReply = "Please upload or share the image you want me to remove the background from.";

    if (actionType === "convert_files") {
      userPrompt = "Convert files";
      assistantReply = "Sure! What would you like to convert? Please upload or share your file (PDF, Word, or Image).";
    } else if (actionType === "analyze_image") {
      userPrompt = "Analyze image";
      assistantReply = "Please upload or share the image you want to inspect for dominant colors, palette, and metadata.";
    }

    const userMsg: UIMessage = {
      id: "u_" + Date.now(),
      role: "user",
      parts: [{ type: "text", text: userPrompt }],
    };
    const assistantMsg: UIMessage = {
      id: "a_" + (Date.now() + 1),
      role: "assistant",
      parts: [{ type: "text", text: assistantReply }],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  useEffect(() => {
    const onChatAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: "remove_bg" | "convert_files" | "analyze_image" }>;
      if (customEvent.detail?.action) {
        handleTriggerQuickWorkflow(customEvent.detail.action);
      }
    };
    window.addEventListener("karudi:chat_action", onChatAction);
    return () => window.removeEventListener("karudi:chat_action", onChatAction);
  }, [messages.length]);

  // Convert File to Data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert Base64 Data URL to Blob
  const dataUrlToBlob = (dataUrl: string): Blob => {
    try {
      const parts = dataUrl.split(";base64,");
      const contentType = parts[0]?.replace("data:", "") || "application/octet-stream";
      const raw = window.atob(parts[1] || "");
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch {
      return new Blob([], { type: "application/octet-stream" });
    }
  };

  // Download helper for data URLs
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded ${filename}`);
  };

  // Download helper for Blobs (DOCX, etc.)
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // --------------------------------------------------------------------------
  // Execute Task Action
  // --------------------------------------------------------------------------
  const executeTaskAction = async (
    msgId: string,
    action: KarudiActionType,
    imageSrc: string,
    filename: string,
    options?: {
      targetFormat?: ("image/jpeg" | "image/png" | "image/webp") | undefined;
      targetWidth?: number | undefined;
      targetHeight?: number | undefined;
      targetKb?: number | undefined;
      rotationDegrees?: number | undefined;
      watermarkText?: string | undefined;
    }
  ) => {
    try {
      Telemetry.trackToolUsage(action, action.replace(/_/g, " "));
    } catch {
      /* ignore */
    }

    // 1. BACKGROUND REMOVAL (Ganga Model)
    if (action === "remove_background") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "remove_background",
          toolName: "Background Removal",
          primaryModel: "ganga",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Removing background, please wait some time...",
        },
      }));

      try {
        const res = await executeRemoveBackground(imageSrc);
        setActiveCutoutSrc(res.cutoutSrc);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "remove_background",
            toolName: "Background Removal",
            primaryModel: "ganga",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: res.cutoutSrc,
            currentBgType: "transparent",
            completionMessage: "Done — background removed.",
            progressMessage: "Background removed successfully.",
          },
        }));
        toast.success("Background removed successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Background removal failed",
          },
        }));
        toast.error("Failed to remove background.");
      }
      return;
    }

    // 2. JPG TO WORD (Narmada + Brahmaputra)
    if (action === "jpg_to_word") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "jpg_to_word",
          toolName: "Image to Word (.docx) Converter",
          primaryModel: "narmada",
          secondaryModel: "brahmaputra",
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Narmada is extracting text via neural OCR… Brahmaputra is compiling Word (.docx)…",
        },
      }));

      try {
        const res = await executeImageToWord(imageSrc, filename);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "jpg_to_word",
            toolName: "Image to Word (.docx) Converter",
            primaryModel: "narmada",
            secondaryModel: "brahmaputra",
            status: "done",
            resultDocxBlob: res.docxBlob,
            resultDocxFilename: filename.replace(/\.[^.]+$/, "") + ".docx",
            extractedText: res.textSnippet,
            completionMessage: "Done — your Word document is ready.",
            progressMessage: "Narmada (OCR) and Brahmaputra (DOCX) compiled your Word document.",
          },
        }));
        toast.success("Word document generated successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Word conversion failed",
          },
        }));
        toast.error("Failed to convert image to Word.");
      }
      return;
    }

    // 2b. JPG OR PDF TO EXCEL (Narmada + Brahmaputra)
    if (action === "jpg_to_excel" || action === "pdf_to_excel") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "jpg_to_excel",
          toolName: "Image to Excel (.xlsx) Converter",
          primaryModel: "narmada",
          secondaryModel: "brahmaputra",
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Narmada is scanning tables via OCR… Brahmaputra is compiling Excel (.xlsx) spreadsheet…",
        },
      }));

      try {
        const res = await executeImageToExcel(imageSrc, filename.replace(/\.[^.]+$/, ""));
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "jpg_to_excel",
            toolName: "Image to Excel (.xlsx) Converter",
            primaryModel: "narmada",
            secondaryModel: "brahmaputra",
            status: "done",
            resultXlsxBlob: res.xlsxBlob,
            resultXlsxFilename: `${filename.replace(/\.[^.]+$/, "")}-converted.xlsx`,
            extractedText: res.textSnippet,
            completionMessage: "Done — your Excel spreadsheet is ready.",
            progressMessage: `Generated editable Excel spreadsheet (${res.rowCount} rows extracted).`,
          },
        }));
        toast.success("Excel spreadsheet generated successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Excel conversion failed",
          },
        }));
        toast.error("Failed to convert to Excel.");
      }
      return;
    }

    // 3. IMAGE TO PDF (Brahmaputra Model)
    if (action === "image_to_pdf") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "image_to_pdf",
          toolName: "Image to PDF Converter",
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Brahmaputra model is transcoding your image into a standard PDF document…",
        },
      }));

      try {
        const res = await executeImageToPdf(imageSrc, filename);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "image_to_pdf",
            toolName: "Image to PDF Converter",
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultPdfBlob: res.pdfBlob,
            resultPdfFilename: res.filename,
            completionMessage: "Done — your PDF is ready.",
            progressMessage: "Brahmaputra compiled your authentic PDF document.",
          },
        }));
        toast.success("PDF document generated successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "PDF conversion failed",
          },
        }));
        toast.error("Failed to convert image to PDF.");
      }
      return;
    }

    // 4. PDF TO IMAGE (Brahmaputra)
    if (action === "pdf_to_image") {
      const task = taskMap[msgId];
      const userPrompt = ((task?.userPrompt || "") + " " + inputText).toLowerCase();
      const isPngRequested = userPrompt.includes("png") && !userPrompt.includes("jpg") && !userPrompt.includes("jpeg");
      const isWebpRequested = userPrompt.includes("webp");
      const targetMime: "image/jpeg" | "image/png" | "image/webp" = isPngRequested
        ? "image/png"
        : isWebpRequested
        ? "image/webp"
        : "image/jpeg";
      const targetExt: "jpg" | "png" | "webp" = isPngRequested ? "png" : isWebpRequested ? "webp" : "jpg";

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "pdf_to_image",
          toolName: "PDF to Image Converter",
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          selectedFormat: targetExt,
          progressMessage: `Brahmaputra engine is parsing PDF and rendering high-resolution ${targetExt.toUpperCase()} images…`,
        },
      }));

      try {
        const res = await executePdfToImages(imageSrc, filename, 2.0, targetMime);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "pdf_to_image",
            toolName: "PDF to Image Converter",
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: res.firstImage,
            selectedFormat: res.format,
            completionMessage: `Done — your ${res.format.toUpperCase()} images are ready.`,
            progressMessage: `Brahmaputra extracted and rendered ${res.totalPages} page(s) from your PDF in ${res.format.toUpperCase()} format.`,
          },
        }));
        toast.success(`PDF converted to ${res.format.toUpperCase()} successfully!`);
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "PDF to Image conversion failed",
          },
        }));
        toast.error(`Failed to convert PDF to ${targetExt.toUpperCase()}.`);
      }
      return;
    }

    // 5. PDF TO WORD (.DOCX) (Brahmaputra + Narmada)
    if (action === "pdf_to_word") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "pdf_to_word",
          toolName: "PDF to Word (.docx) Converter",
          primaryModel: "brahmaputra",
          secondaryModel: "narmada",
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Brahmaputra is parsing PDF… Narmada is running neural OCR to compile Word (.docx)…",
        },
      }));

      try {
        const pdfRes = await executePdfToImages(imageSrc, filename);
        const firstPageImg = pdfRes.firstImage;
        const res = await executeImageToWord(firstPageImg, filename.replace(/\.[^.]+$/, ""));
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "pdf_to_word",
            toolName: "PDF to Word (.docx) Converter",
            primaryModel: "brahmaputra",
            secondaryModel: "narmada",
            status: "done",
            resultDocxBlob: res.docxBlob,
            resultDocxFilename: filename.replace(/\.[^.]+$/, "") + ".docx",
            extractedText: res.textSnippet,
            completionMessage: "Done — your Word document is ready.",
            progressMessage: "Brahmaputra and Narmada compiled your PDF into an editable Word (.docx) document.",
          },
        }));
        toast.success("PDF converted to Word (.docx) successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "PDF to Word conversion failed",
          },
        }));
        toast.error("Failed to convert PDF to Word.");
      }
      return;
    }

    // 6. ANALYZE IMAGE (Saraswati Model)
    if (action === "analyze_image") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Saraswati is inspecting chromatic composition, dominant palette & metadata…",
        },
      }));

      try {
        const res = await executeAnalyzeImage(imageSrc, filename);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "done",
            originalImageSrc: imageSrc,
            originalFilename: filename,
            analysisPalette: res.palette,
            analysisDimensions: res.dimensions,
            analysisAspectRatio: res.aspectRatio,
            analysisBytes: res.approxBytes,
            progressMessage: "Saraswati completed deep image analysis and dominant palette extraction.",
          },
        }));
        toast.success("Image analysis completed by Saraswati!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Image analysis failed",
          },
        }));
        toast.error("Failed to analyze image.");
      }
      return;
    }

    // 7. FORMAT CONVERSION (JPG / PNG / WebP) (Brahmaputra)
    if (action === "convert_format") {
      const task = taskMap[msgId];
      const combinedText = ((task?.userPrompt || "") + " " + (task?.selectedFormat || "") + " " + inputText).toLowerCase();

      let targetMime: "image/jpeg" | "image/png" | "image/webp" = options?.targetFormat || "image/jpeg";
      if (!options?.targetFormat) {
        const targetMatch = combinedText.match(/(?:to|into|->|2|as)\s*(jpg|jpeg|png|webp)/i);
        if (targetMatch && targetMatch[1]) {
          const t = targetMatch[1].toLowerCase();
          targetMime = t === "png" ? "image/png" : t === "webp" ? "image/webp" : "image/jpeg";
        } else if (/\bpng\b/i.test(combinedText) && !/\bjpg\b/i.test(combinedText) && !/\bjpeg\b/i.test(combinedText)) {
          targetMime = "image/png";
        } else if (/\bwebp\b/i.test(combinedText)) {
          targetMime = "image/webp";
        } else {
          targetMime = "image/jpeg";
        }
      }

      const targetExt: "jpg" | "png" | "webp" = targetMime === "image/png" ? "png" : targetMime === "image/webp" ? "webp" : "jpg";

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "convert_format",
          toolName: `Image to ${targetExt.toUpperCase()} Converter`,
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          selectedFormat: targetExt,
          progressMessage: `Brahmaputra engine is converting image to high-quality ${targetExt.toUpperCase()} format…`,
        },
      }));

      try {
        const res = await executeConvertImageFormat(imageSrc, filename, targetMime);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "convert_format",
            toolName: `Image to ${targetExt.toUpperCase()} Converter`,
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: res.dataUrl,
            selectedFormat: res.format,
            completionMessage: `Done — your ${targetExt.toUpperCase()} image is ready.`,
            progressMessage: `Brahmaputra transcoded image into crisp ${targetExt.toUpperCase()} format.`,
          },
        }));
        toast.success(`Image converted to ${targetExt.toUpperCase()} successfully!`);
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Format conversion failed",
          },
        }));
        toast.error(`Failed to convert image to ${targetExt.toUpperCase()}.`);
      }
      return;
    }

    // 8. IMAGE TO BINARY (.TXT FILE) (Brahmaputra)
    if (action === "image_to_binary") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "image_to_binary",
          toolName: "Image to Binary (.txt) Generator",
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Brahmaputra engine is encoding image bytes into 8-bit binary bitstream (.txt)…",
        },
      }));

      try {
        const res = await executeImageToBinary(imageSrc, filename);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "image_to_binary",
            toolName: "Image to Binary (.txt) Generator",
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultBinaryText: res.binaryText,
            resultBinaryPreview: res.previewText,
            resultBinaryBlob: res.textBlob,
            resultBinaryFilename: res.txtFilename,
            resultRawBinBlob: res.binBlob,
            resultRawBinFilename: res.binFilename,
            totalBinaryBytes: res.totalBytes,
            totalBinaryBits: res.totalBits,
            completionMessage: "Done — your binary file is ready.",
            progressMessage: `Brahmaputra generated binary bitstream (${res.totalBytes.toLocaleString()} bytes / ${res.totalBits.toLocaleString()} bits) ready for download.`,
          },
        }));
        toast.success("Binary (.txt) file generated successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Binary generation failed",
          },
        }));
        toast.error("Failed to generate binary file.");
      }
      return;
    }

    // 9. RESIZE IMAGE (Brahmaputra)
    if (action === "resize_image") {
      const task = taskMap[msgId];
      const targetW = options?.targetWidth || task?.targetWidth || 1000;
      const targetH = options?.targetHeight || task?.targetHeight || 1000;

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "resize_image",
          toolName: `Resize Image (${targetW} × ${targetH} px)`,
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          targetWidth: targetW,
          targetHeight: targetH,
          progressMessage: `Brahmaputra engine is scaling your image to ${targetW} × ${targetH} px…`,
        },
      }));

      try {
        const res = await executeResizeImage(imageSrc, targetW, targetH);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "resize_image",
            toolName: `Resize Image (${res.width} × ${res.height} px)`,
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: res.dataUrl,
            targetWidth: res.width,
            targetHeight: res.height,
            originalWidth: res.originalWidth,
            originalHeight: res.originalHeight,
            completionMessage: `Done — image resized to ${res.width} × ${res.height} px.`,
            progressMessage: `Brahmaputra scaled your image to ${res.width} × ${res.height} px with high fidelity.`,
          },
        }));
        toast.success(`Image resized to ${res.width} × ${res.height} px!`);
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Image resize failed",
          },
        }));
        toast.error("Failed to resize image.");
      }
      return;
    }

    // 10. COMPRESS IMAGE (Brahmaputra)
    if (action === "compress_image") {
      const task = taskMap[msgId];
      const targetKb = options?.targetKb || task?.compressedSize;

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "compress_image",
          toolName: "Image Compressor",
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Brahmaputra is compressing image while preserving optimal visual clarity…",
        },
      }));

      try {
        const res = await executeCompressImage(imageSrc, 0.75, targetKb);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "compress_image",
            toolName: "Image Compressor",
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: res.dataUrl,
            originalSize: res.originalBytes,
            compressedSize: res.compressedBytes,
            completionMessage: "Done — your file is compressed.",
            progressMessage: `Brahmaputra reduced size from ${(res.originalBytes / 1024).toFixed(1)} KB to ${(res.compressedBytes / 1024).toFixed(1)} KB (${Math.round((1 - res.compressedBytes / res.originalBytes) * 100)}% smaller).`,
          },
        }));
        toast.success("Image compressed successfully!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Image compression failed",
          },
        }));
        toast.error("Failed to compress image.");
      }
      return;
    }

    // 11. ROTATE IMAGE (Brahmaputra)
    if (action === "rotate_image") {
      const task = taskMap[msgId];
      const deg = options?.rotationDegrees || task?.rotationDegrees || 90;

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "rotate_image",
          toolName: `Rotate Image (${deg}°)`,
          primaryModel: "brahmaputra",
          secondaryModel: undefined,
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: `Brahmaputra is rotating canvas by ${deg}°…`,
        },
      }));

      try {
        const resUrl = await executeRotateImage(imageSrc, deg);
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "rotate_image",
            toolName: `Rotate Image (${deg}°)`,
            primaryModel: "brahmaputra",
            secondaryModel: undefined,
            status: "done",
            resultImageSrc: resUrl,
            rotationDegrees: deg,
            completionMessage: `Done — image rotated by ${deg}°.`,
            progressMessage: `Brahmaputra rotated image by ${deg}°.`,
          },
        }));
        toast.success(`Image rotated ${deg}°!`);
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Rotation failed",
          },
        }));
        toast.error("Failed to rotate image.");
      }
      return;
    }

    // 12. SQUARE IMAGE (Brahmaputra + Ganga)
    if (action === "square_image") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          action: "square_image",
          toolName: "Square Your Image (1:1 Tool)",
          primaryModel: "brahmaputra",
          secondaryModel: "ganga",
          status: "processing",
          originalImageSrc: imageSrc,
          originalFilename: filename,
          progressMessage: "Brahmaputra is formatting image into 1:1 square canvas with dynamic padding…",
        },
      }));

      try {
        const resUrl = await executeSquareImage(imageSrc, "blur");
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            action: "square_image",
            toolName: "Square Your Image (1:1 Tool)",
            primaryModel: "brahmaputra",
            secondaryModel: "ganga",
            status: "done",
            resultImageSrc: resUrl,
            currentBgType: "blur",
            completionMessage: "Done — your square image is ready.",
            progressMessage: "Brahmaputra generated 1:1 square image ready for export.",
          },
        }));
        toast.success("Image formatted into 1:1 square!");
      } catch (err) {
        setTaskMap((prev) => ({
          ...prev,
          [msgId]: {
            ...prev[msgId]!,
            status: "error",
            error: (err as Error).message || "Square formatting failed",
          },
        }));
        toast.error("Failed to make image square.");
      }
      return;
    }
  };

  // --------------------------------------------------------------------------
  // Apply Background Staging
  // --------------------------------------------------------------------------
  const handleApplyBackground = async (
    msgId: string,
    bgType: "transparent" | "white" | "black" | "blue" | "blur" | "custom",
    colorHex = "#3b82f6"
  ) => {
    const task = taskMap[msgId];
    if (!task || !activeCutoutSrc) {
      toast.error("No cutout available to stage.");
      return;
    }

    if (bgType === "transparent") {
      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          resultImageSrc: activeCutoutSrc,
          currentBgType: "transparent",
          progressMessage: "Ganga model restored original transparent cutout.",
        },
      }));
      return;
    }

    const hex =
      bgType === "white"
        ? "#ffffff"
        : bgType === "black"
        ? "#000000"
        : bgType === "blue"
        ? "#2563eb"
        : colorHex;

    const actualBgType = bgType === "blur" ? "blur" : "color";

    setTaskMap((prev) => ({
      ...prev,
      [msgId]: {
        ...prev[msgId]!,
        status: "processing",
        progressMessage: `Ganga and Brahmaputra are staging your cutout onto a ${bgType} background…`,
      },
    }));

    try {
      const composited = await executeCompositeBackground(
        activeCutoutSrc,
        actualBgType,
        hex,
        task.originalImageSrc || activeImageSrc || undefined
      );

      setTaskMap((prev) => ({
        ...prev,
        [msgId]: {
          ...prev[msgId]!,
          status: "done",
          resultImageSrc: composited,
          currentBgType: bgType,
          customColor: hex,
          progressMessage: `Staged with ${bgType} background by Ganga & Brahmaputra.`,
        },
      }));
      toast.success(`Background updated to ${bgType}!`);
    } catch {
      toast.error("Failed to composite background.");
    }
  };

  // --------------------------------------------------------------------------
  // Handle Submit from Floating ChatGPT Input Pill
  // --------------------------------------------------------------------------
  const handleSendMessage = async (customPrompt?: string) => {
    if (AuthUser.isUserRestricted()) {
      window.dispatchEvent(new CustomEvent("bg:show_restricted_dialog"));
      toast.error("You cannot use Bg. because you have violated our terms and conditions.");
      return;
    }

    const text = (customPrompt ?? inputText).trim();
    const filesToUpload = [...attachedFiles];

    if (!text && filesToUpload.length === 0) return;

    // Reset input fields
    setInputText("");
    setAttachedFiles([]);

    let currentImg = activeImageSrc;
    let currentFileName = activeFilename;

    const uiFiles = await Promise.all(
      filesToUpload.map(async (f) => {
        const dataUrl = await fileToDataUrl(f);
        if (
          f.type.startsWith("image/") ||
          f.type === "application/pdf" ||
          f.name.toLowerCase().endsWith(".pdf")
        ) {
          currentImg = dataUrl;
          currentFileName = f.name;
          setActiveImageSrc(dataUrl);
          setActiveFilename(f.name);
        }
        return {
          type: "file" as const,
          mediaType: f.type || "application/octet-stream",
          filename: f.name,
          url: dataUrl,
        };
      })
    );

    // If user starts an explicit tool command like "convert" without attaching a file,
    // reset active file state so we NEVER auto-select older files from past turns!
    const isExplicitToolCommand =
      /^(convert|convt|cnvrt|convert\s*file|convert\s*files|remove\s*bg|remove\s*background|bg\s*removal|analyze\s*image)$/i.test(
        text.trim()
      );

    if (isExplicitToolCommand && filesToUpload.length === 0) {
      currentImg = null;
      currentFileName = "image.png";
      setActiveImageSrc(null);
      setActiveFilename("image.png");
    } else if (!currentImg && filesToUpload.length === 0) {
      // Only recover past file if user is replying with a conversational format choice, conversion request, or binary request
      const isFormatChoice =
        /^(jpg|jpeg|png|webp|word|docx|doc|pdf|binary|bin|base64|to\s*jpg|to\s*png|to\s*word|to\s*pdf|to\s*binary)$/i.test(text.trim()) ||
        /(png|jpg|jpeg|webp|img|image|photo)\s*(to|into|->|2|as)\s*(jpg|jpeg|png|webp|pdf|word|docx|binary|bin|base64|txt)/i.test(text.trim()) ||
        /(convert|transcode|change|save|export|give|get|make|generate)\s*(this|the|my)?\s*(img|image|photo|png|jpg|webp|file)?\s*(to|into|->|2|as)?\s*(jpg|jpeg|png|webp|pdf|word|docx|binary|bin|base64|txt)/i.test(text.trim()) ||
        /binary\s*(file|txt|text|data|export|bitstream)?/i.test(text.trim()) ||
        /give\s*(me)?\s*(a|the)?\s*binary/i.test(text.trim()) ||
        /convert\s*(to\s*)?(jpg|jpeg|png|webp|pdf|word|docx|binary|bin|base64)/i.test(text.trim());
      if (isFormatChoice) {
        if (activeCutoutSrc) {
          currentImg = activeCutoutSrc;
          currentFileName = activeFilename.replace(/\.[^.]+$/, "") + "_cutout.png";
          setActiveImageSrc(currentImg);
          setActiveFilename(currentFileName);
        } else {
          for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (!m || !m.parts) continue;
            const toolPart = m.parts.find((p: any) =>
              (p.type === "custom" && p.providerMetadata?.karudi?.toolInvocation?.state === "result") ||
              (p.type === "tool-invocation" && p.toolInvocation?.state === "result")
            ) as any;
            const invocation = toolPart?.toolInvocation || toolPart?.providerMetadata?.karudi?.toolInvocation;
            if (invocation?.result?.resultImageSrc) {
              currentImg = invocation.result.resultImageSrc;
              currentFileName = invocation.result.filename || "cutout.png";
              setActiveImageSrc(currentImg);
              setActiveFilename(currentFileName);
              break;
            }
            const filePart = m.parts.find((p: any) => p.type === "file" && (p as any).url);
            if (filePart && (filePart as any).url) {
              currentImg = (filePart as any).url;
              currentFileName = (filePart as any).filename || currentFileName;
              setActiveImageSrc(currentImg);
              setActiveFilename(currentFileName);
              break;
            }
          }
        }
      }
    }

    const trimmed = text.trim().toLowerCase();

    // Check if user is explicitly requesting another action or correcting a previous action
    const isExplicitOtherAction =
      /\b(excel|xlsx|xls|spreadsheet|sheet|excl|word|docx|doc|pdf|resize|compress|rotate|square|convert|format|binary)\b/i.test(trimmed) ||
      /^(no|wait|actually|rather|instead)\b/i.test(trimmed) ||
      /\b(no\s*i\s*need|no\s*i\s*want|actually\s*i\s*need|instead\s*of)\b/i.test(trimmed);

    const isStandaloneBgWord =
      !isExplicitOtherAction &&
      /^(remove|remov|rmv|cutout|cut\s*out|transparent|erase|isolate|remove\s*it|remove\s*this|remove\s*bg|remove\s*background)$/i.test(trimmed);

    // Background removal intent is ONLY true if user explicitly asks for it in THIS message and is NOT asking for another tool
    const isBgRemovalIntent =
      !isExplicitOtherAction &&
      (
        isStandaloneBgWord ||
        /(remov|erase|cut\s*out|isolat)\s*(the\s*)?(background|bg)/i.test(trimmed) ||
        /\b(background|bg)\s*(removal|remover|cutout|remove|erase)\b/i.test(trimmed) ||
        /(bg|background)\s*(hata\s*do|hatao|nikal\s*do)/i.test(trimmed)
      );

    const isExplicitActionCommand =
      isBgRemovalIntent ||
      isExplicitOtherAction ||
      /(remov|erase|cut\s*out|isolat)\s*(the\s*)?(background|bg)/i.test(trimmed) ||
      /\b(resize|crop|rotate|flip|compress|upscale|watermark|blur\s*face|square|meme|photo\s*editor|color\s*picker)\b/i.test(trimmed) ||
      /(\d+)\s*[xX×]\s*(\d+)/.test(trimmed) ||
      /(pdf\s*(to|into|->|2)\s*(img|image|images|jpg|jpeg|png|webp|word|docx|excel|xlsx))/i.test(trimmed) ||
      /((jpg|jpeg|png|webp|img|image|photo)\s*(to|into|->|2)\s*(pdf|word|docx|jpg|jpeg|png|webp|excel|xlsx|pptx))/i.test(trimmed) ||
      /((excel|xlsx|csv|powerpoint|pptx)\s*(to|into|->|2)\s*(img|image|images|png|jpg))/i.test(trimmed) ||
      /(convert|transcode|change)\s*(this|the|my)?\s*(img|image|photo|png|jpg|webp)?\s*(to|into|->|2|as)\s*(jpg|jpeg|png|webp|excel|xlsx|pdf|word)/i.test(trimmed) ||
      /(image|img|photo|file)\s*(to|into|->|2|as)\s*(binary|bin|base64|hex|octal|decimal|ascii|txt|excel|xlsx)/i.test(trimmed) ||
      /(binary|base64|hex|octal|decimal|ascii)\s*(to|into|->|2|as)\s*(image|img|png|jpg)/i.test(trimmed) ||
      /binary\s*(file|txt|text)?/i.test(trimmed) ||
      /give\s*(me)?\s*(a|the)?\s*binary/i.test(trimmed) ||
      /^(to\s*pdf|to\s*word|to\s*docx|to\s*jpg|to\s*png|to\s*webp|to\s*binary|to\s*excel|in\s*excel)$/i.test(trimmed);

    // NEVER default an image upload to remove background!
    let effectiveText = text.trim();
    if (!effectiveText && filesToUpload.length > 0) {
      effectiveText = "convert";
    }

    // Capture the index of the user message being dispatched right now
    const currentUserMsgIndex = messages.length;

    // Use our fuzzy-matching intent analyzer with effective text
    const plan = analyzeKarudiIntent(effectiveText || text, filesToUpload.length > 0, {
      activeImageSrc: currentImg || undefined,
      activeCutoutSrc: activeCutoutSrc || undefined,
      activeFilename: currentFileName,
      pendingAction: isBgRemovalIntent ? "remove_background" : undefined,
    });

    // Generate deterministic client turn ID for binding inline tool widgets
    const turnKey = "turn_" + Date.now();

    const isActionableTool =
      plan.action === "remove_background" ||
      plan.action === "resize_image" ||
      plan.action === "compress_image" ||
      plan.action === "square_image" ||
      plan.action === "rotate_image" ||
      plan.action === "crop_image" ||
      plan.action === "jpg_to_word" ||
      plan.action === "pdf_to_word" ||
      plan.action === "jpg_to_excel" ||
      plan.action === "pdf_to_excel" ||
      plan.action === "image_to_pdf" ||
      plan.action === "pdf_to_image" ||
      plan.action === "convert_format" ||
      plan.action === "image_to_binary" ||
      plan.action === "analyze_image";

    if (
      (isActionableTool || plan.action === "convert_file_general") &&
      !plan.needsFile &&
      currentImg
    ) {
      if (plan.action === "convert_file_general") {
        const isPdf = currentFileName.toLowerCase().endsWith(".pdf") || (currentImg && currentImg.startsWith("data:application/pdf"));
        const isDocx = currentFileName.toLowerCase().endsWith(".docx") || (currentImg && currentImg.startsWith("data:application/vnd.openxmlformats-officedocument"));
        const fileType: "pdf" | "docx" | "image" = isPdf ? "pdf" : isDocx ? "docx" : "image";
        setTaskMap((prev) => ({
          ...prev,
          [turnKey]: {
            id: turnKey,
            userPrompt: effectiveText || text || currentFileName,
            action: "convert_file_general",
            primaryModel: isPdf ? "brahmaputra" : isDocx ? "brahmaputra" : "ganga",
            secondaryModel: isPdf ? "narmada" : isDocx ? "narmada" : "brahmaputra",
            toolName: isPdf ? "PDF Conversion Suite" : isDocx ? "Word Document Suite" : "Image Processing Suite",
            status: "waiting_file",
            progressMessage: isPdf
              ? "PDF ready! Select a conversion action below or type your desired format (e.g. JPG, Word)."
              : isDocx
              ? "Word document ready! Select a conversion action below."
              : "Image ready! Select an action below (Convert to PDF, Word, or Remove Background).",
            originalImageSrc: currentImg || undefined,
            originalFilename: currentFileName,
            uploadedFile: {
              name: currentFileName,
              size: filesToUpload[0]?.size || 1024 * 50,
              type: isPdf ? "application/pdf" : isDocx ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : (filesToUpload[0]?.type || "image/png"),
              dataUrl: currentImg!,
            },
            uploadedFileType: fileType,
            turnIndex: currentUserMsgIndex,
          },
        }));
      } else {
        const targetExt = plan.stageOptions?.targetFormat === "image/png" ? "png" : plan.stageOptions?.targetFormat === "image/webp" ? "webp" : "jpg";
        setTaskMap((prev) => ({
          ...prev,
          [turnKey]: {
            id: turnKey,
            userPrompt: effectiveText || text,
            action: plan.action,
            primaryModel: plan.primaryModel,
            secondaryModel: plan.secondaryModel,
            toolName: plan.toolName,
            status: "processing",
            progressMessage: plan.summaryMessage,
            originalImageSrc: currentImg || undefined,
            originalFilename: currentFileName,
            selectedFormat: targetExt,
            targetWidth: plan.stageOptions?.targetWidth,
            targetHeight: plan.stageOptions?.targetHeight,
            rotationDegrees: plan.stageOptions?.rotationDegrees,
            turnIndex: currentUserMsgIndex,
          },
        }));

        // Execute immediately!
        void executeTaskAction(
          turnKey,
          plan.action,
          currentImg,
          currentFileName,
          plan.stageOptions
        );
      }
    } else if (plan.action === "add_background_color" && activeCutoutSrc) {
      // Find latest removal task
      const taskKeys = Object.keys(taskMap);
      const latestKey = taskKeys[taskKeys.length - 1];
      if (latestKey) {
        const bgType =
          plan.stageOptions?.bgType === "blur"
            ? "blur"
            : plan.stageOptions?.color === "#ffffff"
            ? "white"
            : plan.stageOptions?.color === "#000000"
            ? "black"
            : "custom";
        void handleApplyBackground(latestKey, bgType, plan.stageOptions?.color || "#3b82f6");
      }
    }

    // Send to /api/chat so assistant replies with markdown explanation
    void sendMessage({ text: text || effectiveText, files: uiFiles });
  };

  // Sub-model metadata icon
  const getSubModelIcon = (modelId: SubModelId) => {
    switch (modelId) {
      case "ganga":
        return <Scissors className="h-4 w-4" />;
      case "brahmaputra":
        return <RefreshCw className="h-4 w-4" />;
      case "narmada":
        return <Wand2 className="h-4 w-4" />;
      case "saraswati":
        return <BookOpen className="h-4 w-4" />;
      case "karudi":
      default:
        return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background text-foreground relative">


      {/* ---------------------------------------------------------------------- */}
      {/* CONVERSATION STREAM (True message-by-message chronological flow)       */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-7">
          {/* ChatGPT Style Empty State: "Where should we begin?" (As in user screenshot 2) */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-16 md:pt-24 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-card border border-border/80 shadow-md">
                <KarudiAvatar size="lg" />
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Where should we begin?
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-md">
                Karudi 1.0 Prime coordinates Ganga, Brahmaputra, Narmada, and Saraswati sub-models.
              </p>

              {/* Quick suggestion cards (Like ChatGPT screenshot 2) */}
              <div className="mt-8 grid w-full max-w-xl grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <button
                  type="button"
                  onClick={() => handleTriggerQuickWorkflow("remove_bg")}
                  className="flex flex-col p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-all hover:scale-[1.02] text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                    <Scissors className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>Ganga Model</span>
                  </div>
                  <span className="font-extrabold text-sm text-foreground mt-1">Remove background</span>
                  <span className="text-xs text-muted-foreground mt-0.5">1-click alpha matting & cutout</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerQuickWorkflow("convert_files")}
                  className="flex flex-col p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-all hover:scale-[1.02] text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-purple-500 font-bold text-xs">
                    <RefreshCw className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>Brahmaputra Model</span>
                  </div>
                  <span className="font-extrabold text-sm text-foreground mt-1">Convert Files</span>
                  <span className="text-xs text-muted-foreground mt-0.5">PDF, Word (.docx), JPG, PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerQuickWorkflow("convert_files")}
                  className="flex flex-col p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-all hover:scale-[1.02] text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                    <Wand2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>File Converter</span>
                  </div>
                  <span className="font-extrabold text-sm text-foreground mt-1">PDF to Images / Word</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Universal media transcoding</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerQuickWorkflow("analyze_image")}
                  className="flex flex-col p-4 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-all hover:scale-[1.02] text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                    <BookOpen className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>Saraswati Suite</span>
                  </div>
                  <span className="font-extrabold text-sm text-foreground mt-1">Analyze Image</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Palette extraction & metadata</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Render Messages chronologically, with inline tool cards IN THE EXACT MESSAGE TURN */}
          {messages.map((m, idx) => {
            const isUser = m.role === "user";

            // Find task associated strictly with this turn (attached to user turn at idx - 1)
            let task: InlineTaskState | null = null;
            if (!isUser) {
              task =
                Object.values(taskMap).find((t) => t.turnIndex === idx - 1) ||
                Object.values(taskMap).find((t) => t.id === m.id) ||
                null;

              // Check for real LLM tool-call results delivered via AI SDK UI message stream
              if (!task && m.parts) {
                const toolResultPart = m.parts.find(
                  (p: any) =>
                    (p.type === "tool-invocation" && p.toolInvocation?.state === "result") ||
                    (p.type === "custom" && p.providerMetadata?.karudi?.toolInvocation?.state === "result")
                ) as any;

                const invocation =
                  toolResultPart?.toolInvocation ||
                  toolResultPart?.providerMetadata?.karudi?.toolInvocation;
                if (invocation?.result) {
                  const res = invocation.result;
                  const toolName = invocation.toolName || "tool";
                  if (res.success !== false) {
                    const actionName = (res.action || res.tool || toolName) as KarudiActionType;
                    task = {
                      id: m.id,
                      userPrompt: "",
                      action: actionName,
                      primaryModel: "brahmaputra",
                      toolName: res.tool || toolName.replace(/_/g, " "),
                      status: "done",
                      progressMessage: res.message || "Operation completed successfully.",
                      resultImageSrc: res.resultImageSrc,
                      resultPdfBlob: res.resultPdfDataUrl ? dataUrlToBlob(res.resultPdfDataUrl) : undefined,
                      resultPdfFilename: res.filename || "document.pdf",
                      targetWidth: res.width,
                      targetHeight: res.height,
                      compressedSize: res.compressedSize || res.bytes,
                      rotationDegrees: res.rotationDegrees,
                      completionMessage: res.message,
                      selectedFormat: res.format,
                    };
                  }
                }
              }
            }

            return (
              <div key={m.id} className="space-y-4">
                {/* 1. SPEECH BUBBLE */}
                <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                  {isUser ? (
                    // User Message (Sleek bubble on the right showing uploaded image and text on top side)
                    <div className="max-w-[85%] md:max-w-[75%] rounded-3xl bg-secondary/80 text-foreground px-5 py-3.5 text-sm md:text-base font-medium shadow-xs border border-border/40 space-y-2">
                      {m.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <div key={i} className="whitespace-pre-wrap">
                              {part.text}
                            </div>
                          );
                        }
                        if (part.type === "file") {
                          const isImg =
                            part.mediaType?.startsWith("image/") ||
                            (part.url && part.url.startsWith("data:image/"));
                          return (
                            <div key={i} className="mt-1 flex flex-col gap-1.5 items-end">
                              {isImg && part.url ? (
                                <img
                                  src={part.url}
                                  alt={part.filename || "Uploaded file"}
                                  className="max-h-56 max-w-[280px] rounded-2xl object-cover shadow-sm border border-border/50"
                                />
                              ) : null}
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-card/80 px-3 py-1.5 text-xs font-bold text-foreground border border-border/40">
                                📎 {part.filename || "Attached file"}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    // Assistant Message (Left aligned with avatar & clean markdown)
                    <div className="flex items-start gap-3.5 max-w-full">
                      <div className="mt-1 shrink-0">
                        <KarudiAvatar size="sm" />
                      </div>
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* 1. COMPLETED TASK (DONE STATE): SHOW ONLY WORK DONE TEXT + PROCESSED FILE + REACTION OPTIONS + OTHER OPTIONS IN BOTTOM */}
                        {task && task.status === "done" ? (
                          <div className="space-y-3">
                            {/* Work done text with checkmark */}
                            <div className="text-sm md:text-base font-semibold text-foreground leading-relaxed flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>{task.completionMessage || getWorkDoneMessage(task.action)}</span>
                            </div>

                            {/* Visual Preview (if image result) */}
                            {task.resultImageSrc ? (
                              task.action === "remove_background" ? (
                                <div className="max-w-sm rounded-2xl border border-border/80 overflow-hidden shadow-xs p-2 bg-card">
                                  <div
                                    className="flex items-center justify-center rounded-xl p-2 max-h-64 overflow-hidden"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)",
                                      backgroundSize: "16px 16px",
                                    }}
                                  >
                                    <img
                                      src={task.resultImageSrc}
                                      alt="Cutout Result"
                                      className="max-h-60 w-auto object-contain rounded-lg drop-shadow-md"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="max-w-sm rounded-2xl border border-border/80 overflow-hidden shadow-xs p-1.5 bg-card/60">
                                  <div className="flex items-center justify-center rounded-xl max-h-60 overflow-hidden bg-muted/30 p-1">
                                    <img
                                      src={task.resultImageSrc}
                                      alt="Processed Image"
                                      className="max-h-56 w-auto object-contain rounded-lg"
                                    />
                                  </div>
                                </div>
                              )
                            ) : null}

                            {/* Extracted text snippet preview for OCR conversions */}
                            {(task.action === "jpg_to_word" || task.action === "pdf_to_word" || task.action === "jpg_to_excel" || task.action === "pdf_to_excel") && task.extractedText ? (
                              <div className="max-w-md rounded-xl border border-border/60 bg-muted/40 p-2.5 text-xs font-mono text-muted-foreground max-h-20 overflow-y-auto whitespace-pre-wrap">
                                {task.extractedText}
                              </div>
                            ) : null}

                            {/* 2. Processed File Attachment Pill (Image 1 Style: dark capsule, icon, filename, open file, download icon) */}
                            {(() => {
                              const info = getProcessedFileInfo(task, activeFilename, downloadBlob, downloadDataUrl);
                              return (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={info.onDownload}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      info.onDownload();
                                    }
                                  }}
                                  className="group flex items-center justify-between gap-3.5 p-3 px-4 rounded-2xl bg-[#1e1f21] hover:bg-[#282a2d] active:scale-[0.99] border border-white/10 text-white shadow-md transition-all cursor-pointer max-w-md w-full select-none"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/15 text-white/90 group-hover:text-white transition-colors shrink-0">
                                      {info.fileType === "pdf" ? (
                                        <FileText className="h-4.5 w-4.5 text-rose-400" />
                                      ) : info.fileType === "word" ? (
                                        <FileText className="h-4.5 w-4.5 text-blue-400" />
                                      ) : info.fileType === "excel" ? (
                                        <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                                      ) : info.fileType === "binary" ? (
                                        <Binary className="h-4.5 w-4.5 text-sky-400" />
                                      ) : info.fileType === "image" ? (
                                        <ImageIcon className="h-4.5 w-4.5 text-amber-400" />
                                      ) : (
                                        <Globe className="h-4.5 w-4.5 text-zinc-300" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white truncate">
                                        {info.filename}
                                      </p>
                                      <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 font-medium transition-colors">
                                        {info.subtitle}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      info.onDownload();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/20 active:scale-95 text-zinc-200 group-hover:text-white transition-all shrink-0 cursor-pointer"
                                    title="Download file"
                                  >
                                    <ArrowDownToLine className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })()}

                            {/* 3. Reaction Option Toolbar (Copy, Share, Regenerate, Emoji Reaction Popover, Thumbs up/down) */}
                            <MessageFeedbackToolbar
                              text={task.completionMessage || getWorkDoneMessage(task.action)}
                              onRegenerate={() => void handleRegenerateMessage(m.id)}
                              isRegenerating={regeneratingMsgId === m.id}
                              timestamp={(m as any).createdAt || thread.updatedAt}
                              onBranch={() => handleBranchInNewChat(m.id)}
                            />

                            {/* 4. Other Options in Bottom (1-Click Action Pills) */}
                            {(() => {
                              // Prioritize the processed result (e.g. transparent cutout) over original image!
                              const srcFile = task.resultImageSrc || activeCutoutSrc || task.originalImageSrc || task.uploadedFile?.dataUrl || activeImageSrc;
                              const srcName = (task.resultImageSrc || activeCutoutSrc)
                                ? (task.originalFilename?.replace(/\.[^.]+$/, "") || "cutout") + ".png"
                                : (task.originalFilename || task.uploadedFile?.name || activeFilename || "file.png");
                              if (!srcFile) return null;

                              const triggerQuickOption = (actionType: KarudiActionType, opts?: any) => {
                                const newMsgId = "a_" + Date.now();
                                const assistantMsg: UIMessage = {
                                  id: newMsgId,
                                  role: "assistant",
                                  parts: [{ type: "text", text: `Processing ${srcName} with ${actionType.replace(/_/g, " ")}...` }],
                                };
                                setMessages((prev) => [...prev, assistantMsg]);
                                void executeTaskAction(newMsgId, actionType, srcFile, srcName, opts);
                              };

                              return (
                                <div className="pt-2 border-t border-border/40 space-y-2 max-w-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1.5">
                                      <span className="text-amber-500">⚡</span> Other Options:
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                                      Convert this file instantly with 1 click
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {task.action !== "image_to_pdf" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("image_to_pdf")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-blue-500" /> Make PDF
                                      </button>
                                    )}
                                    {task.action !== "jpg_to_excel" && task.action !== "pdf_to_excel" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("jpg_to_excel")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Make Excel
                                      </button>
                                    )}
                                    {task.action !== "jpg_to_word" && task.action !== "pdf_to_word" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("jpg_to_word")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-purple-500" /> Make Word
                                      </button>
                                    )}
                                    {task.action !== "convert_format" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("convert_format", { targetFormat: "image/jpeg" })}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> Make JPG
                                      </button>
                                    )}
                                    {task.action !== "remove_background" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("remove_background")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <Scissors className="h-3.5 w-3.5 text-rose-500" /> Remove BG
                                      </button>
                                    )}
                                    {task.action !== "compress_image" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("compress_image")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <Archive className="h-3.5 w-3.5 text-teal-500" /> Compress
                                      </button>
                                    )}
                                    {task.action !== "resize_image" && (
                                      <button
                                        type="button"
                                        onClick={() => triggerQuickOption("resize_image", { targetWidth: 1000, targetHeight: 1000 })}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                                      >
                                        <Scaling className="h-3.5 w-3.5 text-indigo-500" /> Resize
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <>
                            {/* Text typewriter messages */}
                            {m.parts.map((part, i) => {
                              if (part.type === "text") {
                                return (
                                  <TypewriterMessage
                                    key={`${m.id}-${i}-${regeneratingMsgId === m.id ? "regen" : "idle"}`}
                                    text={part.text}
                                    isLatest={idx === messages.length - 1 || m.id === regeneratingMsgId}
                                    isStreaming={status === "submitted" || status === "streaming" || m.id === regeneratingMsgId}
                                    onCharacterTyped={() => {
                                      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                  />
                                );
                              }
                              if (part.type === "tool-invocation") {
                                const invocation = (part as any).toolInvocation;
                                const toolName = (invocation?.toolName || "tool").replace(/_/g, " ");
                                const isCall = invocation?.state === "call";
                                return (
                                  <div
                                    key={`${m.id}-tool-${i}`}
                                    className="my-2 inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
                                  >
                                    {isCall ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                    <span>
                                      {isCall ? `Executing ${toolName}…` : `Executed ${toolName}`}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })}

                            {/* Processing loader for background removal */}
                            {task && task.status === "processing" && task.action === "remove_background" && (
                              <div className="pt-1">
                                <SingleImageBgRemovalWidget
                                  task={task}
                                  onDownload={(url, filename) => downloadDataUrl(url, filename)}
                                  onUpdateImage={(id, newSrc) => {
                                    setTaskMap((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id]!,
                                        resultImageSrc: newSrc,
                                      },
                                    }));
                                    setActiveCutoutSrc(newSrc);
                                  }}
                                />
                              </div>
                            )}

                            {/* Processing loader for other actions */}
                            {task && task.status === "processing" && task.action !== "remove_background" && (
                              <div className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-muted-foreground animate-pulse py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                                <span>{task.progressMessage || "Processing file, please wait..."}</span>
                              </div>
                            )}

                            {/* Message Feedback Toolbar for non-done messages */}
                            {(!task || task.status !== "processing") && (
                              <MessageFeedbackToolbar
                                text={m.parts.find((p) => p.type === "text")?.text || ""}
                                onRegenerate={() => void handleRegenerateMessage(m.id)}
                                isRegenerating={regeneratingMsgId === m.id}
                                timestamp={(m as any).createdAt || thread.updatedAt}
                                onBranch={() => handleBranchInNewChat(m.id)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. INLINE TOOL CARD (Only when waiting for user file / options) */}
                {!isUser && task && task.action !== "remove_background" && task.status === "waiting_file" ? (
                    <div className="ml-11 rounded-3xl border-2 border-border/80 bg-card/90 p-5 md:p-6 shadow-lg backdrop-blur-md">
                    {/* Tool Attribution Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background shadow-xs">
                          {getSubModelIcon(task.primaryModel)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-extrabold text-sm md:text-base text-foreground">
                              {task.toolName}
                            </span>
                            <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                              {task.primaryModel}
                              {task.secondaryModel ? ` + ${task.secondaryModel}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator pill */}
                      <div>
                        {task.status === "waiting_file" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                            {task.uploadedFile ? "File Ready" : "Upload File"}
                          </span>
                        ) : task.status === "processing" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing…
                          </span>
                        ) : task.status === "done" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                            Failed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress message notice */}
                    <p className="mt-3 text-xs md:text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <span>ℹ️</span> {task.progressMessage}
                    </p>

                    {/* -------------------------------------------------------- */}
                    {/* B. WAITING FILE STATE (Interactive Options for Uploaded File) */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "waiting_file" && task.uploadedFile ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3.5 shadow-xs">
                          <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-xs border border-purple-500/20 shrink-0">
                                {task.uploadedFileType === "pdf" ? "PDF" : task.uploadedFileType === "docx" ? "DOC" : "IMG"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs md:text-sm font-extrabold text-foreground truncate">{task.uploadedFile.name}</p>
                                <p className="text-[11px] text-muted-foreground font-medium">
                                  {(task.uploadedFile.size / 1024).toFixed(1)} KB • Choose your conversion tool below
                                </p>
                              </div>
                            </div>
                            <input
                              id={`change-file-${task.id}`}
                              type="file"
                              accept={
                                task.uploadedFileType === "pdf"
                                  ? ".pdf"
                                  : task.uploadedFileType === "docx"
                                  ? ".docx"
                                  : "image/*"
                              }
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const dataUrl = await fileToDataUrl(file);
                                setActiveImageSrc(dataUrl);
                                setActiveFilename(file.name);
                                const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
                                const isDocx = file.name.toLowerCase().endsWith(".docx") || file.type.includes("word");
                                const fileType: "pdf" | "docx" | "image" = isPdf ? "pdf" : isDocx ? "docx" : "image";
                                setTaskMap((prev) => ({
                                  ...prev,
                                  [task.id]: {
                                    ...prev[task.id]!,
                                    originalImageSrc: dataUrl,
                                    originalFilename: file.name,
                                    uploadedFile: {
                                      name: file.name,
                                      size: file.size,
                                      type: file.type || "application/octet-stream",
                                      dataUrl,
                                    },
                                    uploadedFileType: fileType,
                                    progressMessage: isPdf
                                      ? "PDF ready! Select a conversion action below or type your desired format (e.g. JPG, Word)."
                                      : isDocx
                                      ? "Word document ready! Select a conversion action below."
                                      : "Image ready! Select an action below (Convert to PDF, Word, or Remove Background).",
                                  },
                                }));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                document.getElementById(`change-file-${task.id}`)?.click();
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground font-bold px-2.5 py-1 rounded-lg hover:bg-muted transition-colors shrink-0 cursor-pointer"
                            >
                              Change
                            </button>
                          </div>

                          {/* Dynamic Contextual Tool Options */}
                          <div className="space-y-2">
                            <p className="text-xs font-extrabold text-foreground">
                              {task.uploadedFileType === "pdf"
                                ? "Available PDF Conversion Tools:"
                                : task.uploadedFileType === "docx"
                                ? "Available Word Conversion Tools:"
                                : "Available Image Conversion Tools:"}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                              {task.uploadedFileType === "pdf" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "pdf_to_image", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                      <FileImage className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> PDF to JPG / Images
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Render high-res JPG pages</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "pdf_to_word", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                      <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> PDF to Word (.docx)
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Extract text into editable Word</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "jpg_to_word", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      <Wand2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Neural OCR Scan
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Extract raw text & layout</span>
                                  </button>
                                </>
                              ) : task.uploadedFileType === "docx" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "image_to_pdf", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                      <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Convert to PDF
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Compile into standard PDF</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "jpg_to_word", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                      <Wand2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Extract Text
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Extract text & content</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "convert_format", task.uploadedFile!.dataUrl, task.uploadedFile!.name, { targetFormat: "image/jpeg" });
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                      <RefreshCw className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Convert to JPG
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Transcode into clean JPG</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "image_to_pdf", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                                      <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Convert to PDF
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Transcode into authentic PDF</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "jpg_to_word", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                      <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Convert to Word (.docx)
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">OCR into editable .docx</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "jpg_to_excel", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Convert to Excel (.xlsx)
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">OCR table into editable .xlsx</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "image_to_binary", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                                      <Binary className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Image to Binary (.txt)
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Encode into binary bitstream</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      void executeTaskAction(task.id, "remove_background", task.uploadedFile!.dataUrl, task.uploadedFile!.name);
                                    }}
                                    className="flex flex-col items-start p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/80 hover:border-foreground/40 transition-all text-left shadow-xs group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      <Scissors className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Remove Background
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">Transparent alpha matting</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* Thinking shimmer */}
          {status === "submitted" ? (
            <div className="flex items-start gap-3.5">
              <KarudiAvatar size="sm" />
              <div className="flex items-center gap-2 rounded-2xl bg-card border border-border/70 px-4 py-3 text-xs md:text-sm font-bold animate-pulse text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                Karudi AI is analyzing request & coordinating sub-models…
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-destructive bg-destructive/10 p-4 text-xs md:text-sm font-bold text-destructive">
              ⚠️ {error.message}
            </div>
          ) : null}

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODERN GEMINI / CHATGPT STYLE INPUT BAR (Redesigned per Image 2)       */}
      {/* ---------------------------------------------------------------------- */}
      <div className="w-full shrink-0 p-3 md:p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto w-full max-w-3xl">
          {/* Main Card Container */}
          <div className="relative flex flex-col rounded-3xl border border-border/80 bg-card/90 shadow-xl backdrop-blur-xl transition-all focus-within:border-foreground/50 p-2 md:p-3">
            {/* 1. Top inside: Inline Attached Thumbnails */}
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2.5 px-2 pt-1">
                {attachedFiles.map((file, i) => (
                  <InlineAttachmentThumbnail
                    key={`${file.name}-${i}`}
                    file={file}
                    onRemove={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            )}

            {/* 2. Middle inside: Textarea prompt input */}
            <div className="flex items-center px-2 py-1">
              <textarea
                ref={taRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="Ask anything… (e.g. 'remove background', 'convt file', 'convert to word')"
                rows={1}
                className="w-full resize-none bg-transparent text-sm md:text-base font-normal placeholder:text-muted-foreground/70 focus:outline-none min-h-[38px] max-h-32 text-foreground"
              />
            </div>

            {/* 3. Bottom inside: Controls Toolbar */}
            <div className="flex items-center justify-between px-1.5 pt-1">
              {/* Left Action Buttons: Plus (+) & Model Selector */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Hidden File Input & Plus (+) Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={acceptedChatFiles}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) setAttachedFiles((prev) => [...prev, ...files]);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Attach files or images"
                >
                  <Plus className="h-5 w-5" />
                </button>

                {/* Model Selector Pill */}
                <div className="relative" ref={modelPickerRef}>
                  <button
                    type="button"
                    onClick={() => setIsModelPickerOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-4 w-4 rounded-full overflow-hidden bg-black shrink-0 border border-border/80 flex items-center justify-center">
                      <img src={karudiKLogo} alt="Karudi" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-foreground/90 font-medium">{selectedModelName}</span>
                    <ChevronUp
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                        isModelPickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isModelPickerOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 md:w-80 rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Select Model</span>
                        <span className="text-[10px] text-muted-foreground/75 font-normal">Auto-Orchestrated</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {AVAILABLE_MODELS.map((m) => {
                          const Icon = m.icon;
                          const isSelected = m.name === selectedModelName;
                          const isSelectable = m.selectable !== false;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                if (!isSelectable) {
                                  toast.info(`${m.name} is automatically managed by Karudi 1.0 Prime.`);
                                  return;
                                }
                                setSelectedModelName(m.name);
                                setCurrentTier(m.tier);
                                setStoredTier(m.tier);
                                setIsModelPickerOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all ${
                                isSelected
                                  ? "bg-primary/10 border border-primary/20 text-foreground cursor-pointer"
                                  : isSelectable
                                  ? "hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"
                                  : "opacity-60 cursor-not-allowed hover:bg-muted/30"
                              }`}
                            >
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${m.bgClass}`}>
                                {m.useLogo ? (
                                  <div className="h-4.5 w-4.5 rounded-full overflow-hidden bg-black shrink-0 flex items-center justify-center">
                                    <img src={karudiKLogo} alt="Karudi" className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <Icon className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-semibold ${isSelected ? "text-foreground" : "text-foreground/85"}`}>{m.name}</span>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                                  {!isSelectable && (
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                                      {m.badge || "Auto-Managed"}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">{m.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Think Mode Toggle Pill */}
                <button
                  type="button"
                  onClick={() => {
                    setIsThinkingEnabled((prev) => {
                      const next = !prev;
                      if (next) {
                        toast.info("Think mode enabled: Deeper analysis & evidence synthesis.");
                      } else {
                        toast.info("Think mode disabled: Fast path enabled.");
                      }
                      return next;
                    });
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs md:text-sm font-medium transition-all cursor-pointer ${
                    isThinkingEnabled
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                  title="Toggle Think Mode (deep analysis & web research when needed)"
                >
                  <Brain className={`h-4 w-4 ${isThinkingEnabled ? "text-amber-500 animate-pulse" : "text-muted-foreground"}`} />
                  <span className="font-semibold">Think</span>
                  {isThinkingEnabled && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                </button>
              </div>

              {/* Right Action: Vibrant Blue Circular Send Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isBusy || (!inputText.trim() && attachedFiles.length === 0)}
                  onClick={() => void handleSendMessage()}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    inputText.trim() || attachedFiles.length > 0
                      ? "bg-[#0084ff] hover:bg-[#0074e8] text-white shadow-md shadow-blue-500/25 active:scale-95"
                      : "bg-[#0084ff]/30 text-white/40 cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] font-medium text-muted-foreground/75">
            Karudi 1.0 Prime can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
