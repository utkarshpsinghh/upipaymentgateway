import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getPaymentProvider } from "@/lib/providers";
import { recordPaymentSuccessLedger, recordRefundLedgerDebit } from "@/lib/ledger";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { recordAuditLog } from "@/lib/security/audit";
import { Environment, PaymentStatus, Prisma } from "@prisma/client";

export interface CreatePaymentParams {
  merchantId: string;
  merchantOrderId: string;
  amount: number;
  currency: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  environment?: Environment;
  idempotencyKey?: string;
  paymentLinkId?: string;
  paymentPageId?: string;
}

export async function createPayment(params: CreatePaymentParams) {
  const environment = params.environment || "TEST";

  // Check merchant status
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
  });

  if (!merchant) {
    throw new Error("MERCHANT_NOT_FOUND");
  }

  if (merchant.status !== "APPROVED") {
    throw new Error(`MERCHANT_NOT_APPROVED: Merchant account status is ${merchant.status}. Only APPROVED merchants can accept payments.`);
  }

  // Idempotency check
  if (params.idempotencyKey) {
    const existing = await prisma.idempotencyRecord.findUnique({
      where: {
        merchantId_key_environment: {
          merchantId: params.merchantId,
          key: params.idempotencyKey,
          environment,
        },
      },
    });

    if (existing) {
      return existing.responseBody as any;
    }
  }

  // Generate unique payment ID formatted as pay_xxxxxxxxxxxx
  const paymentId = `pay_${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`;

  // Standard fee model: 2% platform fee + 18% GST on fee
  const feeRate = 0.02;
  const baseFee = Number((params.amount * feeRate).toFixed(2));
  const tax = Number((baseFee * 0.18).toFixed(2));
  const totalFee = Number((baseFee + tax).toFixed(2));
  const netAmount = Number((params.amount - totalFee).toFixed(2));

  // Initialize Provider (MockUPIProvider for MVP)
  const provider = getPaymentProvider("MockUPIProvider");
  const providerResult = await provider.createPayment({
    paymentId,
    merchantOrderId: params.merchantOrderId,
    amount: params.amount,
    currency: params.currency || "INR",
    description: params.description,
    customer: params.customer,
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      legalName: merchant.legalName,
    },
    environment,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const paymentUrl = `${baseUrl}/pay/${paymentId}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  // Save to database
  const payment = await prisma.payment.create({
    data: {
      id: paymentId,
      merchantId: merchant.id,
      merchantOrderId: params.merchantOrderId,
      amount: new Prisma.Decimal(params.amount),
      currency: params.currency || "INR",
      status: "PENDING",
      environment,
      customerName: params.customer?.name,
      customerEmail: params.customer?.email,
      customerPhone: params.customer?.phone,
      description: params.description,
      paymentProvider: provider.name,
      providerPaymentId: providerResult.providerPaymentId,
      paymentMethod: "UPI_QR",
      fee: new Prisma.Decimal(totalFee),
      tax: new Prisma.Decimal(tax),
      netAmount: new Prisma.Decimal(netAmount),
      idempotencyKey: params.idempotencyKey,
      paymentLinkId: params.paymentLinkId,
      paymentPageId: params.paymentPageId,
      expiresAt,
      events: {
        create: {
          eventType: "PAYMENT_CREATED",
          payload: {
            amount: params.amount,
            currency: params.currency || "INR",
            environment,
            providerPaymentId: providerResult.providerPaymentId,
          },
        },
      },
    },
  });

  const responsePayload = {
    payment_id: payment.id,
    merchant_order_id: payment.merchantOrderId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    payment_url: paymentUrl,
    environment: payment.environment,
    qr_payload: providerResult.qrPayload,
    expires_at: payment.expiresAt?.toISOString(),
    created_at: payment.createdAt.toISOString(),
  };

  // Save idempotency record if key was provided
  if (params.idempotencyKey) {
    await prisma.idempotencyRecord.create({
      data: {
        merchantId: params.merchantId,
        key: params.idempotencyKey,
        environment,
        responseStatus: 201,
        responseBody: responsePayload as any,
      },
    });
  }

  // Audit log
  recordAuditLog({
    actor: merchant.email,
    actorRole: "MERCHANT",
    action: "PAYMENT_CREATED",
    entity: "PAYMENT",
    entityId: payment.id,
    newValue: {
      amount: params.amount,
      merchantOrderId: params.merchantOrderId,
      environment,
    },
  });

  // Webhook dispatch
  dispatchWebhook({
    merchantId: merchant.id,
    event: "payment.created",
    payloadData: {
      id: payment.id,
      merchant_order_id: payment.merchantOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
    },
    isTestMode: environment === "TEST",
  });

  return responsePayload;
}

/**
 * Handles test simulation or provider callback for payment completion/failure.
 */
export async function updatePaymentStatus(params: {
  paymentId: string;
  targetStatus: "SUCCESS" | "FAILED";
  upiVpa?: string;
  rrn?: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { merchant: true },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status === "SUCCESS") {
    return payment; // Already settled
  }

  if (payment.status !== "PENDING" && payment.status !== "CREATED") {
    throw new Error(`Cannot transition payment from ${payment.status} to ${params.targetStatus}`);
  }

  const generatedRrn = params.rrn || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

  if (params.targetStatus === "SUCCESS") {
    // 1. Update Payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        rrn: generatedRrn,
        upiVpa: params.upiVpa || "customer@upi",
        events: {
          create: {
            eventType: "PAYMENT_SUCCESS",
            payload: {
              rrn: generatedRrn,
              vpa: params.upiVpa || "customer@upi",
              timestamp: new Date().toISOString(),
            },
          },
        },
      },
    });

    // 2. Increment PaymentLink count if applicable
    if (payment.paymentLinkId) {
      await prisma.paymentLink.update({
        where: { id: payment.paymentLinkId },
        data: { paymentCount: { increment: 1 } },
      });
    }

    // 3. Record Double-Entry Ledger records
    await recordPaymentSuccessLedger({
      merchantId: payment.merchantId,
      paymentId: payment.id,
      amount: payment.amount,
      fee: payment.fee,
      environment: payment.environment,
    });

    // 4. Audit Log
    recordAuditLog({
      actor: "PAYMENT_GATEWAY",
      actorRole: "SYSTEM",
      action: "PAYMENT_STATUS_CHANGED",
      entity: "PAYMENT",
      entityId: payment.id,
      oldValue: { status: payment.status },
      newValue: { status: "SUCCESS", rrn: generatedRrn },
    });

    // 5. Webhook dispatch
    dispatchWebhook({
      merchantId: payment.merchantId,
      event: "payment.success",
      payloadData: {
        id: payment.id,
        merchant_order_id: payment.merchantOrderId,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: "SUCCESS",
        rrn: generatedRrn,
      },
      isTestMode: payment.environment === "TEST",
    });

    return updatedPayment;
  } else {
    // Handle FAILED
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        events: {
          create: {
            eventType: "PAYMENT_FAILED",
            payload: {
              reason: "Payment declined by customer or bank simulator",
              timestamp: new Date().toISOString(),
            },
          },
        },
      },
    });

    // Webhook dispatch
    dispatchWebhook({
      merchantId: payment.merchantId,
      event: "payment.failed",
      payloadData: {
        id: payment.id,
        merchant_order_id: payment.merchantOrderId,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: "FAILED",
      },
      isTestMode: payment.environment === "TEST",
    });

    return updatedPayment;
  }
}

/**
 * Refund a successful payment.
 */
export async function refundPayment(params: {
  paymentId: string;
  merchantId: string;
  reason?: string;
}) {
  const payment = await prisma.payment.findFirst({
    where: {
      id: params.paymentId,
      merchantId: params.merchantId,
    },
  });

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status !== "SUCCESS") {
    throw new Error(`Only successful payments can be refunded. Current status: ${payment.status}`);
  }

  const provider = getPaymentProvider(payment.paymentProvider);
  const refundResult = await provider.refundPayment({
    paymentId: payment.id,
    providerPaymentId: payment.providerPaymentId || payment.id,
    amount: Number(payment.amount),
    reason: params.reason,
    environment: payment.environment,
  });

  // Update payment status
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "REFUNDED",
      events: {
        create: {
          eventType: "PAYMENT_REFUNDED",
          payload: {
            refundId: refundResult.refundId,
            reason: params.reason,
            amount: Number(payment.amount),
          },
        },
      },
    },
  });

  // Debit ledger for refund
  await recordRefundLedgerDebit({
    merchantId: payment.merchantId,
    paymentId: payment.id,
    amount: payment.amount,
    environment: payment.environment,
    description: `Refund for payment ${payment.id}: ${params.reason || "Customer requested"}`,
  });

  // Audit log
  recordAuditLog({
    actor: params.merchantId,
    actorRole: "MERCHANT",
    action: "PAYMENT_REFUNDED",
    entity: "PAYMENT",
    entityId: payment.id,
    newValue: { status: "REFUNDED", refundId: refundResult.refundId },
  });

  // Dispatch webhook
  dispatchWebhook({
    merchantId: payment.merchantId,
    event: "payment.refunded",
    payloadData: {
      id: payment.id,
      merchant_order_id: payment.merchantOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: "REFUNDED",
      refund_id: refundResult.refundId,
    },
    isTestMode: payment.environment === "TEST",
  });

  return updated;
}
