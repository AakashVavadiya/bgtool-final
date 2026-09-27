import { useState, useMemo, useRef, useEffect } from "react";
import {
  AdminStore,
  type ErrorLogItem,
  type ErrorVerificationRecord,
  type ErrorVerificationLog,
} from "@/admin/lib/admin-store";
import { getTool } from "@/lib/tools";
import { runErrorFixVerification } from "@/admin/lib/error-verifier";
import { toast } from "sonner";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Lightbulb,
  Terminal,
  Wrench,
  Bot,
  Globe,
  Code,
  Flame,
  FlaskConical,
  Loader2,
  X,
  RotateCw,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";

// Tool & Route Resolver
function resolvePageContext(url: string): {
  name: string;
  category: string;
  type: "tool" | "chat" | "admin" | "auth" | "billing" | "page";
  link: string;
} {
  if (!url) {
    return { name: "Global Application", category: "System", type: "page", link: "/" };
  }

  const cleanUrl = url.split("?")[0] || "/";

  if (cleanUrl.startsWith("/chat")) {
    return {
      name: "Karudi AI Smart Assistant",
      category: "Multi-Model Orchestrator",
      type: "chat",
      link: cleanUrl,
    };
  }

  if (cleanUrl.startsWith("/tools/")) {
    const slug = cleanUrl.replace("/tools/", "");
    const tool = getTool(slug);
    if (tool) {
      return {
        name: tool.name,
        category: tool.category || "Image & Document Tool",
        type: "tool",
        link: cleanUrl,
      };
    }
    return {
      name: `Tool: ${slug}`,
      category: "Tools Workspace",
      type: "tool",
      link: cleanUrl,
    };
  }

  if (cleanUrl.startsWith("/admin")) {
    return {
      name: "Admin Control Console",
      category: "System Administration",
      type: "admin",
      link: cleanUrl,
    };
  }

  if (cleanUrl.startsWith("/auth")) {
    return {
      name: "User Authentication & Portal",
      category: "Accounts & Security",
      type: "auth",
      link: cleanUrl,
    };
  }

  if (cleanUrl.startsWith("/pricing")) {
    return {
      name: "Pricing & Credit Store",
      category: "Billing & Subscriptions",
      type: "billing",
      link: cleanUrl,
    };
  }

  if (cleanUrl === "/" || cleanUrl === "") {
    return {
      name: "Home Landing Page",
      category: "Main Portal",
      type: "page",
      link: "/",
    };
  }

  return {
    name: cleanUrl,
    category: "Site Route",
    type: "page",
    link: cleanUrl,
  };
}

