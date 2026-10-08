import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { generateApiKey } from "@/lib/security/keys";
import { recordAuditLog } from "@/lib/security/audit";
import { CreateApiKeySchema } from "@/lib/validation";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { merchantId: session.merchantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      maskedKey: true,
      environment: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateApiKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  const { name, environment, type } = parsed.data;

  // Generate key
  const generated = generateApiKey(environment as any, type as any);

  const keyRecord = await prisma.apiKey.create({
    data: {
      merchantId: session.merchantId,
      name,
      keyPrefix: generated.prefix,
      keyHash: generated.keyHash,
      maskedKey: generated.maskedKey,
      environment: environment as any,
    },
  });

  recordAuditLog({
    actor: session.email,
    actorRole: "MERCHANT",
    action: "API_KEY_CREATED",
    entity: "API_KEY",
    entityId: keyRecord.id,
    newValue: {
      name,
      environment,
      maskedKey: generated.maskedKey,
    },
  });

  return NextResponse.json({
    success: true,
    key: {
      id: keyRecord.id,
      name: keyRecord.name,
      maskedKey: keyRecord.maskedKey,
      environment: keyRecord.environment,
      createdAt: keyRecord.createdAt,
    },
    // Raw key is ONLY shown once upon creation!
    fullKey: generated.fullKey,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Key ID required" }, { status: 400 });
  }

  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, merchantId: session.merchantId },
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  recordAuditLog({
    actor: session.email,
    actorRole: "MERCHANT",
    action: "API_KEY_REVOKED",
    entity: "API_KEY",
    entityId: keyId,
  });

  return NextResponse.json({ success: true, message: "API key revoked successfully" });
}
