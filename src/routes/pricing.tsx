import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free 10 Credits a Day, Packs & Plans | bg" },
      {
        name: "description",
        content:
          "bg pricing in INR: a Free plan with 10 credits every day, pay-as-you-go packs from ₹199, Lite at ₹499/mo and Pro at ₹1,999/mo.",
      },
      { property: "og:title", content: "bg Pricing — Free Daily Credits, Packs & Plans" },
      {
        property: "og:description",
        content:
          "Credit packs, monthly plans and enterprise volume tiers for background removal, upscaling and image conversion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const payg = [
  { credits: 5, price: 199 },
  { credits: 10, price: 399 },
  { credits: 75, price: 2499 },
  { credits: 200, price: 5599 },
  { credits: 500, price: 9999 },
  { credits: 1200, price: 19999 },
  { credits: 4000, price: 49999 },
  { credits: 8000, price: 99999 },
];

const freeFeatures = [
  "10 credits every day",
  "Remove background",
  "All conversion tools",
  "Karudi 1.0 Prime AI chat",
  "Standard quality exports",
];

const planFeatures = [
  "AI photo editor",
  "Remove background",
  "AI background",
  "Erase & restore",
  "Max quality exports",
];


function Pricing() {
  const [pack, setPack] = useState("5");

  const selectedPack = payg.find((p) => String(p.credits) === pack) ?? { credits: 5, price: 199 };

  const handleBuy = (credits: number, name: string, price: number) => {
    import("@/lib/auth-user").then(({ AuthUser }) => {
      const txnId = AuthUser.addPurchasedCredits(credits, name, price, "UPI");
      import("sonner").then(({ toast }) => {
        toast.success(`Payment Successful! Added ${credits} credits to your account. (Ref: ${txnId})`);
      });
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="px-5 pt-16 md:px-10 md:pt-24">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          pricing
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.02] md:text-6xl">
          Pay for what you process<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          One credit is one processed image on any tool. Buy a pack when you need it, or keep a
          monthly allowance running.
        </p>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="grid items-start gap-5 lg:grid-cols-4">
          {/* Free */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl font-medium">Free</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="text-foreground">10 credits</span> every day, forever
            </p>
            <p className="mt-6 font-display text-4xl font-medium">
              ₹0 <span className="text-base text-muted-foreground">/ day</span>
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex justify-center rounded-full border border-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
            >
              Start free
            </Link>
            <ul className="mt-7 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
              {freeFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Pay-as-you-go */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl font-medium">Pay-as-you-go</h2>
            <div className="mt-6">
              <span className="text-xs font-medium text-muted-foreground">Amount</span>
              <Select value={pack} onValueChange={setPack}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payg.map((p) => (
                    <SelectItem key={p.credits} value={String(p.credits)}>
                      {p.credits.toLocaleString("en-IN")} credits
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-6 font-display text-4xl font-medium">{inr(selectedPack.price)}</p>
            <button
              type="button"
              onClick={() => handleBuy(selectedPack.credits, `${selectedPack.credits} Credits Pack`, selectedPack.price)}
              className="mt-6 inline-flex justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Buy now
            </button>
            <p className="mt-7 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
              Start small with a one-off purchase — upgrade and scale when needed. Top up your
              credits anytime, on top of your current plan.
            </p>
          </div>

          {/* Lite */}
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl font-medium">Lite</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Use up to <span className="text-foreground">40 credits</span> per month
            </p>
            <p className="mt-6 font-display text-4xl font-medium">
              {inr(499)} <span className="text-base text-muted-foreground">/ month</span>
            </p>
            <button
              type="button"
              onClick={() => handleBuy(40, "Lite Monthly Plan", 499)}
              className="mt-6 inline-flex justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Subscribe
            </button>
            <ul className="mt-7 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
              {planFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative flex h-full flex-col rounded-2xl border-2 border-accent bg-card p-7">
            <span className="absolute right-6 top-7 rounded-full bg-accent px-3 py-1 text-[0.7rem] font-semibold text-accent-foreground">
              Most Popular
            </span>
            <h2 className="font-display text-2xl font-medium">Pro</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Use up to <span className="text-foreground">200 credits</span> per month
            </p>
            <p className="mt-6 font-display text-4xl font-medium">
              {inr(1999)} <span className="text-base text-muted-foreground">/ month</span>
            </p>
            <button
              type="button"
              onClick={() => handleBuy(200, "Pro Monthly Plan", 1999)}
              className="mt-6 inline-flex justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Subscribe
            </button>
            <ul className="mt-7 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
              {planFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li className="text-foreground">Bulk editing ⚡</li>
            </ul>
          </div>



        </div>
      </section>

      <Faq />

      <SiteFooter />
    </div>
  );
}
