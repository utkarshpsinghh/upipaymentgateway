import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getMerchantBalance } from "@/lib/ledger";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchantId = session.merchantId;

  // Start of today in UTC
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [
    merchant,
    balanceSummary,
    allPayments,
    todayPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.merchant.findUnique({
      where: { id: merchantId },
    }),
    getMerchantBalance(merchantId, "TEST"),
    prisma.payment.findMany({
      where: { merchantId },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        merchantId,
        createdAt: { gte: startOfToday },
      },
      select: {
        amount: true,
        status: true,
      },
    }),
    prisma.payment.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        merchantOrderId: true,
        amount: true,
        currency: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        description: true,
        rrn: true,
        createdAt: true,
      },
    }),
  ]);

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  // Calculate metrics
  const totalSuccessful = allPayments.filter((p) => p.status === "SUCCESS").length;
  const totalPending = allPayments.filter((p) => p.status === "PENDING").length;
  const totalFailed = allPayments.filter((p) => p.status === "FAILED").length;
  const totalCount = allPayments.length;
  const successRate = totalCount > 0 ? Math.round((totalSuccessful / totalCount) * 100) : 0;

  const todayVolume = todayPayments
    .filter((p) => p.status === "SUCCESS")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  // Group payments by date for volume chart (last 7 days)
  const last7DaysMap: Record<string, { date: string; volume: number; count: number; successCount: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const displayStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    last7DaysMap[dateStr] = { date: displayStr, volume: 0, count: 0, successCount: 0 };
  }

  for (const p of allPayments) {
    const pDate = p.createdAt.toISOString().split("T")[0];
    if (last7DaysMap[pDate]) {
      last7DaysMap[pDate].count += 1;
      if (p.status === "SUCCESS") {
        last7DaysMap[pDate].volume += Number(p.amount);
        last7DaysMap[pDate].successCount += 1;
      }
    }
  }

  const chartData = Object.values(last7DaysMap);

  return NextResponse.json({
    merchant: {
      id: merchant.id,
      businessName: merchant.businessName,
      legalName: merchant.legalName,
      status: merchant.status,
      email: merchant.email,
      phone: merchant.phone,
    },
    cards: {
      todayVolume,
      todayCount: todayPayments.length,
      successfulCount: totalSuccessful,
      pendingCount: totalPending,
      failedCount: totalFailed,
      totalCollected: balanceSummary.grossCollected,
      availableBalance: balanceSummary.availableBalance,
      pendingSettlement: balanceSummary.pendingSettlement,
      successRate,
    },
    chartData,
    recentPayments: recentPayments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  });
}
