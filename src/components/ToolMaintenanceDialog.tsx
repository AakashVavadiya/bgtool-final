import { Link } from "@tanstack/react-router";
import { Wrench, Sparkles, ArrowRight, ShieldAlert, Home, X } from "lucide-react";

interface ToolMaintenanceDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  toolName: string;
  toolSlug: string;
  maintenanceMessage?: string;
}

export function ToolMaintenanceDialog({
  isOpen,
  onClose,
  toolName,
  toolSlug,
  maintenanceMessage,
}: ToolMaintenanceDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      {/* Outer ambient glow */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-scale-in">
        {/* Optional Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Icon with pulsing rings */}
        <div className="flex justify-center pt-2">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-inner">
            <Wrench className="h-9 w-9 animate-pulse" />
            <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping absolute -top-1 -right-1" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Tool Maintenance & Upgradation</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {toolName} is Under Maintenance
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {maintenanceMessage ||
              "This tool is right now under maintenance and upgradation mode. Our engineering team is currently upgrading the processing model to deliver faster speeds, enhanced resolution limits, and superior quality output."}
          </p>
        </div>

        {/* Feature status box */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs space-y-2 text-left">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">Paused for Upgrades</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">Expected Availability:</span>
            <span className="font-bold text-foreground">Returning Shortly</span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            All other AI models and editing tools remain 100% online and operational.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            to="/"
            hash="tools"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-md hover:scale-[1.02] hover:opacity-90 transition-all cursor-pointer"
          >
            <span>Explore Other Tools</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
