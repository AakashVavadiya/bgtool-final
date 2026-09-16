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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">System Error Logs & User Issue Reports</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time client crash reports, WebAssembly matting exceptions, and user-shared feedback logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-400">
            {logs.filter((l) => l.status === "investigating").length} Investigating
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by error name, message, URL or user notes…"
          className="w-full rounded-2xl border border-white/10 bg-[#121216] pl-10 pr-4 py-3 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#121216] p-12 text-center text-zinc-500 text-sm">
            Zero error logs matching your search filter. All systems operational!
          </div>
        ) : null}

        {filteredLogs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className={`rounded-3xl border transition-all ${
                log.status === "resolved"
                  ? "border-white/5 bg-[#121216]/60 opacity-80"
                  : log.severity === "critical"
                  ? "border-rose-500/30 bg-[#161214]"
                  : "border-amber-500/30 bg-[#141311]"
              } p-6`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                      log.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-orange-400">{log.id}</span>
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        {log.url}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          log.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <h4 className="font-display text-base font-bold text-white mt-1">{log.errorName}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{log.message}</p>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(log.id, "resolved")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resolve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(log.id, "investigating")}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Investigating
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* User Shared Notes & Stack Details */}
              {log.userFeedback ? (
                <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-orange-400 mb-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>User Report & Feedback:</span>
                    {log.userEmail ? (
                      <span className="text-zinc-400 font-normal text-[11px]">({log.userEmail})</span>
                    ) : null}
                  </div>
                  <p className="text-zinc-200 italic">"{log.userFeedback}"</p>
                </div>
              ) : null}

              {/* Expanded Diagnostic Stack */}
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-500 text-[11px]">User Agent & Platform:</span>
                    <p className="font-mono text-[11px] text-zinc-300 mt-0.5">{log.userAgent}</p>
                  </div>

                  {log.stack ? (
                    <div>
                      <span className="font-semibold text-zinc-500 text-[11px]">Stack Trace:</span>
                      <pre className="mt-1 rounded-2xl border border-white/5 bg-black/60 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                        {log.stack}
                      </pre>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
