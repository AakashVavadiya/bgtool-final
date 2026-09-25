import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import {
  Scissors,
  RefreshCw,
  Sparkles,
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
  Paperclip,
  Mic,
  Brain,
  ChevronDown,
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
} from "lucide-react";
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
import {
  SUB_MODELS,
  analyzeKarudiIntent,
  executeRemoveBackground,
  executeCompositeBackground,
  executeImageToWord,
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
  "The work has been completed successfully. Let me know if you need any further assistance.",
  "Everything is completed. Feel free to reach out if you need any additional help.",
  "The task is now complete. Please let me know if there’s anything else I can help with.",
  "All done! If you need any further support, I’m happy to help.",
  "The work is complete. Let me know if you’d like help with anything else.",
  "Everything is taken care of. Feel free to ask if you need anything further.",
  "Done and ready to go! Let me know if you need anything else.",
  "That’s all set! Feel free to reach out if you need further help.",
  "Everything is ready. Let me know what you’d like to work on next.",
  "Completed successfully. I’m here if you need anything else.",
  "All set! Let me know if there’s anything more I can assist with.",
  "The task is complete. Happy to help with the next step.",
  "Done! If there’s anything else you need, just let me know.",
  "Everything has been taken care of. Let me know if you’d like to continue.",
  "Completed! Feel free to ask if you need further assistance.",
  "That’s wrapped up. Let me know if you have another task.",
];

