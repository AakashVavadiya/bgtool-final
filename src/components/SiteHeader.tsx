import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageTranslator } from "@/components/LanguageTranslator";

const links = [
  { label: "Home.", to: "/" },
  { label: "Models.", to: "/models" },
  { label: "Tools.", to: "/", hash: "tools" },
  { label: "Smart Assistant.", to: "/chat" },
  { label: "Pricing.", to: "/pricing" },
  { label: "FAQ.", to: "/pricing", hash: "faq" },
] as const;

export function SiteHeader({ floating = false }: { floating?: boolean }) {
  return (
    <header className={floating ? "fixed inset-x-0 top-0 z-50 bg-background/90 backdrop-blur-md" : "relative z-50 border-b border-border bg-background"}>
      <div className="flex items-center justify-between px-6 py-2 md:px-12 md:py-3">
        <nav className="hidden items-center gap-8 py-5 text-base font-semibold md:flex">
          {links.map((l) =>
            "hash" in l ? (
              <Link
                key={l.label}
                to={l.to}
                hash={l.hash}
                className="transition-all hover:text-accent hover:opacity-80"
              >
                {l.label}
              </Link>
            ) : (
              <Link key={l.label} to={l.to} className="transition-all hover:text-accent hover:opacity-80">
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <Link
          to="/"
          className="py-4 font-display text-3xl font-bold tracking-tight md:absolute md:left-1/2 md:-translate-x-1/2 md:text-4xl"
        >
          bg<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-4 py-4">
          <LanguageTranslator variant="header" />
          <ThemeToggle />
          <Link to="/auth" className="text-base font-medium transition-opacity hover:opacity-60 hidden sm:inline">
            Log in
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-foreground px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-background transition-all hover:scale-[1.03] hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
