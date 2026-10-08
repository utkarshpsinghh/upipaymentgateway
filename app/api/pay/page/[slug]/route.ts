import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const page = await prisma.paymentPage.findFirst({
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

    if (!page) {
      return NextResponse.json({ error: "Payment page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        description: page.description,
        brandName: page.brandName,
        logoUrl: page.logoUrl,
        amountMode: page.amountMode,
        fixedAmount: page.fixedAmount ? Number(page.fixedAmount) : null,
        status: page.status,
        merchant: page.merchant,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payment page via API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
