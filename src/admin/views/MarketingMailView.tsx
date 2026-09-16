import { useState } from "react";
import { AdminStore, type MarketingCampaign } from "@/admin/lib/admin-store";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Sparkles,
  Users,
  Eye,
  CheckCircle2,
  Gift,
  Flame,
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
      `Marketing Campaign "${newCamp.title}" successfully dispatched to ${newCamp.recipientCount.toLocaleString()} users!`
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">Marketing Email Broadcast & Campaign Manager</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Compose segmented email blasts, announce AI model upgrades, and distribute promotional bonus credits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Compose Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-400" />
              <span>Create New Email Broadcast</span>
            </h3>
            <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-[11px] font-bold text-orange-400">
              Direct SMTP Queue
            </span>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
            {/* Campaign Internal Title */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Campaign Internal Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Karudi 1.0 Prime Launch Drop"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-semibold text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Email Subject Line */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Email Subject Line (Inbox Preview):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. ⚡ Karudi 1.0 Prime is live: 20 Free Credits waiting in your studio!"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-semibold text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Audience Segmentation & Bonus Credits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">Target Audience:</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as MarketingCampaign["audience"])}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="all" className="bg-zinc-900">All Registered Users (~14.8k)</option>
                  <option value="free" className="bg-zinc-900">Free Tier Users (Upsell Campaign)</option>
                  <option value="lite" className="bg-zinc-900">Lite Subscribers</option>
                  <option value="pro" className="bg-zinc-900">Pro & Enterprise VIPs</option>
                  <option value="inactive" className="bg-zinc-900">Restricted / Inactive Accounts</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">Bonus Credits Gift (Optional):</label>
                <div className="relative">
                  <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={bonusCredits}
                    onChange={(e) => setBonusCredits(Number(e.target.value))}
                    placeholder="0 credits"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-xs font-bold text-amber-400 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Body Content */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Email Body Copy (Markdown supported):</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your email announcement or promotional letter here…"
                rows={6}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs font-medium text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? "Hide Preview" : "Preview Email Card"}</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3.5 text-xs font-bold text-white shadow-xl transition-all hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span>Broadcast Campaign</span>
              </button>
            </div>
          </form>

          {/* Live Preview Box */}
          {showPreview && (
            <div className="rounded-2xl border border-orange-500/30 bg-[#09090b] p-6 text-xs text-zinc-300 space-y-3 shadow-inner">
              <div className="border-b border-white/10 pb-3">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">From:</span>{" "}
                <span className="font-bold text-white">bg Studio Team &lt;updates@bg.tools&gt;</span>
                <p className="font-display text-sm font-bold text-white mt-1">Subject: {subject || "(No subject set)"}</p>
              </div>

              <div className="py-2 leading-relaxed">
                <p className="font-bold text-sm text-white mb-2">Hello Creator,</p>
                <p className="whitespace-pre-wrap">{content || "(Email body will appear here)"}</p>

                {bonusCredits > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300 flex items-center gap-2 font-bold">
                    <Gift className="h-4 w-4" />
                    <span>+{bonusCredits} Free Studio Credits have been credited to your balance!</span>
                  </div>
                )}

                <div className="mt-5 text-center">
                  <span className="inline-block rounded-full bg-orange-500 px-6 py-2.5 text-xs font-bold text-white">
                    Open Your Workspace →
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Past Campaigns History (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <span>Dispatched Campaigns</span>
          </h3>

          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-orange-400 font-bold">{c.id}</span>
                  <span className="text-[10px] text-zinc-500">{c.sentAt || "Draft"}</span>
                </div>

                <h4 className="font-bold text-white text-sm">{c.title}</h4>
                <p className="text-zinc-400 text-[11px] truncate">{c.subject}</p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-zinc-400">
                    <strong className="text-white">{c.recipientCount.toLocaleString()}</strong> sent
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {c.openRatePercent}% Open Rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
