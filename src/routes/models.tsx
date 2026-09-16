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
    q: "Which model should I choose for general background removal?",
    a: "The General Cutout model is optimized for 95% of everyday objects, products, and standard portraits with ultra-fast sub-second matting.",
  },
  {
    q: "How does the Hair & Fur Matting engine differ from General Cutout?",
    a: "Hair & Fur Matting uses a specialized alpha-channel refinement network specifically trained on fine strands, translucent edges, animal fur, and wispy human hair.",
  },
  {
    q: "Can I process batch images up to 4K resolution?",
    a: "Yes! The Batch & E-Commerce model and 4K Studio Model support input resolutions up to 4096x4096 without downsampling or edge compression.",
  },
  {
    q: "What happens if a background removal model fails?",
    a: "If a job fails or produces an unexpected error, zero credits are deducted from your balance.",
  },
  {
    q: "Do these models run locally or in the cloud?",
    a: "All models are powered by high-throughput GPU clusters with web-assembly acceleration, giving you cloud precision at near-instant local speeds.",
  },
];

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "AI Removal Models & Specifications | bg" },
      {
        name: "description",
        content:
          "Explore bg's five specialized AI background removal engines. Detailed specs, edge precision metrics, and FAQs for hair, batch, glass, and 4K matting.",
      },
      { property: "og:title", content: "AI Removal Models & Specifications | bg" },
      { property: "og:description", content: "Deep dive into five specialized AI matting models." },
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
            <span className="text-foreground">Model Details & FAQ</span>
          </div>

          <h1 className="mt-8 font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl lg:text-[5vw]">
            AI Removal Models & Technical Specifications<span className="text-accent">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-xl">
            Five specialized neural engines engineered for distinct cutout challenges — from sub-pixel hair matting to batch e-commerce workflows.
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
            matrix comparison
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            Engine Capability Matrix<span className="text-accent">.</span>
          </h2>

          <div className="mt-12 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm w-full">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 font-display text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-8 py-5">Model Engine</th>
                  <th className="px-8 py-5">Specialty</th>
                  <th className="px-8 py-5">Est. Speed</th>
                  <th className="px-8 py-5">Max Resolution</th>
                  <th className="px-8 py-5">Alpha Precision</th>
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
                          Flagship Master
                        </span>
                      ) : null}
                    </td>
                    <td className="px-8 py-6 text-muted-foreground">{m.specialty}</td>
                    <td className="px-8 py-6 text-accent-foreground font-semibold">{m.quality}</td>
                    <td className="px-8 py-6 font-semibold">4096 × 4096 (4K)</td>
                    <td className="px-8 py-6 text-muted-foreground font-semibold">
                      {m.id === "karudi"
                        ? "Unified Master Sub-pixel Alpha"
                        : m.id === "narmada"
                        ? "Sub-pixel Hair Matting"
                        : "High Precision Alpha"}
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
              Everything you need to know about choosing the right AI model for your images.
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
            Ready to test our AI engines?
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Upload an image now and get a crisp, transparent PNG cutout in seconds.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/tools/$slug"
              params={{ slug: "remove-background" }}
              className="rounded-full bg-foreground px-9 py-5 text-base font-bold text-background transition-all hover:scale-105 shadow-xl"
            >
              Start Background Removal →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
