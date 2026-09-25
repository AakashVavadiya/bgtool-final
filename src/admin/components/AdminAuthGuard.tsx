import { useState, useEffect } from "react";
import { loginAdmin, getAdminSession, type AdminUser } from "@/admin/lib/admin-auth";
import { ShieldCheck, Lock, ArrowRight, ShieldAlert, KeyRound, User, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(() => typeof window !== "undefined");
  const [session, setSession] = useState<AdminUser | null>(() => getAdminSession());
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only executed on client after hydration — verified securely from sessionStorage
    const activeSession = getAdminSession();
    setSession(activeSession);
    setIsMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Please enter your admin password or security PIN.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = loginAdmin(username, password);
      if (res.success) {
        setSession(getAdminSession());
      } else {
        setErrorMsg(res.message || "Invalid credentials. Please verify and try again.");
      }
      setIsLoading(false);
    }, 300);
  };

  // 1. SSR & Initial Hydration: render identical secure clearance shell (zero mismatch, zero data leak)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors selection:bg-accent selection:text-white">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground font-mono">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            <span>Verifying Security Clearance...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Client is mounted: If securely authenticated, render the dashboard
  if (session) {
    return <>{children}</>;
  }

  // 3. Otherwise: render the login authentication form
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors selection:bg-accent selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="font-display text-4xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
            bg<span className="text-accent">.</span>
          </Link>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-bold text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Portal & Control Center</span>
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Administrator Sign In
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground font-medium max-w-xs">
            Authenticate to manage live traffic, system errors, user credits, and customer inquiries.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Username / Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="admin or admin@bg.tools"
                className="w-full rounded-2xl border border-input bg-background/60 pl-11 pr-4 py-3.5 text-sm font-semibold placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Password or Security PIN</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Enter password (e.g. admin123 or 8899)"
                autoFocus
                className="w-full rounded-2xl border border-input bg-background/60 pl-11 pr-4 py-3.5 text-sm font-semibold placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 py-2.5 px-4 rounded-xl animate-fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-sm font-bold text-background shadow-md transition-all hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Credentials…</span>
            ) : (
              <>
                <span>Access Admin Control Center</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials reminder */}
        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Default: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">admin</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">admin123</code></span>
          <Link to="/" className="hover:text-foreground hover:underline transition-colors">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
