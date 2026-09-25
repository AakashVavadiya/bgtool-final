import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { logoutAdmin, getAdminSession } from "@/admin/lib/admin-auth";
import { Telemetry, REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardOverview } from "@/admin/views/DashboardOverview";
import { UsersManagement } from "@/admin/views/UsersManagement";
import { PurchasesView } from "@/admin/views/PurchasesView";
import { ToolsConfigView } from "@/admin/views/ToolsConfigView";
import { ErrorLogsView } from "@/admin/views/ErrorLogsView";
import { SupportDeskView } from "@/admin/views/SupportDeskView";
import { MarketingMailView } from "@/admin/views/MarketingMailView";
import {
  Activity,
  Users,
  CreditCard,
  Wrench,
  AlertTriangle,
  Inbox,
  Mail,
  LogOut,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "users"
  | "purchases"
  | "tools"
  | "errors"
  | "support"
  | "marketing";

const ADMIN_ACTIVE_TAB_KEY = "bg.admin.active_tab.v2";
const VALID_TABS: AdminTab[] = ["overview", "users", "purchases", "tools", "errors", "support", "marketing"];

function getInitialAdminTab(): AdminTab {
  if (typeof window === "undefined") return "overview";

  // 1. URL Hash (e.g. /admin#users)
  const hash = window.location.hash.replace("#", "").toLowerCase() as AdminTab;
  if (VALID_TABS.includes(hash)) return hash;

  // 2. URL search param (e.g. /admin?tab=users)
  try {
    const urlParam = new URLSearchParams(window.location.search).get("tab")?.toLowerCase() as AdminTab;
    if (VALID_TABS.includes(urlParam)) return urlParam;
  } catch {
    /* ignore */
  }

  // 3. Saved storage key (keeps user on same screen after verification or reload)
  try {
    const saved = (sessionStorage.getItem(ADMIN_ACTIVE_TAB_KEY) || localStorage.getItem(ADMIN_ACTIVE_TAB_KEY))?.toLowerCase() as AdminTab;
    if (VALID_TABS.includes(saved)) return saved;
  } catch {
    /* ignore */
  }

  return "overview";
}

const navTabs = [
  { id: "overview" as const, label: "Traffic & Overview", icon: Activity },
  { id: "users" as const, label: "Logged Users & Credits", icon: Users },
  { id: "purchases" as const, label: "Purchases & Plans", icon: CreditCard },
  { id: "tools" as const, label: "Tools Limits & Toggles", icon: Wrench },
  { id: "errors" as const, label: "Error Logs & Reports", icon: AlertTriangle },
  { id: "support" as const, label: "Support Desk & Inbox", icon: Inbox },
  { id: "marketing" as const, label: "Marketing Broadcast", icon: Mail },
];

export function AdminLayout() {
  const [activeTab, setActiveTabState] = useState<AdminTab>(getInitialAdminTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(() => Telemetry.getLiveActiveUsersCount());
  const session = getAdminSession();

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(ADMIN_ACTIVE_TAB_KEY, tab);
        localStorage.setItem(ADMIN_ACTIVE_TAB_KEY, tab);
        const url = new URL(window.location.href);
        url.hash = tab;
        window.history.replaceState(null, "", url.toString());
      } catch {
        /* ignore */
      }
    }
  };

  useEffect(() => {
    // Keep tab in sync with browser hash / back-forward navigation
    const syncFromUrlOrStorage = () => {
      const current = getInitialAdminTab();
      setActiveTabState(current);
    };

    window.addEventListener("hashchange", syncFromUrlOrStorage);
    window.addEventListener("popstate", syncFromUrlOrStorage);

    const updateLive = () => {
      setLiveVisitors(Telemetry.getLiveActiveUsersCount());
    };
    window.addEventListener(REALTIME_EVENT_NAME, updateLive);
    window.addEventListener("storage", updateLive);
    const interval = setInterval(updateLive, 4000);
    return () => {
      window.removeEventListener("hashchange", syncFromUrlOrStorage);
      window.removeEventListener("popstate", syncFromUrlOrStorage);
      window.removeEventListener(REALTIME_EVENT_NAME, updateLive);
      window.removeEventListener("storage", updateLive);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors selection:bg-accent selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/85 px-6 py-3.5 backdrop-blur-xl shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight">
            <span>bg</span>
            <span className="text-accent">.</span>
            <span className="rounded-lg bg-accent/10 border border-accent/25 px-2 py-0.5 font-mono text-[11px] font-extrabold uppercase text-accent">
              Admin
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono pl-3 border-l border-border">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>admin.bg.tools</span>
          </span>
        </div>

        {/* Live Visitor Pill & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{liveVisitors} Active Live {liveVisitors === 1 ? "User" : "Users"}</span>
          </div>

          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <ThemeToggle />

          <div className="flex items-center gap-3 border-l border-border pl-3 sm:pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-none">{session?.name || "Master Admin"}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{session?.email || "admin@bg.tools"}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out of Admin Portal"
              className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-card/95 border-r border-border pt-16 transition-transform duration-300 md:static md:translate-x-0 md:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full justify-between p-4">
            <div className="space-y-1.5">
              <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Management Modules
              </p>

              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-foreground text-background shadow-md font-extrabold"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-background" : "text-muted-foreground"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive ? <ChevronRight className="h-4 w-4 opacity-70" /> : null}
                  </button>
                );
              })}
            </div>

            {/* Bottom System Status Box */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="text-muted-foreground">AI Processing Engines</span>
                <span className="text-emerald-600 dark:text-emerald-400">All 5 Models Online</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[99%]" />
              </div>
              <p className="text-[10px] text-muted-foreground">Sub-pixel matting & background removal ready</p>
            </div>
          </div>
        </aside>

        {/* Right Active View Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-65px)] bg-background">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "purchases" && <PurchasesView />}
          {activeTab === "tools" && <ToolsConfigView />}
          {activeTab === "errors" && <ErrorLogsView />}
          {activeTab === "support" && <SupportDeskView />}
          {activeTab === "marketing" && <MarketingMailView />}
        </main>
      </div>
    </div>
  );
}
