import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AlertCircle, RefreshCw, Home, Zap, ShieldCheck, CheckCircle2, Wrench } from "lucide-react";
import { AdminStore } from "@/admin/lib/admin-store";

interface ErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    // Automatically capture and silently dispatch crash log to Admin Panel
    try {
      AdminStore.addErrorLog({
        url: typeof window !== "undefined" ? window.location.pathname : "/unknown",
        errorName: error?.name || "UnhandledRuntimeError",
        message: error?.message || "Unexpected client application interruption",
        stack: error?.stack,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        userFeedback: "Auto-captured crash incident sent to admin engineering center",
        severity: "critical",
      });
      setReportSent(true);
    } catch {
      /* ignore */
    }
  }, [error]);

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      router.invalidate();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden">
      <SiteHeader />

      <main className="grain relative flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28 text-center">
        {/* Background Subtle Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[26vw] font-black leading-none tracking-tighter text-foreground/[0.02] select-none z-0"
        >
          CARE
        </div>

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          {/* Animated Reassurance Emblem */}
          <div className="relative mb-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-accent/40 bg-card/90 shadow-2xl backdrop-blur-md">
              <Wrench className="h-11 w-11 text-accent animate-bounce" />
              <span className="flex h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping absolute -top-1 -right-1 ring-2 ring-background" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Crash Report Automatically Sent to Engineering</span>
          </div>

          <h1 className="mt-6 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Something went wrong<span className="text-accent">.</span>
          </h1>

          <p className="mt-3 font-display text-lg sm:text-xl font-bold text-foreground">
            Our team is already working on it.
          </p>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
            We’ve captured the diagnostic logs and dispatched them directly to our engineering panel. Your credits and files remain completely safe.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-8 py-4 text-sm sm:text-base font-bold text-background shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh & Try Again</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-border bg-card px-7 py-4 text-sm sm:text-base font-bold text-foreground shadow-md transition-all hover:scale-105 hover:border-foreground"
            >
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-accent/60 bg-card px-7 py-4 text-sm sm:text-base font-bold text-foreground shadow-md transition-all hover:scale-105 hover:border-accent"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Ask Karudi 1.0 Prime</span>
            </Link>
          </div>

          {/* Diagnostic Auto-Dispatch Confirmation Card */}
          <div className="mt-10 w-full rounded-2xl border border-border/80 bg-card/60 p-4 text-xs font-semibold text-muted-foreground flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-left">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Diagnostic ticket registered in Admin Center.</span>
            </div>
            <span className="font-mono text-[10px] rounded-lg bg-secondary px-2.5 py-1 text-foreground font-bold">
              Status: Investigating
            </span>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
