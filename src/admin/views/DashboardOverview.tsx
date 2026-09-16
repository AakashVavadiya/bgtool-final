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

  useEffect(() => {
    const handleUpdate = () => {
      setTraffic(AdminStore.getTraffic());
      setUsers(AdminStore.getUsers());
      setPurchases(AdminStore.getPurchases());
      setErrorLogs(AdminStore.getErrorLogs());
    };

    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 5000);

    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const totalRevenue = purchases.reduce((acc, p) => (p.status === "completed" ? acc + p.amountINR : acc), 0);
  const activeIssuesCount = errorLogs.filter((e) => e.status !== "resolved").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Live Traffic */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Page Views</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-white">
            {traffic.totalPageViews.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% this week</span>
            <span className="text-zinc-500 ml-auto">({traffic.uniqueVisitors.toLocaleString()} unique)</span>
          </div>
        </div>

        {/* Metric 2: Live Visitors */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Realtime Active</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="font-display text-3xl font-extrabold text-white">{traffic.liveVisitors}</p>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live Online
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Avg session: {traffic.avgSessionDuration} • Bounce: {traffic.bounceRate}</p>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Revenue (INR)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-400">
            {purchases.length} successful transactions
          </p>
        </div>

        {/* Metric 4: Registered Users */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Logged Users</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold text-white">{users.length}</p>
          <p className="mt-2 text-xs text-zinc-400">
            {users.filter((u) => u.plan !== "free").length} paid subscribers
          </p>
        </div>
      </div>

      {/* Traffic Trend & Daily Processing Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Traffic Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Traffic & Processing Volume</h3>
              <p className="text-xs text-zinc-400 mt-1">Daily pageviews and successful image AI processing jobs (Last 7 Days)</p>
            </div>
            <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-400">
              99.98% Model Uptime
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {traffic.dailyTraffic.map((d) => (
              <div key={d.date} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300 w-16">{d.date}</span>
                  <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                    <span>{d.views.toLocaleString()} views</span>
                    <span className="text-orange-400 font-bold">{d.processingJobs.toLocaleString()} AI jobs</span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-white/[0.04] overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${(d.processingJobs / 10000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Breakdown & Top Referrers (1 Col) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Globe className="h-4 w-4 text-orange-400" />
              <span>Geographic Visitors</span>
            </div>
            <div className="mt-4 space-y-3">
              {traffic.countryBreakdown.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-semibold text-zinc-200">{c.country}</span>
                  </div>
                  <span className="font-bold text-zinc-400">{c.percentage}% ({c.count.toLocaleString()})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Monitor className="h-4 w-4 text-amber-400" />
              <span>Devices</span>
            </div>
            <div className="mt-3 space-y-2">
              {traffic.deviceBreakdown.map((dev) => (
                <div key={dev.device} className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">{dev.device}</span>
                  <span className="text-orange-400">{dev.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Referrers & System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Traffic Channels */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-white mb-4">Top Acquisition Channels</h3>
          <div className="space-y-3">
            {traffic.topReferrers.map((ref) => (
              <div key={ref.source} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs font-semibold">
                <div>
                  <p className="text-zinc-200 font-bold">{ref.source}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{ref.visitors.toLocaleString()} visitors</p>
                </div>
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-emerald-400 font-bold">
                  Conv: {ref.conversionRate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Diagnostics */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white">System Diagnostics</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> All Services Operational
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
              <div className="flex items-center gap-3">
                <Cpu className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="font-bold text-zinc-200">Karudi 1.0 Prime Engine Cluster</p>
                  <p className="text-[11px] text-zinc-500">Avg response: 180ms • GPU Memory: 42%</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold">Healthy</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="font-bold text-zinc-200">Unresolved Error Logs</p>
                  <p className="text-[11px] text-zinc-500">{activeIssuesCount} client exceptions captured</p>
                </div>
              </div>
              <span className={`font-bold ${activeIssuesCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {activeIssuesCount} Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
