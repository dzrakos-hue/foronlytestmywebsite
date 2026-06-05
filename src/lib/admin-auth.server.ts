// Server-only admin credentials. NEVER import from client code.
export const ADMIN_USERNAME = "acer";
export const ADMIN_PASSWORD = "789456123";

export function verifyAdminPassword(password: string | undefined | null) {
  if (!password || password !== ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }
}
