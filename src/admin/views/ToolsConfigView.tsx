import { useState } from "react";
import { AdminStore, type AdminToolConfig } from "@/admin/lib/admin-store";
import { TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { toast } from "sonner";
import {
  Search,
  Filter,
} from "lucide-react";

export function ToolsConfigView() {
  const [toolsConfig, setToolsConfig] = useState<AdminToolConfig[]>(() =>
    AdminStore.getToolsConfig()
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | ToolCategory>("All");

  const handleToggleTool = (slug: string) => {
    const updated = AdminStore.toggleToolStatus(slug);
    setToolsConfig([...updated]);
    const target = updated.find((t) => t.slug === slug);
    if (target?.isEnabled) {
      toast.success(`Tool "${target.name}" is now ACTIVE for all users.`);
    } else {
      toast.warning(`Tool "${target?.name}" has been DISABLED.`);
    }
  };

  const handleCreditCostChange = (slug: string, newCost: number) => {
    const updated = AdminStore.updateToolSettings(slug, { creditCost: newCost });
    setToolsConfig([...updated]);
    toast.success(`Updated credit cost to ${newCost} credits.`);
  };

  const handleResolutionChange = (slug: string, res: string) => {
    const updated = AdminStore.updateToolSettings(slug, { maxResolution: res });
    setToolsConfig([...updated]);
    toast.success(`Max resolution limit set to ${res}.`);
  };

  const filteredTools = toolsConfig.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">AI Tools Feature & Limit Controls</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enable or disable specific tools, set maximum processing resolution limits, and adjust credit costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
            {toolsConfig.filter((t) => t.isEnabled).length} of {toolsConfig.length} Active
          </span>
        </div>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools by name or slug…"
            className="w-full rounded-2xl border border-white/10 bg-[#121216] pl-10 pr-4 py-3 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Category Select Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-[#121216] px-4 py-3 text-xs font-semibold text-white focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-zinc-900 text-white">All Categories ({toolsConfig.length})</option>
            {TOOL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-white">
                {cat} ({toolsConfig.filter((t) => t.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((t) => (
          <div
            key={t.slug}
            className={`rounded-3xl border p-6 transition-all ${
              t.isEnabled
                ? "border-white/10 bg-[#121216] shadow-sm hover:border-orange-500/40"
                : "border-rose-500/20 bg-rose-500/[0.02] opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400 mb-1.5">
                  {t.category}
                </span>
                <h3 className="font-display text-base font-bold text-white leading-tight">{t.name}</h3>
                <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{t.slug}</p>
              </div>

              {/* Status Switch Toggle */}
              <button
                type="button"
                onClick={() => handleToggleTool(t.slug)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  t.isEnabled ? "bg-emerald-500" : "bg-zinc-700"
                }`}
                role="switch"
                aria-checked={t.isEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    t.isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/5 pt-4 text-xs">
              {/* Credit Cost Select */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Credit Consumption:</span>
                <select
                  value={t.creditCost}
                  onChange={(e) => handleCreditCostChange(t.slug, Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                >
                  <option value={1} className="bg-zinc-900 text-white">1 Credit / Process</option>
                  <option value={2} className="bg-zinc-900 text-white">2 Credits / Process</option>
                  <option value={3} className="bg-zinc-900 text-white">3 Credits / Process</option>
                  <option value={0} className="bg-zinc-900 text-white">0 Credits (Free Tool)</option>
                </select>
              </div>

              {/* Resolution Limit */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Max Quality Limit:</span>
                <select
                  value={t.maxResolution}
                  onChange={(e) => handleResolutionChange(t.slug, e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="4K (4096px)" className="bg-zinc-900 text-white">4K Ultra HD (4096px)</option>
                  <option value="8K (8192px)" className="bg-zinc-900 text-white">8K Studio (8192px)</option>
                  <option value="1080p (1920px)" className="bg-zinc-900 text-white">1080p Standard (1920px)</option>
                </select>
              </div>

              {/* Usage Stat */}
              <div className="flex items-center justify-between text-zinc-500 text-[11px] pt-1">
                <span>Lifetime Jobs:</span>
                <span className="font-bold text-zinc-300">{t.totalUsageCount.toLocaleString()} exports</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

