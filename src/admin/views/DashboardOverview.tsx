import { useState, useEffect } from "react";
import { AdminStore } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import {
  Users,
  Activity,
  CreditCard,
  Zap,
  TrendingUp,
  BarChart3,
  Globe,
  Monitor,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  HeartPulse,
  ArrowRight,
  CalendarClock,
  Bug,
  ChevronRight,
  Wand2,
  Archive,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="rounded-2xl border border-border/80 bg-popover/95 p-3.5 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[200px]">
      <div className="border-b border-border/60 pb-1.5">
        <p className="font-bold text-foreground">{data?.fullDate || label}</p>
        <p className="text-[10px] text-muted-foreground">Real-time Telemetry Snapshot</p>
      </div>
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
            Page Views:
          </span>
          <span className="font-mono font-bold text-foreground">{data?.views ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
            AI Jobs:
          </span>
          <span className="font-mono font-bold text-foreground">{data?.processingJobs ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground/80 pt-1 border-t border-border/40">
          <span>Unique Visitors:</span>
          <span className="font-mono font-medium text-foreground">{data?.visitors ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const [timeframe, setTimeframe] = useState<7 | 14 | 30>(7);
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [traffic, setTraffic] = useState(() => AdminStore.getTraffic(7));
  const [users, setUsers] = useState(() => AdminStore.getUsers());
  const [purchases, setPurchases] = useState(() => AdminStore.getPurchases());
  const [errorLogs, setErrorLogs] = useState(() => AdminStore.getErrorLogs());
  const [toolsConfig, setToolsConfig] = useState(() => AdminStore.getToolsConfig());
  const [healthAudit, setHealthAudit] = useState(() => AdminStore.getHealthAudit());
  const [healthSchedule, setHealthSchedule] = useState(() => AdminStore.getHealthSchedule());

  useEffect(() => {
    setTraffic(AdminStore.getTraffic(timeframe));
  }, [timeframe]);

  useEffect(() => {
    const handleUpdate = () => {
      setTraffic(AdminStore.getTraffic(timeframe));
      setUsers(AdminStore.getUsers());
      setPurchases(AdminStore.getPurchases());
      setErrorLogs(AdminStore.getErrorLogs());
      setToolsConfig(AdminStore.getToolsConfig());
      setHealthAudit(AdminStore.getHealthAudit());
      setHealthSchedule(AdminStore.getHealthSchedule());
    };

    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 4000);

    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [timeframe]);

  const totalRevenue = purchases.reduce((acc, p) => (p.status === "completed" ? acc + p.amountINR : acc), 0);
  const activeIssuesCount = errorLogs.filter((e) => e.status !== "resolved").length;
  const totalJobsExecuted = toolsConfig.reduce((acc, t) => acc + t.totalUsageCount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Live Traffic */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Page Views</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-foreground">
            {traffic.totalPageViews.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>{traffic.uniqueVisitors.toLocaleString()} unique visitor{traffic.uniqueVisitors === 1 ? "" : "s"}</span>
          </div>
        </div>

        {/* Metric 2: Live Visitors */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Realtime Active</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="font-display text-3xl font-extrabold text-foreground">{traffic.liveVisitors}</p>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Online
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Avg session: {traffic.avgSessionDuration} • Bounce: {traffic.bounceRate}</p>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue (INR)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-foreground">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            {purchases.length} transaction{purchases.length === 1 ? "" : "s"} completed
          </p>
        </div>

        {/* Metric 4: System Health & Errors */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform Health</span>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                activeIssuesCount > 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {activeIssuesCount > 0 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="font-display text-3xl font-extrabold text-foreground">
              {activeIssuesCount === 0 ? "100%" : `${activeIssuesCount} Open`}
            </p>
            <span
              className={`text-xs font-bold ${
                activeIssuesCount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {activeIssuesCount > 0 ? "Requires Attention" : "Operational"}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {totalJobsExecuted} tool executions logged
          </p>
        </div>
      </div>

      {/* Website Health Checkup & Automated Audit Overview Banner */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/20 p-6 sm:p-8 shadow-xs hover:border-foreground/20 transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Website Health Checkup & Automated Route Audit
                </h3>
                {healthSchedule.enabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Auto-Audit Every {healthSchedule.intervalMinutes}m
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    Scheduled Audit Paused
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                Background headless route testing across all AI image engines, PDF suites, chat models, and auth gateways.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                window.location.hash = "older-reports";
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-all cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Older Reports</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.hash = "health";
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <span>{healthAudit ? "View Full Report & Logs" : "Launch Site Health Checkup"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Stats Breakdown */}
        {healthAudit ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-border">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Health Score
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {healthAudit.healthScorePercent}%
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Operational
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {healthAudit.healthyCount} of {healthAudit.totalRoutes} routes passing
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Warnings / Degraded
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`font-display text-2xl font-extrabold ${
                    healthAudit.warningCount > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-foreground"
                  }`}
                >
                  {healthAudit.warningCount}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {healthAudit.warningCount > 0 ? "Degraded" : "Clean"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {healthAudit.warningCount > 0
                  ? "Latency or render warnings detected"
                  : "Zero performance warnings"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Captured Errors
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`font-display text-2xl font-extrabold ${
                    healthAudit.errorCount > 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {healthAudit.errorCount}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {healthAudit.errorCount > 0 ? "Issues" : "0 Crashes"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {healthAudit.errorCount > 0
                  ? "Runtime crashes captured & logged"
                  : "All endpoints responded HTTP 200"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Avg Latency
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-foreground">
                  {healthAudit.avgLatencyMs > 0 ? `${healthAudit.avgLatencyMs}ms` : "--"}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {healthAudit.avgLatencyMs < 400 && healthAudit.avgLatencyMs > 0 ? "Ultra Fast" : "Normal"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Last run {new Date(healthAudit.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-dashed border-border p-5 bg-background/40">
            <div>
              <p className="text-xs font-bold text-foreground">No full site audit has been executed yet.</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Run an automated checkup across 144 registered routes to detect runtime crashes, broken components, or slow responses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "health";
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              <span>Go to Health Checkup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Launch: Tools Health & SEO Optimization Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => {
            window.location.hash = "tools-health";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }}
          className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                  Tools Health & Engine Test
                </h4>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Real Processing
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Passes synthetic files through all 130+ tools. Verifies canvas rendering, format transcoding, and auto-files errors.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
        </div>

        <div
          onClick={() => {
            window.location.hash = "seo-audit";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }}
          className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:border-foreground/20 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 group-hover:scale-105 transition-transform">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                  SEO Optimisation & Rank Engine
                </h4>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                  Rank #1 Google
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keywords density, Core Web Vitals speed score, Schema.org rich snippets, and live Google SERP preview.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </div>

      {/* Middle Grid: 7-Day Activity & System Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Traffic & AI Processing Graph */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:col-span-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header: Title, Controls, Timeframe & Legend */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">Live Traffic & Processing Activity</h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time daily visits and background AI executions</p>
              </div>

              {/* Controls: Timeframe & Chart Type */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Timeframe Selector */}
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/50 text-xs font-semibold">
                  {([7, 14, 30] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTimeframe(days)}
                      className={`rounded-lg px-2.5 py-1 transition-all ${
                        timeframe === days
                          ? "bg-card text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>

                {/* Chart Type Toggle (Area vs Bar) */}
                <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setChartType("area")}
                    className={`rounded-lg p-1.5 transition-all ${
                      chartType === "area"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Area Curve Chart"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType("bar")}
                    className={`rounded-lg p-1.5 transition-all ${
                      chartType === "bar"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Bar Volume Chart"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 py-2 border-b border-border/40">
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">Period Views</span>
                <p className="text-base font-extrabold text-[#f97316]">
                  {traffic.dailyTraffic.reduce((acc, d) => acc + d.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">AI Executions</span>
                <p className="text-base font-extrabold text-[#0284c7]">
                  {traffic.dailyTraffic.reduce((acc, d) => acc + d.processingJobs, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">Daily Avg Visits</span>
                <p className="text-base font-extrabold text-foreground">
                  {(
                    traffic.dailyTraffic.reduce((acc, d) => acc + d.views, 0) /
                    Math.max(1, traffic.dailyTraffic.length)
                  ).toFixed(1)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] font-medium text-muted-foreground">Live Telemetry</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {traffic.liveVisitors} Online
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-5 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                Page Views
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0284c7]" />
                AI Jobs
              </span>
            </div>

            {/* Recharts Area / Bar Chart */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={traffic.dailyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: "currentColor", strokeOpacity: 0.1 }}
                      tick={({ x, y, payload }) => {
                        const item = traffic.dailyTraffic[payload.index];
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={13} textAnchor="middle" className="text-[11px] font-semibold fill-foreground/80">
                              {payload.value}
                            </text>
                            {item?.day && (
                              <text x={0} y={25} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                                {item.day}
                              </text>
                            )}
                          </g>
                        );
                      }}
                      height={38}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Page Views"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fill="url(#viewsGradient)"
                      activeDot={{ r: 5, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="processingJobs"
                      name="AI Jobs"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      fill="url(#jobsGradient)"
                      activeDot={{ r: 5, fill: "#0284c7", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={traffic.dailyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: "currentColor", strokeOpacity: 0.1 }}
                      tick={({ x, y, payload }) => {
                        const item = traffic.dailyTraffic[payload.index];
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={13} textAnchor="middle" className="text-[11px] font-semibold fill-foreground/80">
                              {payload.value}
                            </text>
                            {item?.day && (
                              <text x={0} y={25} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                                {item.day}
                              </text>
                            )}
                          </g>
                        );
                      }}
                      height={38}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="views" name="Page Views" fill="#f97316" radius={[5, 5, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="processingJobs" name="AI Jobs" fill="#0284c7" radius={[5, 5, 0, 0]} maxBarSize={28} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real registered users snippet */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60 text-xs font-medium text-muted-foreground">
            <span>Registered Accounts: <strong className="text-foreground font-bold">{users.length}</strong></span>
            <span>Active AI Tools: <strong className="text-foreground font-bold">{toolsConfig.filter((t) => t.isEnabled).length} / {toolsConfig.length}</strong></span>
            <span>Total Errors Caught: <strong className="text-foreground font-bold">{errorLogs.length}</strong></span>
          </div>
        </div>

        {/* Right Column: Geographic & Device Distribution */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:col-span-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Globe className="h-4 w-4 text-accent" />
              <span>Visitor Locations</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Resolved client geolocations</p>

            <div className="mt-5 space-y-3.5">
              {traffic.countryBreakdown.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-foreground">
                      <span>{c.flag}</span>
                      <span>{c.country}</span>
                    </span>
                    <span className="font-mono text-muted-foreground">{c.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${c.percentage}%` }}
                      className="h-full bg-accent rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
              <Monitor className="h-4 w-4 text-accent" />
              <span>Devices</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {traffic.deviceBreakdown.map((d, i) => (
                <div key={i} className="rounded-2xl border border-border bg-muted/40 p-3">
                  <p className="text-[11px] text-muted-foreground">{d.device}</p>
                  <p className="text-base font-extrabold text-foreground mt-0.5">{d.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
