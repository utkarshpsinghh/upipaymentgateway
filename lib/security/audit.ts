import { prisma } from "@/lib/db/prisma";

export type AuditAction =
  | "ADMIN_APPROVED_MERCHANT"
  | "ADMIN_REJECTED_MERCHANT"
  | "ADMIN_SUSPENDED_MERCHANT"
  | "ADMIN_ACTIVATED_MERCHANT"
  | "ADMIN_CREATED_SETTLEMENT"
  | "ADMIN_COMPLETED_SETTLEMENT"
  | "ADMIN_CANCELLED_SETTLEMENT"
  | "MERCHANT_REGISTERED"
  | "MERCHANT_PROFILE_UPDATED"
  | "API_KEY_CREATED"
  | "API_KEY_REVOKED"
  | "WEBHOOK_CONFIG_UPDATED"
  | "PAYMENT_CREATED"
  | "PAYMENT_STATUS_CHANGED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_LINK_CREATED"
  | "PAYMENT_PAGE_CREATED";

export interface RecordAuditParams {
  actor: string;
  actorRole: "ADMIN" | "MERCHANT" | "SYSTEM";
  action: AuditAction;
  entity: "MERCHANT" | "SETTLEMENT" | "PAYMENT" | "API_KEY" | "PAYMENT_LINK" | "PAYMENT_PAGE" | "WEBHOOK";
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
}

export async function recordAuditLog(params: RecordAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actor: params.actor,
        actorRole: params.actorRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue ? (params.oldValue as any) : undefined,
        newValue: params.newValue ? (params.newValue as any) : undefined,
        ip: params.ip || "127.0.0.1",
        userAgent: params.userAgent || "Internal",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Non-blocking for primary flow, but logged
  }
}
