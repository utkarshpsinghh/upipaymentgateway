import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { Environment } from "@prisma/client";

export function generateApiKey(
  environment: Environment = "TEST",
  type: "SECRET" | "PUBLIC" = "SECRET"
) {
  const prefix =
    type === "SECRET"
      ? environment === "LIVE"
        ? "sk_live_"
        : "sk_test_"
      : environment === "LIVE"
      ? "pk_live_"
      : "pk_test_";

  const randomBytes = crypto.randomBytes(24).toString("hex");
  const fullKey = `${prefix}${randomBytes}`;
  const keyHash = hashKey(fullKey);
  const maskedKey = `${prefix}...${randomBytes.slice(-4)}`;

  return {
    fullKey, // Only returned once on generation
    prefix,
    keyHash,
    maskedKey,
    environment,
    type,
  };
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function verifyApiKey(rawKey: string) {
  if (!rawKey || typeof rawKey !== "string") {
    return null;
  }

  const prefixMatch = rawKey.match(/^(sk_test_|sk_live_|pk_test_|pk_live_)/);
  if (!prefixMatch) {
    return null;
  }

  const keyHash = hashKey(rawKey);

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
    },
    include: {
      merchant: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Update lastUsedAt asynchronously
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => console.error("Failed to update apiKey lastUsedAt:", err));

  return apiKey;
}
