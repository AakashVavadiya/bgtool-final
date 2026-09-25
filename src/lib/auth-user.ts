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

export interface AuthResult {
  success: boolean;
  user?: CurrentUser;
  error?: string;
}

export const AuthUser = {
  getCurrentUser(): CurrentUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_SESSION_KEY);
      if (!raw) {
        const users = AdminStore.getUsers();
        if (users.length > 0) {
          const active = users.find((u) => u.status === "active") || users[0];
          if (active) {
            const restored: CurrentUser = {
              id: active.id,
              name: active.name,
              email: active.email,
              plan: active.plan as any,
              credits: active.credits,
              totalProcessed: active.totalProcessed,
              registeredAt: active.registeredAt,
              token: `tok_${active.id}`,
            };
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(restored));
            return restored;
          }
        }
        return null;
      }
      const user = JSON.parse(raw) as CurrentUser;
      const users = AdminStore.getUsers();
      const fresh = users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (fresh && (fresh.credits !== user.credits || fresh.plan !== user.plan || fresh.name !== user.name)) {
        user.credits = fresh.credits;
        user.plan = fresh.plan as any;
        user.name = fresh.name;
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

    const now = new Date().toISOString().slice(0, 10);
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const user: CurrentUser = {
      id,
      name: cleanName,
      email: cleanEmail,
      plan: "free",
      credits: 10, // 10 Free Daily credits
      totalProcessed: 0,
      registeredAt: now,
      token: `tok_${Math.random().toString(36).slice(2, 12)}`,
    };

    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

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
      // Auto-set password on first login
      target.password = password;
    }

    target.lastActive = "Just now";
    AdminStore.saveUsers(adminUsers);

    const now = new Date().toISOString().slice(0, 10);
    const user: CurrentUser = {
      id: target.id,
      name: target.name,
      email: target.email,
      plan: target.plan,
      credits: target.credits,
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

  hasCredits(amount: number = 1): boolean {
    if (this.isUserRestricted()) return false;
    if (amount <= 0) return true;
    const current = this.getCurrentUser();
    if (!current) return true;
    return current.credits >= amount;
  },

  getCredits(): number {
    const current = this.getCurrentUser();
    return current ? current.credits : 10;
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
    if (!current) return true; // Guests can proceed with default allowance

    if (current.credits < amount) return false;

    // Handle decimal precision cleanly (e.g. 10 - 0.2 = 9.8)
    current.credits = Math.max(0, Math.round((current.credits - amount) * 100) / 100);
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
      const res = this.signUp("Studio Creator", "creator@bg.tools");
      current = res.user || null;
    }
    if (!current) return "";

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
