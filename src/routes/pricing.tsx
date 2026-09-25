import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import { AdminStore, type PurchasePlanConfig } from "@/admin/lib/admin-store";
import { openFestivalOffersDialog } from "@/components/FestivalOffersDialog";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { Sparkles, Gift, Zap } from "lucide-react";
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
  const [activeOffer, setActiveOffer] = useState<PurchasePlanConfig | null>(() => AdminStore.getActiveFestivalOffer());

  useEffect(() => {
    const update = () => setActiveOffer(AdminStore.getActiveFestivalOffer());
    window.addEventListener(REALTIME_EVENT_NAME, update);
    window.addEventListener("storage", update);
    AdminStore.fetchPlansFromServer().then(() => setActiveOffer(AdminStore.getActiveFestivalOffer()));
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

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
        {activeOffer && (
          <div className="mb-12 overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-6 sm:p-8 shadow-xl shadow-amber-500/10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-28 w-28 sm:h-36 sm:w-48 shrink-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-muted">
                  <img
                    src={activeOffer.imageUrl || "/images/festival-offer-banner.jpg"}
                    alt={activeOffer.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/celebration-gift-banner.jpg";
                    }}
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase text-slate-950 shadow-xs">
                    Festival
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-600 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-white shadow-xs">
                      {activeOffer.badge || "LIMITED TIME OFFER"}
                    </span>
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 fill-current" />
                      Special Festive Pack
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-foreground">
                    {activeOffer.name}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {activeOffer.tagline || "Exclusive limited-time festive discount!"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-foreground">
                      ₹{activeOffer.priceINR.toLocaleString("en-IN")}
                    </span>
                    {activeOffer.originalPriceINR && (
                      <span className="font-mono text-sm text-muted-foreground line-through">
                        ₹{activeOffer.originalPriceINR.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      {(activeOffer.credits + (activeOffer.bonusCredits || 0)).toLocaleString()} Credits
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleBuy(
                      activeOffer.credits + (activeOffer.bonusCredits || 0),
                      activeOffer.name,
                      activeOffer.priceINR
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Gift className="h-4 w-4" />
                  <span>Claim Offer ({inr(activeOffer.priceINR)})</span>
                </button>
                <button
                  type="button"
                  onClick={openFestivalOffersDialog}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 py-3.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
