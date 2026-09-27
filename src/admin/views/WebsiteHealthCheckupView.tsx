import { useState, useMemo, useEffect, useRef } from "react";
import {
  AdminStore,
  type SiteHealthRouteItem,
  type SiteHealthAuditReport,
  type HealthScheduleConfig,
} from "@/admin/lib/admin-store";
import {
  getSiteCatalog,
  testSingleRouteHealth,
  runFullSiteHealthAudit,
} from "@/admin/lib/health-checker";
import { toast } from "sonner";
import {
  HeartPulse,
  Play,
  Square,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Filter,
  Layers,
  Zap,
  Terminal,
  FileText,
  Globe,
  Bot,
  Wrench,
  Shield,
  Activity,
  ChevronRight,
  Eye,
  X,
  Bug,
  Wand2,
  CalendarClock,
  Bell,
  Settings2,
  Archive,
} from "lucide-react";

export function WebsiteHealthCheckupView() {
  const [routes, setRoutes] = useState<SiteHealthRouteItem[]>(() => {
    const saved = AdminStore.getHealthAudit();
    if (saved && saved.routes && saved.routes.length > 0) {
      return saved.routes;
    }
    return getSiteCatalog();
  });

  const [activeReport, setActiveReport] = useState<SiteHealthAuditReport | null>(() =>
    AdminStore.getHealthAudit()
  );

  const [scheduleConfig, setScheduleConfig] = useState<HealthScheduleConfig>(() =>
    AdminStore.getHealthSchedule()
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [currentTestingRoute, setCurrentTestingRoute] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRoute, setSelectedRoute] = useState<SiteHealthRouteItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Form state for schedule settings
  const [tempSchedule, setTempSchedule] = useState<HealthScheduleConfig>(scheduleConfig);

  const cancelAuditRef = useRef(false);

  // Sync state if storage changes
  useEffect(() => {
    const sync = () => {
      const saved = AdminStore.getHealthAudit();
      if (saved) {
        setActiveReport(saved);
        setRoutes(saved.routes);
      }
      setScheduleConfig(AdminStore.getHealthSchedule());
    };
    window.addEventListener("bg:telemetry:update", sync);
    return () => window.removeEventListener("bg:telemetry:update", sync);
  }, []);

  // ─── Automated Schedule Background Runner ────────────────────────────────
  useEffect(() => {
    if (!scheduleConfig.enabled) return;

    const interval = setInterval(() => {
      if (isAuditing) return;

      const schedule = AdminStore.getHealthSchedule();
      if (!schedule.enabled) return;

      const now = Date.now();
      const nextTime = schedule.nextRunAt ? new Date(schedule.nextRunAt).getTime() : 0;

      if (nextTime > 0 && now >= nextTime) {
        // Trigger automated scheduled run
        toast.info("Triggering scheduled automated website health audit...");
        handleStartFullAudit(true);

        const nextRun = new Date(now + schedule.intervalMinutes * 60 * 1000).toISOString();
        const updatedSchedule: HealthScheduleConfig = {
          ...schedule,
          lastRunAt: new Date(now).toISOString().replace("T", " ").slice(0, 19),
          nextRunAt: nextRun,
        };
        AdminStore.saveHealthSchedule(updatedSchedule);
        setScheduleConfig(updatedSchedule);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [scheduleConfig.enabled, isAuditing]);

  // ─── Actions: Run Full System Health Audit ─────────────────────────────────
  const handleStartFullAudit = async (isScheduledRun = false) => {
    // 1. Archive older report to history before cleaning
    if (activeReport && activeReport.routes && activeReport.routes.length > 0) {
      AdminStore.archiveHealthAudit(activeReport);
    }

    // 2. Clean older report completely from checkup page
    AdminStore.clearHealthAudit();
    setActiveReport(null);
    setSelectedRoute(null);
    setCurrentTestingRoute(null);
    setCompletedCount(0);

    // 3. Reset routes to fresh clean catalog
    cancelAuditRef.current = false;
    setIsAuditing(true);
    const catalog = getSiteCatalog();
    setRoutes(catalog);

    if (!isScheduledRun) {
      toast.info(`Starting fresh system-wide health audit across ${catalog.length} routes (older report archived)...`);
    }

    try {
      const report = await runFullSiteHealthAudit(catalog, {
        shouldCancel: () => cancelAuditRef.current,
        onProgress: (current, done, total, currReport) => {
          setCurrentTestingRoute(current.name);
          setCompletedCount(done);
          setActiveReport({ ...currReport });
          setRoutes((prev) =>
            prev.map((r) => (r.id === current.id ? current : r))
          );
        },
      });

      setActiveReport(report);
      setRoutes(report.routes);
      setCurrentTestingRoute(null);

      // Update schedule last run & next run
      const schedule = AdminStore.getHealthSchedule();
      if (schedule.enabled) {
        const now = Date.now();
        const nextRun = new Date(now + schedule.intervalMinutes * 60 * 1000).toISOString();
        const updated: HealthScheduleConfig = {
          ...schedule,
          lastRunAt: new Date(now).toISOString().replace("T", " ").slice(0, 19),
          nextRunAt: nextRun,
        };
        AdminStore.saveHealthSchedule(updated);
        setScheduleConfig(updated);
      }

      if (report.errorCount > 0) {
        toast.error(
          `Audit complete: ${report.errorCount} critical issues captured into Error Logs!`
        );
      } else {
        toast.success(
          `Health audit complete: 100% of ${report.totalRoutes} routes are healthy!`
        );
      }
    } catch {
      toast.error("Audit was interrupted.");
    } finally {
      setIsAuditing(false);
      setCurrentTestingRoute(null);
    }
  };

  const handleStopAudit = () => {
    cancelAuditRef.current = true;
    setIsAuditing(false);
    setCurrentTestingRoute(null);
    toast.info("Health audit stopped.");
  };

  // Test single route
  const handleTestSingleRoute = async (routeToTest: SiteHealthRouteItem) => {
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeToTest.id ? { ...r, status: "testing" } : r
      )
    );

    try {
      const audited = await testSingleRouteHealth(routeToTest);
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeToTest.id ? audited : r))
      );

      if (selectedRoute && selectedRoute.id === audited.id) {
        setSelectedRoute(audited);
      }

      if (audited.status === "error") {
        toast.error(`Route "${audited.name}" failed: Error captured into logs!`);
      } else if (audited.status === "warning") {
        toast.warning(`Route "${audited.name}" warning: ${audited.summary}`);
      } else {
        toast.success(`Route "${audited.name}" is healthy (${audited.latencyMs}ms).`);
      }
    } catch {
      toast.error(`Failed to test route ${routeToTest.name}`);
    }
  };

  // Clear report
  const handleClearAudit = () => {
    AdminStore.clearHealthAudit();
    const fresh = getSiteCatalog();
    setRoutes(fresh);
    setActiveReport(null);
    setSelectedRoute(null);
    toast.success("Health audit logs cleared. Reset to default catalog.");
  };

  // Save Schedule settings
  const handleSaveSchedule = () => {
    const now = Date.now();
    const nextRun = tempSchedule.enabled
      ? new Date(now + tempSchedule.intervalMinutes * 60 * 1000).toISOString()
      : undefined;

    const updated: HealthScheduleConfig = {
      ...tempSchedule,
      nextRunAt: nextRun,
    };

    AdminStore.saveHealthSchedule(updated);
    setScheduleConfig(updated);
    setIsScheduleModalOpen(false);

    if (updated.enabled) {
      toast.success(
        `Automated health audit scheduled every ${updated.intervalMinutes} minutes.`
      );
    } else {
      toast.info("Automated health audit scheduling disabled.");
    }
  };

  // Export report as JSON
  const handleExportJSON = () => {
    if (!activeReport) {
      toast.info("Run an audit first to export report.");
      return;
    }
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeReport, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute(
      "download",
      `website-health-audit-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Health audit JSON report downloaded!");
  };

  // Copy Markdown summary
  const handleCopyMarkdown = () => {
    const total = routes.length;
    const healthy = routes.filter((r) => r.status === "healthy").length;
    const warnings = routes.filter((r) => r.status === "warning").length;
    const errors = routes.filter((r) => r.status === "error").length;
    const score = Math.round((healthy / (total || 1)) * 100);

    const md = [
      `# Website Health Checkup & Audit Report`,
      `- **Generated At**: ${new Date().toISOString()}`,
      `- **Overall Health Score**: ${score}% Operational`,
      `- **Total Routes Tested**: ${total}`,
      `- **Healthy (Passing)**: ${healthy}`,
      `- **Warnings (Degraded)**: ${warnings}`,
      `- **Critical Errors Captured**: ${errors}`,
      ``,
      `| Route Name | URL | Status | Latency | Errors |`,
      `|---|---|---|---|---|`,
      ...routes.map(
        (r) =>
          `| ${r.name} | ${r.url} | ${r.status.toUpperCase()} | ${
            r.latencyMs !== undefined ? `${r.latencyMs}ms` : "-"
          } | ${r.errorsCaptured.length} |`
      ),
    ].join("\n");

    void navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Markdown audit report copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered routes calculation
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      // Category filter
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [routes, categoryFilter, statusFilter, search]);

  // Overall metrics calculation
  const totalCount = routes.length;
  const healthyCount = routes.filter((r) => r.status === "healthy").length;
  const warningCount = routes.filter((r) => r.status === "warning").length;
  const errorCount = routes.filter((r) => r.status === "error").length;
  const testedCount = routes.filter((r) => r.status !== "idle").length;
  const healthScore =
    testedCount > 0 ? Math.round((healthyCount / testedCount) * 100) : 100;

  const validLatencies = routes
    .map((r) => r.latencyMs)
    .filter((l): l is number => l !== undefined && l > 0);
  const avgLatency =
    validLatencies.length > 0
      ? Math.round(
          validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─── 1. TOP HEADER & AUDIT CONTROLS ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 shadow-xs">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>Website Health Checkup & Audit</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <ShieldCheck className="h-3 w-3" /> Live Sandbox
                </span>
                {scheduleConfig.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 animate-pulse">
                    <CalendarClock className="h-3 w-3" />
                    <span>Auto-Audit: Every {scheduleConfig.intervalMinutes}m</span>
                  </span>
                )}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Headless multi-vector probe. Opens every route in a sandbox, inspects DOM rendering, traps crashes, and auto-captures exceptions into Error Logs.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isAuditing ? (
            <button
              type="button"
              onClick={() => handleStartFullAudit(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold px-4 py-2 text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Full System Health Audit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopAudit}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs shadow-md transition-all cursor-pointer animate-pulse"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop Health Audit</span>
            </button>
          )}

          {/* Schedule Test Button */}
          <button
            type="button"
            onClick={() => {
              setTempSchedule(scheduleConfig);
              setIsScheduleModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              scheduleConfig.enabled
                ? "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
            title="Configure recurring automated test schedule"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Schedule Auto-Test</span>
          </button>

          {/* Older Reports History Button */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = "older-reports";
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs cursor-pointer"
            title="View older archived health checkup reports"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Older Reports ({AdminStore.getHealthAuditHistory().length})</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            title="Copy audit report in Markdown format"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="hidden sm:inline">Copy Report</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            title="Download full audit report as JSON"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {activeReport && (
            <button
              type="button"
              onClick={handleClearAudit}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Reset health audit"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. LIVE AUDIT PROGRESS BAR (WHEN AUDITING) ────────────────────── */}
      {isAuditing && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Auditing Route: {currentTestingRoute || "Preparing..."}</span>
            </span>
            <span className="font-mono text-muted-foreground">
              {completedCount} / {totalCount} ({Math.round((completedCount / (totalCount || 1)) * 100)}%)
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((completedCount / (totalCount || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ─── 3. TOP 5 EXECUTIVE HEALTH KPI CARDS (INCLUDING WARNINGS) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Health Score */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>System Health Score</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-foreground">
              {testedCount === 0 ? "100%" : `${healthScore}%`}
            </span>
            <span
              className={`text-xs font-bold ${
                healthScore >= 90
                  ? "text-emerald-600 dark:text-emerald-400"
                  : healthScore >= 70
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {healthScore >= 90 ? "Excellent" : healthScore >= 70 ? "Degraded" : "Critical"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {healthyCount} of {testedCount || totalCount} tested routes operational
          </p>
        </div>

        {/* Card 2: Operational Routes (Passing) */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Passing (Healthy)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {healthyCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ {totalCount} Total</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Verified HTTP 200 & 0 runtime crashes
          </p>
        </div>

        {/* Card 3: Warnings & Degraded (NEW DEDICATED WARNINGS CARD) */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Warnings (Degraded)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-3xl font-extrabold ${
                warningCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              }`}
            >
              {warningCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {warningCount > 0 ? "Degraded" : "0 Warnings"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {warningCount > 0 ? "High latency or minor warnings" : "Zero latency or render warnings"}
          </p>
        </div>

        {/* Card 4: Captured Errors */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Captured Errors</span>
            <Bug className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-3xl font-extrabold ${
                errorCount > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {errorCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {errorCount > 0 ? "Needs Fix" : "0 Crashes"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {errorCount > 0
              ? "Auto-logged into Error Logs tab"
              : "0 uncaught exceptions across all routes"}
          </p>
        </div>

        {/* Card 5: Avg Response Latency */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Latency</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-foreground">
              {avgLatency > 0 ? `${avgLatency}ms` : "--"}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {avgLatency < 400 && avgLatency > 0 ? "Fast" : "Normal"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Mean time to first byte across routes
          </p>
        </div>
      </div>

      {/* ─── 4. SEARCH, CATEGORY TABS & STATUS FILTER (WITH WARNING TAB) ────── */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: `All Routes (${totalCount})` },
            { id: "core", label: `Core Pages (${routes.filter((r) => r.category === "core").length})` },
            { id: "chat", label: `AI Chat (${routes.filter((r) => r.category === "chat").length})` },
            { id: "image-tool", label: `Image Tools (${routes.filter((r) => r.category === "image-tool").length})` },
            { id: "pdf-tool", label: `PDF & Docs (${routes.filter((r) => r.category === "pdf-tool").length})` },
            { id: "account", label: `Billing & Auth (${routes.filter((r) => r.category === "account").length})` },
            { id: "api", label: `APIs (${routes.filter((r) => r.category === "api").length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Status Bar (WITH WARNING TAB INCLUDED) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route name, URL (e.g. /chat, /tools/remove-bg) or category..."
              className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* STATUS TABS: All | Passing | Warnings | Errors */}
          <div className="md:col-span-6 flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("healthy")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "healthy"
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Passing ({healthyCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("warning")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "warning"
                  ? "bg-amber-500/25 text-amber-800 dark:text-amber-300 font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Warnings ({warningCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("error")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "error"
                  ? "bg-destructive/20 text-destructive font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Errors ({errorCount})
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. INTERACTIVE ROUTE HEALTH AUDIT TABLE ───────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Route Name & Context</th>
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Trapped Errors</th>
                <th className="py-3 px-4">Audit Verdict</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-foreground">No matching routes found</p>
                    <p className="text-[11px]">Try changing your search query or status filter.</p>
                  </td>
                </tr>
              ) : null}

              {filteredRoutes.map((route) => {
                const isTestingThis = route.status === "testing";

                return (
                  <tr
                    key={route.id}
                    className={`transition-colors hover:bg-muted/40 ${
                      route.status === "error"
                        ? "bg-destructive/5"
                        : route.status === "warning"
                        ? "bg-amber-500/5"
                        : ""
                    }`}
                  >
                    {/* 1. Name & Context */}
                    <td className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                            route.category === "chat"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : route.category === "image-tool"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : route.category === "pdf-tool"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : route.category === "api"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {route.category === "chat" ? (
                            <Bot className="h-4 w-4" />
                          ) : route.category === "image-tool" ? (
                            <Wrench className="h-4 w-4" />
                          ) : route.category === "pdf-tool" ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-foreground text-xs leading-tight">
                            {route.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {route.categoryLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. URL Link */}
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      <a
                        href={route.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-accent hover:underline transition-colors"
                        title="Open page in new browser tab"
                      >
                        <span className="truncate max-w-[180px]">{route.url}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    </td>

                    {/* 3. HTTP Status */}
                    <td className="py-3 px-4">
                      {isTestingThis ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <RefreshCw className="h-3 w-3 animate-spin text-accent" />
                          <span>Testing...</span>
                        </span>
                      ) : route.httpStatus ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${
                            route.httpStatus === 200
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                              : "bg-destructive/15 text-destructive border border-destructive/25"
                          }`}
                        >
                          {route.httpStatus} {route.httpStatus === 200 ? "OK" : "Error"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">--</span>
                      )}
                    </td>

                    {/* 4. Latency */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {route.latencyMs !== undefined ? (
                        <span
                          className={`font-bold ${
                            route.latencyMs < 400
                              ? "text-emerald-600 dark:text-emerald-400"
                              : route.latencyMs < 1500
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {route.latencyMs}ms
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>

                    {/* 5. Trapped Errors */}
                    <td className="py-3 px-4">
                      {route.errorsCaptured.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedRoute(route)}
                          className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2 py-0.5 text-[10px] font-extrabold text-destructive hover:bg-destructive/25 transition-colors cursor-pointer"
                        >
                          <Bug className="h-3 w-3" />
                          <span>{route.errorsCaptured.length} Auto-Captured</span>
                        </button>
                      ) : route.status === "healthy" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="h-3 w-3" /> 0 Crashes
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">None</span>
                      )}
                    </td>

                    {/* 6. Audit Verdict */}
                    <td className="py-3 px-4">
                      {isTestingThis ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full animate-pulse">
                          Evaluating
                        </span>
                      ) : route.status === "healthy" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Operational
                        </span>
                      ) : route.status === "warning" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-500/20 border border-amber-500/35 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3 text-amber-500" /> Degraded
                        </span>
                      ) : route.status === "error" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-destructive bg-destructive/15 border border-destructive/30 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" /> Broken / Crash
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Unchecked
                        </span>
                      )}
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestSingleRoute(route)}
                          disabled={isTestingThis}
                          className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Run isolated health test for this route"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isTestingThis ? "animate-spin" : ""}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRoute(route)}
                          className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="View detailed test execution logs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. ROUTE DETAILS & TEST LOGS DRAWER / MODAL ────────────────────── */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/90">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <span>{selectedRoute.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                      selectedRoute.status === "healthy"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : selectedRoute.status === "warning"
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        : selectedRoute.status === "error"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedRoute.status}
                  </span>
                </h3>
                <p className="font-mono text-xs text-muted-foreground">{selectedRoute.url}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">HTTP Status</span>
                  <span className="font-mono font-bold text-foreground">{selectedRoute.httpStatus ?? "N/A"}</span>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Latency</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedRoute.latencyMs ? `${selectedRoute.latencyMs}ms` : "N/A"}
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">DOM Root Check</span>
                  <span className="font-bold text-foreground">
                    {selectedRoute.hasRootElements ? "✓ Rendered" : "Empty/Waiting"}
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Errors Captured</span>
                  <span className="font-bold text-rose-500">{selectedRoute.errorsCaptured.length}</span>
                </div>
              </div>

              {/* Page title if available */}
              {selectedRoute.pageTitle && (
                <div className="rounded-2xl border border-border bg-card p-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Document Title:</span>
                  <p className="font-semibold text-foreground text-xs">{selectedRoute.pageTitle}</p>
                </div>
              )}

              {/* Captured Errors (If any) */}
              {selectedRoute.errorsCaptured.length > 0 && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-destructive">
                    <Bug className="h-4 w-4" />
                    <span>Captured Runtime Exception (Sent to Admin Error Logs)</span>
                  </div>

                  {selectedRoute.errorsCaptured.map((err, i) => (
                    <div key={i} className="rounded-xl bg-card/80 p-3 text-xs space-y-1 font-mono">
                      <p className="font-bold text-foreground">{err.name}: {err.message}</p>
                      {err.stack && (
                        <pre className="text-[10px] text-muted-foreground overflow-x-auto max-h-32 mt-1">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Live Test Logs */}
              <div>
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block mb-1.5">
                  Execution Trace & Health Logs:
                </span>
                <div className="rounded-2xl bg-black/95 text-slate-200 border border-border p-3.5 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-1">
                  {selectedRoute.logs.length === 0 ? (
                    <p className="text-muted-foreground">Click "Re-test Route" to generate real-time execution trace.</p>
                  ) : (
                    selectedRoute.logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground/60 select-none font-mono text-[10px]">
                          [{log.timestamp}]
                        </span>
                        <span
                          className={
                            log.level === "success"
                              ? "text-emerald-400 font-bold"
                              : log.level === "error"
                              ? "text-rose-400 font-bold"
                              : log.level === "warn"
                              ? "text-amber-400"
                              : "text-cyan-300"
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/90">
              <a
                href={selectedRoute.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
              >
                <span>Open in Public Browser</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestSingleRoute(selectedRoute)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Re-test Route</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoute(null)}
                  className="rounded-xl border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. SCHEDULE AUTO-TEST CONFIGURATION MODAL ───────────────────────── */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/90">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Schedule Automated Health Audit
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Automatically test all routes in background and log reports.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Enable Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <span className="font-bold text-foreground text-sm block">
                    Enable Scheduled Auto-Audit
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Periodically probes all routes and auto-captures exceptions
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSchedule.enabled}
                    onChange={(e) =>
                      setTempSchedule({ ...tempSchedule, enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Interval Selection */}
              <div className="space-y-2">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Select Checkup Interval Frequency:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { minutes: 15, label: "Every 15 Minutes" },
                    { minutes: 30, label: "Every 30 Minutes" },
                    { minutes: 60, label: "Every 1 Hour (Recommended)" },
                    { minutes: 360, label: "Every 6 Hours" },
                    { minutes: 1440, label: "Daily (24 Hours)" },
                  ].map((opt) => (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() =>
                        setTempSchedule({ ...tempSchedule, intervalMinutes: opt.minutes })
                      }
                      className={`rounded-2xl border p-3 text-left font-bold transition-all cursor-pointer ${
                        tempSchedule.intervalMinutes === opt.minutes
                          ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <p className="text-xs">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Status & Timing */}
              <div className="rounded-2xl border border-border bg-card p-3.5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Last Automated Run:</span>
                  <span className="font-mono font-bold text-foreground">
                    {scheduleConfig.lastRunAt || "None yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Next Scheduled Run:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {scheduleConfig.nextRunAt
                      ? new Date(scheduleConfig.nextRunAt).toLocaleTimeString()
                      : "When enabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card/90">
              <button
                type="button"
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  handleStartFullAudit(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Run Audit Right Now</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
