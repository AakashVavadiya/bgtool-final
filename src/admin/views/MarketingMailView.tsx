import { useState } from "react";
import { AdminStore, type MarketingCampaign } from "@/admin/lib/admin-store";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Users,
  Eye,
  CheckCircle2,
  Gift,
  ArrowRight,
} from "lucide-react";

export function MarketingMailView() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() =>
    AdminStore.getCampaigns()
  );
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState<MarketingCampaign["audience"]>("all");
  const [content, setContent] = useState("");
  const [bonusCredits, setBonusCredits] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in campaign title, subject line and email body.");
      return;
    }

    const newCamp = AdminStore.dispatchCampaign({
      title,
      subject,
      audience,
      content,
      bonusCredits: bonusCredits > 0 ? bonusCredits : undefined,
    });

    setCampaigns([...AdminStore.getCampaigns()]);
    setTitle("");
    setSubject("");
    setContent("");
    setBonusCredits(0);
    setShowPreview(false);

    toast.success(
      `Marketing Campaign "${newCamp.title}" dispatched to ${newCamp.recipientCount.toLocaleString()} recipient(s)!`
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Marketing Broadcast & Campaign Manager</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Compose segmented email blasts, announce AI model upgrades, and distribute promotional bonus credits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Compose Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              <span>Create New Email Broadcast</span>
            </h3>
            <span className="rounded-full bg-accent/10 border border-accent/25 px-3 py-1 text-[11px] font-bold text-accent">
              SMTP Broadcast Queue
            </span>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
            {/* Campaign Internal Title */}
            <div>
              <label className="block font-bold text-foreground mb-1">Campaign Internal Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Model Accuracy Update & Bonus Drop"
                className="w-full rounded-2xl border border-input bg-background/60 p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none shadow-xs"
              />
            </div>

            {/* Email Subject Line */}
            <div>
              <label className="block font-bold text-foreground mb-1">Email Subject Line (Inbox Preview):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. ⚡ 20 Free Credits waiting in your bg studio!"
                className="w-full rounded-2xl border border-input bg-background/60 p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none shadow-xs"
              />
            </div>

            {/* Target Audience & Bonus Credits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-foreground mb-1">Audience Segment:</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full rounded-2xl border border-input bg-background/60 p-3 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="all">All Registered Users</option>
                  <option value="free">Free Tier Users Only</option>
                  <option value="lite">Lite Plan Subscribers</option>
                  <option value="pro">Pro Plan Subscribers</option>
                  <option value="inactive">Restricted or Inactive</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-amber-500" />
                  <span>Attach Bonus Credits (Optional):</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={bonusCredits}
                  onChange={(e) => setBonusCredits(Number(e.target.value))}
                  placeholder="0 (no bonus credits)"
                  className="w-full rounded-2xl border border-input bg-background/60 p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="block font-bold text-foreground mb-1">Email Content / Announcement Body:</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your email announcement or promotional copy here…"
                className="w-full rounded-2xl border border-input bg-background/60 p-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none resize-none shadow-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? "Hide Preview" : "Live Email Preview"}</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-xs font-extrabold text-background shadow-xs hover:opacity-90 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Dispatch Broadcast</span>
              </button>
            </div>
          </form>

          {/* Email Preview Drawer */}
          {showPreview && (
            <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-5 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-muted-foreground">Subject: <span className="text-foreground">{subject || "(No subject yet)"}</span></span>
                <span className="font-mono text-[10px] text-muted-foreground">From: announcements@bg.tools</span>
              </div>
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {content || "Email preview body will render here as you type."}
              </div>
              {bonusCredits > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  <span>🎁 +{bonusCredits} Complimentary AI Credits credited to your studio balance!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: History & Sent Broadcasts (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-foreground">Dispatched Campaigns History</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {campaigns.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                  No marketing campaigns sent yet.
                </div>
              ) : null}

              {campaigns.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-4 text-xs space-y-2 hover:border-foreground/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{c.id}</span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      Sent
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-xs">{c.title}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">{c.subject}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                    <span>Recipients: <strong className="text-foreground font-bold">{c.recipientCount}</strong></span>
                    <span className="font-mono">{c.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
