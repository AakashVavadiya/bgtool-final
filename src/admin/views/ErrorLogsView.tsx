import { useState } from "react";
import { AdminStore, type ErrorLogItem } from "@/admin/lib/admin-store";
import { toast } from "sonner";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export function ErrorLogsView() {
  const [logs, setLogs] = useState<ErrorLogItem[]>(() => AdminStore.getErrorLogs());
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, newStatus: ErrorLogItem["status"]) => {
    const updated = AdminStore.updateErrorStatus(id, newStatus);
    setLogs([...updated]);
    toast.success(`Error ${id} status marked as ${newStatus}.`);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.errorName.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase()) ||
      (l.userFeedback && l.userFeedback.toLowerCase().includes(search.toLowerCase())) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">System Error Logs & Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real client crash reports, WebAssembly matting exceptions, and user-shared feedback logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted/60 border border-border px-3.5 py-1 text-xs font-bold text-foreground">
            {logs.filter((l) => l.status === "investigating").length} Investigating
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by error name, message, URL or user notes…"
          className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground text-xs shadow-xs">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-foreground text-sm">No errors recorded</p>
            <p className="mt-1 text-[11px]">All background tools, OCR processors, and AI servers are operating normally with zero unhandled exceptions.</p>
          </div>
        ) : null}

        {filteredLogs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className={`rounded-3xl border transition-all shadow-xs ${
                log.status === "resolved"
                  ? "border-border bg-card/60 opacity-80"
                  : log.severity === "critical"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-amber-500/30 bg-amber-500/5"
              } p-6`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                      log.severity === "critical"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {log.url}
                      </span>
                    </div>

                    <h4 className="mt-1 font-bold text-foreground text-sm">{log.errorName}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-mono">{log.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {log.status !== "resolved" ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(log.id, "resolved")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
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
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-5 space-y-4 border-t border-border pt-4 text-xs">
                  <div>
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Full Message:</span>
                    <p className="mt-1 rounded-xl bg-muted/40 p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
                      {log.message}
                    </p>
                  </div>

                  {log.stack && (
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[10px]">Stack Trace:</span>
                      <pre className="mt-1 max-h-48 overflow-y-auto rounded-xl bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
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
    </div>
  );
}
