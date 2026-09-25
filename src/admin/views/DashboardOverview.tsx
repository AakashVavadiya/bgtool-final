import { useState, useEffect } from "react";
import { AdminStore } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import {
  Users,
  Activity,
  CreditCard,
  Zap,
  TrendingUp,
  Globe,
  Monitor,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export function DashboardOverview() {
  const [traffic, setTraffic] = useState(() => AdminStore.getTraffic());
  const [users, setUsers] = useState(() => AdminStore.getUsers());
  const [purchases, setPurchases] = useState(() => AdminStore.getPurchases());
  const [errorLogs, setErrorLogs] = useState(() => AdminStore.getErrorLogs());
  const [toolsConfig, setToolsConfig] = useState(() => AdminStore.getToolsConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setTraffic(AdminStore.getTraffic());
      setUsers(AdminStore.getUsers());
      setPurchases(AdminStore.getPurchases());
      setErrorLogs(AdminStore.getErrorLogs());
      setToolsConfig(AdminStore.getToolsConfig());
    };

    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 4000);

    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

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

      {/* Middle Grid: 7-Day Activity & System Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 7-Day Traffic Graph & Activity */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:col-span-8 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Live Traffic & Processing Activity</h3>
              <p className="text-xs text-muted-foreground">Real-time daily visits and background AI executions</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                Page Views
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                AI Jobs
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 border-b border-border">
            {traffic.dailyTraffic.map((d, i) => {
              const maxVal = Math.max(...traffic.dailyTraffic.map((x) => x.views), 1);
              const heightPercent = Math.max(12, Math.round((d.views / maxVal) * 100));

              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.views}
                  </span>
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Views Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[20px] rounded-t-lg bg-accent/70 group-hover:bg-accent transition-all duration-300"
                    />
                    {/* Jobs Bar */}
                    <div
                      style={{ height: `${Math.min(100, d.processingJobs * 25 + 8)}%` }}
                      className="w-full max-w-[12px] rounded-t-lg bg-foreground/70 group-hover:bg-foreground transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {d.date.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real registered users snippet */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-medium text-muted-foreground">
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
