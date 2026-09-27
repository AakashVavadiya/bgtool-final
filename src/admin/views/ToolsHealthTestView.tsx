import { useState, useMemo, useEffect, useRef } from "react";
import { tools, type Tool } from "@/lib/tools";
import {
  AdminStore,
  type ToolEngineTestResult,
  type ToolEngineAuditReport,
} from "@/admin/lib/admin-store";
import {
  testSingleToolEngine,
  runBatchToolEngineTest,
  formatBytes,
} from "@/admin/lib/tool-engine-tester";
import { toast } from "sonner";
import {
  Cpu,
  Play,
  Square,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Zap,
  Terminal,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Eye,
  X,
  Bug,
  Wand2,
  Download,
  ShieldCheck,
  ArrowRight,
  Archive,
} from "lucide-react";

export function ToolsHealthTestView() {
  const [activeReport, setActiveReport] = useState<ToolEngineAuditReport | null>(() =>
    AdminStore.getToolEngineAudit()
  );

  const [resultsMap, setResultsMap] = useState<Record<string, ToolEngineTestResult>>(() => {
    const saved = AdminStore.getToolEngineAudit();
    if (saved && saved.results) {
      const map: Record<string, ToolEngineTestResult> = {};
      saved.results.forEach((r) => {
        map[r.toolSlug] = r;
      });
      return map;
    }
    return {};
  });

  const [isRunningAll, setIsRunningAll] = useState(false);
  const [testingToolSlug, setTestingToolSlug] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<ToolEngineTestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const cancelRef = useRef(false);

  // Sync state if storage updates
  useEffect(() => {
    const sync = () => {
      const saved = AdminStore.getToolEngineAudit();
      if (saved) {
        setActiveReport(saved);
        const map: Record<string, ToolEngineTestResult> = {};
        saved.results.forEach((r) => {
          map[r.toolSlug] = r;
        });
        setResultsMap(map);
      }
    };
    window.addEventListener("bg:telemetry:update", sync);
    return () => window.removeEventListener("bg:telemetry:update", sync);
  }, []);

  // ─── Actions: Run Full Suite Test ──────────────────────────────────────────
  const handleStartAll = async () => {
    // 1. Archive older report into history if one exists
    if (activeReport && activeReport.results && activeReport.results.length > 0) {
      AdminStore.archiveToolEngineAudit(activeReport);
    } else if (Object.keys(resultsMap).length > 0) {
      const results = Object.values(resultsMap);
      const passed = results.filter((r) => r.status === "passed").length;
      const warn = results.filter((r) => r.status === "warning").length;
      const failed = results.filter((r) => r.status === "failed").length;
      AdminStore.archiveToolEngineAudit({
        id: `ENG_AUDIT_${Date.now().toString(36).toUpperCase()}`,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalTools: results.length,
        passedCount: passed,
        warningCount: warn,
        failedCount: failed,
        avgDurationMs: Math.round(results.reduce((a, b) => a + (b.executionDurationMs || 0), 0) / (results.length || 1)),
        results,
      });
    }

    // 2. Clean older report completely from checkup page
    AdminStore.clearToolEngineAudit();
    setActiveReport(null);
    setResultsMap({});
    setSelectedResult(null);
    setCompletedCount(0);
    setTestingToolSlug(null);

    // 3. Start fresh audit
    cancelRef.current = false;
    setIsRunningAll(true);
    toast.info(`Initiating fresh synthetic engine test across all ${tools.length} tools (older report archived)...`);

    try {
      const report = await runBatchToolEngineTest(tools, {
        shouldCancel: () => cancelRef.current,
        onProgress: (current, done, total, res) => {
          setTestingToolSlug(current.slug);
          setCompletedCount(done);
          setResultsMap((prev) => ({
            ...prev,
            [current.slug]: res,
          }));
        },
      });

      setActiveReport(report);
      setTestingToolSlug(null);
      setIsRunningAll(false);

      if (report.failedCount > 0) {
        toast.error(
          `Tools audit complete: ${report.passedCount} passed, ${report.failedCount} failed! Errors logged to Error Reports.`
        );
      } else {
        toast.success(
          `Tools audit complete: All ${report.totalTools} tools processed synthetic files successfully!`
        );
      }
    } catch (err: unknown) {
      setIsRunningAll(false);
      setTestingToolSlug(null);
      toast.error(`Engine test aborted: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleStopAll = () => {
    cancelRef.current = true;
    setIsRunningAll(false);
    setTestingToolSlug(null);
    toast.warning("Tools health test paused by user.");
  };

  // ─── Single Tool Engine Test ──────────────────────────────────────────────
  const handleTestSingleTool = async (tool: Tool) => {
    setTestingToolSlug(tool.slug);
    toast.info(`Processing synthetic file through ${tool.name} engine...`);

    const res = await testSingleToolEngine(tool);
    setResultsMap((prev) => ({
      ...prev,
      [tool.slug]: res,
    }));
    setTestingToolSlug(null);

    if (res.status === "passed") {
      toast.success(`${tool.name}: Processed successfully in ${res.executionDurationMs}ms!`);
    } else if (res.status === "warning") {
      toast.warning(`${tool.name}: Processed with warning (${res.executionDurationMs}ms).`);
    } else {
      toast.error(`${tool.name} failed: ${res.error?.message}. Logged to Error Reports!`);
    }
  };

  // ─── Export Audit Report ──────────────────────────────────────────────────
  const handleExportJson = () => {
    const data = activeReport || {
      generatedAt: new Date().toISOString(),
      tools: Object.values(resultsMap),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tool-engine-health-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Tool Engine Health Report JSON.");
  };

  // ─── Filtered Tools ───────────────────────────────────────────────────────
  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      // Category filter
      if (categoryFilter !== "all" && t.category !== categoryFilter) {
        return false;
      }
      // Status filter
      const res = resultsMap[t.slug];
      const status = res ? res.status : "idle";
      if (statusFilter === "passed" && status !== "passed") return false;
      if (statusFilter === "warning" && status !== "warning") return false;
      if (statusFilter === "failed" && status !== "failed") return false;
      if (statusFilter === "untested" && status !== "idle") return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = t.name.toLowerCase().includes(query);
        const matchSlug = t.slug.toLowerCase().includes(query);
        const matchAccepts = t.accepts.toLowerCase().includes(query);
        const matchOutputs = t.outputs.toLowerCase().includes(query);
        return matchName || matchSlug || matchAccepts || matchOutputs;
      }
      return true;
    });
  }, [categoryFilter, statusFilter, search, resultsMap]);

  // Derived Stats
  const totalCount = tools.length;
  const testedCount = Object.keys(resultsMap).length;
  const passedCount = Object.values(resultsMap).filter((r) => r.status === "passed").length;
  const warningCount = Object.values(resultsMap).filter((r) => r.status === "warning").length;
  const failedCount = Object.values(resultsMap).filter((r) => r.status === "failed").length;
  const avgLatency =
    testedCount > 0
      ? Math.round(
          Object.values(resultsMap).reduce((acc, r) => acc + r.executionDurationMs, 0) / testedCount
        )
      : 0;

  const healthScore =
    testedCount > 0
      ? Math.round(((passedCount + warningCount * 0.7) / testedCount) * 100)
      : 100;

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── 1. TOP HEADER & AUDIT ACTIONS ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Tools Engine Health & Processing Test
              </h2>
              <p className="text-xs text-muted-foreground">
                End-to-end synthetic file execution pipeline across all {totalCount} tools. Auto-captures and files errors into Error Reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Older Reports History Button */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = "older-reports";
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary shadow-xs hover:bg-primary/20 transition-all cursor-pointer"
            title="View older archived tools engine test reports"
          >
            <Archive className="h-4 w-4" />
            <span>Older Reports ({AdminStore.getToolEngineAuditHistory().length})</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={testedCount === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-xs hover:border-foreground/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>

          {isRunningAll ? (
            <button
              type="button"
              onClick={handleStopAll}
              className="inline-flex items-center gap-2 rounded-2xl bg-destructive px-5 py-2.5 text-xs font-bold text-destructive-foreground shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Square className="h-4 w-4" />
              <span>Cancel Test</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartAll}
              className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{testedCount === 0 ? "Test All Tools Engine" : "Re-Run All Tools Test"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. LIVE RUNNER PROGRESS BAR (WHEN RUNNING) ────────────────────── */}
      {isRunningAll && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
              <span>
                Processing:{" "}
                <span className="font-mono text-accent">
                  {testingToolSlug || "Initializing next tool..."}
                </span>
              </span>
            </div>
            <span className="text-muted-foreground font-mono">
              {completedCount} / {totalCount} ({Math.round((completedCount / totalCount) * 100)}%)
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── 3. TOP KPI CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Engine Health Score */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Engine Health</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-foreground">
              {healthScore}%
            </span>
            <span
              className={`text-xs font-bold ${
                healthScore >= 95
                  ? "text-emerald-600 dark:text-emerald-400"
                  : healthScore >= 80
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-destructive"
              }`}
            >
              {healthScore >= 95 ? "Excellent" : healthScore >= 80 ? "Stable" : "Degraded"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {passedCount} of {testedCount || totalCount} tested engines passed
          </p>
        </div>

        {/* Card 2: Passed Engines */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Passed Engines</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {passedCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ {totalCount} Total</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Synthetic output verified & byte valid
          </p>
        </div>

        {/* Card 3: Execution Warnings (Slow) */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Slow Warnings</span>
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
              {warningCount > 0 ? ">1.5s Execution" : "Optimal"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Latency or memory threshold notices
          </p>
        </div>

        {/* Card 4: Failed Processing Engines */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Failed Engines</span>
            <Bug className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-3xl font-extrabold ${
                failedCount > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {failedCount}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {failedCount > 0 ? "Requires Fix" : "0 Crashes"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {failedCount > 0 ? "Auto-filed to Error Logs tab" : "All tested pipelines operational"}
          </p>
        </div>

        {/* Card 5: Mean Processing Latency */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            <span>Mean Latency</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-foreground">
              {avgLatency > 0 ? `${avgLatency}ms` : "--"}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {avgLatency < 500 && avgLatency > 0 ? "Fast" : "Normal"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Synthetic transcode & output render time
          </p>
        </div>
      </div>

      {/* ─── 4. SEARCH, CATEGORIES & STATUS FILTERS ─────────────────────────── */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === "all"
                ? "bg-foreground text-background shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories ({totalCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-1.5 font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat} ({tools.filter((t) => t.category === cat).length})
            </button>
          ))}
        </div>

        {/* Search & Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tool name, slug, or input/output type..."
              className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
            />
          </div>

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
              onClick={() => setStatusFilter("passed")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "passed"
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Passed ({passedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("warning")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "warning"
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Warnings ({warningCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("failed")}
              className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === "failed"
                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Failed ({failedCount})
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. TOOLS ENGINE TEST TABLE ────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                <th className="py-4 px-6">Tool Name & Category</th>
                <th className="py-4 px-4">Uploaded Test File (Input)</th>
                <th className="py-4 px-4">Processed Output (Result)</th>
                <th className="py-4 px-4">Engine Status</th>
                <th className="py-4 px-4">Duration</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTools.map((tool) => {
                const res = resultsMap[tool.slug];
                const isCurrentlyTesting = testingToolSlug === tool.slug;
                const status = res ? res.status : "idle";

                return (
                  <tr
                    key={tool.slug}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Tool Name & Category */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground font-bold">
                          <tool.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-accent transition-colors">
                            {tool.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              /tools/{tool.slug}
                            </span>
                            <span className="text-[10px] rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground font-semibold">
                              {tool.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Uploaded Test File (Input) */}
                    <td className="py-4 px-4">
                      {res && res.inputPreview ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={res.inputPreview}
                            alt="Input Test Payload"
                            className="h-9 w-9 rounded-lg object-contain bg-slate-100 dark:bg-slate-900 border border-border shadow-2xs shrink-0"
                          />
                          <div className="text-left">
                            <span className="font-mono text-[11px] font-bold text-foreground block">
                              {formatBytes(res.inputSizeBytes)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {res.inputFormat.split("/")[1] ?? res.inputFormat} • {res.inputDimensions?.width ?? 240}x{res.inputDimensions?.height ?? 240}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-[11px] font-mono">
                          <span>{tool.accepts.split(",")[0] || "File"}</span>
                          <span className="block text-[10px] text-muted-foreground/70">240x240 payload</span>
                        </div>
                      )}
                    </td>

                    {/* Processed Output (Result) */}
                    <td className="py-4 px-4">
                      {res && (res.outputSizeBytes ?? 0) > 0 ? (
                        <div className="flex items-center gap-2.5">
                          {res.outputPreview ? (
                            <div
                              className="relative h-9 w-9 rounded-lg border border-border overflow-hidden shrink-0 shadow-2xs"
                              style={{
                                backgroundImage:
                                  "repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 8px 8px",
                              }}
                            >
                              <img
                                src={res.outputPreview}
                                alt="Processed Output"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-rose-500">
                              ERR
                            </div>
                          )}
                          <div className="text-left max-w-[170px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-extrabold text-foreground">
                                {formatBytes(res.outputSizeBytes ?? 0)}
                              </span>
                              <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono">
                                {res.outputFormat?.split("/")[1] ?? "OUT"}
                              </span>
                            </div>
                            <p
                              className="text-[10px] text-muted-foreground truncate"
                              title={res.transformationSummary}
                            >
                              {res.transformationSummary || "Output verified"}
                            </p>
                          </div>
                        </div>
                      ) : res && res.status === "failed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" />
                          0 bytes (Failed)
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px] font-mono">
                          Pending test
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {isCurrentlyTesting ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent animate-pulse">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Processing...
                        </span>
                      ) : status === "passed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Passed
                        </span>
                      ) : status === "warning" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          Slow Engine
                        </span>
                      ) : status === "failed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                          <XCircle className="h-3 w-3" />
                          Execution Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          Untested
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4">
                      {res && res.executionDurationMs > 0 ? (
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {res.executionDurationMs}ms
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">--</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res && (
                          <button
                            type="button"
                            onClick={() => setSelectedResult(res)}
                            className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Logs</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleTestSingleTool(tool)}
                          disabled={isCurrentlyTesting}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-[11px] font-bold text-background shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Test</span>
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

      {/* ─── 6. DETAILED PIPELINE LOGS & REPORT MODAL ───────────────────────── */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {selectedResult.toolName} — Engine Execution Logs
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      selectedResult.status === "passed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : selectedResult.status === "warning"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {selectedResult.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  /tools/{selectedResult.toolSlug} • Execution time: {selectedResult.executionDurationMs}ms
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Banner if failed */}
            {selectedResult.status === "failed" && selectedResult.error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <Bug className="h-4 w-4" />
                  <span>Pipeline Execution Error Encountered</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-mono">
                  {selectedResult.error.message}
                </p>
                {selectedResult.error.stack && (
                  <pre className="max-h-36 overflow-y-auto rounded-xl bg-black/40 p-3 text-[10px] font-mono text-rose-300 whitespace-pre-wrap">
                    {selectedResult.error.stack}
                  </pre>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${selectedResult.error?.message}\n${selectedResult.error?.stack || ""}`
                      );
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      toast.success("Error stack copied to clipboard.");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy Error Stack"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = "errors";
                      window.dispatchEvent(new HashChangeEvent("hashchange"));
                      setSelectedResult(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    <span>View in Error Reports</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Pipeline Execution Stages */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pipeline Stages Breakdown
              </h4>
              <div className="space-y-2">
                {selectedResult.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-background/50 p-3.5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {st.status === "passed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : st.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-rose-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          Stage {idx + 1}: {st.step}
                        </p>
                        {st.details && (
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {st.details}
                          </p>
                        )}
                      </div>
                    </div>

                    {st.durationMs !== undefined && (
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground shrink-0">
                        {st.durationMs}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Side-by-Side: Uploaded File vs Output Result */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Visual Processing Inspection: Uploaded File vs Output Result
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Input File Card */}
                <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider">
                      Uploaded Test File (Input)
                    </span>
                    <span className="font-mono text-foreground font-semibold">
                      {formatBytes(selectedResult.inputSizeBytes)}
                    </span>
                  </div>
                  <div className="h-36 rounded-xl border border-border bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {selectedResult.inputPreview ? (
                      <img
                        src={selectedResult.inputPreview}
                        alt="Uploaded Input"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No input preview</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format: {selectedResult.inputFormat} • {selectedResult.inputDimensions?.width ?? 240}x{selectedResult.inputDimensions?.height ?? 240}px
                  </p>
                </div>

                {/* Output Result Card */}
                <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider">
                      Processed Engine Result (Output)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {formatBytes(selectedResult.outputSizeBytes ?? 0)}
                    </span>
                  </div>
                  <div
                    className="h-36 rounded-xl border border-border flex items-center justify-center overflow-hidden relative"
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 12px 12px",
                    }}
                  >
                    {selectedResult.outputPreview ? (
                      <img
                        src={selectedResult.outputPreview}
                        alt="Processed Output"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-rose-500 font-bold">Execution Failed</span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ {selectedResult.transformationSummary || "Buffer verified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
