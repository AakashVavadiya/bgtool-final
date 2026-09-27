import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminStore, type PurchasePlanConfig } from "@/admin/lib/admin-store";
import { AuthUser, type CurrentUser } from "@/lib/auth-user";
import { openFestivalOffersDialog } from "@/components/FestivalOffersDialog";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { Wand2, Zap, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { DualTokenPill, TokenCoin } from "@/components/TokenCoins";

const links = [
  { label: "Home.", to: "/" },
  { label: "Models.", to: "/models" },
  { label: "Tools.", to: "/tools" },
  { label: "Smart Assistant.", to: "/chat" },
  { label: "Pricing.", to: "/pricing" },
  { label: "FAQ.", to: "/pricing", hash: "faq" },
] as const;

export function SiteHeader({ floating = false }: { floating?: boolean }) {
  const [activeOffer, setActiveOffer] = useState<PurchasePlanConfig | null>(() => AdminStore.getActiveFestivalOffer());
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => AuthUser.getCurrentUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setActiveOffer(AdminStore.getActiveFestivalOffer());
      setCurrentUser(AuthUser.getCurrentUser());
    };
    window.addEventListener(REALTIME_EVENT_NAME, update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    AuthUser.logout();
    setCurrentUser(null);
    setProfileOpen(false);
    window.location.reload();
  };

  return (
    <header className={floating ? "fixed inset-x-0 top-0 z-50 bg-background/90 backdrop-blur-md" : "relative z-50 border-b border-border bg-background"}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 md:px-12 md:py-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 rounded-xl text-foreground hover:bg-muted/80 md:hidden transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

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
          className="notranslate py-4 font-display text-3xl font-bold tracking-tight md:absolute md:left-1/2 md:-translate-x-1/2 md:text-4xl"
        >
          bg<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-4 py-4">
          {activeOffer && (
            <button
              type="button"
              onClick={openFestivalOffersDialog}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shadow-xs animate-pulse"
              title="Click to view special festival offer"
            >
              <Wand2 className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">Festival Offer</span>
              <span className="sm:hidden">Offer</span>
            </button>
          )}

          <ThemeToggle />

          {/* User Logged In State vs Logged Out State */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Dual Token Pill: Silver (Free) & Gold (Paid) Tokens */}
              <Link to="/pricing">
                <DualTokenPill
                  silver={currentUser.freeCredits ?? 10}
                  gold={currentUser.paidCredits ?? 0}
                />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1 sm:pr-3 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background font-black text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-68 rounded-2xl border border-border bg-card p-2.5 shadow-2xl z-50 animate-scale-up space-y-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-bold text-xs text-foreground truncate">{currentUser.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                          {currentUser.plan} plan
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 px-1.5 py-0.5 text-[9px] font-bold">
                          <TokenCoin type="silver" size="xs" />
                          <span>10 Free / Day</span>
                        </span>
                      </div>
                    </div>

                    {/* Token Details Card */}
                    <div className="rounded-xl bg-muted/40 p-2.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Token Balance
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {currentUser.credits} Total
                        </span>
                      </div>

                      {/* Silver Free Tokens */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <TokenCoin type="silver" size="xs" />
                          <span>Silver Tokens (Free)</span>
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {currentUser.freeCredits ?? 10}
                        </span>
                      </div>

                      {/* Gold Paid Tokens */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <TokenCoin type="gold" size="xs" showGlow={(currentUser.paidCredits ?? 0) > 0} />
                          <span>Gold Tokens (Purchased)</span>
                        </span>
                        <span className="font-mono font-bold text-amber-500">
                          {currentUser.paidCredits ?? 0}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/pricing"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <TokenCoin type="gold" size="xs" />
                        <span>Get Gold Tokens</span>
                      </span>
                      <span className="font-mono font-bold text-amber-500">Top up →</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <span>Studio & Tools</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-4">
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
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/98 backdrop-blur-xl px-5 py-4 shadow-xl space-y-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {links.map((l) =>
              "hash" in l ? (
                <Link
                  key={l.label}
                  to={l.to}
                  hash={l.hash}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          {!currentUser && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl border border-border bg-muted/40 py-2.5 text-xs font-bold text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-xl bg-foreground py-2.5 text-xs font-bold text-background"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
