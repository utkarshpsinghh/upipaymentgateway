import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [
    merchants,
    payments,
    todayPayments,
    settlements,
  ] = await Promise.all([
    prisma.merchant.findMany({
      select: { id: true, status: true, createdAt: true },
    }),
    prisma.payment.findMany({
      select: { id: true, amount: true, status: true },
    }),
    prisma.payment.findMany({
      where: { createdAt: { gte: startOfToday } },
      select: { amount: true, status: true },
    }),
    prisma.settlement.findMany({
      select: { id: true, amount: true, status: true },
    }),
  ]);

  const totalMerchants = merchants.length;
  const approvedMerchants = merchants.filter((m) => m.status === "APPROVED").length;
  const pendingMerchants = merchants.filter((m) => m.status === "PENDING" || m.status === "UNDER_REVIEW").length;
  const suspendedMerchants = merchants.filter((m) => m.status === "SUSPENDED").length;

  const totalVolume = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const todayVolume = todayPayments
    .filter((p) => p.status === "SUCCESS")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const pendingSettlementCount = settlements.filter((s) => s.status === "PENDING" || s.status === "PROCESSING").length;
  const pendingSettlementVolume = settlements
    .filter((s) => s.status === "PENDING" || s.status === "PROCESSING")
    .reduce((acc, s) => acc + Number(s.amount), 0);

  const completedSettlementCount = settlements.filter((s) => s.status === "COMPLETED").length;
  const completedSettlementVolume = settlements
    .filter((s) => s.status === "COMPLETED")
    .reduce((acc, s) => acc + Number(s.amount), 0);

  return NextResponse.json({
    metrics: {
      totalMerchants,
      approvedMerchants,
      pendingMerchants,
      suspendedMerchants,
      totalVolume,
      todayVolume,
      todayCount: todayPayments.length,
      totalTransactions: payments.length,
      pendingSettlementCount,
      pendingSettlementVolume,
      completedSettlementCount,
      completedSettlementVolume,
    },
  });
}
