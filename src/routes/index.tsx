import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import shapeTwo from "@/assets/shape-2.png";
import girlBefore from "@/assets/girl-before.jpg";
import girlAfter from "@/assets/girl-after.png";
import krishnaMark from "@/assets/krishna-mark.png";
import { ToolsGrid } from "@/components/ToolsGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BgModels } from "@/components/BgModels";
import { Faq } from "@/components/Faq";
import { ScrollBeforeAfter } from "@/components/ScrollBeforeAfter";
import { krishnaModels } from "@/lib/krishna";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "bg — Free Online Background Remover, Instant & 4K" },
      {
        name: "description",
        content:
          "bg removes image backgrounds online in one click — free, unlimited, and export-ready up to 4K. Crisp edges on hair, fur and glass.",
      },
      { property: "og:title", content: "bg — Free Online Background Remover" },
      {
        property: "og:description",
        content:
          "Free online background remover with razor-sharp cutouts and 4K exports. No signup, no watermark.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

const stats = [
  { n: "1s", t: "Average cutout.", d: "Edge-aware matting runs in about a second, even on large files." },
  { n: "4K", t: "Export quality.", d: "Download transparent PNGs at full resolution — no downscaling." },
  { n: "12M+", t: "Images cleaned.", d: "Creators, sellers and studios trust bg with their daily output." },
  { n: "25", t: "Tools, one tab.", d: "Compress, convert, upscale, watermark and clean — all in one place." },
];

const marquee = [
  "Free Background Remover.",
  "Online Image Compressor.",
  "Free Image Resizer.",
  "Convert PNG To JPG Online.",
  "Free Image To Text OCR.",
  "Online Image To PDF.",
  "AI Image Upscaler Free.",
  "Remove Watermark Online.",
  "Free Photo Editor Online.",
  "Blur Face Online Free.",
  "Free Meme Generator.",
  "Crop Image Online.",
];

const features = [
  {
    k: "01",
    title: "Hair & fur precision.",
    body: "A matting model trained on fine detail keeps every strand instead of carving a soft halo around your subject.",
  },
  {
    k: "02",
    title: "Batch in one drop.",
    body: "Drag a hundred product shots at once. Consistent framing, consistent margins, one zip on the way out.",
  },
  {
    k: "03",
    title: "Transparent or styled.",
    body: "Ship a clean alpha channel, or drop the subject onto a solid, gradient or studio-grey backdrop instantly.",
  },
  {
    k: "04",
    title: "Nothing kept.",
    body: "Uploads are processed and discarded. No archive, no training set, no quiet second life for your images.",
  },
];

const checkerStyle = {
  backgroundImage:
    "linear-gradient(45deg,var(--color-secondary) 25%,transparent 25%),linear-gradient(-45deg,var(--color-secondary) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--color-secondary) 75%),linear-gradient(-45deg,transparent 75%,var(--color-secondary) 75%)",
  backgroundSize: "26px 26px",
  backgroundPosition: "0 0,0 13px,13px -13px,-13px 0",
};

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-12 md:pb-28 md:pt-20 w-full">
        <p className="rise-in text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          free · online · unlimited
        </p>

        <div className="relative mt-6 w-full max-w-[98%] mx-auto">
          {/* Charcoal typographic mark behind title */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 font-display text-[22vw] font-bold leading-none tracking-tighter text-foreground/[0.04] md:text-[18vw]"
          >
            BG.
          </span>

          <h1 className="rise-in halftone-text relative mx-auto w-full text-center font-display text-5xl font-black leading-[1.02] pb-3 tracking-tighter text-foreground sm:text-7xl md:text-[5.5vw] lg:text-[6vw] xl:text-[6.5vw]">
            <span className="block">remove any background</span>
            <span className="block mt-2">in one Click.</span>
          </h1>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {["· Transparent PNG", "· 4K export", "· Batch upload", "· No watermark"].map((p, i) => (
            <span
              key={p}
              style={{ animationDelay: `${300 + i * 120}ms` }}
              className="rise-in rounded-full bg-card px-5 py-2.5 text-xs font-semibold shadow-sm border border-border md:text-sm"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/tools/$slug"
            params={{ slug: "remove-background" }}
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-9 py-5 text-base font-bold text-background shadow-xl transition-all hover:scale-105 hover:gap-5"
          >
            Remove a background <span aria-hidden>→</span>
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-3 rounded-full border-2 border-foreground px-9 py-5 text-base font-bold transition-all hover:scale-105 hover:bg-foreground hover:text-background shadow-md"
          >
            <img src={krishnaMark} alt="" width={512} height={512} className="h-6 w-6" />
            Try Karudi 1.0 Prime
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-3 rounded-full border-2 border-border bg-card px-9 py-5 text-base font-bold transition-all hover:scale-105 hover:border-foreground shadow-md"
          >
            See pricing
          </Link>
        </div>

        <p className="mt-8 max-w-md text-center text-sm text-muted-foreground">
          Free online background remover for people who care about edges.
        </p>
      </section>

      {/* Stats Section spanning FULL WIDE across screen */}
      <section className="grain border-y border-border px-6 py-16 md:px-12 md:py-24 w-full">
        <div className="w-full px-2 sm:px-6 md:px-10 lg:px-12 xl:px-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {stats.map((s, i) => (
              <Reveal key={s.t} delay={i * 90}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card/80 p-8 md:p-10 shadow-sm transition-all hover:border-foreground/40 hover:shadow-lg">
                  <div>
                    <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-extrabold text-foreground border border-accent/30">
                      {s.n}
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl lg:text-4xl text-foreground">
                      {s.t}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="px-5 py-24 md:px-10 md:py-36">
        <Reveal>
          <h2 className="max-w-4xl font-display text-3xl leading-[1.1] font-medium md:text-6xl">
            Built for every image that needs to stand alone. From a single portrait to a
            thousand-SKU catalogue.
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            <span className="text-foreground">
              We obsess over the one pixel most tools give up on.
            </span>{" "}
            Hair, fur, smoke, glass, motion blur — the places where a cutout usually falls apart are
            exactly where bg does its best work.
          </p>
          <a
            href="#upload"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-foreground px-7 py-4 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            Try it now
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </section>

      {/* Marquee — SEO tool keywords */}
      <div className="grain overflow-hidden border-y border-border py-6">
        <div className="marquee-track gap-14 whitespace-nowrap">
          {[...marquee, ...marquee].map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="font-display text-2xl font-medium text-muted-foreground"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Showcase with Scroll-Driven Before/After Reveal Animation */}
      <section id="work" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                interactive result
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">
                Scroll to Reveal Background Removal<span className="text-accent">.</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Watch the background disappear automatically as you scroll down the page.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <ScrollBeforeAfter />
          </Reveal>
        </div>
      </section>

      {/* Removal models overview & link to separate models page */}
      <section id="models-summary" className="border-t border-border bg-card/30 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            ai removal engines
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
            Five Neural Engines for Any Edge Challenge<span className="text-accent">.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            From 4K ultra-resolution exports to fine hair and translucent matting, pick the engine engineered for your image.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/models"
              className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-base font-semibold text-background transition-all hover:scale-[1.03]"
            >
              View All Model Details & FAQ
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Karudi Smart Assistant */}
      <section className="grain border-t border-border px-5 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
              karudi 1.0 prime assistant
            </p>
            <h2 className="mt-6 max-w-xl font-display text-4xl font-medium leading-[1.02] md:text-6xl">
              Meet Karudi 1.0 Prime<span className="text-accent">.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Ask anything, or upload a PDF, image, Excel sheet, Word doc, PowerPoint or text file
              and get it read, summarised and answered — powered by Karudi 1.0 Prime.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["PDF", "Image", "Excel", "Word", "PowerPoint", "Text"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium"
                >
                  {f}
                </span>
              ))}
            </div>
            <Link
              to="/chat"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-all hover:gap-6"
            >
              <img src={krishnaMark} alt="" width={512} height={512} className="h-5 w-5" />
              Try Karudi 1.0 Prime
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              {krishnaModels.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between gap-4 py-4 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div>
                    <p className="font-display text-lg font-medium">{m.fullName || m.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.blurb}</p>
                  </div>
                  <Link
                    to="/chat"
                    className="shrink-0 rounded-full border border-border px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground hover:text-background"
                  >
                    Try Karudi 1.0 Prime →
                  </Link>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>



      {/* Tools */}
      <div className="border-t border-border">
        <ToolsGrid />
      </div>

      {/* Features */}
      <section className="border-t border-border">
        {features.map((f, i) => (
          <Reveal key={f.k} delay={i * 60}>
            <article className="group grid gap-4 border-b border-border px-5 py-10 transition-colors hover:bg-secondary md:grid-cols-[6rem_1fr_1fr] md:items-baseline md:px-10 md:py-14">
              <span className="font-display text-sm text-muted-foreground">{f.k}</span>
              <h3 className="font-display text-2xl font-medium transition-transform duration-500 group-hover:translate-x-2 md:text-4xl">
                {f.title}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </section>

      {/* CTA */}
      <section
        id="upload"
        className="relative overflow-hidden px-5 py-32 text-center md:px-10 md:py-44"
      >
        <img
          src={shapeTwo}
          alt=""
          aria-hidden
          loading="lazy"
          width={900}
          height={900}
          className="spin-slow pointer-events-none absolute -right-16 top-10 w-56 opacity-90 md:w-80"
        />
        <Reveal>
          <h2 className="mx-auto max-w-5xl font-display text-4xl leading-[0.95] font-medium md:text-8xl">
            Drop an image.
            <br />
            Keep the subject<span className="text-accent">.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-sm text-muted-foreground md:text-base">
            Up to 4K exports, batch uploads and credits that only spend when a job succeeds.
          </p>
          <Link
            to="/tools/$slug"
            params={{ slug: "remove-background" }}
            className="mt-12 inline-flex items-center gap-3 bg-foreground px-9 py-5 text-sm font-medium text-background transition-all hover:gap-6"
          >
            Remove a background
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>

      <Faq />

      <SiteFooter />
    </div>
  );
}
