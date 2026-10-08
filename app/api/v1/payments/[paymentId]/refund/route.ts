import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/security/keys";
import { refundPayment } from "@/lib/payments/service";

export async function POST(
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
    const body = await req.json().catch(() => ({}));

    const refund = await refundPayment({
      paymentId,
      merchantId: apiKey.merchantId,
      reason: body.reason || "Merchant API Refund",
    });

    return NextResponse.json({
      success: true,
      payment_id: refund.id,
      status: refund.status,
      amount: Number(refund.amount),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
