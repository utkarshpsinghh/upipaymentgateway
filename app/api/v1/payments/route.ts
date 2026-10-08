import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/security/keys";
import { CreatePaymentApiSchema } from "@/lib/validation";
import { createPayment } from "@/lib/payments/service";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate with Bearer API Key
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Missing or malformed Authorization header. Expected 'Bearer sk_test_...' or 'Bearer sk_live_...'",
        },
        { status: 401 }
      );
    }

    const rawKey = authHeader.replace("Bearer ", "").trim();
    const apiKey = await verifyApiKey(rawKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or revoked API key" },
        { status: 401 }
      );
    }

    // 2. Validate merchant approval status
    if (apiKey.merchant.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: "MerchantNotApproved",
          message: `Merchant account is currently ${apiKey.merchant.status}. Only APPROVED merchants can process payments.`,
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = CreatePaymentApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const idempotencyKey = req.headers.get("idempotency-key") || undefined;

    // 4. Create Payment
    const paymentResult = await createPayment({
      merchantId: apiKey.merchantId,
      merchantOrderId: parsed.data.merchant_order_id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      description: parsed.data.description,
      customer: parsed.data.customer,
      environment: apiKey.environment,
      idempotencyKey,
    });

    return NextResponse.json(paymentResult, { status: 201 });
  } catch (error: any) {
    console.error("API v1 createPayment error:", error);
    return NextResponse.json(
      { error: "PaymentError", message: error.message || "Failed to process payment request" },
      { status: error.message?.includes("MERCHANT_NOT_APPROVED") ? 403 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawKey = authHeader.replace("Bearer ", "").trim();
    const apiKey = await verifyApiKey(rawKey);

    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const status = searchParams.get("status") || undefined;

    const payments = await prisma.payment.findMany({
      where: {
        merchantId: apiKey.merchantId,
        environment: apiKey.environment,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        merchantOrderId: true,
        amount: true,
        currency: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        description: true,
        rrn: true,
        environment: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      data: payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
      count: payments.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
