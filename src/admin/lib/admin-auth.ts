export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "moderator";
  lastLogin: number;
}

const ADMIN_SESSION_KEY = "bg.admin.session.v2";
const LEGACY_STORAGE_KEY = "bg.admin.session.v1";
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours validity

export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;

  // Clear any legacy persistent localStorage bypass
  try {
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminUser;

    // Check sliding session expiration
    if (Date.now() - session.lastLogin > SESSION_EXPIRY_MS) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function loginAdmin(
  identifierOrPass: string,
  optionalPassword?: string
): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false };

  const id = identifierOrPass.trim();
  const pass = optionalPassword ? optionalPassword.trim() : id;

  const validPasswords = ["admin123", "8899", "admin@2026"];
  const validIdentifiers = ["admin", "admin@bg.tools", "superadmin", ""];

  const isValidPass = validPasswords.includes(pass) || validPasswords.includes(id);
  const isValidId = optionalPassword ? validIdentifiers.includes(id.toLowerCase()) : true;

  if (isValidPass && isValidId) {
    const sessionUser: AdminUser = {
      id: "adm_super_01",
      email: id.includes("@") ? id : "admin@bg.tools",
      name: "Admin Control Center",
      role: "superadmin",
      lastLogin: Date.now(),
    };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true };
  }

  return {
    success: false,
    message: "Invalid admin credentials. Default credentials: User: 'admin' | Password: 'admin123' (or PIN: '8899')",
  };
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isAuthenticatedAdmin(): boolean {
  return getAdminSession() !== null;
}
