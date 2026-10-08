import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CreatePaymentPageSchema } from "@/lib/validation";
import { recordAuditLog } from "@/lib/security/audit";
import { Prisma } from "@prisma/client";

function generateSlug(title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 20);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${clean}-${randomSuffix}`;
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.paymentPage.findMany({
    where: { merchantId: session.merchantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { payments: true },
      },
    },
  });

  return NextResponse.json({
    pages: pages.map((p) => ({
      ...p,
      fixedAmount: p.fixedAmount ? Number(p.fixedAmount) : null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreatePaymentPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = generateSlug(data.title);

  const page = await prisma.paymentPage.create({
    data: {
      merchantId: session.merchantId,
      slug,
      title: data.title,
      description: data.description,
      logoUrl: data.logoUrl || null,
      brandName: data.brandName || null,
      amountMode: data.amountMode,
      fixedAmount: data.fixedAmount ? new Prisma.Decimal(data.fixedAmount) : null,
      successRedirectUrl: data.successRedirectUrl || null,
      failureRedirectUrl: data.failureRedirectUrl || null,
      environment: "TEST",
    },
  });

  recordAuditLog({
    actor: session.email,
    actorRole: "MERCHANT",
    action: "PAYMENT_PAGE_CREATED",
    entity: "PAYMENT_PAGE",
    entityId: page.id,
    newValue: { slug, title: data.title, amountMode: data.amountMode },
  });

  return NextResponse.json({
    success: true,
    page: {
      ...page,
      fixedAmount: page.fixedAmount ? Number(page.fixedAmount) : null,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/page/${page.slug}`,
    },
  }, { status: 201 });
}
