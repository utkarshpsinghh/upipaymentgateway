import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId") || undefined;
  const type = searchParams.get("type") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      ...(merchantId ? { merchantId } : {}),
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      merchant: {
        select: {
          id: true,
          businessName: true,
        },
      },
      payment: {
        select: {
          id: true,
          merchantOrderId: true,
        },
      },
      settlement: {
        select: {
          id: true,
          utr: true,
        },
      },
    },
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      ...e,
      amount: Number(e.amount),
    })),
  });
}
