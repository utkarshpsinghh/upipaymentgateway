import { prisma } from "@/lib/db/prisma";
import { Environment, LedgerDirection, LedgerType, Prisma } from "@prisma/client";

export interface BalanceSummary {
  grossCollected: number;
  totalFees: number;
  totalRefunds: number;
  totalSettled: number;
  totalAdjustments: number;
  availableBalance: number;
  pendingSettlement: number;
  currency: string;
}

/**
 * Calculates a merchant's financial balance strictly from immutable ledger entries.
 * Never trusts any static balance column.
 */
export async function getMerchantBalance(
  merchantId: string,
  environment: Environment = "TEST"
): Promise<BalanceSummary> {
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      merchantId,
      environment,
    },
  });

  let grossCollected = new Prisma.Decimal(0);
  let totalFees = new Prisma.Decimal(0);
  let totalRefunds = new Prisma.Decimal(0);
  let totalSettled = new Prisma.Decimal(0);
  let totalAdjustments = new Prisma.Decimal(0);
  let netBalance = new Prisma.Decimal(0);

  for (const entry of entries) {
    if (entry.direction === "CREDIT") {
      netBalance = netBalance.add(entry.amount);
    } else if (entry.direction === "DEBIT") {
      netBalance = netBalance.sub(entry.amount);
    }

    if (entry.type === "PAYMENT" && entry.direction === "CREDIT") {
      grossCollected = grossCollected.add(entry.amount);
    } else if (entry.type === "FEE" && entry.direction === "DEBIT") {
      totalFees = totalFees.add(entry.amount);
    } else if (entry.type === "REFUND" && entry.direction === "DEBIT") {
      totalRefunds = totalRefunds.add(entry.amount);
    } else if (entry.type === "SETTLEMENT" && entry.direction === "DEBIT") {
      totalSettled = totalSettled.add(entry.amount);
    } else if (entry.type === "ADJUSTMENT") {
      if (entry.direction === "CREDIT") {
        totalAdjustments = totalAdjustments.add(entry.amount);
      } else {
        totalAdjustments = totalAdjustments.sub(entry.amount);
      }
    }
  }

  // Calculate pending settlements that have not yet been marked completed
  const pendingSettlements = await prisma.settlement.findMany({
    where: {
      merchantId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });

  const pendingSettlementTotal = pendingSettlements.reduce(
    (acc, curr) => acc.add(curr.amount),
    new Prisma.Decimal(0)
  );

  return {
    grossCollected: grossCollected.toNumber(),
    totalFees: totalFees.toNumber(),
    totalRefunds: totalRefunds.toNumber(),
    totalSettled: totalSettled.toNumber(),
    totalAdjustments: totalAdjustments.toNumber(),
    availableBalance: Math.max(0, netBalance.toNumber()),
    pendingSettlement: pendingSettlementTotal.toNumber(),
    currency: "INR",
  };
}

/**
 * Records double-entry style ledger entries for a successful payment.
 */
export async function recordPaymentSuccessLedger(params: {
  merchantId: string;
  paymentId: string;
  amount: number | Prisma.Decimal;
  fee: number | Prisma.Decimal;
  environment: Environment;
  description?: string;
}) {
  const amountDecimal = new Prisma.Decimal(params.amount);
  const feeDecimal = new Prisma.Decimal(params.fee);

  return await prisma.$transaction(async (tx) => {
    // 1. CREDIT merchant ledger for full payment amount
    const creditEntry = await tx.ledgerEntry.create({
      data: {
        merchantId: params.merchantId,
        paymentId: params.paymentId,
        type: "PAYMENT",
        amount: amountDecimal,
        direction: "CREDIT",
        description: params.description || `Payment received: ${params.paymentId}`,
        environment: params.environment,
      },
    });

    // 2. DEBIT gateway fee if fee > 0
    let feeEntry = null;
    if (feeDecimal.greaterThan(0)) {
      feeEntry = await tx.ledgerEntry.create({
        data: {
          merchantId: params.merchantId,
          paymentId: params.paymentId,
          type: "FEE",
          amount: feeDecimal,
          direction: "DEBIT",
          description: `UPI Gateway processing fee for ${params.paymentId}`,
          environment: params.environment,
        },
      });
    }

    return { creditEntry, feeEntry };
  });
}

/**
 * Records a settlement payout debit in the ledger upon settlement completion.
 */
export async function recordSettlementLedgerDebit(params: {
  merchantId: string;
  settlementId: string;
  amount: number | Prisma.Decimal;
  environment: Environment;
  utr?: string;
}) {
  const amountDecimal = new Prisma.Decimal(params.amount);

  return await prisma.ledgerEntry.create({
    data: {
      merchantId: params.merchantId,
      settlementId: params.settlementId,
      type: "SETTLEMENT",
      amount: amountDecimal,
      direction: "DEBIT",
      description: `Settlement payout ${params.settlementId} (UTR: ${params.utr || "N/A"})`,
      environment: params.environment,
    },
  });
}

/**
 * Records a refund debit in the ledger.
 */
export async function recordRefundLedgerDebit(params: {
  merchantId: string;
  paymentId: string;
  amount: number | Prisma.Decimal;
  environment: Environment;
  description?: string;
}) {
  const amountDecimal = new Prisma.Decimal(params.amount);

  return await prisma.ledgerEntry.create({
    data: {
      merchantId: params.merchantId,
      paymentId: params.paymentId,
      type: "REFUND",
      amount: amountDecimal,
      direction: "DEBIT",
      description: params.description || `Refund debited for payment ${params.paymentId}`,
      environment: params.environment,
    },
  });
}
