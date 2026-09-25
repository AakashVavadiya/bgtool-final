import { useState, useEffect } from "react";
import { AdminStore, type SupportTicket } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { toast } from "sonner";
import {
  Inbox,
  Search,
  CheckCircle2,
  Send,
  User,
  Mail,
  Clock,
  MessageSquare,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export function SupportDeskView() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => AdminStore.getTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    tickets[0]?.id ?? ""
  );
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLatest = async () => {
    setIsSyncing(true);
    try {
      const merged = await AdminStore.syncTicketsFromServer();
      setTickets([...merged]);
      if (!selectedTicketId && merged.length > 0 && merged[0]) {
        setSelectedTicketId(merged[0].id);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial fetch from server
    fetchLatest();

    const handleUpdate = () => {
      fetchLatest();
    };

    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(fetchLatest, 6000);

    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const updated = AdminStore.replyToTicket(selectedTicket.id, replyText);
    setTickets([...updated]);
    setReplyText("");
    toast.success(`Reply dispatched to ${selectedTicket.email} and inquiry marked as Resolved.`);
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Support Desk & Contact Inquiries</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real inquiries submitted via the Contact Us page and customer feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLatest}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-accent" : ""}`} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Inquiries List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contact inquiries…"
                className="w-full rounded-2xl border border-input bg-background/60 pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "open", "in_progress", "resolved"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-foreground text-background shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
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
              <div className="rounded-3xl border border-border bg-card p-10 text-center text-xs text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="font-semibold text-foreground">No contact submissions found</p>
                <p className="mt-1 text-[11px]">When users submit the Contact page form, messages will appear here in real time.</p>
              </div>
            ) : null}

            {filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicket?.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/5 shadow-xs"
                      : "border-border bg-card hover:border-foreground/20 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">{t.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          t.status === "open"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : t.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{t.createdAt}</span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-foreground line-clamp-1">{t.subject}</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{t.message}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="font-mono text-[10px]">{t.email}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Detail & Reply Thread */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col justify-between min-h-[620px] shadow-xs">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground">{selectedTicket.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          selectedTicket.status === "open"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-foreground">{selectedTicket.subject}</h3>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{selectedTicket.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Submitter Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Sender Name</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedTicket.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">{selectedTicket.email}</p>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Customer Inquiry Message
                  </span>
                  <div className="rounded-2xl border border-border bg-muted/20 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Existing Replies Thread */}
                {selectedTicket.replies.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Admin Reply History
                    </span>
                    {selectedTicket.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                          <span>Admin Response</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{rep.sentAt}</span>
                        </div>
                        <p className="text-foreground leading-relaxed pt-1">{rep.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="mt-8 pt-6 border-t border-border space-y-3">
                <label className="text-xs font-bold text-foreground">
                  Reply to {selectedTicket.name} ({selectedTicket.email})
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type your reply to ${selectedTicket.name}… (Marks as resolved)`}
                  className="w-full rounded-2xl border border-input bg-background/60 p-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all resize-none shadow-xs"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-xs font-bold text-background shadow-xs hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Reply & Resolve</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center min-h-[620px]">
              <HelpCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-bold text-sm text-foreground">No inquiry selected</p>
              <p className="mt-1">Select an inquiry from the list on the left to view details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
