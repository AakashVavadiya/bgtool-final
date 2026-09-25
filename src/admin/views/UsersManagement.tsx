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
      (u.ip && u.ip.includes(search)) ||
      (u.location && u.location.toLowerCase().includes(search.toLowerCase()));

    const matchesPlan = planFilter === "all" || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Logged Users Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage real registered user accounts, allocate credits, and manage account statuses.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted/60 border border-border px-4 py-1.5 text-xs font-bold text-foreground">
            {filteredUsers.length} User{filteredUsers.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, IP or city…"
            className="w-full rounded-2xl border border-input bg-background/60 pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* Plan Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "free", "lite", "pro", "enterprise"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                planFilter === p
                  ? "bg-foreground text-background shadow-xs font-extrabold"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-semibold text-foreground text-sm">No registered users found</p>
            <p className="mt-1 text-[11px]">When users sign up or log in on the website, their accounts will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
              <tr>
                <th className="py-4 px-6">User & Profile</th>
                <th className="py-4 px-6">Current Plan</th>
                <th className="py-4 px-6">Credits Balance</th>
                <th className="py-4 px-6">Total Processed</th>
                <th className="py-4 px-6">Location & Last Active</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  {/* User Profile */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 font-bold text-accent">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs leading-snug">{u.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        u.plan === "enterprise"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : u.plan === "pro"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : u.plan === "lite"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>

                  {/* Credits */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 font-mono font-bold text-foreground">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>{u.credits.toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Total Processed */}
                  <td className="py-4 px-6 font-mono text-muted-foreground">
                    {u.totalProcessed.toLocaleString()} images
                  </td>

                  {/* Location & Last Active */}
                  <td className="py-4 px-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{u.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-mono">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{u.lastActive}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        u.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span>{u.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(u.id, 10)}
                        title="Add 10 Credits"
                        className="rounded-lg border border-border p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(u.id, -10)}
                        title="Deduct 10 Credits"
                        className="rounded-lg border border-border p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleRestriction(u.id)}
                        title={u.status === "active" ? "Restrict User" : "Activate User"}
                        className={`rounded-lg border p-1.5 transition-colors cursor-pointer ${
                          u.status === "active"
                            ? "border-border text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                            : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        }`}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
