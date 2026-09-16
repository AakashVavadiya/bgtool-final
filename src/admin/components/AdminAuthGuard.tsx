import { useState } from "react";
import { loginAdmin, getAdminSession, logoutAdmin } from "@/admin/lib/admin-auth";
import { ShieldCheck, Lock, Key, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(() => getAdminSession());
  const [passOrPin, setPassOrPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passOrPin.trim()) return;

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = loginAdmin(passOrPin);
      if (res.success) {
        setSession(getAdminSession());
      } else {
        setErrorMsg(res.message || "Authentication failed.");
      }
      setIsLoading(false);
    }, 400);
  };

  if (session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glowing ambient mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#101014]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/10 text-orange-500 shadow-xl">
            <Lock className="h-8 w-8 animate-pulse" />
            <span className="flex h-3 w-3 rounded-full bg-orange-500 animate-ping absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>admin.bg.tools Security Portal</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
          Admin Portal Authentication
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Enter Master Password or 4-Digit Security PIN to access live traffic, users, revenue & system logs.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div className="relative">
            <input
              type="password"
              value={passOrPin}
              onChange={(e) => {
                setPassOrPin(e.target.value);
                setErrorMsg("");
              }}
              placeholder="Enter Master Password or PIN (e.g. 8899)"
              autoFocus
              className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none transition-all shadow-inner tracking-widest"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2.5 px-4 rounded-xl">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:opacity-95 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Security Token…</span>
            ) : (
              <>
                <span>Authorize & Open Admin Panel</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick PIN Helpers */}
        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-zinc-400">
          <p className="font-semibold text-zinc-300 mb-2">Quick Security Credentials:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setPassOrPin("8899");
                setErrorMsg("");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] hover:border-orange-500 hover:text-orange-400 transition-colors"
            >
              PIN: 8899
            </button>
            <button
              type="button"
              onClick={() => {
                setPassOrPin("admin123");
                setErrorMsg("");
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] hover:border-orange-500 hover:text-orange-400 transition-colors"
            >
              Password: admin123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