// Intelligent Error Diagnosis Engine
function diagnoseError(errorName: string, message: string): {
  category: string;
  explanation: string;
  possibleFix: string;
  badgeColor: string;
} {
  const normName = (errorName || "").toLowerCase();
  const normMsg = (message || "").toLowerCase();

  if (normName.includes("referenceerror") || normMsg.includes("is not defined")) {
    return {
      category: "Missing Import / Undeclared Variable",
      explanation:
        "The code attempted to render or execute a component or variable that does not exist in the current file scope.",
      possibleFix:
        "Check imports at the top of the file, verify matching component export names (e.g. aliases like KrishnaAvatar ⇄ KarudiAvatar), and ensure no typos.",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    };
  }

  if (
    normName.includes("typeerror") ||
    normMsg.includes("cannot read properties of undefined") ||
    normMsg.includes("cannot read properties of null") ||
    normMsg.includes("is not a function")
  ) {
    return {
      category: "Null / Undefined Dereference",
      explanation:
        "An object was accessed before it finished loading, was initialized, or was returned null from an API/state hook.",
      possibleFix:
        "Add optional chaining (?.) before accessing nested properties, and add fallback defaults or loading guards.",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  }

  if (
    normMsg.includes("fetch") ||
    normMsg.includes("network") ||
    normMsg.includes("failed to fetch") ||
    normName.includes("networkerror")
  ) {
    return {
      category: "Network / API Failure",
      explanation:
        "An asynchronous fetch request failed due to offline connectivity, API server unreachable, or CORS restriction.",
      possibleFix:
        "Verify backend dev server is running on the expected port, check browser DevTools Network tab, and verify CORS headers.",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
  }

  if (
    normMsg.includes("chunkloaderror") ||
    normMsg.includes("loading chunk") ||
    normMsg.includes("failed to fetch dynamically imported module")
  ) {
    return {
      category: "Stale Bundle / Cache Mismatch",
      explanation:
        "The user's browser had an older HTML page cached and tried to load a Vite code-split bundle that was replaced in a newer deployment.",
      possibleFix:
        "Hard-refresh the page (Ctrl + Shift + R), or add an automatic chunk reload handler in the TanStack router error boundary.",
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    };
  }

  if (
    normMsg.includes("wasm") ||
    normMsg.includes("out of memory") ||
    normMsg.includes("canvas") ||
    normMsg.includes("webgl")
  ) {
    return {
      category: "Media / WebAssembly Memory Exhaustion",
      explanation:
        "High resolution image processing or neural matting exceeded the available GPU or canvas memory allocation.",
      possibleFix:
        "Downscale source files exceeding 4K resolution before running inference, or enable chunked canvas processing.",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    };
  }

  return {
    category: "Unhandled Client Exception",
    explanation:
      "A client-side JavaScript exception was caught by the global error boundary during user interaction.",
    possibleFix:
      "Review the stack trace line numbers to pinpoint the failing component and verify safe state transitions.",
    badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  };
}

export type GroupedError = {
  groupKey: string;
  errorName: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  severity: ErrorLogItem["severity"];
  status: ErrorLogItem["status"];
  urls: string[];
  items: ErrorLogItem[];
  latestItem: ErrorLogItem;
};

export function ErrorLogsView() {
  const [logs, setLogs] = useState<ErrorLogItem[]>(() => AdminStore.getErrorLogs());
  const [search, setSearch] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grouped" | "individual">("grouped");
  const [statusFilter, setStatusFilter] = useState<"all" | "investigating" | "resolved">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Background Verification State
  const [verifications, setVerifications] = useState<Record<string, ErrorVerificationRecord>>(() =>
    AdminStore.getVerifications()
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeVerifyRecord, setActiveVerifyRecord] = useState<ErrorVerificationRecord | null>(null);
  const [liveLogs, setLiveLogs] = useState<ErrorVerificationLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<{
    key: string;
    url: string;
    targetError: string;
    errorName: string;
    group?: GroupedError;
    single?: ErrorLogItem;
  } | null>(null);

  const logsTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll verification logs terminal
  useEffect(() => {
    if (logsTerminalRef.current) {
      logsTerminalRef.current.scrollTop = logsTerminalRef.current.scrollHeight;
    }
  }, [liveLogs]);

  // Status updates
  const handleUpdateStatus = (id: string, newStatus: ErrorLogItem["status"]) => {
    const updated = AdminStore.updateErrorStatus(id, newStatus);
    setLogs([...updated]);
    toast.success(`Error ${id} marked as ${newStatus}`);
  };

  // Group status update (mark all occurrences resolved)
  const handleUpdateGroupStatus = (group: GroupedError, newStatus: ErrorLogItem["status"]) => {
    const ids = group.items.map((i) => i.id);
    const updated = AdminStore.updateErrorStatusMany(ids, newStatus);
    setLogs([...updated]);
    toast.success(`Marked all ${ids.length} occurrences as ${newStatus}`);
  };

  // Delete single or group
  const handleDeleteSingle = (id: string) => {
    const updated = AdminStore.deleteErrorLogs([id]);
    setLogs([...updated]);
    toast.success(`Deleted error log ${id}`);
  };

  const handleDeleteGroup = (group: GroupedError) => {
    const ids = group.items.map((i) => i.id);
    const updated = AdminStore.deleteErrorLogs(ids);
    setLogs([...updated]);
    toast.success(`Deleted ${ids.length} error occurrences`);
  };

  // Clear operations
  const handleClearResolved = () => {
    const resolvedCount = logs.filter((l) => l.status === "resolved").length;
    if (resolvedCount === 0) {
      toast.info("No resolved errors to clear.");
      return;
    }
    const updated = AdminStore.clearResolvedErrorLogs();
    setLogs([...updated]);
    toast.success(`Cleared ${resolvedCount} resolved error logs`);
  };

  const handleClearAll = () => {
    if (logs.length === 0) {
      toast.info("Error log list is already empty.");
      return;
    }
    const count = logs.length;
    AdminStore.clearAllErrorLogs();
    setLogs([]);
    toast.success(`Cleared all ${count} error logs from system`);
  };

  const handleResolveAllOpen = () => {
    const openLogs = logs.filter((l) => l.status !== "resolved");
    if (openLogs.length === 0) {
      toast.info("All errors are already marked resolved.");
      return;
    }
    const ids = openLogs.map((l) => l.id);
    const updated = AdminStore.updateErrorStatusMany(ids, "resolved");
    setLogs([...updated]);
    toast.success(`Marked all ${ids.length} open errors as resolved`);
  };

  // Copy helpers
  const handleCopyGroup = (group: GroupedError) => {
    const primaryUrl = group.urls[0] || "/";
    const context = resolvePageContext(primaryUrl);
    const diagnosis = diagnoseError(group.errorName, group.message);

    const text = [
      `### Error Report: ${group.errorName}`,
      `- **Occurrences**: ${group.count} times`,
      `- **Status**: ${group.status}`,
      `- **Severity**: ${group.severity}`,
      `- **Tool / Page**: ${context.name} (${context.category}) [${primaryUrl}]`,
      `- **First Seen**: ${group.firstSeen}`,
      `- **Last Seen**: ${group.lastSeen}`,
      `- **Diagnosis**: ${diagnosis.category}`,
      `- **Error IDs**: ${group.items.map((i) => i.id).join(", ")}`,
      `- **User Agent**: ${group.latestItem.userAgent || "Unknown"}`,
      ``,
      `#### Error Message:`,
      "```",
      group.message,
      "```",
      group.latestItem.stack ? `\n#### Stack Trace:\n\`\`\`\n${group.latestItem.stack}\n\`\`\`` : "",
      diagnosis.possibleFix ? `\n#### Recommended Fix:\n${diagnosis.possibleFix}` : "",
    ].join("\n");

    void navigator.clipboard.writeText(text);
    setCopiedKey(group.groupKey);
    toast.success("Complete error details copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopySingle = (log: ErrorLogItem) => {
    const context = resolvePageContext(log.url);
    const text = [
      `### Error Report: [${log.id}] ${log.errorName}`,
      `- **Tool / Page**: ${context.name} (${log.url})`,
      `- **Timestamp**: ${log.timestamp}`,
      `- **Severity**: ${log.severity}`,
      `- **User Agent**: ${log.userAgent || "Unknown"}`,
      ``,
      `#### Error Message:`,
      "```",
      log.message,
      "```",
      log.stack ? `\n#### Stack Trace:\n\`\`\`\n${log.stack}\n\`\`\`` : "",
    ].join("\n");

    void navigator.clipboard.writeText(text);
    setCopiedKey(log.id);
    toast.success(`Error details for ${log.id} copied!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyCodeSnippet = (snippet: string, key: string) => {
    void navigator.clipboard.writeText(snippet);
    setCopiedKey(`stack_${key}`);
    toast.success("Stack trace copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ─── Automated Fix Verification Execution ─────────────────────────────────
  const startVerification = async (target: {
    key: string;
    url: string;
    targetError: string;
    errorName: string;
    group?: GroupedError;
    single?: ErrorLogItem;
  }) => {
    setVerifyTarget(target);
    setIsModalOpen(true);
    setIsVerifying(true);
    setLiveLogs([]);
    setActiveVerifyRecord(null);

    try {
      const record = await runErrorFixVerification({
        errorKey: target.key,
        url: target.url,
        targetError: target.targetError,
        errorName: target.errorName,
        onLog: (entry) => {
          setLiveLogs((prev) => [...prev, entry]);
        },
      });

      setActiveVerifyRecord(record);
      setVerifications(AdminStore.getVerifications());

      if (record.status === "passed") {
        toast.success("Fix verified! No errors detected in background test run.");
      } else {
        toast.error("Verification failed: error was still detected during test execution.");
      }
    } catch {
      toast.error("Failed to complete background verification test.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyTestLogs = () => {
    if (!verifyTarget) return;
    const lines = [
      `### Background Fix Verification Report`,
      `- **Target Error**: ${verifyTarget.targetError} (${verifyTarget.errorName})`,
      `- **Tested Route**: ${verifyTarget.url}`,
      `- **Status**: ${activeVerifyRecord?.status.toUpperCase() || "IN_PROGRESS"}`,
      `- **Duration**: ${activeVerifyRecord ? `${activeVerifyRecord.durationMs}ms` : "N/A"}`,
      `- **HTTP Status**: ${activeVerifyRecord ? activeVerifyRecord.httpStatus : "N/A"}`,
      `- **Tested At**: ${activeVerifyRecord ? activeVerifyRecord.testedAt : new Date().toISOString()}`,
      `- **Summary**: ${activeVerifyRecord?.summary || "N/A"}`,
      ``,
      `#### Execution Test Log:`,
      "```",
      liveLogs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join("\n"),
      "```",
    ].join("\n");

    void navigator.clipboard.writeText(lines);
    toast.success("Verification test logs copied to clipboard!");
  };

  const handleAcceptFixAndResolve = () => {
    if (!verifyTarget) return;

    if (verifyTarget.group) {
      handleUpdateGroupStatus(verifyTarget.group, "resolved");
    } else if (verifyTarget.single) {
      handleUpdateStatus(verifyTarget.single.id, "resolved");
    }

    toast.success("Fix accepted and issue marked as resolved!");
    setIsModalOpen(false);
  };

  // Filtered raw logs
  const filteredRawLogs = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.message.toLowerCase().includes(q) ||
        l.errorName.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        (l.userFeedback && l.userFeedback.toLowerCase().includes(q))
      );
    });
  }, [logs, search, statusFilter]);

  // Grouped logs computation
  const groupedLogs: GroupedError[] = useMemo(() => {
    const groupsMap = new Map<string, GroupedError>();

    for (const item of logs) {
      const normalizedMsg = (item.message || "").trim();
      const groupKey = `${item.errorName}:::${normalizedMsg}`;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          groupKey,
          errorName: item.errorName,
          message: item.message,
          count: 0,
          firstSeen: item.timestamp,
          lastSeen: item.timestamp,
          severity: item.severity,
          status: item.status,
          urls: [],
          items: [],
          latestItem: item,
        });
      }

      const g = groupsMap.get(groupKey)!;
      g.count += 1;
      g.items.push(item);

      if (!g.urls.includes(item.url)) {
        g.urls.push(item.url);
      }

      if (item.severity === "critical") {
        g.severity = "critical";
      }

      // If any occurrence is still investigating, mark group as investigating
      if (item.status === "investigating") {
        g.status = "investigating";
      }

      // Update timestamps
      if (new Date(item.timestamp) < new Date(g.firstSeen)) {
        g.firstSeen = item.timestamp;
      }
      if (new Date(item.timestamp) > new Date(g.lastSeen)) {
        g.lastSeen = item.timestamp;
        g.latestItem = item;
      }
    }

    const arr = Array.from(groupsMap.values());

    return arr.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        g.errorName.toLowerCase().includes(q) ||
        g.message.toLowerCase().includes(q) ||
        g.urls.some((u) => u.toLowerCase().includes(q)) ||
        g.items.some((i) => i.id.toLowerCase().includes(q))
      );
    });
  }, [logs, search, statusFilter]);

  const totalInvestigating = logs.filter((l) => l.status === "investigating").length;
  const totalResolved = logs.filter((l) => l.status === "resolved").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              System Error Logs & Reports
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted border border-border text-muted-foreground">
              <Terminal className="h-3 w-3" /> Auto-Fix Verification Engine
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real client crash reports, WebAssembly matting exceptions, headless auto-check verification, and smart grouping.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {totalInvestigating > 0 && (
            <button
              type="button"
              onClick={handleResolveAllOpen}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-xs"
              title="Mark all investigating errors as resolved"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Resolve All Open ({totalInvestigating})</span>
            </button>
          )}

          {totalResolved > 0 && (
            <button
              type="button"
              onClick={handleClearResolved}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-xs"
              title="Purge resolved logs from storage"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Resolved ({totalResolved})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/15 transition-all shadow-xs"
            title="Wipe entire error logs database"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All Logs</span>
          </button>
        </div>
      </div>

      {/* Filter, View Switcher & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by error name, message, tool URL or ID (e.g. ERR_MUFF)..."
            className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* View Mode Toggle: Grouped vs Individual */}
        <div className="md:col-span-3 flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
              viewMode === "grouped"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Grouped ({groupedLogs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("individual")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
              viewMode === "individual"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Raw Log ({filteredRawLogs.length})</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex items-center rounded-2xl border border-border bg-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all ${
              statusFilter === "all"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("investigating")}
            className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all ${
              statusFilter === "investigating"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Open ({totalInvestigating})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("resolved")}
            className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all ${
              statusFilter === "resolved"
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Resolved ({totalResolved})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center shadow-xs">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">Clean Slate: Zero Recorded Errors</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            All background AI tools, OCR processors, WASM cutouts, and Karudi chat orchestrators are running smoothly with no unhandled browser exceptions.
          </p>
        </div>
      ) : (viewMode === "grouped" && groupedLogs.length === 0) ||
        (viewMode === "individual" && filteredRawLogs.length === 0) ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground text-xs shadow-xs">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-foreground text-sm">No matching errors found</p>
          <p className="mt-1 text-[11px]">Try adjusting your search query or status filter.</p>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 1. GROUPED VIEW (Smart Stack & Unified Handling)                         */}
      {/* ========================================================================= */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {groupedLogs.map((group) => {
            const isExpanded = expandedKey === group.groupKey;
            const isCopied = copiedKey === group.groupKey;
            const primaryUrl = group.urls[0] || "/";
            const context = resolvePageContext(primaryUrl);
            const diagnosis = diagnoseError(group.errorName, group.message);
            const verification = verifications[group.groupKey];

            return (
              <div
                key={group.groupKey}
                className={`rounded-3xl border transition-all duration-200 shadow-xs ${
                  group.status === "resolved"
                    ? "border-border/80 bg-card/60 opacity-80"
                    : group.severity === "critical"
                    ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                    : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                } p-5 md:p-6`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Icon & Core Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold shadow-xs ${
                        group.severity === "critical"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Badges bar */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {/* Occurrence Counter Badge */}
                        <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 font-extrabold text-background shadow-xs text-[10px]">
                          <Flame className="h-3 w-3 fill-current text-amber-400" />
                          <span>
                            {group.count} {group.count === 1 ? "Occurrence" : "Occurrences"}
                          </span>
                        </span>

                        {/* Severity */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            group.severity === "critical"
                              ? "bg-destructive/15 text-destructive border border-destructive/30"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {group.severity}
                        </span>

                        {/* Verification Status Badge (If already tested) */}
                        {verification && (
                          <span
                            onClick={() => {
                              setVerifyTarget({
                                key: group.groupKey,
                                url: primaryUrl,
                                targetError: group.message,
                                errorName: group.errorName,
                                group,
                              });
                              setActiveVerifyRecord(verification);
                              setLiveLogs(verification.logs);
                              setIsModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold cursor-pointer border transition-transform hover:scale-105 ${
                              verification.status === "passed"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-destructive/15 text-destructive border-destructive/30"
                            }`}
                            title="Click to view full verification test logs"
                          >
                            {verification.status === "passed" ? (
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-destructive" />
                            )}
                            <span>
                              {verification.status === "passed"
                                ? `Fix Verified (${verification.durationMs}ms)`
                                : `Verification Failed`}
                            </span>
                          </span>
                        )}

                        {/* Tool / Page Reference Badge */}
                        <a
                          href={context.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-card border border-border/80 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                          title="Open affected tool or page in new tab"
                        >
                          {context.type === "chat" ? (
                            <Bot className="h-3 w-3 text-accent" />
                          ) : context.type === "tool" ? (
                            <Wrench className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Globe className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="truncate max-w-[180px]">{context.name}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
                        </a>

                        {/* Timestamp range */}
                        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 opacity-60" />
                          <span>Last: {group.lastSeen}</span>
                        </span>
                      </div>

                      {/* Error Headline & Message */}
                      <h4 className="mt-1.5 font-display font-extrabold text-foreground text-base tracking-tight truncate">
                        {group.errorName}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-mono break-all">
                        {group.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                    {/* AUTO ERROR HANDLE CHECKER / FIX VERIFY BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        startVerification({
                          key: group.groupKey,
                          url: primaryUrl,
                          targetError: group.message,
                          errorName: group.errorName,
                          group,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-extrabold text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all shadow-xs cursor-pointer"
                      title="Load website route in isolated background sandbox and verify if this error still triggers or is solved"
                    >
                      <FlaskConical className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Auto-Verify Fix</span>
                    </button>

                    {/* Copy Code / Error Details Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyGroup(group)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                      title="Copy complete error report and code to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Copy Error Code</span>
                        </>
                      )}
                    </button>

                    {/* Mark Group Resolved / Status */}
                    {group.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateGroupStatus(group, "resolved")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-xs"
                        title="Mark all occurrences in this group as resolved"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Resolved ({group.count})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateGroupStatus(group, "investigating")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-colors"
                        title="Click to reopen this error group"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Resolved ({group.count})</span>
                      </button>
                    )}

                    {/* Delete Group */}
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete this error group permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      type="button"
                      onClick={() => setExpandedKey(isExpanded ? null : group.groupKey)}
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* ============================================================= */}
                {/* EXPANDED DETAILS: Tool Reference, Diagnosis, Code & Occurrences */}
                {/* ============================================================= */}
                {isExpanded && (
                  <div className="mt-5 space-y-4 border-t border-border/70 pt-5 text-xs animate-fade-in">
                    {/* 1. TOOL & ERROR UNDERSTANDING SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tool / Page Reference Card */}
                      <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5 text-accent" />
                            Tool Reference & Context
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {context.category}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-foreground">{context.name}</h5>
                        <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
                          URL: {primaryUrl}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <a
                            href={context.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-opacity"
                          >
                            <span>Open Tool / Workspace</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <span className="text-[11px] text-muted-foreground">
                            Occurred across {group.urls.length} unique {group.urls.length === 1 ? "route" : "routes"}
                          </span>
                        </div>
                      </div>

                      {/* AI Error Diagnosis & Remediation */}
                      <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                            Error Understanding & Diagnosis
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diagnosis.badgeColor}`}>
                            {diagnosis.category}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">
                          {diagnosis.explanation}
                        </p>
                        <div className="mt-2.5 rounded-xl bg-muted/50 p-2.5 border border-border/50 text-[11px]">
                          <strong className="text-foreground block mb-0.5 font-bold">Suggested Remediation:</strong>
                          <span className="text-muted-foreground leading-relaxed">{diagnosis.possibleFix}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. FULL MESSAGE BOX */}
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block mb-1">
                        Full Message:
                      </span>
                      <div className="rounded-2xl bg-card border border-border p-3.5 font-mono text-xs text-foreground whitespace-pre-wrap shadow-2xs">
                        {group.message}
                      </div>
                    </div>

                    {/* 3. STACK TRACE & COPY CODE BUTTON */}
                    {group.latestItem.stack && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-primary" />
                            Stack Trace (Latest Instance)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCodeSnippet(group.latestItem.stack || "", group.groupKey)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                          >
                            {copiedKey === `stack_${group.groupKey}` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Stack Trace</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="max-h-60 overflow-y-auto rounded-2xl bg-muted/60 border border-border/80 p-3.5 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap shadow-inner leading-relaxed">
                          {group.latestItem.stack}
                        </pre>
                      </div>
                    )}

                    {/* 4. GROUP OCCURRENCES LIST (INDIVIDUAL IDS) */}
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block mb-2">
                        All {group.count} Logged Occurrence IDs:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-mono text-foreground shadow-2xs hover:bg-muted transition-colors"
                          >
                            <span className="font-bold">{item.id}</span>
                            <span className="text-[10px] text-muted-foreground">({item.timestamp.slice(11)})</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(item.id)}
                              className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                              title={`Delete instance ${item.id}`}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground">User Agent:</span>
                        <p className="font-mono text-[11px] truncate mt-0.5">
                          {group.latestItem.userAgent || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-foreground">Time Horizon:</span>
                        <p className="font-mono text-[11px] mt-0.5">
                          First: {group.firstSeen} · Latest: {group.lastSeen}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INDIVIDUAL LOG STREAM VIEW                                            */}
      {/* ========================================================================= */}
      {viewMode === "individual" && (
        <div className="space-y-4">
          {filteredRawLogs.map((log) => {
            const isExpanded = expandedKey === log.id;
            const isCopied = copiedKey === log.id;
            const context = resolvePageContext(log.url);
            const diagnosis = diagnoseError(log.errorName, log.message);
            const verification = verifications[log.id];

            return (
              <div
                key={log.id}
                className={`rounded-3xl border transition-all duration-200 shadow-xs ${
                  log.status === "resolved"
                    ? "border-border bg-card/60 opacity-80"
                    : log.severity === "critical"
                    ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                    : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                } p-5 md:p-6`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                        log.severity === "critical"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono text-xs font-bold text-foreground">{log.id}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{log.timestamp}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            log.severity === "critical"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {log.severity}
                        </span>

                        {verification && (
                          <span
                            onClick={() => {
                              setVerifyTarget({
                                key: log.id,
                                url: log.url,
                                targetError: log.message,
                                errorName: log.errorName,
                                single: log,
                              });
                              setActiveVerifyRecord(verification);
                              setLiveLogs(verification.logs);
                              setIsModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold cursor-pointer border ${
                              verification.status === "passed"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-destructive/15 text-destructive border-destructive/30"
                            }`}
                          >
                            {verification.status === "passed" ? (
                              <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-2.5 w-2.5 text-destructive" />
                            )}
                            <span>{verification.status === "passed" ? "Verified Fixed" : "Still Failing"}</span>
                          </span>
                        )}

                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                          {context.name} ({log.url})
                        </span>
                      </div>

                      <h4 className="mt-1 font-bold text-foreground text-sm">{log.errorName}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-mono">{log.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        startVerification({
                          key: log.id,
                          url: log.url,
                          targetError: log.message,
                          errorName: log.errorName,
                          single: log,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
                      title="Run automated test in background"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Verify Fix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySingle(log)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      title="Copy error code"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="hidden sm:inline">Copy</span>
                    </button>

                    {log.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(log.id, "resolved")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        Resolved
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(log.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete this error log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedKey(isExpanded ? null : log.id)}
                      className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-4 border-t border-border pt-4 text-xs">
                    {/* Tool context & Diagnosis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
                        <span className="font-bold text-foreground block text-[11px] mb-1">
                          Affected Tool / Page: {context.name}
                        </span>
                        <a
                          href={context.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-accent hover:underline text-[11px] font-semibold"
                        >
                          <span>Visit {context.link}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
                        <span className="font-bold text-foreground block text-[11px] mb-1">
                          Diagnosis: {diagnosis.category}
                        </span>
                        <p className="text-[11px] text-muted-foreground">{diagnosis.explanation}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[10px]">Full Message:</span>
                      <p className="mt-1 rounded-xl bg-muted/40 p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
                        {log.message}
                      </p>
                    </div>

                    {log.stack && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-muted-foreground uppercase text-[10px]">Stack Trace:</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCodeSnippet(log.stack || "", log.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy Stack</span>
                          </button>
                        </div>
                        <pre className="max-h-48 overflow-y-auto rounded-xl bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-bold text-foreground">User Agent:</span>
                        <p className="font-mono text-[11px] truncate mt-0.5">{log.userAgent}</p>
                      </div>
                      {log.userEmail && (
                        <div>
                          <span className="font-bold text-foreground">Reported By User:</span>
                          <p className="font-mono text-[11px] text-accent mt-0.5">{log.userEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AUTOMATED FIX VERIFICATION MODAL & LIVE TEST LOGS                       */}
      {/* ========================================================================= */}
      {isModalOpen && verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/70 bg-card/80">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isVerifying
                      ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 animate-pulse"
                      : activeVerifyRecord?.status === "passed"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {isVerifying ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : activeVerifyRecord?.status === "passed" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <FlaskConical className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    Automated Background Fix Verification
                    {isVerifying && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        <Activity className="h-3 w-3" /> Testing Live...
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                    Target Route: {verifyTarget.url}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Verdict Summary Banner */}
              <div
                className={`rounded-2xl border p-4 transition-all shadow-xs ${
                  isVerifying
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-800 dark:text-purple-200"
                    : activeVerifyRecord?.status === "passed"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {isVerifying ? (
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                    ) : activeVerifyRecord?.status === "passed" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-display font-extrabold text-sm sm:text-base">
                      {isVerifying
                        ? "Running Background Sandbox Probe..."
                        : activeVerifyRecord?.status === "passed"
                        ? "VERIFICATION PASSED — FIX CONFIRMED"
                        : "VERIFICATION FAILED — EXCEPTION DETECTED"}
                    </span>
                  </div>

                  {activeVerifyRecord && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-card/60 border border-border/60">
                        ⏱️ {activeVerifyRecord.durationMs}ms
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-card/60 border border-border/60">
                        HTTP {activeVerifyRecord.httpStatus}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs opacity-90 leading-relaxed font-sans">
                  {isVerifying
                    ? `Mounting an isolated headless iframe sandbox to execute ${verifyTarget.url}. The engine is evaluating module bundle chunks and trapping any unhandled runtime exceptions...`
                    : activeVerifyRecord?.summary}
                </p>
              </div>

              {/* Target Exception Checked */}
              <div className="rounded-2xl border border-border bg-card p-3.5 text-xs">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Target Exception Checked:
                </span>
                <p className="font-mono text-xs text-foreground font-bold">
                  {verifyTarget.errorName}: {verifyTarget.targetError}
                </p>
              </div>

              {/* Live Terminal Test Logs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-border/50 text-[10px] font-mono text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                      <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      <span className="ml-1 text-foreground font-bold">sandbox://test-runner.log</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      ({liveLogs.length} events logged)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyTestLogs}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Test Logs</span>
                  </button>
                </div>

                <div
                  ref={logsTerminalRef}
                  className="max-h-64 overflow-y-auto rounded-2xl bg-black/95 text-slate-200 border border-border/80 p-4 font-mono text-[11px] leading-relaxed shadow-inner space-y-1.5"
                >
                  {liveLogs.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Initializing background verification runner...
                    </div>
                  ) : (
                    liveLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground/60 select-none shrink-0 font-mono text-[10px]">
                          [{log.timestamp}]
                        </span>
                        <span
                          className={`break-all ${
                            log.level === "success"
                              ? "text-emerald-400 font-bold"
                              : log.level === "error"
                              ? "text-rose-400 font-bold"
                              : log.level === "warn"
                              ? "text-amber-400"
                              : "text-cyan-300"
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/70 bg-card/80">
              <button
                type="button"
                onClick={() => startVerification(verifyTarget)}
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                <span>Re-run Verification Test</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>

                {activeVerifyRecord?.status === "passed" && (
                  <button
                    type="button"
                    onClick={handleAcceptFixAndResolve}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accept Fix & Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
