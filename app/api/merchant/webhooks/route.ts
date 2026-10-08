import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { generateWebhookSecret } from "@/lib/security/signature";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { recordAuditLog } from "@/lib/security/audit";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: {
      webhookUrl: true,
      webhookSecret: true,
      testWebhookUrl: true,
      testWebhookSecret: true,
    },
  });

  const deliveries = await prisma.webhookDelivery.findMany({
    where: { merchantId: session.merchantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    config: merchant,
    recentDeliveries: deliveries,
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.action === "TEST_PING") {
    // Send a test ping webhook
    await dispatchWebhook({
      merchantId: session.merchantId,
      event: "payment.created",
      payloadData: {
        id: "pay_test_ping_12345",
        merchant_order_id: "PING_TEST_ORDER",
        amount: 1.0,
        currency: "INR",
        status: "PENDING",
        note: "Webhook delivery test ping from Developer console",
      },
      isTestMode: true,
    });

    return NextResponse.json({ success: true, message: "Test webhook dispatched" });
  }

  // Update webhook URLs or secrets
  const data: Record<string, string> = {};
  if (body.testWebhookUrl !== undefined) data.testWebhookUrl = body.testWebhookUrl;
  if (body.webhookUrl !== undefined) data.webhookUrl = body.webhookUrl;

  if (body.regenerateTestSecret) {
    data.testWebhookSecret = generateWebhookSecret();
  }
  if (body.regenerateLiveSecret) {
    data.webhookSecret = generateWebhookSecret();
  }

  const updated = await prisma.merchant.update({
    where: { id: session.merchantId },
    data,
    select: {
      webhookUrl: true,
      webhookSecret: true,
      testWebhookUrl: true,
      testWebhookSecret: true,
    },
  });

  recordAuditLog({
    actor: session.email,
    actorRole: "MERCHANT",
    action: "WEBHOOK_CONFIG_UPDATED",
    entity: "WEBHOOK",
    entityId: session.merchantId,
  });

  return NextResponse.json({ success: true, config: updated });
}
