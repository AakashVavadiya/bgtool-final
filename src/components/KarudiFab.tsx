import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, X, ArrowRight, Send } from "lucide-react";
import { KarudiAvatar } from "@/components/KrishnaAvatar";

export function KarudiFab() {
  const [open, setOpen] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState("");
  const navigate = useNavigate();

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    void navigate({ to: "/chat" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Quick Assistant Popup Drawer */}
      {open && (
        <div className="w-[340px] sm:w-[380px] rounded-3xl border border-accent/30 bg-card/95 p-6 shadow-2xl backdrop-blur-xl rise-in text-foreground ring-1 ring-accent/20">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <KarudiAvatar size="md" />
              <div>
                <h4 className="font-display text-base font-extrabold leading-tight">
                  Karudi 1.0 Prime Assistant
                </h4>
                <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Prime 1.0 Engine Online
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close Assistant popup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-4 text-xs font-medium leading-relaxed text-muted-foreground">
            Hi! I am Karudi 1.0 Prime. Ask me anything about image tools, background removal, photo editing, or document analysis.
          </p>

          {/* Quick Prompts */}
          <div className="mt-4 space-y-2">
            {[
              "✂️ How to remove background in 4K?",
              "✨ How to clean & upscale blurry photo?",
              "🎨 Convert PNG to WebP/JPG",
            ].map((p) => (
              <Link
                key={p}
                to="/chat"
                className="block rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-bold text-foreground transition-all hover:scale-[1.02] hover:border-accent hover:text-accent shadow-sm"
              >
                {p}
              </Link>
            ))}
          </div>

          <form onSubmit={handleQuickSubmit} className="mt-5 flex items-center gap-2">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ask Karudi 1.0 Prime…"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent p-2 text-accent-foreground transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <Link
            to="/chat"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-xs font-bold text-background shadow-md transition-all hover:scale-105"
          >
            Try Karudi 1.0 Prime <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Animated FAB Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-3 rounded-full border-2 border-accent bg-foreground px-4 py-2.5 text-background shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none"
      >
        <span className="absolute -inset-1 rounded-full bg-accent/40 blur-md animate-pulse pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <KarudiAvatar size="sm" className="ring-2 ring-background shadow-md" />

          <div className="text-left hidden sm:block">
            <p className="font-display text-xs font-extrabold leading-none text-background">
              Karudi 1.0 Prime
            </p>
            <p className="text-[10px] font-bold text-accent leading-none mt-1 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 animate-spin" /> Try AI
            </p>
          </div>
        </div>

        <span className="flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background animate-ping absolute -top-0.5 -right-0.5" />
      </button>
    </div>
  );
}
