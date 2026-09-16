import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { KrishnaAvatar } from "@/components/KrishnaAvatar";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { acceptedChatFiles, krishnaModels, type KrishnaTier } from "@/lib/krishna";
import { titleFrom, upsertThread, type ChatThread } from "@/lib/chat-threads";
import { notifyThreadsChanged } from "@/hooks/use-threads";

export function ChatWindow({ thread }: { thread: ChatThread }) {
  const [tier] = useState<KrishnaTier>("prime-1.0");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumName] = useState("Karudi Pro");
  const taRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages: m, id }) => ({
        body: { messages: m, tier, id },
      }),
    }),
    onError: (err) => toast.error(err.message || "Karudi could not reply."),
  });

  const busy = status === "submitted" || status === "streaming";

  // Persist this thread whenever its messages settle.
  useEffect(() => {
    if (messages.length === 0) return;
    upsertThread({
      id: thread.id,
      title: titleFrom(messages as UIMessage[]),
      updatedAt: Date.now(),
      tier: "prime-1.0",
      messages: messages as UIMessage[],
    });
    notifyThreadsChanged();
  }, [messages, status, thread.id]);

  const focusInput = () => {
    const el = taRef.current?.querySelector("textarea");
    el?.focus();
  };

  useEffect(() => {
    focusInput();
  }, [thread.id]);

  useEffect(() => {
    if (!busy) focusInput();
  }, [busy]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim() ?? "";
    if (!text && message.files.length === 0) return;
    void sendMessage({ text, files: message.files });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Top Bar with Karudi 1.0 Prime Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border bg-card/40 px-6 py-4">
        <div className="flex items-center gap-4">
          <KrishnaAvatar size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <p className="font-display text-lg md:text-xl font-bold leading-none">Karudi 1.0 Prime</p>
              <span className="rounded-full bg-foreground text-background px-3 py-0.5 text-xs md:text-sm font-extrabold uppercase shadow-sm">
                Prime 1.0
              </span>
            </div>
            <p className="mt-1.5 text-xs md:text-sm font-semibold text-muted-foreground">
              Flagship all-in-one multimodal AI engine for image editing, document analysis & smart queries.
            </p>
          </div>
        </div>

        {/* Right Side Online Status Badge */}
        <div className="flex items-center gap-2.5 rounded-2xl border-2 border-border bg-card px-4 py-2 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-foreground">Karudi 1.0 Prime Active</span>
        </div>
      </div>

      {/* Main Conversation Messages View */}
      <Conversation className="min-h-0 flex-1 px-4 py-6 md:px-8">
        <ConversationContent className="mx-auto w-full max-w-4xl space-y-6">
          {messages.length === 0 ? (
            <div className="py-10 text-center">
              <div className="flex justify-center mb-5">
                <KrishnaAvatar size="xl" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Ask Karudi Anything ✨
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg font-medium leading-relaxed text-muted-foreground">
                Drop an image or ask about image editing tools — background removal, watermarks, rotating & cleaning images.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {[
                  "Remove background from image",
                  "Rotate image & adjust orientation",
                  "Remove watermark & clean object",
                  "Clean image & upscale to 4K",
                  "Convert image format (PNG, JPG, WebP)",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage({ text: prompt, files: [] })}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs md:text-sm font-bold text-foreground shadow-sm transition-all hover:scale-105 hover:border-foreground"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) => (
            <Message from={m.role} key={m.id} className="text-base md:text-lg font-medium leading-relaxed">
              <MessageContent className="rounded-2xl p-5 md:p-6 shadow-sm border border-border">
                {m.parts.map((part, i) => {
                  if (part.type === "text")
                    return m.role === "assistant" ? (
                      <MessageResponse key={i} className="text-base md:text-lg leading-relaxed font-medium">{part.text}</MessageResponse>
                    ) : (
                      <span key={i} className="whitespace-pre-wrap text-base md:text-lg font-semibold">
                        {part.text}
                      </span>
                    );
                  if (part.type === "reasoning" && part.text)
                    return (
                      <p key={i} className="mb-3 border-l-4 border-accent pl-4 text-xs md:text-sm font-medium italic text-muted-foreground">
                        {part.text}
                      </p>
                    );
                  if (part.type === "file")
                    return (
                      <span
                        key={i}
                        className="mb-2 mr-2 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs md:text-sm font-bold shadow-sm"
                      >
                        📎 {part.filename ?? part.mediaType}
                      </span>
                    );
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" ? (
            <Message from="assistant">
              <MessageContent className="rounded-2xl p-5">
                <Shimmer className="text-base font-bold">Karudi AI is thinking and generating reply…</Shimmer>
              </MessageContent>
            </Message>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-base font-bold text-destructive">
              ⚠️ {error.message}
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Guest Free Credit Banner & Input Section */}
      <div ref={taRef} className="border-t border-border bg-card/30 p-3 md:p-4">
        <div className="mx-auto w-full max-w-4xl">
          {/* Guest Login / Free Credit Banner */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-foreground">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>🎁 Free Credits: 5 Daily Messages Available</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground hidden md:inline">
                Want unlimited AI chat & 4K model access?
              </span>
              <a
                href="/auth"
                className="rounded-full bg-foreground px-3.5 py-1 text-xs font-bold text-background shadow-sm transition-all hover:scale-105"
              >
                Log in to unlock full access →
              </a>
            </div>
          </div>

          <PromptInput
            accept={acceptedChatFiles}
            multiple
            maxFiles={6}
            maxFileSize={20 * 1024 * 1024}
            onError={(e) => toast.error(e.message)}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-3 shadow-md focus-within:border-foreground"
          >
            <PromptInputTextarea
              placeholder="Message Karudi AI… (Ask anything or drop image files)"
              className="text-sm md:text-base font-medium min-h-[50px] p-2 placeholder:text-muted-foreground"
            />
            <PromptInputFooter className="pt-2 border-t border-border mt-2">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger className="h-9 w-9 rounded-full" />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Upload PNG, JPG, WebP, PDF or image" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit status={status} className="h-9 px-5 rounded-xl font-bold text-xs md:text-sm" />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] font-medium text-muted-foreground">
            Karudi AI can make mistakes. Files stay in this browser session.
          </p>
        </div>
      </div>

      {/* Premium Subscription Modal */}
      {showPremiumModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
          <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-card p-8 shadow-2xl rise-in text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-md">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="mt-6 font-display text-2xl md:text-3xl font-extrabold text-foreground">
              Unlock {selectedPremiumName} Model
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The <strong className="text-foreground">{selectedPremiumName}</strong> AI model is part of our Premium Subscription. Subscribe now or log in to your account to enjoy unlimited high-speed AI reasoning, document analysis, and 4K image processing!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="/pricing"
                className="flex-1 rounded-full bg-foreground px-6 py-4 text-base font-bold text-background shadow-xl transition-all hover:scale-105"
              >
                View Pricing & Subscribe →
              </a>
              <a
                href="/auth"
                className="flex-1 rounded-full border-2 border-border bg-background px-6 py-4 text-base font-bold text-foreground transition-all hover:scale-105"
              >
                Log In
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              className="mt-6 text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              Continue using Low (Free) Model
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
