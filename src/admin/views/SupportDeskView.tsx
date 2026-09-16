import { useState } from "react";
import { AdminStore, type SupportTicket } from "@/admin/lib/admin-store";
import { toast } from "sonner";
import {
  Inbox,
  Search,
  CheckCircle2,
  Send,
  User,
  Mail,
  Clock,
  MessageCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function SupportDeskView() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => AdminStore.getTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    tickets[0]?.id ?? ""
  );
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const updated = AdminStore.replyToTicket(selectedTicket.id, replyText);
    setTickets([...updated]);
    setReplyText("");
    toast.success(`Reply dispatched to ${selectedTicket.email} and ticket marked as Resolved.`);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">Support Desk & Contact Inquiries</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Respond to user contact submissions, custom enterprise inquiries, and customer help requests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Tickets List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121216] p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inquiries…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["all", "open", "in_progress", "resolved"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                    statusFilter === s
                      ? "bg-orange-500 text-white"
                      : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Cards */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121216] p-8 text-center text-xs text-zinc-500">
                No tickets in this view.
              </div>
            ) : null}

            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-orange-500/60 bg-[#191512] shadow-md"
                      : "border-white/5 bg-[#121216] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-xs leading-none">{t.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        t.status === "open"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : t.status === "in_progress"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-1 font-semibold text-zinc-200 text-xs truncate">{t.subject}</p>
                  <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">{t.message}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-white/5">
                    <span>{t.createdAt}</span>
                    <span className="font-mono text-orange-400">{t.id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket & Reply Composer (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 flex flex-col justify-between h-full min-h-[580px]">
              <div>
                {/* Ticket Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-orange-400">{selectedTicket.id}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-xs text-zinc-400">{selectedTicket.createdAt}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-semibold text-zinc-200">{selectedTicket.name}</span>
                      <span>({selectedTicket.email})</span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                      selectedTicket.status === "open"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : selectedTicket.status === "in_progress"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>

                {/* User Message Box */}
                <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-xs leading-relaxed text-zinc-200">
                  <p className="font-bold text-zinc-400 text-[11px] uppercase tracking-wider mb-2">Original User Inquiry:</p>
                  <p className="whitespace-pre-wrap text-sm">{selectedTicket.message}</p>
                </div>

                {/* Previous Admin Replies */}
                {selectedTicket.replies.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Response History:</p>
                    {selectedTicket.replies.map((r) => (
                      <div key={r.id} className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-orange-400 font-bold mb-1">
                          <span>Admin Support Response</span>
                          <span>{r.sentAt}</span>
                        </div>
                        <p className="text-zinc-200 text-xs">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="mt-6 border-t border-white/10 pt-5 space-y-3">
                <label className="block text-xs font-bold text-zinc-300">
                  Compose Email Reply to {selectedTicket.name}:
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official resolution or response to send via email…"
                  rows={4}
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-xs font-medium text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  {/* Quick Canned Snippets */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          `Hi ${selectedTicket.name}, thank you for contacting bg Support. We have investigated your request and credited 10 bonus credits to your workspace. Please let us know if you need anything else!`
                        )
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:text-white"
                    >
                      + Quick Credit Compensation
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReplyText(
                          `Hello ${selectedTicket.name}, thank you for your enterprise interest. Our sales engineering team has scheduled a demo and quote. You can also explore our custom webhook pipeline at docs.bg.tools.`
                        )
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:text-white"
                    >
                      + Enterprise Quote Reply
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:scale-105"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Reply & Resolve</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
