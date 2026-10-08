import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getMerchantBalance } from "@/lib/ledger";

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { payments: true, settlements: true },
      },
    },
  });

  // Calculate live balances for each merchant from ledger
  const merchantsWithBalances = await Promise.all(
    merchants.map(async (m) => {
      const balance = await getMerchantBalance(m.id, "TEST");
      return {
        ...m,
        balance,
      };
    })
  );

  return NextResponse.json({ merchants: merchantsWithBalances });
}
