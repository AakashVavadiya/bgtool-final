import { AdminStore, type LoggedUser, getTodayDateString, ensureUserDailyCredits } from "@/admin/lib/admin-store";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "lite" | "pro" | "enterprise";
  credits: number;
  freeCredits?: number | undefined;
  paidCredits?: number | undefined;
  lastCreditReset?: string | undefined;
  totalProcessed: number;
  registeredAt: string;
  token: string;
}

const USER_SESSION_KEY = "bg.auth.user.session.v1";

export interface AuthResult {
  success: boolean;
  user?: CurrentUser;
  error?: string;
}

export function ensureCurrentUserDailyCredits(user: CurrentUser): boolean {
  const today = getTodayDateString();
  let changed = false;

  // Rule 1 & Rule 4: Daily 10 free credits reset every day; do not add 10 to remainder
  if (user.lastCreditReset !== today) {
    user.freeCredits = 10;
    if (typeof user.paidCredits !== "number") {
      user.paidCredits = Math.max(0, (user.credits || 0) > 10 ? Math.round(((user.credits || 0) - 10) * 100) / 100 : 0);
    }
    user.credits = Math.round((user.freeCredits + user.paidCredits) * 100) / 100;
    user.lastCreditReset = today;
    changed = true;
  } else {
    if (typeof user.freeCredits !== "number") {
      user.freeCredits = Math.min(10, user.credits ?? 10);
      user.paidCredits = Math.max(0, Math.round(((user.credits ?? 10) - user.freeCredits) * 100) / 100);
      user.credits = Math.round((user.freeCredits + user.paidCredits) * 100) / 100;
      changed = true;
    }
  }
  return changed;
}

