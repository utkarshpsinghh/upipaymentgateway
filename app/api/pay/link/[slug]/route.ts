import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const link = await prisma.paymentLink.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: slug },
          { slug: { equals: decodedSlug, mode: "insensitive" } },
        ],
      },
      include: {
        merchant: {
          select: {
            businessName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
    }

    const isExpired = link.expiresAt ? new Date() > link.expiresAt : false;
    const isLimitReached = link.maxPayments ? link.paymentCount >= link.maxPayments : false;
    const isInactive = link.status !== "ACTIVE" || isExpired || isLimitReached;

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        slug: link.slug,
        title: link.title,
        description: link.description,
        amount: Number(link.amount),
        currency: link.currency,
        status: link.status,
        isExpired,
        isLimitReached,
        isInactive,
        customerNameRequired: link.customerNameRequired,
        customerPhoneRequired: link.customerPhoneRequired,
        customerEmailRequired: link.customerEmailRequired,
        merchant: link.merchant,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payment link via API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
