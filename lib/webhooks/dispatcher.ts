import { prisma } from "@/lib/db/prisma";
import { computeWebhookSignature } from "@/lib/security/signature";

export interface WebhookEventPayload {
  event:
    | "payment.created"
    | "payment.pending"
    | "payment.success"
    | "payment.failed"
    | "payment.expired"
    | "payment.refunded"
    | "settlement.completed";
  data: Record<string, unknown>;
  timestamp: string;
}

export async function dispatchWebhook(params: {
  merchantId: string;
  event: WebhookEventPayload["event"];
  payloadData: Record<string, unknown>;
  isTestMode?: boolean;
}) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
    select: {
      webhookUrl: true,
      webhookSecret: true,
      testWebhookUrl: true,
      testWebhookSecret: true,
    },
  });

  if (!merchant) return;

  const url = params.isTestMode
    ? merchant.testWebhookUrl || merchant.webhookUrl
    : merchant.webhookUrl;

  const secret = params.isTestMode
    ? merchant.testWebhookSecret || merchant.webhookSecret
    : merchant.webhookSecret;

  if (!url || !secret) {
    // Merchant has not configured a webhook URL or secret yet
    return;
  }

  const timestampIso = new Date().toISOString();
  const timestampUnix = Math.floor(Date.now() / 1000);

  const payload: WebhookEventPayload = {
    event: params.event,
    data: params.payloadData,
    timestamp: timestampIso,
  };

  const payloadString = JSON.stringify(payload);
  const signature = computeWebhookSignature(payloadString, secret, timestampUnix);

  // Create initial delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      merchantId: params.merchantId,
      event: params.event,
      url,
      payload: payload as any,
      signature: `t=${timestampUnix},v1=${signature}`,
      status: "PENDING",
      attempts: 1,
    },
  });

  // Attempt async delivery
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Signature": `t=${timestampUnix},v1=${signature}`,
        "X-Gateway-Timestamp": timestampUnix.toString(),
        "User-Agent": "BharatUPI-Webhook/1.0",
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await response.text().catch(() => "");
    const isSuccess = response.ok;

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: isSuccess ? "SUCCESS" : "FAILED",
        statusCode: response.status,
        responseBody: responseText.slice(0, 1000), // Cap response size
      },
    });
  } catch (error: any) {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "FAILED",
        responseBody: error?.message || "Connection refused or timed out",
      },
    });
  }
}
