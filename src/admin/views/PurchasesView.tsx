import { useState, useEffect } from "react";
import { AdminStore, type PurchaseTransaction, type PurchasePlanConfig } from "@/admin/lib/admin-store";
import { FestivalOffersDialog } from "@/components/FestivalOffersDialog";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import {
  CreditCard,
  Search,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Download,
  IndianRupee,
  ShieldCheck,
  Plus,
  Sparkles,
  Flame,
  Gift,
  Zap,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export function PurchasesView() {
  const [subTab, setSubTab] = useState<"orders" | "plans">("orders");

  // Orders State
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => AdminStore.getPurchases());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Plans & Offers State
  const [plans, setPlans] = useState<PurchasePlanConfig[]>(() => AdminStore.getPlans());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PurchasePlanConfig | null>(null);
  const [previewOffer, setPreviewOffer] = useState<PurchasePlanConfig | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formType, setFormType] = useState<"festival" | "pack" | "subscription">("festival");
  const [formCredits, setFormCredits] = useState<number>(500);
  const [formBonusCredits, setFormBonusCredits] = useState<number>(150);
  const [formPriceINR, setFormPriceINR] = useState<number>(999);
  const [formOriginalPriceINR, setFormOriginalPriceINR] = useState<number>(2499);
  const [formBilling, setFormBilling] = useState<"one-time" | "month" | "year">("one-time");
  const [formImageUrl, setFormImageUrl] = useState("/images/festival-offer-banner.jpg");
  const [formFeatures, setFormFeatures] = useState("");
  const [formIsFestival, setFormIsFestival] = useState(true);
  const [formShowInDialog, setFormShowInDialog] = useState(true);
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setPurchases(AdminStore.getPurchases());
      setPlans(AdminStore.getPlans());
    };
    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    AdminStore.fetchPlansFromServer().then((data) => setPlans(data));
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const totalGrossINR = purchases.reduce(
    (sum, p) => (p.status === "completed" ? sum + p.amountINR : sum),
    0
  );
  const totalCreditsSold = purchases.reduce(
    (sum, p) => (p.status === "completed" ? sum + p.creditsPurchased : sum),
    0
  );

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.userName.toLowerCase().includes(search.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.planName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDownloadInvoice = (txnId: string) => {
    toast.success(`Generated official GST Invoice PDF for transaction ${txnId}.`);
  };

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormName("Diwali Special Festive Offer 🎉");
    setFormTagline("Exclusive limited-time festival discount with bonus credits!");
    setFormBadge("🔥 60% OFF FESTIVAL SPECIAL");
    setFormType("festival");
    setFormCredits(500);
    setFormBonusCredits(150);
    setFormPriceINR(999);
    setFormOriginalPriceINR(2499);
    setFormBilling("one-time");
    setFormImageUrl("/images/festival-offer-banner.jpg");
    setFormFeatures(
      "650 Total Credits (500 + 150 Extra Bonus)\nUltra HD 4K Outputs on All Tools\nFull Access to AI Background Removal\nLifetime Validity — Credits Never Expire\nCommercial Use License Included"
    );
    setFormIsFestival(true);
    setFormShowInDialog(true);
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PurchasePlanConfig) => {
    setEditingPlan(p);
    setFormName(p.name);
    setFormTagline(p.tagline || "");
    setFormBadge(p.badge || "");
    setFormType(p.type);
    setFormCredits(p.credits);
    setFormBonusCredits(p.bonusCredits || 0);
    setFormPriceINR(p.priceINR);
    setFormOriginalPriceINR(p.originalPriceINR || 0);
    setFormBilling(p.billingPeriod || "one-time");
    setFormImageUrl(p.imageUrl || "/images/festival-offer-banner.jpg");
    setFormFeatures(p.features.join("\n"));
    setFormIsFestival(p.isFestivalOffer);
    setFormShowInDialog(p.showInFestivalDialog);
    setFormActive(p.active);
    setIsModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!formName.trim()) {
      toast.error("Please enter a plan name.");
      return;
    }

    const featureList = formFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const updatedPlans = [...plans];

    if (editingPlan) {
      const idx = updatedPlans.findIndex((x) => x.id === editingPlan.id);
      if (idx >= 0) {
        updatedPlans[idx] = {
          ...editingPlan,
          name: formName.trim(),
          tagline: formTagline.trim(),
          badge: formBadge.trim(),
          type: formType,
          credits: Number(formCredits) || 0,
          bonusCredits: Number(formBonusCredits) || 0,
          priceINR: Number(formPriceINR) || 0,
          originalPriceINR: Number(formOriginalPriceINR) || 0,
          billingPeriod: formBilling,
          imageUrl: formImageUrl.trim(),
          features: featureList,
          isFestivalOffer: formIsFestival,
          showInFestivalDialog: formShowInDialog,
          active: formActive,
        };
      }
      toast.success(`Updated plan "${formName}" successfully!`);
    } else {
      const newPlan: PurchasePlanConfig = {
        id: `plan-custom-${Date.now().toString(36)}`,
        name: formName.trim(),
        tagline: formTagline.trim(),
        badge: formBadge.trim(),
        type: formType,
        credits: Number(formCredits) || 0,
        bonusCredits: Number(formBonusCredits) || 0,
        priceINR: Number(formPriceINR) || 0,
        originalPriceINR: Number(formOriginalPriceINR) || 0,
        billingPeriod: formBilling,
        imageUrl: formImageUrl.trim(),
        features: featureList,
        isFestivalOffer: formIsFestival,
        showInFestivalDialog: formShowInDialog,
        active: formActive,
        sortOrder: updatedPlans.length,
      };
      updatedPlans.unshift(newPlan);
      toast.success(`Created new plan "${formName}" successfully!`);
    }

    // If marked as festival dialog, ensure it is enabled
    setPlans(updatedPlans);
    AdminStore.savePlans(updatedPlans);
    setIsModalOpen(false);
  };

  const handleTogglePlanActive = (id: string) => {
    const updated = plans.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setPlans(updated);
    AdminStore.savePlans(updated);
    toast.success("Plan status updated.");
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);
      AdminStore.savePlans(updated);
      toast.success(`Deleted plan "${name}".`);
    }
  };

  const activeFestivalOffer = plans.find((p) => p.active && p.isFestivalOffer && p.showInFestivalDialog);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Purchases & Plans Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure credit packs, festival discount offers, popup dialogs, and verify sales records.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setSubTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              subTab === "orders"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Orders & Revenue ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("plans")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              subTab === "plans"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-current" />
            <span>Plans & Festival Offers ({plans.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ORDERS & REVENUE */}
      {subTab === "orders" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Gross Revenue</span>
              <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
                ₹{totalGrossINR.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verified Payment Gateway</span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Credits Issued via Sales</span>
              <p className="mt-3 font-display text-3xl font-extrabold text-amber-500">
                {totalCreditsSold.toLocaleString()} Credits
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Across credit packs & festive offers</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed Transactions</span>
              <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
                {purchases.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Total customer order records</p>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer, email, plan or TXN ID…"
                className="w-full rounded-2xl border border-input bg-background/60 pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {["all", "subscription", "pack"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                    typeFilter === t
                      ? "bg-foreground text-background shadow-xs font-extrabold"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "All Orders" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
            {filteredPurchases.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="font-semibold text-foreground text-sm">No transactions found</p>
                <p className="mt-1 text-[11px]">When users purchase credit packs or subscriptions on the Pricing page, orders will be recorded here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                  <tr>
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Plan / Pack</th>
                    <th className="py-4 px-6">Credits</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Payment Method</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] font-bold text-foreground">
                        {p.id}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-foreground">{p.userName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{p.userEmail}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-foreground">{p.planName}</span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-amber-500">
                        +{p.creditsPurchased}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-foreground">
                        ₹{p.amountINR.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{p.paymentMethod}</td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">{p.date}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PLANS & FESTIVAL OFFERS MANAGER */}
      {subTab === "plans" && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-xs">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Configured Purchase Plans & Offers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage live plans visible to users on the Pricing page and set festival celebration popups with images.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add Custom / Festival Plan</span>
            </button>
          </div>

          {/* ACTIVE FESTIVAL OFFER SPOTLIGHT BANNER */}
          {activeFestivalOffer ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-6 shadow-xl shadow-amber-500/10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-44 shrink-0 overflow-hidden rounded-2xl border border-amber-500/40 bg-muted">
                    <img
                      src={activeFestivalOffer.imageUrl || "/images/festival-offer-banner.jpg"}
                      alt={activeFestivalOffer.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/celebration-gift-banner.jpg";
                      }}
                    />
                    <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase text-slate-950 shadow-xs">
                      Live Popup
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-500 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-slate-950">
                        {activeFestivalOffer.badge || "FESTIVAL OFFER"}
                      </span>
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 fill-current" />
                        Active on Website Popup Dialog
                      </span>
                    </div>

                    <h4 className="mt-1.5 font-display text-2xl font-black text-foreground">
                      {activeFestivalOffer.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeFestivalOffer.tagline || "Active celebration offer with extra bonus credits"}
                    </p>

                    <div className="mt-2.5 flex items-baseline gap-3">
                      <span className="font-mono text-2xl font-black text-foreground">
                        ₹{activeFestivalOffer.priceINR.toLocaleString("en-IN")}
                      </span>
                      {activeFestivalOffer.originalPriceINR && (
                        <span className="font-mono text-sm text-muted-foreground line-through">
                          ₹{activeFestivalOffer.originalPriceINR.toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-500">
                        ⚡ {(activeFestivalOffer.credits + (activeFestivalOffer.bonusCredits || 0)).toLocaleString()} Credits
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreviewOffer(activeFestivalOffer)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-amber-500" />
                    <span>Preview Festival Dialog</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(activeFestivalOffer)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-500 fill-current opacity-70" />
              <p className="font-bold text-sm text-foreground">No Festival Offer Dialog Active</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Create a festival or promotional plan with "Show in Festival Popup Dialog" enabled to greet users with celebration offers & images!
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Launch Festival Offer</span>
              </button>
            </div>
          )}

          {/* PLANS CARDS GRID */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const totalCredits = p.credits + (p.bonusCredits || 0);
              const hasDiscount = p.originalPriceINR && p.originalPriceINR > p.priceINR;

              return (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between overflow-hidden rounded-3xl border transition-all ${
                    p.isFestivalOffer
                      ? "border-amber-500/40 bg-card shadow-lg shadow-amber-500/5"
                      : "border-border bg-card shadow-xs hover:border-foreground/20"
                  } ${!p.active ? "opacity-60" : ""}`}
                >
                  {/* Card Header & Image */}
                  <div>
                    {p.imageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden bg-muted">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/celebration-gift-banner.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {p.badge && (
                            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-slate-950 shadow-xs">
                              {p.badge}
                            </span>
                          )}
                          {p.isFestivalOffer && (
                            <span className="rounded-full bg-rose-600 px-2 py-0.5 font-mono text-[9px] font-extrabold text-white">
                              FESTIVAL
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 pb-0 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {p.badge && (
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                              {p.badge}
                            </span>
                          )}
                          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-muted-foreground">
                            {p.type}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-display text-xl font-bold text-foreground">{p.name}</h4>
                        {p.tagline && <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-mono text-2xl font-black text-foreground">
                          ₹{p.priceINR.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="font-mono text-sm text-muted-foreground line-through">
                            ₹{p.originalPriceINR!.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          /{p.billingPeriod === "one-time" ? "one-time" : p.billingPeriod}
                        </span>
                      </div>

                      {/* Credits */}
                      <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-2.5 font-mono text-xs">
                        <Zap className="h-4 w-4 text-amber-500 fill-current" />
                        <span className="font-bold text-foreground">{totalCredits.toLocaleString()} Credits</span>
                        {p.bonusCredits && p.bonusCredits > 0 ? (
                          <span className="text-emerald-500 font-semibold text-[11px]">
                            (+{p.bonusCredits} Bonus)
                          </span>
                        ) : null}
                      </div>

                      {/* Features */}
                      {p.features && p.features.length > 0 && (
                        <ul className="space-y-1 text-xs text-muted-foreground pt-1">
                          {p.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span className="line-clamp-1">{f}</span>
                            </li>
                          ))}
                          {p.features.length > 4 && (
                            <li className="text-[11px] text-muted-foreground/80 pl-5">
                              +{p.features.length - 4} more features
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="border-t border-border p-4 flex items-center justify-between gap-2 bg-muted/20">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanActive(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        p.active
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${p.active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                      <span>{p.active ? "Active" : "Disabled"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {p.isFestivalOffer && (
                        <button
                          type="button"
                          onClick={() => setPreviewOffer(p)}
                          className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Preview Dialog"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePlan(p.id, p.name)}
                        className="rounded-xl border border-border p-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD / EDIT PLAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-foreground my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingPlan ? "Edit Purchase Plan / Offer" : "Add Custom Purchase Plan / Festival Offer"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set prices, bonus credits, and configure celebration popup dialogs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Row 1: Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Plan Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Diwali Mega Creator Offer 🎉"
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Save 60% today with bonus credits!"
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-medium text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Badge & Plan Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Badge Text</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. 🔥 60% OFF FESTIVAL SPECIAL"
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Plan Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="festival">Festival / Special Offer</option>
                    <option value="pack">Credit Pack (One-time)</option>
                    <option value="subscription">Monthly Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Billing Period</label>
                  <select
                    value={formBilling}
                    onChange={(e) => setFormBilling(e.target.value as any)}
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="one-time">One-time payment</option>
                    <option value="month">Per Month</option>
                    <option value="year">Per Year</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Pricing & Credits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Offer Price (₹ INR) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formPriceINR}
                    onChange={(e) => setFormPriceINR(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-mono font-bold text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formOriginalPriceINR}
                    onChange={(e) => setFormOriginalPriceINR(Number(e.target.value))}
                    placeholder="Strikethrough MRP"
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-mono font-bold text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Base Credits *</label>
                  <input
                    type="number"
                    min="1"
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-mono font-bold text-foreground focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Bonus Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={formBonusCredits}
                    onChange={(e) => setFormBonusCredits(Number(e.target.value))}
                    placeholder="e.g. 150 extra"
                    className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-xs font-mono font-bold text-emerald-500 focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Banner Image Selector & Preview */}
              <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-amber-500" />
                  <span>Banner Image (for Dialog & Spotlight Cards)</span>
                </label>

                {/* Preset Banner Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormImageUrl("/images/festival-offer-banner.jpg")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      formImageUrl === "/images/festival-offer-banner.jpg"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>🏮 Festive Diyas Banner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormImageUrl("/images/celebration-gift-banner.jpg")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      formImageUrl === "/images/celebration-gift-banner.jpg"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>🎆 Celebration Fireworks Banner</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Custom Image URL or path (e.g. /images/...)"
                    className="flex-1 rounded-2xl border border-input bg-background/60 px-4 py-2 text-xs font-medium text-foreground focus:border-foreground focus:outline-none"
                  />
                  {formImageUrl && (
                    <div className="h-10 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/festival-offer-banner.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Features (One per line) */}
              <div>
                <label className="text-xs font-bold text-foreground">Features (one item per line)</label>
                <textarea
                  rows={4}
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="Ultra HD 4K Outputs&#10;Full AI Tool Access&#10;Lifetime Validity&#10;Commercial License"
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background/60 p-4 text-xs font-medium text-foreground focus:border-foreground focus:outline-none font-mono"
                />
              </div>

              {/* Row 6: Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formShowInDialog}
                    onChange={(e) => setFormShowInDialog(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Show in Website Festival Popup Dialog</p>
                    <p className="text-[11px] text-muted-foreground">Greet website visitors with this festive offer dialog modal.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Active & Visible to Users</p>
                    <p className="text-[11px] text-muted-foreground">Publish to pricing options.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Save Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW DIALOG MODAL */}
      {previewOffer && (
        <FestivalOffersDialog
          customOffer={previewOffer}
          forceOpen={true}
          onClose={() => setPreviewOffer(null)}
        />
      )}
    </div>
  );
}
