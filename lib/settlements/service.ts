import { prisma } from "@/lib/db/prisma";
import { getMerchantBalance, recordSettlementLedgerDebit } from "@/lib/ledger";
import { recordAuditLog } from "@/lib/security/audit";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { Prisma } from "@prisma/client";

export async function createSettlement(params: {
  merchantId: string;
  amount?: number;
  periodStart?: Date;
  periodEnd?: Date;
  notes?: string;
  adminEmail: string;
}) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
  });

  if (!merchant) {
    throw new Error("MERCHANT_NOT_FOUND");
  }

  // Calculate current available balance strictly from ledger
  const balanceSummary = await getMerchantBalance(merchant.id, "TEST");

  // Determine requested settlement amount
  const requestedAmount = params.amount !== undefined ? params.amount : balanceSummary.availableBalance;

  if (requestedAmount <= 0) {
    throw new Error("Cannot create settlement: Available balance is ₹0.00");
  }

  if (requestedAmount > balanceSummary.availableBalance) {
    throw new Error(
      `Settlement amount ₹${requestedAmount.toFixed(2)} exceeds merchant's available ledger balance of ₹${balanceSummary.availableBalance.toFixed(2)}`
    );
  }

  const periodStart = params.periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const periodEnd = params.periodEnd || new Date();

  const settlement = await prisma.settlement.create({
    data: {
      merchantId: merchant.id,
      amount: new Prisma.Decimal(requestedAmount),
      currency: "INR",
      status: "PENDING",
      periodStart,
      periodEnd,
      grossAmount: new Prisma.Decimal(balanceSummary.grossCollected),
      totalFees: new Prisma.Decimal(balanceSummary.totalFees),
      totalRefunds: new Prisma.Decimal(balanceSummary.totalRefunds),
      notes: params.notes || "Standard settlement cycle",
    },
  });

  recordAuditLog({
    actor: params.adminEmail,
    actorRole: "ADMIN",
    action: "ADMIN_CREATED_SETTLEMENT",
    entity: "SETTLEMENT",
    entityId: settlement.id,
    newValue: {
      merchantId: merchant.id,
      amount: requestedAmount,
      status: "PENDING",
    },
  });

  return settlement;
}

export async function markSettlementProcessing(settlementId: string, adminEmail: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) {
    throw new Error("SETTLEMENT_NOT_FOUND");
  }

  if (settlement.status !== "PENDING") {
    throw new Error(`Cannot transition from ${settlement.status} to PROCESSING`);
  }

  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: "PROCESSING" },
  });

  recordAuditLog({
    actor: adminEmail,
    actorRole: "ADMIN",
    action: "ADMIN_CREATED_SETTLEMENT",
    entity: "SETTLEMENT",
    entityId: settlement.id,
    oldValue: { status: "PENDING" },
    newValue: { status: "PROCESSING" },
  });

  return updated;
}

export async function completeSettlement(params: {
  settlementId: string;
  utr: string;
  settledAt?: Date;
  notes?: string;
  adminEmail: string;
}) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: params.settlementId },
    include: { merchant: true },
  });

  if (!settlement) {
    throw new Error("SETTLEMENT_NOT_FOUND");
  }

  if (settlement.status === "COMPLETED") {
    return settlement;
  }

  if (settlement.status !== "PENDING" && settlement.status !== "PROCESSING") {
    throw new Error(`Cannot complete settlement in status: ${settlement.status}`);
  }

  // Ensure balance check again
  const currentBalance = await getMerchantBalance(settlement.merchantId, "TEST");
  if (Number(settlement.amount) > currentBalance.availableBalance + 0.001) {
    throw new Error(
      `Cannot complete settlement: Settlement amount ₹${Number(settlement.amount)} exceeds merchant available balance ₹${currentBalance.availableBalance}`
    );
  }

  const settledAt = params.settledAt || new Date();

  // Perform atomic update + ledger debit
  const [updatedSettlement] = await prisma.$transaction([
    prisma.settlement.update({
      where: { id: settlement.id },
      data: {
        status: "COMPLETED",
        utr: params.utr,
        settledAt,
        notes: params.notes ? `${settlement.notes || ""}\n${params.notes}`.trim() : settlement.notes,
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        merchantId: settlement.merchantId,
        settlementId: settlement.id,
        type: "SETTLEMENT",
        amount: settlement.amount,
        direction: "DEBIT",
        description: `Settlement completed (UTR: ${params.utr})`,
        environment: "TEST",
      },
    }),
  ]);

  recordAuditLog({
    actor: params.adminEmail,
    actorRole: "ADMIN",
    action: "ADMIN_COMPLETED_SETTLEMENT",
    entity: "SETTLEMENT",
    entityId: settlement.id,
    newValue: {
      status: "COMPLETED",
      utr: params.utr,
      settledAt: settledAt.toISOString(),
      amount: Number(settlement.amount),
    },
  });

  // Dispatch webhook to merchant
  dispatchWebhook({
    merchantId: settlement.merchantId,
    event: "settlement.completed",
    payloadData: {
      settlement_id: settlement.id,
      amount: Number(settlement.amount),
      currency: settlement.currency,
      status: "COMPLETED",
      utr: params.utr,
      settled_at: settledAt.toISOString(),
    },
    isTestMode: true,
  });

  return updatedSettlement;
}
