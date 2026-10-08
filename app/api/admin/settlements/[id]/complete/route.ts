import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { completeSettlement, markSettlementProcessing } from "@/lib/settlements/service";
import { CompleteSettlementSchema } from "@/lib/validation";

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

  if (body.action === "PROCESSING") {
    try {
      const settlement = await markSettlementProcessing(id, session.email);
      return NextResponse.json({ success: true, settlement });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }

  const parsed = CompleteSettlementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const settlement = await completeSettlement({
      settlementId: id,
      utr: parsed.data.utr,
      settledAt: parsed.data.settledAt ? new Date(parsed.data.settledAt) : new Date(),
      notes: parsed.data.notes,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: "Settlement completed and ledger successfully debited",
      settlement,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
