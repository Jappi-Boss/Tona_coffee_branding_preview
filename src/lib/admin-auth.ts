import { createInternalNeonAuth } from "@neondatabase/auth";

export const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth";

export const adminAuth = createInternalNeonAuth(NEON_AUTH_URL);

export async function getAdminToken() {
  const token = await adminAuth.getJWTToken();
  if (!token)
    throw new Error("Your admin session has expired. Please sign in again.");
  return token;
}