export function getWorkDoneMessage(id?: string): string {
  if (!id) {
    const rand = Math.floor(Math.random() * WORK_DONE_MESSAGES.length);
    return WORK_DONE_MESSAGES[rand]!;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % WORK_DONE_MESSAGES.length;
  return WORK_DONE_MESSAGES[index]!;
}

export function ChatWindow({ thread }: { thread: ChatThread }) {
  const [currentTier, setCurrentTier] = useState<KarudiTier>(() => getStoredTier());

  const activeModelInfo = karudiModels.find((m) => m.id === currentTier) || karudiModels[0];

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
        body: { messages: m, tier: currentTier, id },
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
            completionMessage: getWorkDoneMessage(msgId),
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
        for (let i = messages.length - 1; i >= 0; i--) {
          const m = messages[i];
          if (!m || !m.parts) continue;
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

    const trimmed = text.trim().toLowerCase();

    // Inspect conversation history for background removal intent
    const lastAssistantMsg = messages.slice().reverse().find((m) => m.role === "assistant");
    const lastAssistantText =
      lastAssistantMsg && lastAssistantMsg.parts
        ? ((lastAssistantMsg.parts.find((p: any) => p.type === "text") as any)?.text || "").toLowerCase()
        : "";
    const lastUserMsg = messages.slice().reverse().find((m) => m.role === "user");
    const lastUserText =
      lastUserMsg && lastUserMsg.parts
        ? ((lastUserMsg.parts.find((p: any) => p.type === "text") as any)?.text || "").toLowerCase()
        : "";

    const assistantWasAskingForBgRemoval =
      lastAssistantText.includes("remove the background") ||
      lastAssistantText.includes("remove background") ||
      lastAssistantText.includes("image you want me to remove the background from") ||
      lastAssistantText.includes("image you want to remove the background from");

    const prevUserWantedBgRemoval =
      lastUserText.includes("remove background") ||
      lastUserText.includes("remove bg") ||
      lastUserText.includes("bg removal") ||
      lastUserText.includes("cutout");

    const isStandaloneBgWord = /^(remove|remov|rmv|cutout|cut\s*out|transparent|erase|isolate|remove\s*it|remove\s*this|do\s*it|bg|remove\s*bg|remove\s*background)$/i.test(trimmed);

    const isBgRemovalIntent =
      assistantWasAskingForBgRemoval ||
      prevUserWantedBgRemoval ||
      isStandaloneBgWord ||
      /(remov|erase|cut\s*out|isolat)\s*(the\s*)?(background|bg)/i.test(trimmed) ||
      /\b(background|bg)\s*(removal|remover|cutout|remove|erase)\b/i.test(trimmed);

    const isExplicitActionCommand =
      isBgRemovalIntent ||
      /(remov|erase|cut\s*out|isolat)\s*(the\s*)?(background|bg)/i.test(trimmed) ||
      /\b(resize|crop|rotate|flip|compress|upscale|watermark|blur\s*face|square|meme|photo\s*editor|color\s*picker)\b/i.test(trimmed) ||
      /(\d+)\s*[xX×]\s*(\d+)/.test(trimmed) ||
      /(pdf\s*(to|into|->|2)\s*(img|image|images|jpg|jpeg|png|webp|word|docx))/i.test(trimmed) ||
      /((jpg|jpeg|png|webp|img|image|photo)\s*(to|into|->|2)\s*(pdf|word|docx|jpg|jpeg|png|webp|excel|pptx))/i.test(trimmed) ||
      /((excel|xlsx|csv|powerpoint|pptx)\s*(to|into|->|2)\s*(img|image|images|png|jpg))/i.test(trimmed) ||
      /(convert|transcode|change)\s*(this|the|my)?\s*(img|image|photo|png|jpg|webp)?\s*(to|into|->|2|as)\s*(jpg|jpeg|png|webp)/i.test(trimmed) ||
      /(image|img|photo|file)\s*(to|into|->|2|as)\s*(binary|bin|base64|hex|octal|decimal|ascii|txt)/i.test(trimmed) ||
      /(binary|base64|hex|octal|decimal|ascii)\s*(to|into|->|2|as)\s*(image|img|png|jpg)/i.test(trimmed) ||
      /binary\s*(file|txt|text)?/i.test(trimmed) ||
      /give\s*(me)?\s*(a|the)?\s*binary/i.test(trimmed) ||
      /^(to\s*pdf|to\s*word|to\s*docx|to\s*jpg|to\s*png|to\s*webp|to\s*binary)$/i.test(trimmed) ||
      isStandaloneBgWord ||
      trimmed === "remove background" ||
      trimmed === "bg removal" ||
      trimmed === "remove bg" ||
      trimmed === "pdf to word" ||
      trimmed === "pdf to jpg" ||
      trimmed === "pdf to image" ||
      trimmed === "image to pdf" ||
      trimmed === "jpg to word" ||
      trimmed === "png to jpg" ||
      trimmed === "jpg to png" ||
      trimmed === "convert to jpg" ||
      trimmed === "convert to png" ||
      trimmed === "binary" ||
      trimmed === "image to binary" ||
      trimmed === "binary file";

    // Only infer specific workflow if user came directly from an explicit quick action prompt or background removal flow
    let effectiveText = text.trim();
    if (filesToUpload.length > 0 && isBgRemovalIntent) {
      effectiveText = "remove background";
    } else if (!effectiveText && filesToUpload.length > 0) {
      const isDoc =
        filesToUpload[0]?.name.toLowerCase().endsWith(".pdf") ||
        filesToUpload[0]?.name.toLowerCase().endsWith(".docx") ||
        filesToUpload[0]?.name.toLowerCase().endsWith(".xlsx") ||
        filesToUpload[0]?.name.toLowerCase().endsWith(".pptx");
      if (isDoc) {
        effectiveText = "convert";
      } else {
        effectiveText = "remove background";
      }
    } else if (isStandaloneBgWord) {
      effectiveText = "remove background";
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
        return <Sparkles className="h-4 w-4" />;
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
                    <Sparkles className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
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
                        {/* 1. TOP SIDE: If process is finished (done), show the resulting image card here on top */}
                        {task && task.status === "done" && task.action === "remove_background" && (
                          <div className="pt-0.5">
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

                        {/* 2. TEXT: When process is done, show dynamically selected completion phrase */}
                        {task && task.status === "done" ? (
                          <div className="text-sm md:text-base font-medium text-foreground leading-relaxed">
                            {task.completionMessage || getWorkDoneMessage(task.id || m.id)}
                          </div>
                        ) : (
                          m.parts.map((part, i) => {
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
                            return null;
                          })
                        )}

                        {/* 3. If process is still in progress (processing), show the scanline widget under the in-progress text */}
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

                        {/* 4. BOTTOM: Gemini-style Message Feedback Toolbar (Copy, Share, Regenerate, Thumbs Up, Thumbs Down, More) */}
                        {(!task || task.status === "done") && (
                          <MessageFeedbackToolbar
                            text={
                              task && task.status === "done"
                                ? task.completionMessage || getWorkDoneMessage(task.id || m.id)
                                : m.parts.find((p) => p.type === "text")?.text || ""
                            }
                            onRegenerate={() => void handleRegenerateMessage(m.id)}
                            isRegenerating={regeneratingMsgId === m.id}
                            timestamp={(m as any).createdAt || thread.updatedAt}
                            onBranch={() => handleBranchInNewChat(m.id)}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. INLINE TOOL CARD (For non-remove_background tools, e.g. format conversion, OCR, resize) */}
                {!isUser && task && task.action !== "remove_background" ? (
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
                                      <Sparkles className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Neural OCR Scan
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
                                      <Sparkles className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Extract Text
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

                    {/* -------------------------------------------------------- */}
                    {/* C. PROCESSING STATE                                      */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "processing" ? (
                      <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
                        <Loader2 className="h-9 w-9 animate-spin text-foreground mb-3" />
                        <p className="font-display font-extrabold text-sm text-foreground">
                          {task.action === "resize_image"
                            ? `Brahmaputra is resizing image to ${task.targetWidth || 1000}×${task.targetHeight || 1000}px…`
                            : task.action === "compress_image"
                            ? "Brahmaputra is compressing image file…"
                            : task.action === "rotate_image"
                            ? `Brahmaputra is rotating image by ${task.rotationDegrees || 90}°…`
                            : task.action === "square_image"
                            ? "Brahmaputra is formatting into 1:1 square canvas…"
                            : task.action === "convert_format"
                            ? `Brahmaputra is converting image to ${(task.selectedFormat || "JPG").toUpperCase()}…`
                            : task.action === "image_to_binary"
                            ? "Brahmaputra is encoding image into binary bitstream (.txt)…"
                            : "Narmada & Brahmaputra are compiling your document…"}
                        </p>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* E. DONE: JPG OR PDF TO WORD RESULT                       */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && (task.action === "jpg_to_word" || task.action === "pdf_to_word" || !!task.resultDocxBlob) && task.resultDocxBlob ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                              <FileText className="h-3.5 w-3.5" />
                              Narmada OCR Extracted Text
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              Editable Word OpenXML
                            </span>
                          </div>
                          <div className="max-h-32 overflow-y-auto rounded-xl border border-border bg-card p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap">
                            {task.extractedText || "Document structure formatted and ready."}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Brahmaputra compiled .docx
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                task.resultDocxBlob!,
                                task.resultDocxFilename || "converted_document.docx"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download Word (.docx)
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* F. DONE: IMAGE TO PDF RESULT                             */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && (task.action === "image_to_pdf" || !!task.resultPdfBlob) && task.resultPdfBlob ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                              <FileText className="h-3.5 w-3.5" />
                              PDF Document Ready
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              Standard PDF 1.4 Binary
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your image has been transcoded into an authentic PDF document with standard page sizing and margin framing.
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> High-res PDF generated
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                task.resultPdfBlob!,
                                task.resultPdfFilename || "converted_document.pdf"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G0. DONE: RESIZE IMAGE RESULT                             */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "resize_image" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                              <Scaling className="h-3.5 w-3.5" />
                              Image Resized to {task.targetWidth} × {task.targetHeight} px
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra Scaler
                            </span>
                          </div>

                          {/* Dimensions Badge Comparison */}
                          <div className="rounded-xl border border-border bg-card p-2.5 mb-2.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Original: {task.originalWidth || "—"} × {task.originalHeight || "—"} px
                            </span>
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <span>➔</span> {task.targetWidth} × {task.targetHeight} px
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="Resized Result"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>

                          {/* Quick Dimension Presets */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Quick Presets:</span>
                            {[
                              { label: "1000×1000", w: 1000, h: 1000 },
                              { label: "1920×1080", w: 1920, h: 1080 },
                              { label: "1200×630", w: 1200, h: 630 },
                              { label: "800×800", w: 800, h: 800 },
                              { label: "500×500", w: 500, h: 500 },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  if (task.originalImageSrc) {
                                    void executeTaskAction(task.id, "resize_image", task.originalImageSrc, task.originalFilename || "image.png", {
                                      targetWidth: preset.w,
                                      targetHeight: preset.h,
                                    });
                                  }
                                }}
                                className="rounded-lg border border-border bg-muted/50 px-2 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> High-fidelity scale ready
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "image"}_${task.targetWidth}x${task.targetHeight}.png`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download Resized Image ({task.targetWidth}×{task.targetHeight})
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G0b. DONE: COMPRESS IMAGE RESULT                          */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "compress_image" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <Archive className="h-3.5 w-3.5" />
                              Image Compressed
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra Optimizer
                            </span>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-2.5 mb-2.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Original: {task.originalSize ? `${(task.originalSize / 1024).toFixed(1)} KB` : "—"}
                            </span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span>➔</span> {task.compressedSize ? `${(task.compressedSize / 1024).toFixed(1)} KB` : "—"}
                              {task.originalSize && task.compressedSize
                                ? ` (${Math.round((1 - task.compressedSize / task.originalSize) * 100)}% saved)`
                                : ""}
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="Compressed Result"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Compressed file ready
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "image"}_compressed.jpg`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download Compressed Image
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G0c. DONE: ROTATE IMAGE RESULT                            */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "rotate_image" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <RotateCw className="h-3.5 w-3.5" />
                              Image Rotated ({task.rotationDegrees || 90}°)
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra Engine
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="Rotated Result"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>

                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const nextDeg = ((task.rotationDegrees || 90) + 90) % 360 || 360;
                                if (task.originalImageSrc) {
                                  void executeTaskAction(task.id, "rotate_image", task.originalImageSrc, task.originalFilename || "image.png", {
                                    rotationDegrees: nextDeg,
                                  });
                                }
                              }}
                              className="rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCw className="h-3.5 w-3.5" /> Rotate +90° Again
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Rotated image ready
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "image"}_rotated.png`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download Rotated Image
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G0d. DONE: SQUARE IMAGE RESULT                            */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "square_image" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                              <Square className="h-3.5 w-3.5" />
                              Square (1:1) Formatted
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra + Ganga
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="Square Result"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 1:1 image ready
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "image"}_square.png`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download 1:1 Square Image
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G1. DONE: FORMAT CONVERSION RESULT (JPG / PNG / WebP)     */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "convert_format" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Image Converted to {(task.selectedFormat || "jpg").toUpperCase()}
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra Transcoder
                            </span>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="Converted Result"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Transcoded to {(task.selectedFormat || "jpg").toUpperCase()}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "converted_image"}.${task.selectedFormat || "jpg"}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Download {(task.selectedFormat || "jpg").toUpperCase()}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G2. DONE: PDF TO IMAGE RESULT                             */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "pdf_to_image" && task.resultImageSrc ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <FileText className="h-3.5 w-3.5" />
                              PDF Page Rendered
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              High-Resolution {task.selectedFormat || "JPG"}
                            </span>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-border bg-card flex justify-center p-2">
                            <img
                              src={task.resultImageSrc}
                              alt="PDF Page"
                              className="max-h-64 rounded-lg object-contain shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> PDF converted to {(task.selectedFormat || "jpg").toUpperCase()}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              downloadDataUrl(
                                task.resultImageSrc!,
                                `${task.originalFilename?.replace(/\.[^.]+$/, "") || "pdf_page"}.${task.selectedFormat || "jpg"}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95"
                          >
                            <Download className="h-4 w-4" />
                            Download Image ({(task.selectedFormat || "jpg").toUpperCase()})
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* G3. DONE: IMAGE TO BINARY (.TXT FILE) RESULT              */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "image_to_binary" && task.resultBinaryBlob ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-border bg-background/80 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                              <Binary className="h-3.5 w-3.5" />
                              Image to Binary (.txt) Generated
                            </span>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Brahmaputra Binary Engine
                            </span>
                          </div>

                          <div className="rounded-xl border border-border bg-card p-2.5 mb-2.5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {task.originalFilename || "image.png"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {task.totalBinaryBytes?.toLocaleString()} Bytes • {task.totalBinaryBits?.toLocaleString()} Bits (8-Bit)
                            </span>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-border bg-muted/40 p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                                Binary Bitstream Preview (8-Bit Formatted)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (task.resultBinaryText) {
                                    navigator.clipboard.writeText(task.resultBinaryText);
                                    toast.success("Binary text copied to clipboard!");
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-500 hover:text-sky-600 cursor-pointer"
                              >
                                <Copy className="h-3 w-3" /> Copy Text
                              </button>
                            </div>
                            <pre className="text-[11px] font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap max-h-40 overflow-y-auto p-2 bg-background/80 rounded-lg border border-border/50 select-all">
                              {task.resultBinaryPreview || task.resultBinaryText}
                            </pre>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Binary .txt & raw .bin compiled
                          </span>

                          <div className="flex items-center gap-2">
                            {task.resultRawBinBlob && (
                              <button
                                type="button"
                                onClick={() =>
                                  downloadBlob(
                                    task.resultRawBinBlob!,
                                    task.resultRawBinFilename || "image.bin"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-muted/80 transition-all cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download .bin
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                downloadBlob(
                                  task.resultBinaryBlob!,
                                  task.resultBinaryFilename || "image_binary.txt"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs md:text-sm font-extrabold text-background shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <Download className="h-4 w-4" />
                              Download Binary (.txt)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* -------------------------------------------------------- */}
                    {/* H. DONE: SARASWATI ANALYZE IMAGE PALETTE & METADATA      */}
                    {/* -------------------------------------------------------- */}
                    {task.status === "done" && task.action === "analyze_image" && task.analysisPalette ? (
                      <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          {task.originalImageSrc ? (
                            <div className="rounded-2xl border border-border bg-card p-2 text-center">
                              <p className="text-[11px] font-bold text-muted-foreground mb-1">Inspected Image</p>
                              <div className="h-44 w-full flex items-center justify-center overflow-hidden rounded-xl bg-muted/40">
                                <img
                                  src={task.originalImageSrc}
                                  alt="Inspected"
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            </div>
                          ) : null}

                          <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
                            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <Palette className="h-3.5 w-3.5 text-rose-500" /> Dominant Color Palette
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {task.analysisPalette.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(color);
                                    toast.success(`Copied ${color} to clipboard!`);
                                  }}
                                  className="flex flex-col items-center p-2 rounded-xl border border-border/80 bg-background hover:scale-105 transition-transform shadow-xs cursor-pointer"
                                  title={`Click to copy ${color}`}
                                >
                                  <div
                                    className="h-7 w-full rounded-lg border border-border/60 shadow-xs mb-1"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="font-mono text-[10px] font-bold text-foreground">{color}</span>
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-border/60 text-[11px] space-y-1 font-medium text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Dimensions:</span>
                                <span className="font-bold text-foreground">{task.analysisDimensions || "Auto"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Aspect Ratio:</span>
                                <span className="font-bold text-foreground">{task.analysisAspectRatio || "Standard"}</span>
                              </div>
                              {task.analysisBytes ? (
                                <div className="flex justify-between">
                                  <span>Approx Size:</span>
                                  <span className="font-bold text-foreground">{(task.analysisBytes / 1024).toFixed(1)} KB</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> High-precision chromatic analysis complete
                          </span>
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
      {/* FLOATING CHATGPT PILL INPUT BAR (Matching user screenshot 2 & 3)       */}
      {/* ---------------------------------------------------------------------- */}
      <div className="w-full shrink-0 p-3 md:p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto w-full max-w-3xl">
          {/* File Attachment Badges */}
          {attachedFiles.length > 0 ? (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {attachedFiles.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-xs"
                >
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="ml-1 text-muted-foreground hover:text-destructive text-xs"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          {/* Pill Container */}
          <div className="relative flex flex-col rounded-3xl border border-border/80 bg-card/90 shadow-xl backdrop-blur-xl transition-all focus-within:border-foreground/60">
            {/* Top row of pill: input textarea */}
            <div className="flex items-center px-4 pt-3 pb-1">
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
                className="w-full resize-none bg-transparent text-sm md:text-base font-medium placeholder:text-muted-foreground focus:outline-none min-h-[40px] max-h-32"
              />
            </div>

            {/* Bottom row of pill: Action buttons */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              {/* Left action: File attach button (+) */}
              <div className="flex items-center gap-1">
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
                  title="Attach images or files"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>

              {/* Right actions: Think pill, Mic, Send Button */}
              <div className="flex items-center gap-2">
                {/* Think reasoning toggle (As in user screenshot 2) */}
                <button
                  type="button"
                  onClick={() => setIsThinkingEnabled((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    isThinkingEnabled
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span>Think</span>
                </button>

                {/* Voice / Mic Icon */}
                <button
                  type="button"
                  onClick={() => toast.info("Voice input ready.")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  disabled={isBusy || (!inputText.trim() && attachedFiles.length === 0)}
                  onClick={() => void handleSendMessage()}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    inputText.trim() || attachedFiles.length > 0
                      ? "bg-foreground text-background shadow-md hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] font-medium text-muted-foreground">
            Karudi 1.0 Prime can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
