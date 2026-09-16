import { AdminStore, type LoggedUser } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "lite" | "pro" | "enterprise";
  credits: number;
  totalProcessed: number;
  registeredAt: string;
  token: string;
}

const USER_SESSION_KEY = "bg.auth.user.session.v1";

export const AuthUser = {
  getCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  },

  signUp(name: string, email: string): CurrentUser {
    const now = new Date().toISOString().slice(0, 10);
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const user: CurrentUser = {
      id,
      name: name.trim() || "Creative User",
      email: email.trim().toLowerCase(),
      plan: "free",
      credits: 10, // 10 Free Daily credits
      totalProcessed: 0,
      registeredAt: now,
      token: `tok_${Math.random().toString(36).slice(2, 12)}`,
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

    // Sync to Admin Store Real Users List
    const adminUsers = AdminStore.getUsers();
    const existingIdx = adminUsers.findIndex((u) => u.email.toLowerCase() === user.email);
    const adminUserEntry: LoggedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      credits: user.credits,
      totalProcessed: user.totalProcessed,
      status: "active",
      location: Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Client",
      ip: "127.0.0.1 (Local Client)",
      registeredAt: user.registeredAt,
      lastActive: "Just now",
    };

    if (existingIdx >= 0) {
      adminUsers[existingIdx] = adminUserEntry;
    } else {
      adminUsers.unshift(adminUserEntry);
    }
    AdminStore.saveUsers(adminUsers);

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_registered", user } }));
    return user;
  },

  login(email: string, name?: string): CurrentUser {
    const existing = AdminStore.getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const now = new Date().toISOString().slice(0, 10);

    const user: CurrentUser = {
      id: existing?.id || `usr_${Date.now().toString(36)}`,
      name: existing?.name || name || email.split("@")[0] || "Creative User",
      email: email.trim().toLowerCase(),
      plan: existing?.plan || "free",
      credits: existing?.credits ?? 10,
      totalProcessed: existing?.totalProcessed ?? 0,
      registeredAt: existing?.registeredAt || now,
      token: `tok_${Math.random().toString(36).slice(2, 12)}`,
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

    // Update AdminStore last active
    const adminUsers = AdminStore.getUsers();
    const target = adminUsers.find((u) => u.email.toLowerCase() === user.email);
    if (target) {
      target.lastActive = "Just now";
      AdminStore.saveUsers(adminUsers);
    } else {
      this.signUp(user.name, user.email);
    }

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_login", user } }));
    return user;
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_logout" } }));
  },

  deductCredit(amount: number = 1): boolean {
    const current = this.getCurrentUser();
    if (!current) return true; // Guests can proceed with default allowance

    if (current.credits < amount) return false;

    current.credits -= amount;
    current.totalProcessed += 1;
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(current));

    // Sync to admin store
    const users = AdminStore.getUsers();
    const u = users.find((x) => x.id === current.id || x.email === current.email);
    if (u) {
      u.credits = current.credits;
      u.totalProcessed = current.totalProcessed;
      u.lastActive = "Just now";
      AdminStore.saveUsers(users);
    }

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "credit_deducted" } }));
    return true;
  },

  addPurchasedCredits(creditsAmount: number, planName: string, amountINR: number, paymentMethod: "UPI" | "Credit Card" | "Net Banking" | "PayPal" = "UPI") {
    let current = this.getCurrentUser();
    if (!current) {
      current = this.signUp("Studio Creator", "creator@bg.tools");
    }

    current.credits += creditsAmount;
    if (planName.toLowerCase().includes("pro")) current.plan = "pro";
    else if (planName.toLowerCase().includes("lite")) current.plan = "lite";
    else if (planName.toLowerCase().includes("enterprise")) current.plan = "enterprise";

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(current));

    // Record Real Purchase Transaction into AdminStore
    const txnId = `TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);

    const purchases = AdminStore.getPurchases();
    purchases.unshift({
      id: txnId,
      userId: current.id,
      userName: current.name,
      userEmail: current.email,
      type: planName.toLowerCase().includes("pack") ? "pack" : "subscription",
      planName,
      creditsPurchased: creditsAmount,
      amountINR,
      currency: "INR",
      status: "completed",
      paymentMethod,
      date: nowStr,
    });
    AdminStore.savePurchases(purchases);

    // Sync to user in admin store
    const users = AdminStore.getUsers();
    const u = users.find((x) => x.id === current?.id || x.email === current?.email);
    if (u) {
      u.credits = current.credits;
      u.plan = current.plan;
      u.lastActive = "Just now";
      AdminStore.saveUsers(users);
    }

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "purchase_completed", txnId } }));
    return txnId;
  },
};
