import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createSettlement } from "@/lib/settlements/service";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const settlements = await prisma.settlement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchant: {
        select: {
          id: true,
          businessName: true,
          legalName: true,
          bankAccountNumber: true,
          bankIfsc: true,
          settlementUpiId: true,
        },
      },
    },
  });

  return NextResponse.json({
    settlements: settlements.map((s) => ({
      ...s,
      amount: Number(s.amount),
      grossAmount: Number(s.grossAmount),
      totalFees: Number(s.totalFees),
      totalRefunds: Number(s.totalRefunds),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { merchantId, amount, notes } = body;

  if (!merchantId) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  try {
    const settlement = await createSettlement({
      merchantId,
      amount: amount !== undefined ? Number(amount) : undefined,
      notes,
      adminEmail: session.email,
    });

    return NextResponse.json({ success: true, settlement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
