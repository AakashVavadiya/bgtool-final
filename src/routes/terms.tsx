import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FileText, CheckCircle, Scale, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — bg Image Processing Service" },
      {
        name: "description",
        content:
          "Terms of Service for bg. Details on credit usage, non-refundable credit packs, commercial use license, and acceptable usage policy.",
      },
      { property: "og:title", content: "Terms & Conditions — bg" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <SiteHeader />

        <main className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-foreground">Terms & Conditions</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl tracking-tight">
            Terms of Service & Usage<span className="text-accent">.</span>
          </h1>

          <p className="mt-4 text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
            Effective Date: August 10, 2026. By accessing or using the <strong>bg</strong> platform, you agree to these binding terms.
          </p>

          <div className="mt-12 space-y-8 text-base leading-relaxed text-foreground/90 font-medium">
            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-500" /> 1. Credit Allocation & Guarantee
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Free tier users receive 10 daily credits. One credit is consumed per successfully processed image. <strong>Failed or un-rendered jobs zero-deduct your balance</strong> — you only pay for successful cutouts and edits.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Scale className="h-6 w-6 text-amber-500" /> 2. Commercial License & Ownership
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                You retain full copyright and ownership of all uploaded photographs and generated transparent PNG outputs. Outputs produced by <strong>bg</strong> are licensed for unlimited commercial, e-commerce, advertising, and personal use.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" /> 3. Acceptable Use Policy
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Users are prohibited from using <strong>bg</strong> to process illegal, non-consensual explicit content, or copyrighted material without authorization. We reserve the right to suspend accounts violating these guidelines.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-orange-500" /> 4. Subscriptions & Pay-As-You-Go
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Pay-as-you-go credit packs do not expire. Monthly plan subscriptions auto-renew at the start of each billing cycle unless cancelled prior to the renewal date.
              </p>
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
