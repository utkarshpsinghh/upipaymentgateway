import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/security/keys";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
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

    const { paymentId } = await params;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        merchantId: apiKey.merchantId,
      },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          select: { eventType: true, createdAt: true, payload: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      payment_id: payment.id,
      merchant_order_id: payment.merchantOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      customer: {
        name: payment.customerName,
        email: payment.customerEmail,
        phone: payment.customerPhone,
      },
      description: payment.description,
      rrn: payment.rrn,
      payment_url: `${baseUrl}/pay/${payment.id}`,
      environment: payment.environment,
      events: payment.events,
      created_at: payment.createdAt.toISOString(),
      updated_at: payment.updatedAt.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
