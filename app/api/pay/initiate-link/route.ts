import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createPayment } from "@/lib/payments/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { linkSlug, pageSlug, customAmount, customer } = body;

    if (linkSlug) {
      const link = await prisma.paymentLink.findUnique({
        where: { slug: linkSlug },
        include: { merchant: true },
      });

      if (!link) {
        return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
      }

      if (link.status !== "ACTIVE") {
        return NextResponse.json({ error: "This payment link is no longer active" }, { status: 400 });
      }

      if (link.maxPayments && link.paymentCount >= link.maxPayments) {
        return NextResponse.json({ error: "This payment link has reached its payment limit" }, { status: 400 });
      }

      if (link.expiresAt && new Date() > link.expiresAt) {
        return NextResponse.json({ error: "This payment link has expired" }, { status: 400 });
      }

      const orderId = `ORD_LINK_${Date.now().toString(36)}`;

      const payment = await createPayment({
        merchantId: link.merchantId,
        merchantOrderId: orderId,
        amount: Number(link.amount),
        currency: link.currency,
        description: link.title,
        customer,
        paymentLinkId: link.id,
        environment: link.environment,
      });

      return NextResponse.json({ success: true, paymentUrl: payment.payment_url });
    }

    if (pageSlug) {
      const page = await prisma.paymentPage.findUnique({
        where: { slug: pageSlug },
        include: { merchant: true },
      });

      if (!page) {
        return NextResponse.json({ error: "Payment page not found" }, { status: 404 });
      }

      if (page.status !== "ACTIVE") {
        return NextResponse.json({ error: "This payment page is inactive" }, { status: 400 });
      }

      const finalAmount = page.amountMode === "FIXED" ? Number(page.fixedAmount) : Number(customAmount);

      if (!finalAmount || finalAmount <= 0) {
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
      }

      const orderId = `ORD_PAGE_${Date.now().toString(36)}`;

      const payment = await createPayment({
        merchantId: page.merchantId,
        merchantOrderId: orderId,
        amount: finalAmount,
        currency: "INR",
        description: page.title,
        customer,
        paymentPageId: page.id,
        environment: page.environment,
      });

      return NextResponse.json({ success: true, paymentUrl: payment.payment_url });
    }

    return NextResponse.json({ error: "Missing link or page identifier" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
