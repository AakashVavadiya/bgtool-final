import { useState, useEffect } from "react";
import { ShieldAlert, LogOut, MessageSquare, AlertTriangle } from "lucide-react";
import { AuthUser } from "@/lib/auth-user";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { Link } from "@tanstack/react-router";
import { getAdminSession } from "@/admin/lib/admin-auth";

function isAdminContext(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return true;
  if (getAdminSession() !== null) return true;
  return false;
}

export function RestrictedUserDialog() {
  const [isRestricted, setIsRestricted] = useState<boolean>(() => {
    if (isAdminContext()) return false;
    return AuthUser.isUserRestricted();
  });

  const checkRestriction = () => {
    if (isAdminContext()) {
      setIsRestricted(false);
      return;
    }
    const restricted = AuthUser.isUserRestricted();
    setIsRestricted(restricted);
  };

  useEffect(() => {
    // Initial check
    checkRestriction();

    // Listen for custom trigger event (ignored inside admin panel)
    const handleTrigger = () => {
      if (isAdminContext()) return;
      setIsRestricted(true);
    };

    // Listen for telemetry / real-time updates from admin or auth
    const handleRealtime = () => {
      checkRestriction();
    };

    window.addEventListener("bg:show_restricted_dialog", handleTrigger);
    window.addEventListener(REALTIME_EVENT_NAME, handleRealtime);
    window.addEventListener("storage", handleRealtime);

    // Periodic check every 5 seconds so live admin toggles take effect immediately
    const interval = setInterval(checkRestriction, 5000);

    return () => {
      window.removeEventListener("bg:show_restricted_dialog", handleTrigger);
      window.removeEventListener(REALTIME_EVENT_NAME, handleRealtime);
      window.removeEventListener("storage", handleRealtime);
      clearInterval(interval);
    };
  }, []);

  if (isAdminContext()) return null;
  if (!isRestricted) return null;

  const currentUser = AuthUser.getCurrentUser();

  const handleLogout = () => {
    AuthUser.logout();
    setIsRestricted(false);
    window.location.href = "/";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-rose-500/40 bg-card p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-500 shadow-xl">
          <ShieldAlert className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" /> Access Suspended
          </div>

          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-foreground leading-snug">
            You cannot use Bg. because you have violated our terms and conditions.
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
            Your account <span className="font-bold text-foreground font-mono">{currentUser?.email || "associated with this session"}</span> has been restricted by an administrator due to violations of our Terms of Service, Acceptable Use Policy, or suspicious automated activity. All image processing, tool usage, and studio features have been locked.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background hover:bg-muted px-6 py-3.5 text-xs sm:text-sm font-extrabold text-foreground shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-primary" /> Contact Support
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/80 font-medium">
          If you believe this is an error, please reach out to our trust & safety team through the support desk.
        </p>
      </div>
    </div>
  );
}
