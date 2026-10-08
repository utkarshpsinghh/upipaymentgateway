import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatus } from "@/lib/payments/service";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const body = await req.json().catch(() => ({}));
    const targetStatus = body.status === "FAILED" ? "FAILED" : "SUCCESS";
    const upiVpa = body.upiVpa || "payer@okaxis";

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.environment === "LIVE") {
      return NextResponse.json(
        {
          error: "ComplianceViolation",
          message: "Simulated completion is strictly forbidden for LIVE transactions. Authorised banking/PSP callback required.",
        },
        { status: 403 }
      );
    }

    const updated = await updatePaymentStatus({
      paymentId: payment.id,
      targetStatus,
      upiVpa,
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      rrn: updated.rrn,
      paymentId: updated.id,
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
