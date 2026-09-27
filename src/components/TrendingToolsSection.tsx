import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { tools, type Tool } from "@/lib/tools";
import { AdminStore } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { Flame, ArrowRight, Wrench, Layers } from "lucide-react";

// Curated list of top trending tool slugs
const TRENDING_SLUGS: string[] = [
  "remove-background",
  "upscale-image",
  "remove-watermark",
  "compress-image",
  "image-to-text-ocr",
  "blur-face",
  "photo-editor",
  "crop-image",
  "resize-image",
  "merge-pdf",
  "image-to-pdf",
  "convert-to-jpg",
];

type TrendingFilter = "all" | "ai" | "image" | "pdf";

export function TrendingToolsSection() {
  const [filter, setFilter] = useState<TrendingFilter>("all");
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

  // Map slugs to actual tool objects
  const trendingTools = TRENDING_SLUGS.map((slug) =>
    tools.find((t) => t.slug === slug)
  ).filter((tool): tool is Tool => tool !== undefined);

  const filteredTrending = trendingTools.filter((tool) => {
    if (filter === "ai") return tool.category === "AI Tools";
    if (filter === "image")
      return (
        tool.category === "Image Editing & Optimization" ||
        tool.category === "Creative & Utilities"
      );
    if (filter === "pdf")
      return (
        tool.category === "PDF Tools" ||
        tool.category === "Document Converters"
      );
    return true;
  });

  return (
    <section id="tools" className="relative px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
      {/* Background glow effect */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-red-500/5 blur-[120px]" />

      {/* Section Header */}
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
            <Flame className="h-3.5 w-3.5" />
            <span>Trending & Most Used</span>
          </div>

          <h2 className="mt-4 font-display text-3xl font-medium tracking-tight md:text-5xl">
            Popular AI & Creative Tools<span className="text-accent">.</span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            High-speed neural background removal, 4K upscaling, document conversion, and image optimization — ready in a click with daily free credits.
          </p>
        </div>

        {/* Top "See All Tools" quick link */}
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-foreground bg-foreground px-5 py-3 text-xs font-bold text-background transition-all hover:bg-background hover:text-foreground shadow-sm"
          >
            <span>Explore All 130+ Tools</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-foreground text-background shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            All Trending ({trendingTools.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ai")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              filter === "ai"
                ? "bg-foreground text-background shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            AI Tools
          </button>
          <button
            type="button"
            onClick={() => setFilter("image")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              filter === "image"
                ? "bg-foreground text-background shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            Image Optimization
          </button>
          <button
            type="button"
            onClick={() => setFilter("pdf")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              filter === "pdf"
                ? "bg-foreground text-background shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            PDF & Documents
          </button>
        </div>

        <div className="text-xs font-medium text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredTrending.length}</span> top picks
        </div>
      </div>

      {/* Trending Tools Grid - 4 Columns */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredTrending.map((tool) => {
          const Icon = tool.icon;
          const isEnabled = AdminStore.isToolEnabled(tool.slug);

          return (
            <Link
              key={tool.slug}
              to="/tools/$slug"
              params={{ slug: tool.slug }}
              className="tool-card group relative flex flex-col justify-between rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-xl hover:shadow-accent/5"
            >
              <div>
                {/* Header inside card: Clean text only (no colored pill badges) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground/80">
                    {tool.category}
                  </span>

                  {!isEnabled ? (
                    <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[0.625rem] font-bold text-amber-600 dark:text-amber-400">
                      Maintenance
                    </span>
                  ) : tool.tag ? (
                    <span className="text-[0.68rem] font-medium text-muted-foreground">
                      {tool.tag}
                    </span>
                  ) : null}
                </div>

                {/* Tool Icon & Title */}
                <div className="mt-5 flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground group-hover:text-background shadow-inner">
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-semibold leading-tight transition-colors group-hover:text-accent">
                      {tool.name}
                    </h3>
                    <span className="block truncate text-[0.68rem] text-muted-foreground">
                      {tool.accepts} → {tool.outputs}
                    </span>
                  </div>
                </div>

                {/* Tool Description */}
                <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {tool.blurb}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 border-t border-border/50 pt-4 flex items-center justify-end text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-semibold transition-all group-hover:gap-2 ${
                    !isEnabled
                      ? "text-amber-600 dark:text-amber-400 text-[0.7rem]"
                      : "text-foreground group-hover:text-accent"
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

      {/* Prominent "See All Tools" Banner */}
      <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-secondary/40 to-card p-8 md:p-12 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Layers className="h-4 w-4 text-accent" />
              <span>Full Toolkit Suite</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Need more specialized utilities?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse our complete library of over <span className="font-semibold text-foreground">130+ online tools</span>, including image format converters, OCR, PDF splitters, background editors, and developer decoders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Link
              to="/tools"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-4 text-sm font-bold text-background transition-all hover:bg-foreground/90 hover:scale-105 shadow-lg active:scale-95"
            >
              <span>See All 130+ Tools</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
