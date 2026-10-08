import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CreatePaymentLinkSchema } from "@/lib/validation";
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

  const links = await prisma.paymentLink.findMany({
    where: { merchantId: session.merchantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { payments: true },
      },
    },
  });

  return NextResponse.json({
    links: links.map((l) => ({
      ...l,
      amount: Number(l.amount),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreatePaymentLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, amount, expiresAt, maxPayments, customerNameRequired, customerPhoneRequired, customerEmailRequired } = parsed.data;

  const slug = generateSlug(title);

  const link = await prisma.paymentLink.create({
    data: {
      merchantId: session.merchantId,
      slug,
      title,
      description,
      amount: new Prisma.Decimal(amount),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxPayments: maxPayments || null,
      customerNameRequired,
      customerPhoneRequired,
      customerEmailRequired,
      environment: "TEST",
    },
  });

  recordAuditLog({
    actor: session.email,
    actorRole: "MERCHANT",
    action: "PAYMENT_LINK_CREATED",
    entity: "PAYMENT_LINK",
    entityId: link.id,
    newValue: { slug, title, amount },
  });

  return NextResponse.json({
    success: true,
    link: {
      ...link,
      amount: Number(link.amount),
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/l/${link.slug}`,
    },
  }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { linkId, status } = body;

  if (!linkId || !status) {
    return NextResponse.json({ error: "Missing linkId or status" }, { status: 400 });
  }

  const updated = await prisma.paymentLink.update({
    where: { id: linkId, merchantId: session.merchantId },
    data: { status },
  });

  return NextResponse.json({ success: true, link: updated });
}
