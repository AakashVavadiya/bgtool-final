import { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  Upload,
  RotateCw,
  SmilePlus,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  BookOpen,
  GitFork,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MessageFeedbackToolbarProps {
  text: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  timestamp?: number | Date | string;
  onBranch?: () => void;
}

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🙌", label: "Celebration" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😮", label: "Wow" },
];

function formatMessageTime(ts?: number | Date | string): string {
  if (!ts) {
    const now = new Date();
    return `Today, ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return isToday
    ? `Today, ${timeStr}`
    : `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
}

export function MessageFeedbackToolbar({
  text,
  onRegenerate,
  isRegenerating = false,
  timestamp,
  onBranch,
}: MessageFeedbackToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [isReactionOpen, setIsReactionOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop speech when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsReactionOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsReactionOpen(false);
    }, 200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Karudi AI Conversation",
          text: text,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link & message copied to clipboard");
    } catch {
      toast.info("Share ready");
    }
  };

  const handleSelectReaction = (emoji: string) => {
    if (selectedReaction === emoji) {
      setSelectedReaction(null);
      setFeedback(null);
      toast.info("Reaction removed");
    } else {
      setSelectedReaction(emoji);
      setFeedback("like");
      toast.success(`Reacted with ${emoji}`);
    }
    setIsReactionOpen(false);
  };

  const handleGoodResponse = () => {
    if (feedback === "like" && !selectedReaction) {
      setFeedback(null);
      toast.info("Feedback removed");
    } else {
      setFeedback("like");
      setSelectedReaction(null);
      toast.success("Thanks for your feedback!");
    }
    setIsReactionOpen(false);
  };

  const handleDislike = () => {
    if (feedback === "dislike") {
      setFeedback(null);
    } else {
      setFeedback("dislike");
      setSelectedReaction(null);
      toast.info("Thanks for your feedback! We'll work to improve.");
    }
  };

  // Text-To-Speech Read Aloud
  const handleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech synthesis is not supported on this device/browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Reading stopped");
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown formatting before speaking
    const cleanSpeechText = text
      .replace(/[*#`_~\[\]]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    toast.info("Reading response aloud…");
  };

  const handleBranchInNewChat = () => {
    if (onBranch) {
      onBranch();
    } else {
      toast.info("Branching into new chat…");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 pt-1.5 text-muted-foreground transition-opacity">
        {/* 1. Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
          title="Copy response"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in-50 duration-200" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        {/* 2. Share / Export */}
        <button
          type="button"
          onClick={handleShare}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
          title="Share"
        >
          <Upload className="h-4 w-4" />
        </button>

        {/* 3. Regenerate */}
        {onRegenerate ? (
          <button
            type="button"
            disabled={isRegenerating}
            onClick={() => {
              onRegenerate();
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isRegenerating
                ? "opacity-70 cursor-not-allowed text-primary"
                : "hover:bg-muted/80 hover:text-foreground"
            }`}
            title={isRegenerating ? "Regenerating answer…" : "Regenerate response"}
          >
            <RotateCw className={`h-4 w-4 ${isRegenerating ? "animate-spin text-primary" : ""}`} />
          </button>
        ) : null}

        {/* 4. Reaction Popover: Emojis + Good Response */}
        <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative inline-flex items-center"
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={() => setIsReactionOpen((prev) => !prev)}
                className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-1.5 transition-colors ${
                  feedback === "like" || selectedReaction
                    ? "bg-muted text-emerald-500"
                    : "hover:bg-muted/80 hover:text-foreground"
                }`}
                title="Good response"
              >
                {selectedReaction ? (
                  <span className="text-base leading-none animate-in zoom-in-75 duration-150">
                    {selectedReaction}
                  </span>
                ) : (
                  <SmilePlus className="h-4 w-4" />
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="center"
              sideOffset={8}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="z-50 w-auto rounded-2xl border border-neutral-700/80 bg-[#1c1c1e] p-2 text-white shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
            >
              {/* 5 Emojis Row (Heart, Celebration, Haha, Sad, Wow) */}
              <div className="flex items-center gap-2 px-1 py-0.5">
                {REACTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectReaction(emoji)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-transform duration-150 hover:scale-130 active:scale-95 ${
                      selectedReaction === emoji ? "bg-white/20 scale-110" : "hover:bg-white/10"
                    }`}
                    title={label}
                  >
                    <span className="select-none transform-gpu">{emoji}</span>
                  </button>
                ))}
              </div>

              {/* Subtle Divider */}
              <div className="my-1.5 border-t border-neutral-700/80" />

              {/* Good response button */}
              <button
                type="button"
                onClick={handleGoodResponse}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  feedback === "like" && !selectedReaction
                    ? "bg-white/20 text-white"
                    : "text-neutral-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Good response</span>
              </button>
            </PopoverContent>
          </div>
        </Popover>

        {/* 5. Dislike / Bad Response */}
        <button
          type="button"
          onClick={handleDislike}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            feedback === "dislike"
              ? "bg-muted text-rose-500"
              : "hover:bg-muted/80 hover:text-foreground"
          }`}
          title="Bad response"
        >
          <ThumbsDown className="h-4 w-4" />
        </button>

        {/* 6. More Options Menu (Exact Match with user screenshot) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56 rounded-2xl border border-neutral-700/80 bg-[#252629] p-2 text-white shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
          >
            {/* Timestamp Header (e.g. "Today, 10:28 AM") */}
            <div className="px-2.5 pt-1.5 pb-2 text-xs font-medium text-neutral-400 select-none">
              {formatMessageTime(timestamp)}
            </div>

            {/* Item 1: View sources */}
            <DropdownMenuItem
              onClick={() => setSourcesOpen(true)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-neutral-100 hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-neutral-300 shrink-0" />
              <span>View sources</span>
            </DropdownMenuItem>

            {/* Item 2: Branch in new chat */}
            <DropdownMenuItem
              onClick={handleBranchInNewChat}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-neutral-100 hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors"
            >
              <GitFork className="h-4 w-4 text-neutral-300 shrink-0" />
              <span>Branch in new chat</span>
            </DropdownMenuItem>

            {/* Item 3: Read aloud */}
            <DropdownMenuItem
              onClick={handleReadAloud}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-neutral-100 hover:bg-white/10 focus:bg-white/10 focus:text-white transition-colors"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
                  <span className="text-rose-300">Stop reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-neutral-300 shrink-0" />
                  <span>Read aloud</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sources & Model Attribution Dialog */}
      <Dialog open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Sources & Engine Attribution
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This response was processed and verified by Karudi 1.0 Prime sub-models.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-foreground">Karudi 1.0 Prime Orchestrator</div>
                <div className="text-muted-foreground mt-0.5">
                  Universal routing engine analyzing intent, text structure, and multi-turn context.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-foreground">Sub-Model Pipelines</div>
                <div className="text-muted-foreground mt-0.5">
                  Brahmaputra (Transcoder), Narmada (OCR Intelligence), Ganga (Alpha Matting).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-foreground">Data Safety & Privacy</div>
                <div className="text-muted-foreground mt-0.5">
                  Encrypted local memory & stateless execution.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setSourcesOpen(false)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
