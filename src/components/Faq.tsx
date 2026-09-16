import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "How does credit-based pricing work?",
    a: "Every tool spends credits per processed image. Buy a one-off Pay-as-you-go pack, or keep a monthly allowance running with Lite or Pro.",
  },
  {
    q: "What does one credit cover?",
    a: "One credit equals one processed image on any tool — background removal, upscale, watermark removal, OCR or conversion. Failed jobs are never charged.",
  },
  {
    q: "Do credits expire?",
    a: "Pay-as-you-go credits never expire. Monthly plan credits reset at the start of each billing cycle.",
  },
  {
    q: "What image formats and sizes are supported?",
    a: "JPG, PNG, WEBP, HEIC and AVIF up to 4K on input, with transparent PNG or your chosen format on output.",
  },
  {
    q: "Do you store my uploads?",
    a: "No. Files are processed and then discarded — no archive, no training set, no quiet second life for your images.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan gives you 10 credits every day — enough for daily background removals, conversions and Karudi Lite chat, with no card required.",
  },
  {
    q: "Can I switch or cancel a plan later?",
    a: "Anytime. Upgrades apply immediately and downgrades take effect at the end of the current cycle.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            faq
          </p>
          <h2 className="mt-6 font-display text-3xl font-medium leading-[1.05] md:text-5xl">
            Questions, answered<span className="text-accent">.</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-base font-medium md:text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
