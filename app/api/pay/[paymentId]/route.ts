import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        merchant: {
          select: {
            businessName: true,
            legalName: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Build UPI Payload
    const cleanMerchant = payment.merchant.businessName.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 25);
    const cleanDesc = (payment.description || "Order Payment").slice(0, 25);
    const amountStr = Number(payment.amount).toFixed(2);
    
    // Standard UPI URI format (TEST)
    const upiUri = `upi://pay?pa=test-merchant@bharatupi&pn=${encodeURIComponent(
      cleanMerchant
    )}&am=${amountStr}&cu=INR&tr=${payment.id}&tn=${encodeURIComponent(cleanDesc)}&mc=5411`;

    // Generate base64 Data URL for QR Code
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(upiUri, {
        margin: 2,
        width: 280,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
    } catch (e) {
      console.error("QR Code generation error:", e);
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        merchantOrderId: payment.merchantOrderId,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        customerPhone: payment.customerPhone,
        merchantName: payment.merchant.businessName,
        environment: payment.environment,
        rrn: payment.rrn,
        upiUri,
        qrDataUrl,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
