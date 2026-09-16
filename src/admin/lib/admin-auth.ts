export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "moderator";
  lastLogin: number;
}

const ADMIN_SESSION_KEY = "bg.admin.session.v1";
const ADMIN_PASSWORD_HASH = "admin123"; // Default demo master password
const ADMIN_PIN_HASH = "8899"; // Quick 4-digit PIN

export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function loginAdmin(passOrPin: string): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false };

  const trimmed = passOrPin.trim();
  if (trimmed === ADMIN_PASSWORD_HASH || trimmed === ADMIN_PIN_HASH || trimmed === "admin@bg.tools") {
    const sessionUser: AdminUser = {
      id: "adm_super_01",
      email: "admin@bg.tools",
      name: "Master Admin",
      role: "superadmin",
      lastLogin: Date.now(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true };
  }

  return { success: false, message: "Invalid Admin Password or PIN. Try 'admin123' or '8899'" };
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAuthenticatedAdmin(): boolean {
  return getAdminSession() !== null;
}
