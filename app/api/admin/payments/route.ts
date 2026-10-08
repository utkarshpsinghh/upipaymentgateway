import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const merchantId = searchParams.get("merchantId") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  const payments = await prisma.payment.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(merchantId ? { merchantId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      merchant: {
        select: {
          id: true,
          businessName: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    payments: payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      fee: Number(p.fee),
      netAmount: Number(p.netAmount),
    })),
  });
}
