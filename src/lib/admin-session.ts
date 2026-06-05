// Client-only admin session helper. Stores credentials locally; server fns verify them before admin actions.
const KEY = "autoluxe.admin.credentials";
const LEGACY_KEY = "autoluxe.admin.pwd";

export type AdminCredentials = { username: string; password: string };

export function getAdminCredentials(): AdminCredentials | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AdminCredentials;
      if (parsed.username && parsed.password) return parsed;
    } catch {
      localStorage.removeItem(KEY);
    }
  }
  const legacyPassword = localStorage.getItem(LEGACY_KEY);
  return legacyPassword ? { username: "acer", password: legacyPassword } : null;
}

export function setAdminCredentials(credentials: AdminCredentials) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(credentials));
  localStorage.removeItem(LEGACY_KEY);
}

export function getAdminPassword(): string | null {
  return getAdminCredentials()?.password ?? null;
}

export function setAdminPassword(pwd: string) {
  if (typeof window === "undefined") return;
  setAdminCredentials({ username: "acer", password: pwd });
}

export function clearAdminPassword() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY_KEY);
}
