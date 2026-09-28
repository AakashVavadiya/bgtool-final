import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthUser, type CurrentUser } from "@/lib/auth-user";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import {
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon,
  FileText,
  Wand2,
  Search,
  Share2,
  Check,
  Zap,
  Scissors,
  RefreshCw,
  BookOpen,
  Construction,
  ArrowRight,
} from "lucide-react";
import { KarudiAvatar } from "@/components/KarudiAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DualTokenPill } from "@/components/TokenCoins";
import { useThreads, notifyThreadsChanged } from "@/hooks/use-threads";
import { deleteThread, newId, upsertThread } from "@/lib/chat-threads";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Karudi 1.0 Prime — AI Assistant & Tool Orchestrator | bg" },
      {
        name: "description",
        content:
          "Karudi AI Assistant powered by Ganga, Brahmaputra, Narmada, and Saraswati sub-models for image editing, file conversion and neural OCR.",
      },
    ],
  }),
  component: ChatLayout,
});

export function ChatLayout() {
  const { threads } = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState<"chat" | "work">("chat");
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => AuthUser.getCurrentUser());

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const update = () => setCurrentUser(AuthUser.getCurrentUser());
    window.addEventListener(REALTIME_EVENT_NAME, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const silverTokens = currentUser ? (currentUser.freeCredits ?? 10) : AuthUser.getSilverTokens();
  const goldTokens = currentUser ? (currentUser.paidCredits ?? 0) : AuthUser.getGoldTokens();
  const credits = currentUser ? (currentUser.credits ?? (silverTokens + goldTokens)) : AuthUser.getCredits();
  const displayName = currentUser?.name || "Upanishad Official";
  const initial = displayName.charAt(0).toUpperCase();

  const createThread = () => {
    if (isMobile) setSidebarOpen(false);
    const id = newId();
    upsertThread({
      id,
      title: "New chat",
      updatedAt: Date.now(),
      tier: "prime-1.0",
      messages: [],
    });
    notifyThreadsChanged();
    void navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const handleTriggerAction = (action: "remove_bg" | "convert_files" | "analyze_image") => {
    if (isMobile) setSidebarOpen(false);
    if (!params.threadId) {
      createThread();
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("karudi:chat_action", { detail: { action } }));
    }, 60);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Chat link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (ChatGPT / Gemini Dark Aesthetics)                        */}
      {/* ---------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-30 overflow-hidden transition-all duration-300 ease-in-out bg-card md:bg-card/60 backdrop-blur-xl flex flex-col shadow-2xl md:shadow-none ${
          sidebarOpen
            ? "w-72 max-w-[85vw] border-r border-border/80 opacity-100 visible translate-x-0"
            : "w-0 border-r-0 opacity-0 invisible pointer-events-none -translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-72 max-w-[85vw] h-full flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border/40">
          <Link to="/" className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-muted/50 transition-colors">
            <KarudiAvatar size="sm" />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm tracking-tight text-foreground">
                Karudi AI
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Prime 1.0
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={createThread}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card hover:bg-muted/60 px-4 py-3 text-xs md:text-sm font-bold shadow-xs transition-all hover:scale-[1.01]"
          >
            <span className="flex items-center gap-2.5">
              <Plus className="h-4 w-4 text-foreground" />
              New chat
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘N</span>
          </button>
        </div>

        {/* Quick Chat Tools: Remove BG, Convert Files, Analyze Image */}
        <div className="px-3 py-1 space-y-1">
          {/* 1. Remove BG (Ganga) */}
          <button
            type="button"
            onClick={() => handleTriggerAction("remove_bg")}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Scissors className="h-4 w-4 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate text-foreground font-bold">Remove BG</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              Ganga
            </span>
          </button>

          {/* 2. Convert Files (Brahmaputra) */}
          <button
            type="button"
            onClick={() => handleTriggerAction("convert_files")}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <RefreshCw className="h-4 w-4 text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate text-foreground font-bold">Convert Files</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              Brahmaputra
            </span>
          </button>

          {/* 3. Analyze Image (Saraswati) */}
          <button
            type="button"
            onClick={() => handleTriggerAction("analyze_image")}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BookOpen className="h-4 w-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate text-foreground font-bold">Analyze Image</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
              Saraswati
            </span>
          </button>
        </div>

        {/* Recents Thread List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 border-t border-border/40">
          <div className="flex items-center justify-between px-2 mb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Recent Chats</span>
            <Search className="h-3 w-3 opacity-60" />
          </div>

          {threads.length === 0 ? (
            <p className="px-3 py-4 text-xs font-medium text-muted-foreground">No conversations yet.</p>
          ) : null}

          <div className="space-y-0.5">
            {threads.map((t) => {
              const active = params.threadId === t.id;
              return (
                <div
                  key={t.id}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs md:text-sm font-medium transition-all ${
                    active
                      ? "bg-foreground/10 text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="min-w-0 flex-1 truncate pr-2 text-left"
                  >
                    {t.title || "Untitled Conversation"}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Delete ${t.title}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rest = deleteThread(t.id);
                      notifyThreadsChanged();
                      if (params.threadId === t.id) {
                        if (rest[0])
                          void navigate({
                            to: "/chat/$threadId",
                            params: { threadId: rest[0].id },
                          });
                        else void navigate({ to: "/chat" });
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile Footer (ChatGPT Style) */}
        <div className="p-3 border-t border-border/50 bg-card/40">
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-card border border-border/60">
            <Link
              to="/pricing"
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
              title="View account credits & pricing"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-extrabold text-white shadow-xs shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-tight">{displayName}</p>
                <p className="text-[10px] font-semibold text-amber-500/95 font-mono flex items-center gap-1 mt-0.5">
                  <Zap className="h-2.5 w-2.5 fill-current" />
                  <span>{credits > 0 ? `${credits} ${credits === 1 ? "Credit" : "Credits"}` : "0 Credits"}</span>
                </p>
              </div>
            </Link>

            {credits <= 0 ? (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1 rounded-xl bg-foreground px-2.5 py-1 text-[11px] font-extrabold text-background shadow-xs transition-all hover:scale-105 shrink-0"
              >
                <Zap className="h-3 w-3" /> Upgrade
              </Link>
            ) : null}
          </div>
        </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------------------- */}
      {/* MAIN CHAT CONTAINER                                                    */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col min-h-0 min-w-0 bg-background relative">
        {/* Modern Top Header (Matching ChatGPT / Gemini Aesthetics) */}
        <header className="h-14 shrink-0 flex items-center justify-between px-3 md:px-4 border-b border-border/50 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {(!sidebarOpen || isMobile) && (
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                title="Toggle sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Center Tabs: Chat | + Work */}
          <div className="flex items-center rounded-full border border-border/60 bg-card/60 p-0.5 sm:p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`rounded-full px-3 sm:px-4 py-1 text-xs font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("work")}
              className={`rounded-full px-3 sm:px-4 py-1 text-xs font-bold transition-all ${
                activeTab === "work"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              + Work
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-2xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Proprietary AI Engine</span>
            </div>

            <Link to="/pricing">
              <DualTokenPill silver={silverTokens} gold={goldTokens} />
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Share chat"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area: Chat or Work */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col relative overflow-hidden">
          {activeTab === "chat" ? (
            <Outlet />
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-10 text-center relative select-none animate-in fade-in zoom-in-95 duration-200">
              <div className="max-w-md w-full flex flex-col items-center">
                {/* Construction Icon Badge */}
                <div className="relative mb-5">
                  <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-xl shadow-amber-500/10 ring-8 ring-amber-500/5">
                    <Construction className="h-10 w-10 text-amber-500 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 px-1.5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black tracking-wide shadow-md">
                    2.0
                  </span>
                </div>

                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>UNDER CONSTRUCTION</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Karudi 2.0 is under Construction
                </h2>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Soon we will activate this. We are developing the next-generation autonomous workspace engine for intelligent multi-step workflows, creative pipelines, and background tool automations.
                </p>

                {/* Feature preview cards */}
                <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 shadow-2xs">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-amber-500" />
                      <span>Smart Multi-Tool Runs</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      Chain background removal, upscaling, OCR & conversions together automatically.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border/70 bg-card/60 shadow-2xs">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Autonomous Workspace</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                      Delegated task execution with live progress reporting and real-time artifact previews.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("chat")}
                    className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    <span>Back to AI Chat</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    to="/tools"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/70 transition-all shadow-2xs"
                  >
                    <span>Explore Tools</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
