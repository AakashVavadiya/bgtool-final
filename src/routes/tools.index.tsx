import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { tools, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdminStore } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import {
  Search,
  X,
  Wand2,
  ArrowRight,
  Filter,
  CheckCircle2,
  Wrench,
  Layers,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      {
        title: "All 130+ AI Image & PDF Tools — Free Online Processing | bg",
      },
      {
        name: "description",
        content:
          "Discover our complete library of 130+ AI image processing tools, PDF utilities, background erasers, and format converters. Fast, secure, and powered by 10 free daily credits.",
      },
      {
        name: "keywords",
        content:
          "all tools, 130 tools, ai tools, image editor, remove background, pdf editor, compress image, convert format, ocr text extractor",
      },
      { property: "og:title", content: "All 130+ AI Image & PDF Tools Directory | bg" },
      {
        property: "og:description",
        content:
          "Explore 130+ online AI tools for image manipulation, background removal, PDF conversions, and utilities.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ToolsDirectoryPage,
});

export function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ToolCategory>("All");
  const [, setTick] = useState(0);

  useEffect(() => {
    AdminStore.syncToolsConfigFromServer().then(() => setTick((t) => t + 1));
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter tools based on category and live search
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tools.filter((tool) => {
      // Category match
      if (selectedCategory !== "All" && tool.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (!q) return true;
      const matchName = tool.name.toLowerCase().includes(q);
      const matchBlurb = tool.blurb.toLowerCase().includes(q);
      const matchTag = tool.tag?.toLowerCase().includes(q);
      const matchCategory = tool.category.toLowerCase().includes(q);
      const matchAccepts = tool.accepts.toLowerCase().includes(q);
      const matchOutputs = tool.outputs.toLowerCase().includes(q);
      const matchKeywords = tool.seo?.keywords?.some((k) => k.toLowerCase().includes(q));

      return (
        matchName ||
        matchBlurb ||
        matchTag ||
        matchCategory ||
        matchAccepts ||
        matchOutputs ||
        matchKeywords
      );
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryCount = (cat: "All" | ToolCategory) => {
    if (cat === "All") return tools.length;
    return tools.filter((t) => t.category === cat).length;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <SiteHeader />

      <main className="flex-1 w-full">
        {/* Full-width Hero Header with aligned edge padding */}
        <section className="relative border-b border-border bg-gradient-to-b from-secondary/40 via-card/50 to-background px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 py-12 md:py-20 w-full">
          <div className="w-full">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                <Wand2 className="h-3.5 w-3.5" />
                <span>Complete Toolkit Directory</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
                <span>10 Daily Free Credits Enabled</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>In-Browser Privacy</span>
              </span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              130+ Tools<span className="text-accent">.</span> One Workspace.
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              Explore our full ecosystem of specialized image processors, neural AI models, document utilities, and PDF converters. Search instantly or filter by category below.
            </p>

            {/* Live Search Bar */}
            <div className="mt-7 w-full max-w-3xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any tool (e.g. background remover, pdf, crop, watermark, ocr)..."
                  className="w-full rounded-2xl border-2 border-border bg-card/90 py-3.5 sm:py-4 pl-12 pr-12 text-sm font-medium placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-4 focus:ring-accent/10 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Line */}
            <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground font-medium">
              <span>
                Total Tools: <strong className="text-foreground">{tools.length}</strong>
              </span>
              <span>•</span>
              <span>
                Categories: <strong className="text-foreground">{TOOL_CATEGORIES.length}</strong>
              </span>
              <span>•</span>
              <span>
                Browser Acceleration: <strong className="text-emerald-500 font-bold">Enabled</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Categories Bar & Results - Full width with aligned edge padding */}
        <section className="w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 2xl:px-20 py-8 md:py-10">
          {/* Category Filter Pills & Counter */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedCategory === "All"
                    ? "bg-foreground text-background shadow-md scale-105"
                    : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                All Tools ({getCategoryCount("All")})
              </button>

              {TOOL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-foreground text-background shadow-md scale-105"
                      : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {cat} ({getCategoryCount(cat)})
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-muted-foreground shrink-0">
              Showing <span className="font-bold text-foreground">{filteredTools.length}</span> of {tools.length} tools
            </div>
          </div>

          {/* Tools Grid or Empty State - Full screen multi-column grid */}
          {filteredTools.length === 0 ? (
            <div className="my-20 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center w-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">No matching tools found</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                We couldn't find any tool matching "{searchQuery}". Try adjusting your keywords or clearing the category filter.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-all hover:bg-foreground/90"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const isEnabled = AdminStore.isToolEnabled(tool.slug);

                return (
                  <Link
                    key={tool.slug}
                    to="/tools/$slug"
                    params={{ slug: tool.slug }}
                    className="tool-card group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-lg"
                  >
                    <div>
                      {/* Top Bar inside card: Category & Tag/Maintenance */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground/80">
                          {tool.category}
                        </span>

                        {!isEnabled ? (
                          <span className="shrink-0 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[0.625rem] font-bold text-amber-600 dark:text-amber-400">
                            Maintenance
                          </span>
                        ) : tool.tag ? (
                          <span className="shrink-0 text-[0.68rem] font-medium text-muted-foreground">
                            {tool.tag}
                          </span>
                        ) : null}
                      </div>

                      {/* Icon & Title */}
                      <div className="mt-5 flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground group-hover:text-background shadow-inner">
                          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate font-display text-base font-semibold leading-tight transition-colors group-hover:text-accent">
                            {tool.name}
                          </h2>
                          <span className="block truncate text-[0.68rem] text-muted-foreground">
                            {tool.accepts} → {tool.outputs}
                          </span>
                        </div>
                      </div>

                      {/* Blurb */}
                      <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {tool.blurb}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-4 border-t border-border/50 pt-3 flex items-center justify-end text-xs">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold transition-all group-hover:gap-1.5 ${
                          !isEnabled
                            ? "text-amber-600 dark:text-amber-400 text-[0.68rem]"
                            : "text-foreground group-hover:text-accent text-[0.72rem]"
                        }`}
                      >
                        {!isEnabled ? (
                          <>
                            <Wrench className="h-3 w-3" />
                            <span>Soon</span>
                          </>
                        ) : (
                          <>
                            <span>Open</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Bottom Info Callout - Full width */}
          <div className="mt-14 w-full rounded-3xl border border-border bg-muted/30 p-6 sm:p-8 text-center md:text-left md:flex md:items-center md:justify-between shadow-xs">
            <div className="max-w-2xl">
              <h3 className="font-display text-lg font-bold">
                10 Free Credits Every Day For Everyone
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                All accounts automatically refresh up to 10 free credits daily at midnight. No credit card required. Upgrade anytime for unlimited 4K batch processing.
              </p>
            </div>
            <div className="mt-4 md:mt-0 shrink-0">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-foreground hover:text-background"
              >
                <span>View Plans & Packs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
