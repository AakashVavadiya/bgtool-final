import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { tools, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { AdminStore } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";

export function ToolsGrid() {
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

  const filteredTools =
    selectedCategory === "All"
      ? tools
      : tools.filter((t) => t.category === selectedCategory);

  const getCount = (cat: "All" | ToolCategory) =>
    cat === "All" ? tools.length : tools.filter((t) => t.category === cat).length;

  return (
    <section id="tools" className="px-5 pb-28 pt-24 md:px-10 md:pb-40 md:pt-32">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            the toolkit
          </p>
          <h2 className="mt-6 font-display text-3xl font-medium leading-[1.05] md:text-6xl">
            130+ tools<span className="text-accent">.</span> One tab.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Image processing, PDF management, document conversion, and creative utilities —
            everything in one consistent place.
          </p>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredTools.length}</span> of {tools.length} tools
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-border/60 pb-6">
        <button
          type="button"
          onClick={() => setSelectedCategory("All")}
          className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
            selectedCategory === "All"
              ? "bg-foreground text-background shadow-md"
              : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          All Tools ({getCount("All")})
        </button>

        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-foreground text-background shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {cat} ({getCount(cat)})
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="tool-card group relative flex flex-col items-center rounded-2xl border border-border bg-card px-6 pb-8 pt-9 text-center transition-all hover:border-accent/50"
            >
              {/* Category Badge top left */}
              <span className="absolute left-4 top-4 text-[0.65rem] font-medium text-muted-foreground/80">
                {t.category}
              </span>

              {/* Tag top right */}
              {!AdminStore.isToolEnabled(t.slug) ? (
                <span className="absolute right-4 top-4 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-amber-600 dark:text-amber-400">
                  Maintenance
                </span>
              ) : t.tag ? (
                <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[0.625rem] font-semibold tracking-wide text-accent-foreground">
                  {t.tag}
                </span>
              ) : null}

              <span className="tool-icon relative flex h-14 w-14 items-center justify-center rounded-2xl mt-4">
                <Icon className="relative z-10 h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>

              <h3 className="mt-5 font-display text-lg font-medium leading-tight transition-transform duration-500 group-hover:-translate-y-0.5">
                {t.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                {t.blurb}
              </p>
              <span
                className={`mt-4 inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-500 group-hover:gap-3 ${
                  !AdminStore.isToolEnabled(t.slug)
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {!AdminStore.isToolEnabled(t.slug) ? "Under Maintenance" : "Open tool"} <span aria-hidden>→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

