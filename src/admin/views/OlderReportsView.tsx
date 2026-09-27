import { useState, useEffect, useMemo } from "react";
import {
  AdminStore,
  type SiteHealthAuditReport,
  type ToolEngineAuditReport,
  type SeoSiteAuditReport,
} from "@/admin/lib/admin-store";
import { toast } from "sonner";
import {
  Archive,
  HeartPulse,
  Cpu,
  Wand2,
  Search,
  Calendar,
  Clock,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Layers,
  ArrowRight,
  X,
  FileText,
  Activity,
  Zap,
} from "lucide-react";

export type OlderReportType = "all" | "website" | "tools" | "seo";

interface GenericAuditItem {
  id: string;
  type: "website" | "tools" | "seo";
  title: string;
  date: string;
  scoreText: string;
  scoreType: "percent" | "grade" | "count";
  scoreBadgeColor: string;
  summary: string;
  passedCount: number;
  warnCount: number;
  failCount: number;
  totalCount: number;
  rawHealthReport?: SiteHealthAuditReport;
  rawToolReport?: ToolEngineAuditReport;
  rawSeoReport?: SeoSiteAuditReport;
}

export function OlderReportsView({
  defaultFilter = "all",
  onNavigateToTab,
}: {
  defaultFilter?: OlderReportType;
  onNavigateToTab?: (tab: string) => void;
}) {
  const [selectedType, setSelectedType] = useState<OlderReportType>(defaultFilter);
  const [search, setSearch] = useState("");
  const [healthReports, setHealthReports] = useState<SiteHealthAuditReport[]>(() =>
    AdminStore.getHealthAuditHistory()
  );
  const [toolReports, setToolReports] = useState<ToolEngineAuditReport[]>(() =>
    AdminStore.getToolEngineAuditHistory()
  );
  const [seoReports, setSeoReports] = useState<SeoSiteAuditReport[]>(() =>
    AdminStore.getSeoAuditHistory()
  );

  const [activeModalReport, setActiveModalReport] = useState<GenericAuditItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshHistory = () => {
    setHealthReports(AdminStore.getHealthAuditHistory());
    setToolReports(AdminStore.getToolEngineAuditHistory());
    setSeoReports(AdminStore.getSeoAuditHistory());
  };

  useEffect(() => {
    window.addEventListener("bg:telemetry:update", refreshHistory);
    return () => window.removeEventListener("bg:telemetry:update", refreshHistory);
  }, []);

  // Format all reports into unified items for viewing & searching
  const unifiedItems: GenericAuditItem[] = useMemo(() => {
    const list: GenericAuditItem[] = [];

    // 1. Website Health Audits
    healthReports.forEach((r) => {
      list.push({
        id: r.id,
        type: "website",
        title: "Website Health Checkup & Automated Audit",
        date: r.completedAt || r.startedAt,
        scoreText: `${r.healthScorePercent}%`,
        scoreType: "percent",
        scoreBadgeColor:
          r.healthScorePercent >= 90
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : r.healthScorePercent >= 70
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        summary: `${r.healthyCount} routes healthy, ${r.warningCount} warnings, ${r.errorCount} critical issues. Avg latency: ${r.avgLatencyMs}ms.`,
        passedCount: r.healthyCount,
        warnCount: r.warningCount,
        failCount: r.errorCount,
        totalCount: r.totalRoutes,
        rawHealthReport: r,
      });
    });

    // 2. Tools Engine Audits
    toolReports.forEach((r) => {
      const passRate = r.totalTools > 0 ? Math.round((r.passedCount / r.totalTools) * 100) : 100;
      list.push({
        id: r.id,
        type: "tools",
        title: "Tools Engine Health & Processing Test",
        date: r.completedAt || r.startedAt,
        scoreText: `${passRate}%`,
        scoreType: "percent",
        scoreBadgeColor:
          r.failedCount === 0
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        summary: `${r.passedCount} tools passed synthetic test, ${r.warningCount} warnings, ${r.failedCount} failures. Avg duration: ${r.avgDurationMs}ms.`,
        passedCount: r.passedCount,
        warnCount: r.warningCount,
        failCount: r.failedCount,
        totalCount: r.totalTools,
        rawToolReport: r,
      });
    });

    // 3. SEO Optimization Audits
    seoReports.forEach((r) => {
      list.push({
        id: r.id,
        type: "seo",
        title: "SEO Optimization & Google Ranking Report",
        date: r.auditedAt,
        scoreText: `${r.overallScore}% (${r.grade})`,
        scoreType: "grade",
        scoreBadgeColor:
          r.overallScore >= 85
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : r.overallScore >= 70
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        summary: `${r.totalPages} pages probed. ${r.criticalIssuesCount} critical SEO issues identified. Grade ${r.grade}.`,
        passedCount: r.excellentCount || 0,
        warnCount: (r.goodCount || 0) + (r.needsWorkCount || 0),
        failCount: r.criticalIssuesCount,
        totalCount: r.totalPages,
        rawSeoReport: r,
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthReports, toolReports, seoReports]);

  // Filtered by selected category and search query
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.date.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [unifiedItems, selectedType, search]);

  const handleDeleteItem = (item: GenericAuditItem) => {
    if (item.type === "website") {
      AdminStore.deleteHealthAuditFromHistory(item.id);
    } else if (item.type === "tools") {
      AdminStore.deleteToolEngineAuditFromHistory(item.id);
    } else if (item.type === "seo") {
      AdminStore.deleteSeoAuditFromHistory(item.id);
    }
    refreshHistory();
    toast.success("Archived report deleted.");
  };

  const handleClearCategoryHistory = (type: OlderReportType) => {
    if (type === "website" || type === "all") AdminStore.clearHealthAuditHistory();
    if (type === "tools" || type === "all") AdminStore.clearToolEngineAuditHistory();
    if (type === "seo" || type === "all") AdminStore.clearSeoAuditHistory();
    refreshHistory();
    toast.success("Older reports history cleared.");
  };

  const handleExportJson = (item: GenericAuditItem) => {
    const data = item.rawHealthReport || item.rawToolReport || item.rawSeoReport;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `older-${item.type}-report-${item.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded as JSON.");
  };

  const handleCopySummary = (item: GenericAuditItem) => {
    const text = [
      `### Archived Report: ${item.title}`,
      `- **Report ID**: ${item.id}`,
      `- **Generated**: ${item.date}`,
      `- **Score**: ${item.scoreText}`,
      `- **Summary**: ${item.summary}`,
      `- **Total Audited**: ${item.totalCount}`,
      `- **Passed**: ${item.passedCount} | **Warnings**: ${item.warnCount} | **Failures**: ${item.failCount}`,
    ].join("\n");

    void navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRestoreAsActive = (item: GenericAuditItem) => {
    if (item.rawHealthReport) {
      AdminStore.saveHealthAudit(item.rawHealthReport);
      toast.success("Restored Website Health Checkup report to active checkup view!");
      if (onNavigateToTab) onNavigateToTab("health");
    } else if (item.rawToolReport) {
      AdminStore.saveToolEngineAudit(item.rawToolReport);
      toast.success("Restored Tools Engine Test report to active checkup view!");
      if (onNavigateToTab) onNavigateToTab("tools-health");
    } else if (item.rawSeoReport) {
      AdminStore.saveSeoAudit(item.rawSeoReport);
      toast.success("Restored SEO report to active SEO view!");
      if (onNavigateToTab) onNavigateToTab("seo-audit");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Older Audit Reports & History
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Archived snapshots of Website Health, Tools Engine, and SEO Ranking audits saved whenever new audits are initiated.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {unifiedItems.length > 0 && (
            <button
              type="button"
              onClick={() => handleClearCategoryHistory(selectedType)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear {selectedType === "all" ? "All" : selectedType} History</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Total Archived Reports</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-foreground">{unifiedItems.length}</span>
            <Archive className="h-4 w-4 text-muted-foreground opacity-60" />
          </div>
          <p className="text-[11px] text-muted-foreground">Persisted historical snapshots</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Website Health Audits</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-foreground">{healthReports.length}</span>
            <HeartPulse className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-muted-foreground">Route & endpoint health</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Tools Engine Tests</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-foreground">{toolReports.length}</span>
            <Cpu className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-[11px] text-muted-foreground">Synthetic image & PDF tests</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">SEO Ranking Audits</p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-foreground">{seoReports.length}</span>
            <Wand2 className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-[11px] text-muted-foreground">Google rank & meta probes</p>
        </div>
      </div>

      {/* Segment Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border max-w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedType === "all"
                ? "bg-card text-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Reports</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">{unifiedItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("website")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedType === "website"
                ? "bg-card text-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartPulse className="h-3.5 w-3.5 text-emerald-500" />
            <span>Website Health</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">{healthReports.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("tools")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedType === "tools"
                ? "bg-card text-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            <span>Tools Engine</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">{toolReports.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("seo")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              selectedType === "seo"
                ? "bg-card text-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-500" />
            <span>SEO Audits</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">{seoReports.length}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, date or metrics..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
          <h3 className="font-display text-lg font-bold text-foreground">No Older Reports Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {search
              ? "No archived reports match your current search query."
              : "When you re-run an audit in Website Health, Tools Engine, or SEO Optimization, the previous report is cleaned from the checkup page and archived here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isHealth = item.type === "website";
            const isTool = item.type === "tools";
            const isSeo = item.type === "seo";

            return (
              <div
                key={item.id}
                className="group relative rounded-3xl border border-border bg-card p-5 sm:p-6 transition-all hover:border-foreground/30 hover:shadow-md space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                        isHealth
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
                          : isTool
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
                      }`}
                    >
                      {isHealth && <HeartPulse className="h-5 w-5" />}
                      {isTool && <Cpu className="h-5 w-5" />}
                      {isSeo && <Wand2 className="h-5 w-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">{item.title}</span>
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase font-bold">
                          {item.type}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${item.scoreBadgeColor}`}>
                          Score: {item.scoreText}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(item.date).toLocaleTimeString()}</span>
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground/80">ID: {item.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveModalReport(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-1.5 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Full Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySummary(item)}
                      title="Copy Summary"
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportJson(item)}
                      title="Export JSON"
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRestoreAsActive(item)}
                      title="Restore / Set this as current active report"
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      title="Delete Archived Report"
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-muted-foreground">Passed:</span>
                    <span className="font-bold text-foreground">{item.passedCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-muted-foreground">Warnings:</span>
                    <span className="font-bold text-foreground">{item.warnCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-muted-foreground">Critical Issues:</span>
                    <span className="font-bold text-foreground">{item.failCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Probed:</span>
                    <span className="font-bold text-foreground">{item.totalCount}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40 font-mono">
                  {item.summary}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Full Report Inspection Modal */}
      {activeModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                  {activeModalReport.type === "website" && <HeartPulse className="h-5 w-5 text-emerald-500" />}
                  {activeModalReport.type === "tools" && <Cpu className="h-5 w-5 text-blue-500" />}
                  {activeModalReport.type === "seo" && <Wand2 className="h-5 w-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {activeModalReport.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Audited at: {new Date(activeModalReport.date).toLocaleString()} · ID: {activeModalReport.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalReport(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground">Score</span>
                <p className="text-lg font-black text-foreground">{activeModalReport.scoreText}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground">Passed</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeModalReport.passedCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground">Warnings</span>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">{activeModalReport.warnCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <span className="text-[11px] text-muted-foreground">Failures</span>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{activeModalReport.failCount}</p>
              </div>
            </div>

            {/* Sub-table: Website Health Routes */}
            {activeModalReport.rawHealthReport && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                  <span>Audited Routes Breakdown ({activeModalReport.rawHealthReport.routes.length})</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Avg Latency: {activeModalReport.rawHealthReport.avgLatencyMs}ms
                  </span>
                </h4>

                <div className="max-h-96 overflow-y-auto rounded-2xl border border-border bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Route Name & Path</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">HTTP</th>
                        <th className="py-2.5 px-4">Latency</th>
                        <th className="py-2.5 px-4">Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeModalReport.rawHealthReport.routes.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-foreground block">{r.name}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{r.path}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                r.status === "healthy"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : r.status === "warning"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold">{r.httpStatus || 200}</td>
                          <td className="py-2.5 px-4 font-mono">{r.latencyMs || 0}ms</td>
                          <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate">{r.summary || "OK"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-table: Tools Engine Health */}
            {activeModalReport.rawToolReport && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                  <span>Tool Engines Tested ({activeModalReport.rawToolReport.results.length})</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Avg Exec: {activeModalReport.rawToolReport.avgDurationMs}ms
                  </span>
                </h4>

                <div className="max-h-96 overflow-y-auto rounded-2xl border border-border bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Tool Name & Slug</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Format</th>
                        <th className="py-2.5 px-4">Duration</th>
                        <th className="py-2.5 px-4">Transformation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeModalReport.rawToolReport.results.map((t) => (
                        <tr key={t.toolSlug} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-foreground block">{t.toolName}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{t.toolSlug}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                t.status === "passed"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : t.status === "warning"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono">{t.inputFormat} → {t.outputFormat || t.inputFormat}</td>
                          <td className="py-2.5 px-4 font-mono">{t.executionDurationMs}ms</td>
                          <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate">
                            {t.transformationSummary || (t.error ? t.error.message : "Processed OK")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-table: SEO Audited Pages */}
            {activeModalReport.rawSeoReport && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                  <span>Pages SEO Performance ({activeModalReport.rawSeoReport.pages.length})</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Grade {activeModalReport.rawSeoReport.grade} · {activeModalReport.rawSeoReport.overallScore}% Score
                  </span>
                </h4>

                <div className="max-h-96 overflow-y-auto rounded-2xl border border-border bg-background">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Page Title & URL</th>
                        <th className="py-2.5 px-4">Score</th>
                        <th className="py-2.5 px-4">Grade</th>
                        <th className="py-2.5 px-4">Target Keyword</th>
                        <th className="py-2.5 px-4">Issues Found</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeModalReport.rawSeoReport.pages.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-foreground block">{p.title}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{p.url}</span>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {p.score}%
                          </td>
                          <td className="py-2.5 px-4 font-bold">{p.grade}</td>
                          <td className="py-2.5 px-4 font-mono text-muted-foreground">{p.details?.primaryKeyword || "—"}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {p.recommendations?.length || 0} recommendations
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <button
                type="button"
                onClick={() => handleExportJson(activeModalReport)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export Full Report (JSON)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleRestoreAsActive(activeModalReport);
                    setActiveModalReport(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restore As Active Checkup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalReport(null)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
