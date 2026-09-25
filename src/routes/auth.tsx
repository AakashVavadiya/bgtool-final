import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthUser, type CurrentUser } from "@/lib/auth-user";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Zap,
  LogOut,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or Sign up — bg Image Toolkit" },
      {
        name: "description",
        content:
          "Access your bg account to remove backgrounds, upscale images and manage credits across 30+ free online image tools.",
      },
      { property: "og:title", content: "Log in to bg" },
      {
        property: "og:description",
        content: "Sign in to bg to manage credits and run the full image toolkit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => AuthUser.getCurrentUser());
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const update = () => setCurrentUser(AuthUser.getCurrentUser());
    window.addEventListener(REALTIME_EVENT_NAME, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        const res = AuthUser.login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Login failed. Please check your credentials.");
          toast.error(res.error || "Login failed.");
          setIsLoading(false);
          return;
        }

        toast.success(`Welcome back, ${res.user!.name}! (${res.user!.credits} credits available)`);
        setCurrentUser(res.user!);
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } else {
        const res = AuthUser.signUp(name, email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Registration failed.");
          toast.error(res.error || "Registration failed.");
          setIsLoading(false);
          return;
        }

        toast.success(`Account created! Welcome, ${res.user!.name}! 10 free daily credits added.`);
        setCurrentUser(res.user!);
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      }
    }, 350);
  };

  const handleSocialAuth = (provider: "google" | "apple") => {
    setIsLoading(true);
    setTimeout(() => {
      const res = AuthUser.loginWithProvider(provider);
      setIsLoading(false);
      if (res.success) {
        toast.success(`Signed in with ${provider === "google" ? "Google" : "Apple"} successfully!`);
        setCurrentUser(res.user!);
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } else {
        toast.error(res.error || "Social authentication failed.");
      }
    }, 400);
  };

  const handleLogout = () => {
    AuthUser.logout();
    setCurrentUser(null);
    toast.success("Logged out successfully.");
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      {/* Left / brand panel */}
      <aside className="grain relative hidden flex-col justify-between border-r border-border p-10 lg:flex bg-card/30">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
          bg<span className="text-accent">.</span>
        </Link>
        <div>
          <p className="halftone-text font-display text-[7vw] font-medium leading-normal pb-3 text-foreground">
            bg.
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
            One account for all thirty studio tools — background removal, upscaling, conversion and
            clean-up, with credits shared seamlessly across every one of them.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} bg. tools</p>
      </aside>

      {/* Main Content Area */}
      <main className="flex items-center justify-center px-5 py-16 md:px-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight lg:hidden">
            bg<span className="text-accent">.</span>
          </Link>

          {/* IF ALREADY LOGGED IN: SHOW ACTIVE PROFILE CARD */}
          {currentUser ? (
            <div className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background font-display text-2xl font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground">{currentUser.name}</h2>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">
                      {currentUser.plan}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>

              {/* Credits Status */}
              <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4 border border-border">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500 fill-current" />
                  <span className="text-xs font-bold text-foreground">Available Credits</span>
                </div>
                <span className="font-mono text-xl font-black text-amber-500">
                  {currentUser.credits}
                </span>
              </div>

              {/* Navigation Actions */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background hover:scale-[1.02] transition-all cursor-pointer shadow-md"
                >
                  <span>Go to Studio & Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/pricing"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/60 px-6 py-3 text-xs font-bold text-foreground hover:bg-secondary transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Get More Credits</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 px-6 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            /* IF NOT LOGGED IN: SHOW AUTH FORM */
            <div>
              {/* Tab Switcher */}
              <div className="mt-8 inline-flex rounded-full border border-border p-1 lg:mt-0">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setErrorMsg("");
                    }}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                      mode === m
                        ? "bg-foreground text-background shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              <h1 className="mt-8 font-display text-3xl font-medium leading-tight md:text-4xl">
                {isLogin ? "Welcome back." : "Create your account."}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {isLogin
                  ? "Log in to access your tools and studio credits."
                  : "Set up a free account with 10 daily credits to process images."}
              </p>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-500 animate-shake">
                  {errorMsg}
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">Your Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="e.g. Aakash Patel"
                      autoComplete="name"
                      className="rounded-2xl"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="you@studio.com"
                    autoComplete="email"
                    required
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder="••••••••"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      className="rounded-2xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-extrabold text-background transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isLoading ? "Authenticating..." : isLogin ? "Log in" : "Create Account (Free 10 Credits)"}</span>
                </button>
              </form>

              <div className="my-7 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or continue with
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialAuth("google")}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-all hover:bg-secondary cursor-pointer hover:border-foreground/30"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth("apple")}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-all hover:bg-secondary cursor-pointer hover:border-foreground/30"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.73-7.85-12.1-14.42-6.53-9.8-11.75-20.9-15.66-33.3-3.92-12.39-5.88-24.16-5.88-35.32 0-14.14 3.7-25.9 11.1-35.3 7.4-9.39 16.75-14.2 28.05-14.43 4.36 0 9.47 1.2 15.34 3.6 5.88 2.4 9.47 3.69 10.78 3.86 1.74-.27 5.66-1.63 11.74-4.08 6.09-2.45 11.22-3.54 15.42-3.26 12.3.65 22.09 5.39 29.35 14.2-10.88 6.64-16.2 15.67-15.98 27.1.22 8.92 3.65 16.48 10.28 22.68 6.64 6.2 14.53 9.74 23.67 10.61-2.4 7.29-5.44 14.42-9.14 21.41zM119.22 31.84c0-7.29 2.67-14.15 8.01-20.57 5.34-6.42 11.97-10.4 19.89-11.95.87 7.29-1.42 14.26-6.86 20.9-5.44 6.64-12.19 10.51-20.25 11.62-.22-.38-.43-1.03-.79-2z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              <p className="mt-8 text-xs leading-relaxed text-muted-foreground text-center">
                By continuing you agree to the Terms and Privacy Policy.{" "}
                <Link to="/pricing" className="text-foreground underline">
                  See pricing
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
