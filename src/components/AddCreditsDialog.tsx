import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Zap, Coins, ArrowRight, X, Check, ShieldCheck, Wand2 } from "lucide-react";
import { AuthUser } from "@/lib/auth-user";
import { toast } from "sonner";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { TokenCoin } from "@/components/TokenCoins";

export interface AddCreditsDialogDetail {
  toolName?: string;
  toolSlug?: string;
  creditCost?: number;
  currentCredits?: number;
}

export function openAddCreditsDialog(detail?: AddCreditsDialogDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bg:show_add_credits_dialog", { detail }));
  }
}

// Alias for semantic clarity
export const openAddTokensDialog = openAddCreditsDialog;

interface AddCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
  toolSlug?: string;
  creditCost?: number;
  currentCredits?: number;
}

const QUICK_PACKS = [
  {
    id: "pack_5",
    name: "Starter Pack",
    credits: 5,
    price: 199,
    badge: null,
    perCredit: "₹39.8 / token",
  },
  {
    id: "pack_15",
    name: "Creator Pack",
    credits: 15,
    price: 499,
    badge: "Most Popular",
    perCredit: "₹33.2 / token",
  },
  {
    id: "pack_50",
    name: "Pro Studio",
    credits: 50,
    price: 999,
    badge: "Best Value (Save 50%)",
    perCredit: "₹19.9 / token",
  },
];

export function AddCreditsDialog({
  isOpen,
  onClose,
  toolName = "Tool",
  creditCost = 1,
  currentCredits = 0,
}: AddCreditsDialogProps) {
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickBuy = (credits: number, name: string, price: number, packId: string) => {
    setPurchasingId(packId);
    setTimeout(() => {
      const txnId = AuthUser.addPurchasedTokens(credits, name, price, "UPI");
      toast.success(`Success! Added ${credits} Gold Tokens to your account. (Ref: ${txnId})`);
      setPurchasingId(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "credits_purchased" } }));
      }
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Tag */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 shadow-inner">
            <TokenCoin type="gold" size="lg" showGlow />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <TokenCoin type="gold" size="xs" />
            <span>Tokens Needed · Add Gold Tokens</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Get Gold Tokens to Continue
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            You need <strong className="text-foreground">{creditCost} token{creditCost === 1 ? "" : "s"}</strong> to process with{" "}
            <strong className="text-foreground">{toolName}</strong>. Your current balance is{" "}
            <strong className="text-amber-500 font-mono">{currentCredits} token{currentCredits === 1 ? "" : "s"}</strong>.
          </p>
          <div className="rounded-xl bg-muted/40 border border-border/60 px-3.5 py-2.5 text-[11px] text-muted-foreground max-w-md text-left flex items-start gap-2.5">
            <TokenCoin type="silver" size="sm" className="mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-foreground">Daily 10 Free Silver Tokens</strong> are renewed every day. Top up with <strong className="text-amber-500">Gold Tokens</strong> to keep creating without interruption (Purchased Gold Tokens never expire).
            </div>
          </div>
        </div>

        {/* Quick Recharge Packs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {QUICK_PACKS.map((pack) => {
            const isHighlight = pack.id === "pack_15";
            const isBuying = purchasingId === pack.id;

            return (
              <div
                key={pack.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  isHighlight
                    ? "border-amber-500/60 bg-amber-500/5 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30 scale-[1.02]"
                    : "border-border bg-card/60 hover:border-foreground/40 hover:bg-muted/30"
                }`}
              >
                {pack.badge && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 tracking-wider shadow-sm">
                    {pack.badge}
                  </span>
                )}

                <div>
                  <h4 className="font-extrabold text-sm text-foreground">{pack.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-display text-foreground">₹{pack.price}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <TokenCoin type="gold" size="xs" />
                    <span>+{pack.credits} Gold Tokens</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                    {pack.perCredit}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={Boolean(purchasingId)}
                  onClick={() => handleQuickBuy(pack.credits, pack.name, pack.price, pack.id)}
                  className={`mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black shadow-sm transition-all cursor-pointer ${
                    isHighlight
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95"
                      : "bg-foreground text-background hover:opacity-90 active:scale-95"
                  }`}
                >
                  {isBuying ? (
                    <span>Processing…</span>
                  ) : (
                    <>
                      <span>Add {pack.credits} Tokens</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions & Trust Badges */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Gold Tokens never expire · Instant activation</span>
          </div>

          <Link
            to="/pricing"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors cursor-pointer"
          >
            <span>View All Token Plans</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
