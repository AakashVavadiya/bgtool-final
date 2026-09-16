import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or Sign up — bg Image Toolkit" },
      {
        name: "description",
        content:
          "Access your bg account to remove backgrounds, upscale images and manage credits across 25 free online image tools.",
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
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      import("sonner").then(({ toast }) => toast.error("Please enter a valid email."));
      return;
    }

    import("@/lib/auth-user").then(({ AuthUser }) => {
      let user;
      if (isLogin) {
        user = AuthUser.login(email, name);
      } else {
        user = AuthUser.signUp(name || email.split("@")[0] || "Creative Creator", email);
      }

      import("sonner").then(({ toast }) => {
        toast.success(`Welcome back, ${user.name}! You have ${user.credits} studio credits.`);
      });

      // Redirect to home or previous tool
      window.location.href = "/";
    });
  };

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      {/* Left / brand panel */}
      <aside className="grain relative hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
          bg<span className="text-accent">.</span>
        </Link>
        <div>
          <p className="halftone-text font-display text-[7vw] font-medium leading-normal pb-3 text-foreground">
            bg.
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
            One account for all twenty-five tools — background removal, upscaling, conversion and
            clean-up, with credits shared across every one of them.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} bg</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-5 py-16 md:px-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight lg:hidden">
            bg<span className="text-accent">.</span>
          </Link>

          <div className="mt-8 inline-flex rounded-full border border-border p-1 lg:mt-0">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  mode === m ? "bg-foreground text-background" : "text-muted-foreground"
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
              ? "Log in to pick up where your last batch stopped."
              : "Set up an account to track credits and keep your exports in one place."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              {isLogin ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {["Continue with Google", "Continue with Apple"].map((label) => (
              <button
                key={label}
                type="button"
                className="w-full rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to the Terms and Privacy Policy.{" "}
            <Link to="/pricing" className="text-foreground underline">
              See pricing
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
