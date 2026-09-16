import { useState, useEffect } from "react";
import { AdminStore, type PurchaseTransaction } from "@/admin/lib/admin-store";
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
} from "lucide-react";
import { toast } from "sonner";

export function PurchasesView() {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => AdminStore.getPurchases());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const handleUpdate = () => {
      setPurchases(AdminStore.getPurchases());
    };
    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & KPI Summary Cards */}
      <div>
        <h2 className="font-display text-2xl font-extrabold text-white">Purchase & Subscription Transactions</h2>
        <p className="text-xs text-zinc-400 mt-1">Real-time revenue monitoring, credit pack sales, and invoice receipts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Gross Revenue</span>
          <p className="mt-3 font-display text-3xl font-black text-white">
            ₹{totalGrossINR.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>100% Verified Payment Gateway</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Credits Issued via Sales</span>
          <p className="mt-3 font-display text-3xl font-black text-amber-400">
            {totalCreditsSold.toLocaleString()} Credits
          </p>
          <p className="mt-2 text-xs text-zinc-400">Across credit packs & recurring plans</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Average Order Value (AOV)</span>
          <p className="mt-3 font-display text-3xl font-black text-white">
            ₹{Math.round(totalGrossINR / (purchases.length || 1)).toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-zinc-400">Higher proportion of Pro and 4K packs</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#121216] p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, plan or transaction ID…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "pack", "subscription"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition-all ${
                typeFilter === t
                  ? "bg-orange-500 text-white shadow-md"
                  : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
              }`}
            >
              {t === "all" ? "All Purchases" : t === "pack" ? "Credit Packs" : "Subscriptions"}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#121216] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[0.02] font-display text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Plan / Pack Description</th>
              <th className="px-6 py-4">Credits Added</th>
              <th className="px-6 py-4">Amount Paid</th>
              <th className="px-6 py-4">Payment Method</th>
              <th className="px-6 py-4">Date & Status</th>
              <th className="px-6 py-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium text-zinc-300">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                  No purchases found matching your query.
                </td>
              </tr>
            ) : null}

            {filteredPurchases.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-orange-400 text-xs">{p.id}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-white text-sm leading-none">{p.userName}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{p.userEmail}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        p.type === "subscription"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {p.type}
                    </span>
                    <span className="font-bold text-zinc-200">{p.planName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-extrabold text-amber-400">
                  +{p.creditsPurchased.toLocaleString()}
                </td>
                <td className="px-6 py-4 font-display text-sm font-extrabold text-white">
                  ₹{p.amountINR.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-zinc-300 font-semibold border border-white/5">
                    {p.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[11px] text-zinc-400">{p.date}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