export const AuthUser = {
  getCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") return null;
    try {
      const today = getTodayDateString();
      const raw = localStorage.getItem(USER_SESSION_KEY);
      let user: CurrentUser | null = null;

      if (!raw) {
        const users = AdminStore.getUsers();
        if (users.length > 0) {
          const active = users.find((u) => u.status === "active") || users[0];
          if (active) {
            ensureUserDailyCredits(active);
            user = {
              id: active.id,
              name: active.name,
              email: active.email,
              plan: active.plan as any,
              credits: active.credits,
              freeCredits: active.freeCredits ?? 10,
              paidCredits: active.paidCredits ?? 0,
              lastCreditReset: active.lastCreditReset ?? today,
              totalProcessed: active.totalProcessed,
              registeredAt: active.registeredAt,
              token: `tok_${active.id}`,
            };
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
            return user;
          }
        }
        return null;
      }

      user = JSON.parse(raw) as CurrentUser;
      let sessionUpdated = ensureCurrentUserDailyCredits(user);

      const users = AdminStore.getUsers();
      const fresh = users.find((u) => u.id === user?.id || u.email.toLowerCase() === user?.email.toLowerCase());
      if (fresh) {
        ensureUserDailyCredits(fresh);
        if (
          fresh.credits !== user.credits ||
          fresh.freeCredits !== user.freeCredits ||
          fresh.paidCredits !== user.paidCredits ||
          fresh.plan !== user.plan ||
          fresh.name !== user.name
        ) {
          user.credits = fresh.credits;
          user.freeCredits = fresh.freeCredits ?? user.freeCredits;
          user.paidCredits = fresh.paidCredits ?? user.paidCredits;
          user.lastCreditReset = fresh.lastCreditReset ?? user.lastCreditReset;
          user.plan = fresh.plan as any;
          user.name = fresh.name;
          sessionUpdated = true;
        }
      } else if (sessionUpdated) {
        // Sync updated state to admin users list if user exists
        const adminUsers = AdminStore.getUsers();
        const u = adminUsers.find((x) => x.id === user?.id || x.email === user?.email);
        if (u) {
          u.credits = user.credits;
          u.freeCredits = user.freeCredits;
          u.paidCredits = user.paidCredits;
          u.lastCreditReset = user.lastCreditReset;
          AdminStore.saveUsers(adminUsers);
        }
      }

      if (sessionUpdated) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      }

      return user;
    } catch {
      return null;
    }
  },

  isUserRestricted(email?: string): boolean {
    if (typeof window === "undefined") return false;
    const targetEmail = (email || this.getCurrentUser()?.email || "").trim().toLowerCase();
    if (!targetEmail) return false;
    const adminUsers = AdminStore.getUsers();
    const target = adminUsers.find((u) => u.email.toLowerCase() === targetEmail);
    return target?.status === "restricted" || target?.status === "banned";
  },

  signUp(name: string, email: string, password?: string): AuthResult {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split("@")[0] || "Creative User";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (password && password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const adminUsers = AdminStore.getUsers();
    const existing = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    const today = getTodayDateString();
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const user: CurrentUser = {
      id,
      name: cleanName,
      email: cleanEmail,
      plan: "free",
      credits: 10, // 10 Free Daily credits
      freeCredits: 10,
      paidCredits: 0,
      lastCreditReset: today,
      totalProcessed: 0,
      registeredAt: today,
      token: `tok_${Math.random().toString(36).slice(2, 12)}`,
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

    const adminUserEntry: LoggedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      credits: user.credits,
      freeCredits: user.freeCredits,
      paidCredits: user.paidCredits,
      lastCreditReset: user.lastCreditReset,
      totalProcessed: user.totalProcessed,
      status: "active",
      location: Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Client",
      ip: "127.0.0.1 (Local Client)",
      registeredAt: user.registeredAt,
      lastActive: "Just now",
      ...(password ? { password } : {}),
    };

    adminUsers.unshift(adminUserEntry);
    AdminStore.saveUsers(adminUsers);

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_registered", user } }));
    return { success: true, user };
  },

  login(email: string, password?: string): AuthResult {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const adminUsers = AdminStore.getUsers();
    const target = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!target) {
      return { success: false, error: "No account found with this email. Please sign up first." };
    }

    if (target.status === "restricted" || target.status === "banned") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bg:show_restricted_dialog"));
      }
      return { success: false, error: "You cannot use Bg. because you have violated our terms and conditions." };
    }

    // Verify password if user has one configured
    if (target.password && password) {
      if (target.password !== password) {
        return { success: false, error: "Incorrect password. Please verify and try again." };
      }
    } else if (password && !target.password) {
      target.password = password;
    }

    ensureUserDailyCredits(target);
    target.lastActive = "Just now";
    AdminStore.saveUsers(adminUsers);

    const now = new Date().toISOString().slice(0, 10);
    const user: CurrentUser = {
      id: target.id,
      name: target.name,
      email: target.email,
      plan: target.plan,
      credits: target.credits,
      freeCredits: target.freeCredits ?? 10,
      paidCredits: target.paidCredits ?? 0,
      lastCreditReset: target.lastCreditReset || getTodayDateString(),
      totalProcessed: target.totalProcessed,
      registeredAt: target.registeredAt || now,
      token: `tok_${Math.random().toString(36).slice(2, 12)}`,
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_login", user } }));
    return { success: true, user };
  },

  loginWithProvider(provider: "google" | "apple"): AuthResult {
    const isGoogle = provider === "google";
    const email = isGoogle ? "google.creator@gmail.com" : "apple.creator@icloud.com";
    const name = isGoogle ? "Google Creator" : "Apple Creator";

    const adminUsers = AdminStore.getUsers();
    let target = adminUsers.find((u) => u.email.toLowerCase() === email);

    if (!target) {
      return this.signUp(name, email, "social_oauth_verified_2026");
    }

    return this.login(email, target.password);
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_SESSION_KEY);
    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "user_logout" } }));
  },

  getGuestCredits(): number {
    if (typeof window === "undefined") return 10;
    try {
      const today = getTodayDateString();
      const lastReset = localStorage.getItem("bg.guest.creditDate.v1");
      if (lastReset !== today) {
        // Daily reset for guest
        localStorage.setItem("bg.guest.credits.v1", "10");
        localStorage.setItem("bg.guest.creditDate.v1", today);
        return 10;
      }
      const stored = localStorage.getItem("bg.guest.credits.v1");
      if (stored === null) {
        localStorage.setItem("bg.guest.credits.v1", "10");
        localStorage.setItem("bg.guest.creditDate.v1", today);
        return 10;
      }
      return parseFloat(stored) || 0;
    } catch {
      return 10;
    }
  },

  setGuestCredits(credits: number) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("bg.guest.credits.v1", String(Math.max(0, credits)));
    } catch {}
  },

  hasCredits(amount: number = 1): boolean {
    if (this.isUserRestricted()) return false;
    if (amount <= 0) return true;
    const current = this.getCurrentUser();
    if (!current) {
      return this.getGuestCredits() >= amount;
    }
    return current.credits >= amount;
  },

  getCredits(): number {
    const current = this.getCurrentUser();
    return current ? current.credits : this.getGuestCredits();
  },

  getFreeCredits(): number {
    const current = this.getCurrentUser();
    if (!current) return this.getGuestCredits();
    return typeof current.freeCredits === "number" ? current.freeCredits : 10;
  },

  getPaidCredits(): number {
    const current = this.getCurrentUser();
    if (!current) return 0;
    return typeof current.paidCredits === "number" ? current.paidCredits : 0;
  },

  // Token Aliases for Silver (Free) & Gold (Purchased) Tokens
  getSilverTokens(): number {
    return this.getFreeCredits();
  },

  getGoldTokens(): number {
    return this.getPaidCredits();
  },

  getTotalTokens(): number {
    return this.getCredits();
  },

  hasTokens(amount: number = 1): boolean {
    return this.hasCredits(amount);
  },

  deductToken(amount: number = 1): boolean {
    return this.deductCredit(amount);
  },

  deductCredit(amount: number = 1): boolean {
    if (this.isUserRestricted()) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bg:show_restricted_dialog"));
      }
      return false;
    }
    if (amount <= 0) return true; // Free tool execution
    const current = this.getCurrentUser();
    if (!current) {
      const guestCred = this.getGuestCredits();
      if (guestCred < amount) return false;
      const nextCred = Math.max(0, Math.round((guestCred - amount) * 100) / 100);
      this.setGuestCredits(nextCred);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "credit_deducted" } }));
      }
      return true;
    }

    if (current.credits < amount) return false;

    // Rule 2 : Deduct credit from Free Credit first
    // Rule 3 : When finish 10 Free credits, then use Paid Credit
    let remainingToDeduct = amount;
    let free = typeof current.freeCredits === "number" ? current.freeCredits : 0;
    let paid = typeof current.paidCredits === "number" ? current.paidCredits : 0;

    if (free >= remainingToDeduct) {
      free = Math.round((free - remainingToDeduct) * 100) / 100;
      remainingToDeduct = 0;
    } else {
      remainingToDeduct = Math.round((remainingToDeduct - free) * 100) / 100;
      free = 0;
      paid = Math.max(0, Math.round((paid - remainingToDeduct) * 100) / 100);
      remainingToDeduct = 0;
    }

    current.freeCredits = free;
    current.paidCredits = paid;
    current.credits = Math.round((free + paid) * 100) / 100;
    current.totalProcessed += 1;
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(current));

    // Sync to admin store
    const users = AdminStore.getUsers();
    const u = users.find((x) => x.id === current.id || x.email === current.email);
    if (u) {
      u.credits = current.credits;
      u.freeCredits = current.freeCredits;
      u.paidCredits = current.paidCredits;
      u.lastCreditReset = current.lastCreditReset;
      u.totalProcessed = current.totalProcessed;
      u.lastActive = "Just now";
      AdminStore.saveUsers(users);
    }

    window.dispatchEvent(
      new CustomEvent(REALTIME_EVENT_NAME, {
        detail: {
          type: "credit_deducted",
          amount,
          freeCredits: current.freeCredits,
          paidCredits: current.paidCredits,
          credits: current.credits,
        },
      })
    );
    return true;
  },

  addPurchasedCredits(
    creditsAmount: number,
    planName: string,
    amountINR: number,
    paymentMethod: "UPI" | "Credit Card" | "Net Banking" | "PayPal" = "UPI"
  ) {
    let current = this.getCurrentUser();
    if (!current) {
      const res = this.signUp("Studio Creator", "creator@bg.tools");
      current = res.user || null;
    }
    if (!current) return "";

    // Purchased credits go to paidCredits
    current.paidCredits = Math.round(((current.paidCredits || 0) + creditsAmount) * 100) / 100;
    current.credits = Math.round(((current.freeCredits || 0) + current.paidCredits) * 100) / 100;

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
      u.freeCredits = current.freeCredits;
      u.paidCredits = current.paidCredits;
      u.lastCreditReset = current.lastCreditReset;
      u.plan = current.plan;
      u.lastActive = "Just now";
      AdminStore.saveUsers(users);
    }

    window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "purchase_completed", txnId } }));
    return txnId;
  },

  addPurchasedTokens(
    tokensAmount: number,
    planName: string,
    amountINR: number,
    paymentMethod: "UPI" | "Credit Card" | "Net Banking" | "PayPal" = "UPI"
  ) {
    return this.addPurchasedCredits(tokensAmount, planName, amountINR, paymentMethod);
  },
};
