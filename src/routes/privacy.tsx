import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShieldCheck, Lock, EyeOff, Server, FileCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Zero Storage Guarantee | bg" },
      {
        name: "description",
        content:
          "Read bg's privacy policy. We process your images in temporary memory and discard them immediately — zero tracking, zero archive, zero AI training on user uploads.",
      },
      { property: "og:title", content: "Privacy Policy — bg Image Toolkit" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <SiteHeader />

        <main className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-foreground">Privacy Policy</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl tracking-tight">
            Privacy Policy & Data Protection<span className="text-accent">.</span>
          </h1>

          <p className="mt-4 text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
            Last updated: August 10, 2026. Your privacy and image ownership are absolute when using <strong>bg</strong>.
          </p>

          {/* Highlights Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <EyeOff className="h-7 w-7 text-emerald-500 mb-3" />
              <h3 className="font-display text-lg font-bold">Zero Image Retention</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Images uploaded for background removal or editing are processed in ephemeral memory and discarded instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Lock className="h-7 w-7 text-amber-500 mb-3" />
              <h3 className="font-display text-lg font-bold">No AI Training</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                We never use your personal or commercial photos to train AI models or public datasets.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Server className="h-7 w-7 text-orange-500 mb-3" />
              <h3 className="font-display text-lg font-bold">Encrypted Processing</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                All data transfers run through TLS 1.3 end-to-end encryption with secure token verification.
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-8 text-base leading-relaxed text-foreground/90 font-medium">
            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-accent" /> 1. Information We Collect
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                We collect minimal account information necessary to manage your credits and authentication (such as email address and subscription preferences). We do <strong>NOT</strong> archive, index, or store your uploaded image content.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-500" /> 2. Image File Lifecycle
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                When you drag & drop an image or document into <strong>bg</strong>, it is transmitted securely to our GPU inference clusters. Once alpha matting, rotation, watermark cleaning or format conversion completes, the raw file and result are returned to your browser and immediately purged from server memory.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold">3. Cookies & Analytics</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                We use essential session tokens to remember your login status and theme preference (Day/Night mode). We do not run intrusive 3rd-party tracking scripts or sell user data to advertising brokers.
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 space-y-4">
              <h2 className="font-display text-2xl font-bold">4. Your Data Rights</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                You can request full account deletion and data wipe at any time by contacting our support team at <strong className="text-foreground">privacy@bgtool.ai</strong>.
              </p>
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
