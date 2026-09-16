import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getTool, tools } from "@/lib/tools";
import { RemovalProcess } from "@/components/RemovalProcess";
import { InteractiveToolWorkspace } from "@/components/InteractiveToolWorkspace";
import { BgModels } from "@/components/BgModels";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug, name: tool.name, blurb: tool.blurb };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Tool not found — bg" }, { name: "robots", content: "noindex" }],
      };
    }
    const tool = getTool(loaderData.slug);
    const seo = tool?.seo;
    return {
      meta: [
        { title: seo?.title ?? `${loaderData.name} — bg Image Processing` },
        { name: "description", content: seo?.description ?? loaderData.blurb },
        { name: "keywords", content: seo?.keywords?.join(", ") ?? "" },
        { property: "og:title", content: seo?.title ?? loaderData.name },
        { property: "og:description", content: seo?.description ?? loaderData.blurb },
        { property: "og:type", content: "website" },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getTool(slug);

  if (!tool) return null;

  const Icon = tool.icon;
  const isBgRemover = tool.slug === "remove-background";
  const sameCat = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug);
  const otherCat = tools.filter((t) => t.category !== tool.category && t.slug !== tool.slug);
  const related = [...sameCat, ...otherCat].slice(0, 4);
  const seo = tool.seo;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <SiteHeader />

        {/* ─── UPLOAD ZONE & WORKSPACE ─────────────────────────────────────── */}
        <section className="grain border-b border-border px-4 py-4 md:px-8 md:py-6">
          {isBgRemover ? (
            <RemovalProcess />
          ) : (
            <InteractiveToolWorkspace tool={tool} />
          )}
        </section>

        {/* ─── HERO: ICON + HEADING (BELOW UPLOAD) ───────────────────────── */}
        <section className="border-b border-border px-5 py-14 md:px-10 md:py-20">
          <div className="flex flex-col items-center text-center mx-auto max-w-3xl gap-5">
            <span className="tool-icon rise-in relative flex h-16 w-16 items-center justify-center rounded-2xl">
              <Icon className="relative z-10 h-8 w-8" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="rounded-full bg-card border border-border px-3.5 py-1 text-[0.7rem] font-semibold text-muted-foreground">
                  {tool.category}
                </span>
                {tool.tag ? (
                  <span className="rounded-full bg-accent/20 border border-accent/30 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-accent-foreground">
                    {tool.tag}
                  </span>
                ) : null}
              </div>
              <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                {tool.name}
                <span className="text-accent">.</span>
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-base text-muted-foreground md:text-lg font-medium">
                {tool.blurb}
              </p>
            </div>

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium">
                <span className="text-muted-foreground">Accepts:</span>
                <span className="font-semibold">{tool.accepts}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium">
                <span className="text-muted-foreground">Returns:</span>
                <span className="font-semibold">{tool.outputs}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-semibold text-accent">Free forever</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MODELS SHOWCASE (bg remover only) ─────────────────────────── */}
        {isBgRemover ? (
          <section className="border-b border-border px-5 py-20 md:px-10 md:py-28">
            <BgModels compact />
          </section>
        ) : null}

        {/* ─── SEO ARTICLE ────────────────────────────────────────────────── */}
        {seo ? (
          <article className="border-b border-border px-5 py-20 md:px-10 md:py-28">

              {/* Intro */}
              <div className="mb-14">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  about this tool
                </p>
                <h2 className="font-display text-2xl font-semibold md:text-4xl mb-5">
                  What is the {tool.name} Tool?
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base md:text-xl max-w-4xl">
                  {seo.article.intro}
                </p>
              </div>

              {/* How To */}
              <div className="mb-14">
                <h2 className="font-display text-2xl font-semibold md:text-4xl mb-8">
                  How to Use {tool.name}
                </h2>
                <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {seo.article.howTo.map((step, i) => (
                    <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-6">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 border border-accent/30 text-sm font-bold text-accent-foreground font-display flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-muted-foreground leading-relaxed text-sm">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Benefits */}
              <div className="mb-14">
                <h2 className="font-display text-2xl font-semibold md:text-4xl mb-8">
                  Why Use Our {tool.name} Tool?
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {seo.article.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col gap-4"
                    >
                      <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" strokeWidth={2} />
                      <div>
                        <h3 className="font-display font-semibold text-base mb-2">
                          {b.heading}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="mb-6">
                <h2 className="font-display text-2xl font-semibold md:text-4xl mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {seo.article.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card/40 p-6"
                    >
                      <h3 className="font-display font-semibold text-base mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords / Tags */}
              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-5">
                  Related Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {seo.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
          </article>
        ) : null}

        {/* ─── RELATED TOOLS ──────────────────────────────────────────────── */}
        <section className="border-t border-border px-5 py-20 md:px-10 md:py-28">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            more tools
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => {
              const RelIcon = t.icon;
              return (
                <Link
                  key={t.slug}
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className="tool-card group relative flex flex-col items-center rounded-2xl border border-border bg-card px-6 pb-8 pt-8 text-center"
                >
                  <span className="tool-icon relative flex h-14 w-14 items-center justify-center rounded-2xl">
                    <RelIcon className="relative z-10 h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-medium leading-tight transition-transform duration-500 group-hover:-translate-y-0.5">
                    {t.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-all duration-500 group-hover:gap-3 group-hover:text-foreground">
                    Open tool <span aria-hidden>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
