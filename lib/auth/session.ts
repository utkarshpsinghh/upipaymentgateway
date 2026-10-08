import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifySessionToken, TokenPayload } from "./jwt";
import { prisma } from "@/lib/db/prisma";

export const SESSION_COOKIE_NAME = "bharatpay_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<
  (TokenPayload & { merchantStatus?: string | null }) | null
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Check if merchant status is updated
    if (payload.merchantId) {
      const merchant = await prisma.merchant.findUnique({
        where: { id: payload.merchantId },
        select: { status: true },
      });
      return {
        ...payload,
        merchantStatus: merchant?.status || null,
      };
    }

    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return user;
}

export async function requireApprovedMerchant() {
  const user = await getCurrentUser();
  if (!user || user.role !== "MERCHANT" || !user.merchantId) {
    throw new Error("FORBIDDEN_MERCHANT_ONLY");
  }
  if (user.merchantStatus !== "APPROVED") {
    throw new Error("MERCHANT_NOT_APPROVED");
  }
  return user;
}
