import { useState, useEffect } from "react";
import { AdminStore, type LoggedUser } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Minus,
  Ban,
  CheckCircle2,
  Coins,
  MapPin,
  Clock,
  Sparkles,
  Shield,
} from "lucide-react";

export function UsersManagement() {
  const [users, setUsers] = useState<LoggedUser[]>(() => AdminStore.getUsers());
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [customCreditUser, setCustomCreditUser] = useState<string | null>(null);
  const [customCreditAmount, setCustomCreditAmount] = useState<number>(50);

  useEffect(() => {
    const handleUpdate = () => {
      setUsers(AdminStore.getUsers());
    };
    window.addEventListener(REALTIME_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleAdjustCredits = (userId: string, delta: number) => {
    const updated = AdminStore.adjustUserCredits(userId, delta);
    setUsers([...updated]);
    const target = updated.find((u) => u.id === userId);
    toast.success(
      `${delta > 0 ? "Added" : "Deducted"} ${Math.abs(delta)} credits for ${target?.name}. New balance: ${target?.credits}`
    );
  };

  const handleToggleRestriction = (userId: string) => {
    const updated = AdminStore.toggleUserRestriction(userId);
    setUsers([...updated]);
    const target = updated.find((u) => u.id === userId);
    if (target?.status === "restricted") {
      toast.warning(`Account for ${target.name} has been RESTRICTED.`);
    } else {
      toast.success(`Account for ${target?.name} is now ACTIVE.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.ip.includes(search) ||
      u.location.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = planFilter === "all" || u.plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">Logged Users Directory</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage user balances, allocate credits, and manage account restrictions.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-bold text-zinc-300">
            {filteredUsers.length} Users Listed
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#121216] p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, IP or city…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs font-medium text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Plan Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "free", "lite", "pro", "enterprise"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition-all ${
                planFilter === p
                  ? "bg-orange-500 text-white shadow-md"
                  : "border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#121216] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[0.02] font-display text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan & Status</th>
              <th className="px-6 py-4">Credits Balance</th>
              <th className="px-6 py-4">Total Processed</th>
              <th className="px-6 py-4">IP & Location</th>
              <th className="px-6 py-4">Registered</th>
              <th className="px-6 py-4 text-right">Credit & Status Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium text-zinc-300">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  No users found matching your search filters.
                </td>
              </tr>
            ) : null}

            {filteredUsers.map((u) => {
              const isRestricted = u.status === "restricted";

              return (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* User Profile */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 font-bold font-display text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm leading-none">{u.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-1">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan & Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          u.plan === "enterprise"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : u.plan === "pro"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : u.plan === "lite"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {u.plan}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isRestricted
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  </td>

                  {/* Credits */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-display text-base font-extrabold text-white">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>{u.credits}</span>
                    </div>
                  </td>

                  {/* Total Processed */}
                  <td className="px-6 py-4 font-semibold text-zinc-300">
                    {u.totalProcessed.toLocaleString()} images
                  </td>

                  {/* IP & Location */}
                  <td className="px-6 py-4">
                    <div className="text-[11px]">
                      <p className="font-semibold text-zinc-200 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-zinc-500" /> {u.location}
                      </p>
                      <p className="text-zinc-500 mt-0.5 font-mono">{u.ip}</p>
                    </div>
                  </td>

                  {/* Registered & Last Active */}
                  <td className="px-6 py-4 text-[11px] text-zinc-400">
                    <p>{u.registeredAt}</p>
                    <p className="text-zinc-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {u.lastActive}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Add +10 Credits */}
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(u.id, 10)}
                        title="Add 10 Credits"
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>

                      {/* Deduct -5 Credits */}
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(u.id, -5)}
                        title="Deduct 5 Credits"
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      {/* Add +100 Credits */}
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(u.id, 100)}
                        title="Add 100 Credits Bonus"
                        className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        +100
                      </button>

                      {/* Restrict / Unban Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRestriction(u.id)}
                        title={isRestricted ? "Unban Account" : "Restrict Account"}
                        className={`rounded-lg border p-1.5 transition-colors ${
                          isRestricted
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                            : "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                        }`}
                      >
                        {isRestricted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
