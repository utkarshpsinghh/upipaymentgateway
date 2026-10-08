import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const entity = searchParams.get("entity") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}
