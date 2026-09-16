import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { logoutAdmin, getAdminSession } from "@/admin/lib/admin-auth";
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
  Zap,
  ExternalLink,
  ChevronRight,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getAdminSession();

  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0c0c0f]/90 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden rounded-xl border border-white/10 p-2 text-zinc-300 hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight">
            <span>bg</span>
            <span className="text-orange-500">.</span>
            <span className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 font-mono text-[11px] font-extrabold uppercase text-orange-400">
              Admin
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono pl-3 border-l border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>admin.bg.tools</span>
          </span>
        </div>

        {/* Live Visitor Pill & User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>64 Active Live Users</span>
          </div>

          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{session?.name || "Master Admin"}</p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{session?.email || "admin@bg.tools"}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out of Admin Portal"
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left Obsidian Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-[#0d0d10] border-r border-white/10 pt-16 transition-transform duration-300 md:static md:translate-x-0 md:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full justify-between p-4">
            <div className="space-y-1.5">
              <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
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
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                        : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {isActive ? <ChevronRight className="h-4 w-4 opacity-80" /> : null}
                  </button>
                );
              })}
            </div>

            {/* Bottom System Status Box */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="text-zinc-400">Karudi Cluster</span>
                <span className="text-emerald-400">1.0 Prime Online</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
              </div>
              <p className="text-[10px] text-zinc-500">GPU Acceleration 99.98% Healthy</p>
            </div>
          </div>
        </aside>

        {/* Right Active View Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-65px)]">
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
