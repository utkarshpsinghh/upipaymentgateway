import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getMerchantBalance } from "@/lib/ledger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { id } = await params;

  const [merchant, balance, recentPayments, recentSettlements, auditLogs] = await Promise.all([
    prisma.merchant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, email: true, name: true, createdAt: true } },
        apiKeys: { select: { id: true, name: true, keyPrefix: true, maskedKey: true, environment: true, createdAt: true, revokedAt: true } },
      },
    }),
    getMerchantBalance(id, "TEST"),
    prisma.payment.findMany({
      where: { merchantId: id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.settlement.findMany({
      where: { merchantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditLog.findMany({
      where: { entityId: id },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
  ]);

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  return NextResponse.json({
    merchant,
    balance,
    recentPayments: recentPayments.map((p) => ({ ...p, amount: Number(p.amount) })),
    recentSettlements: recentSettlements.map((s) => ({ ...s, amount: Number(s.amount) })),
    auditLogs,
  });
}
