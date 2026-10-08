import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { recordAuditLog, AuditAction } from "@/lib/security/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, notes } = body;

  const validStatuses = ["APPROVED", "REJECTED", "SUSPENDED", "UNDER_REVIEW"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const oldStatus = merchant.status;

  const updated = await prisma.merchant.update({
    where: { id },
    data: { status: status as any },
  });

  let auditAction: AuditAction = "ADMIN_APPROVED_MERCHANT";
  if (status === "SUSPENDED") auditAction = "ADMIN_SUSPENDED_MERCHANT";
  if (status === "REJECTED") auditAction = "ADMIN_REJECTED_MERCHANT";

  await recordAuditLog({
    actor: session.email,
    actorRole: "ADMIN",
    action: auditAction,
    entity: "MERCHANT",
    entityId: id,
    oldValue: { status: oldStatus },
    newValue: { status, notes },
  });

  return NextResponse.json({
    success: true,
    message: `Merchant status updated to ${status}`,
    merchant: updated,
  });
}
