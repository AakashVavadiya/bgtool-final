import { useState } from "react";
import { AdminStore, type AdminToolConfig } from "@/admin/lib/admin-store";
import { TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Wrench,
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
    const cleanCost = Math.max(0, Math.round(newCost * 100) / 100);
    const updated = AdminStore.updateToolSettings(slug, { creditCost: cleanCost });
    setToolsConfig([...updated]);
    toast.success(`Updated credit cost for "${slug}" to ${cleanCost} credits.`);
  };

  const handleDailyLimitChange = (slug: string, limit: number) => {
    const cleanLimit = Math.max(0, Math.floor(limit));
    const updated = AdminStore.updateToolSettings(slug, { dailyLimitPerIp: cleanLimit });
    setToolsConfig([...updated]);
    toast.success(
      cleanLimit > 0
        ? `Daily usage limit set to ${cleanLimit} runs / day per IP.`
        : `Daily usage limit removed (Unlimited runs allowed).`
    );
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">AI Tools & Feature Controls</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure custom credit consumption (e.g. 0.2 credits), daily usage limits per IP, resolution caps, and maintenance toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {toolsConfig.filter((t) => t.isEnabled).length} of {toolsConfig.length} Active
          </span>
        </div>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools by name or slug…"
            className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Category Select Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="rounded-2xl border border-input bg-card px-4 py-3 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="All">All Categories ({toolsConfig.length})</option>
            {TOOL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({toolsConfig.filter((t) => t.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((t) => (
          <div
            key={t.slug}
            className={`rounded-3xl border p-6 transition-all shadow-xs flex flex-col justify-between ${
              t.isEnabled
                ? "border-border bg-card hover:border-foreground/20"
                : "border-destructive/20 bg-destructive/5 opacity-75"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent mb-1.5">
                    {t.category}
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground leading-tight">{t.name}</h3>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{t.slug}</p>
                </div>

                {/* Status Switch Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTool(t.slug)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    t.isEnabled ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                  role="switch"
                  aria-checked={t.isEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      t.isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-5 space-y-4 border-t border-border pt-4 text-xs">
                {/* 1. Custom Credit Cost Input & Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-semibold">Credit Cost per Run:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={t.creditCost}
                        onChange={(e) => handleCreditCostChange(t.slug, parseFloat(e.target.value) || 0)}
                        className="w-20 rounded-xl border border-input bg-background/80 px-2.5 py-1 text-xs font-bold text-accent focus:outline-none focus:border-foreground text-right"
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground">Credits</span>
                    </div>
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 justify-end flex-wrap">
                    {[0, 0.2, 0.5, 1, 2].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleCreditCostChange(t.slug, preset)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          t.creditCost === preset
                            ? "bg-accent text-white font-bold"
                            : "bg-muted/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset === 0 ? "Free" : `${preset} cr`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Daily Limit per IP / Client */}
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground font-semibold block">Daily Limit / IP:</span>
                      <span className="text-[10px] text-muted-foreground">Max runs per day</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={t.dailyLimitPerIp ?? 0}
                        onChange={(e) => handleDailyLimitChange(t.slug, parseInt(e.target.value, 10) || 0)}
                        placeholder="0 = Unlimited"
                        className="w-20 rounded-xl border border-input bg-background/80 px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-foreground text-right"
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {(t.dailyLimitPerIp ?? 0) > 0 ? "/ day" : "Unlimited"}
                      </span>
                    </div>
                  </div>
                  {/* Quick Presets for Daily Limits */}
                  <div className="flex items-center gap-1 justify-end flex-wrap">
                    {[0, 5, 10, 25, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleDailyLimitChange(t.slug, preset)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          (t.dailyLimitPerIp ?? 0) === preset
                            ? "bg-foreground text-background font-bold"
                            : "bg-muted/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset === 0 ? "Unlimited" : `${preset}/day`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Max Resolution Limit */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground font-semibold">Max Quality Limit:</span>
                  <select
                    value={t.maxResolution}
                    onChange={(e) => handleResolutionChange(t.slug, e.target.value)}
                    className="rounded-xl border border-input bg-background/80 px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-foreground cursor-pointer"
                  >
                    <option value="4K (4096px)">4K Ultra HD (4096px)</option>
                    <option value="8K (8192px)">8K Studio (8192px)</option>
                    <option value="1080p (1920px)">1080p Standard (1920px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lifetime Runs Stat */}
            <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-3 mt-3 border-t border-border">
              <span>Lifetime Runs:</span>
              <span className="font-bold text-foreground font-mono">
                {t.totalUsageCount.toLocaleString()} run{t.totalUsageCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
