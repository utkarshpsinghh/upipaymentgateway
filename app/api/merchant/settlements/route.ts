import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getMerchantBalance } from "@/lib/ledger";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || !session.merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [settlements, balanceSummary, bankDetails] = await Promise.all([
    prisma.settlement.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { createdAt: "desc" },
    }),
    getMerchantBalance(session.merchantId, "TEST"),
    prisma.merchant.findUnique({
      where: { id: session.merchantId },
      select: {
        bankAccountNumber: true,
        bankIfsc: true,
        settlementUpiId: true,
      },
    }),
  ]);

  return NextResponse.json({
    settlements: settlements.map((s) => ({
      ...s,
      amount: Number(s.amount),
      grossAmount: Number(s.grossAmount),
      totalFees: Number(s.totalFees),
      totalRefunds: Number(s.totalRefunds),
    })),
    balance: balanceSummary,
    bankDetails: {
      accountMasked: `••••••••${bankDetails?.bankAccountNumber.slice(-4) || ""}`,
      ifsc: bankDetails?.bankIfsc,
      upiId: bankDetails?.settlementUpiId,
    },
  });
}
