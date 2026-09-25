import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BgModels } from "@/components/BgModels";
import { bgModels } from "@/lib/bg-models";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const modelFaqs = [
  {
    q: "How does the Karudi Universal Master Model work?",
    a: "Karudi is our flagship universal orchestrator. When you submit an image, document, or prompt, Karudi analyzes your exact requirement and dynamically routes the task to the ideal specialized model (Ganga, Brahmaputra, Narmada, or Saraswati) — chaining them together when necessary to deliver the best possible result.",
  },
  {
    q: "What is the Ganga Model and when should I use it?",
    a: "Ganga is our dedicated neural Background Removal Engine. It uses sub-pixel alpha matting and edge reconstruction to cleanly isolate subjects, preserve fine flyaway hair and translucent glassware, and cleanly eliminate backgrounds even from blurry or low-light photos.",
  },
  {
    q: "How does the Brahmaputra Model handle media conversions?",
    a: "Brahmaputra is our high-speed media and format conversion engine. It converts images between formats like JPG, PNG, WebP, SVG, and AVIF while optimizing file sizes and preserving 100% color gamut fidelity (sRGB / Display P3).",
  },
  {
    q: "What outputs can the Narmada Model generate?",
    a: "Narmada is a versatile processing and generative engine. It extracts text with multilingual OCR, produces smart AI summaries of complex documents or screenshots, and generates creative memes with custom overlays and viral captions.",
  },
  {
    q: "What is the Saraswati Model used for?",
    a: "Saraswati is our deep research and knowledge engine. It is designed for multi-source data extraction, deep document interrogation, fact-checking, and structured analytical reporting.",
  },
  {
    q: "Do all models run in real-time?",
    a: "Yes! All models are accelerated by high-throughput GPU clusters with WebAssembly browser acceleration, giving you near-instant responses with enterprise-grade quality.",
  },
];

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "AI Model Suite & Specifications | Karudi, Ganga, Brahmaputra, Narmada & Saraswati" },
      {
        name: "description",
        content:
          "Explore bg's specialized AI model ecosystem: Karudi (Universal Master), Ganga (Background Removal), Brahmaputra (Format Conversion), Narmada (OCR, Summary & Memes), and Saraswati (Research Suite).",
      },
      { property: "og:title", content: "AI Model Suite & Specifications | bg" },
      { property: "og:description", content: "Explore Karudi, Ganga, Brahmaputra, Narmada, and Saraswati AI engines." },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Header */}
      <section className="w-full border-b border-border bg-card/40 px-6 py-16 md:px-12 md:py-24">
        <div className="w-full px-2 sm:px-6 md:px-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-foreground">AI Models Architecture & Specs</span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-[5vw]">
            AI Model Ecosystem & Specifications<span className="text-accent">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-xl">
            Five powerful engines working in harmony — from precision background cutouts and lightning-fast format conversion to OCR extraction, creative meme synthesis, deep research, and universal orchestration.
          </p>
        </div>
      </section>

      {/* Models Grid */}
      <div className="w-full px-2 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <BgModels />
      </div>

      {/* Detailed Technical Comparison Table */}
      <section className="w-full border-t border-border bg-secondary/30 px-6 py-20 md:px-12 md:py-28">
        <div className="w-full px-2 sm:px-6 md:px-10 lg:px-12 xl:px-16">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            ecosystem matrix
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            Model Capability & Architecture Matrix<span className="text-accent">.</span>
          </h2>

          <div className="mt-12 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm w-full">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 font-display text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-8 py-5">Model Engine</th>
                  <th className="px-8 py-5">Core Role</th>
                  <th className="px-8 py-5">Specialized Capabilities</th>
                  <th className="px-8 py-5">Primary Output</th>
                  <th className="px-8 py-5">Performance Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {bgModels.map((m) => (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      m.id === "karudi"
                        ? "bg-accent/15 border-l-4 border-foreground font-bold"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-8 py-6 font-bold text-base flex items-center gap-2">
                      {m.name}
                      {m.id === "karudi" ? (
                        <span className="rounded-full bg-foreground text-background px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                          Universal Master
                        </span>
                      ) : null}
                    </td>
                    <td className="px-8 py-6 text-foreground font-semibold">{m.specialty}</td>
                    <td className="px-8 py-6 text-muted-foreground">
                      {m.id === "karudi" && "Orchestrates all specialist models according to exact user intent"}
                      {m.id === "ganga" && "Sub-pixel alpha matting, hair/fur edge reconstruction, cutout isolation"}
                      {m.id === "brahmaputra" && "Converting formats (JPG/PNG/WebP), batch processing & image compression"}
                      {m.id === "narmada" && "Multilingual OCR, intelligent AI summary, and custom meme generator"}
                      {m.id === "saraswati" && "Deep data research, document interrogation, structured analytical insights"}
                    </td>
                    <td className="px-8 py-6 text-foreground font-semibold">
                      {m.id === "karudi" && "Optimized Unified Result"}
                      {m.id === "ganga" && "Transparent PNG Cutouts"}
                      {m.id === "brahmaputra" && "JPG / PNG / WebP / AVIF"}
                      {m.id === "narmada" && "Text / Summaries / Memes"}
                      {m.id === "saraswati" && "Structured Research Reports"}
                    </td>
                    <td className="px-8 py-6 font-semibold">
                      {m.id === "karudi" ? "Supreme Master Pipeline" : "Ultra-Fast Dedicated GPU"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Model FAQ Section */}
      <section id="model-faq" className="w-full border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              model FAQs
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
              Model Selection & Performance FAQ<span className="text-accent">.</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Everything you need to know about our specialized AI engines and universal orchestration.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-12 w-full space-y-4">
            {modelFaqs.map((f, i) => (
              <AccordionItem key={f.q} value={`model-faq-${i}`} className="rounded-2xl border border-border bg-card px-6 sm:px-8 shadow-sm">
                <AccordionTrigger className="py-6 text-left font-display text-lg font-bold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full border-t border-border bg-card px-6 py-20 text-center md:px-12 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Experience Our AI Model Suite in Action
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Choose a tool or let Karudi automatically handle your workflow with zero compromise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/tools/$slug"
              params={{ slug: "remove-background" }}
              className="rounded-full bg-foreground px-9 py-5 text-base font-bold text-background transition-all hover:scale-105 shadow-xl"
            >
              Start Background Removal →
            </Link>
            <Link
              to="/chat"
              className="rounded-full border border-border bg-card px-9 py-5 text-base font-bold text-foreground transition-all hover:border-foreground/40 hover:scale-105 shadow-sm"
            >
              Ask Karudi Universal AI →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

