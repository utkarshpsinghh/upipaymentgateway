import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/jwt";
import { RegisterMerchantSchema } from "@/lib/validation";
import { recordAuditLog } from "@/lib/security/audit";
import { generateApiKey } from "@/lib/security/keys";
import { generateWebhookSecret } from "@/lib/security/signature";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterMerchantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const testWebhookSecret = generateWebhookSecret();

    // Create Merchant and linked User in transaction
    const result = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: {
          businessName: data.businessName,
          legalName: data.legalName,
          merchantType: data.merchantType,
          ownerName: data.ownerName,
          email: data.email,
          phone: data.phone,
          pan: data.pan,
          gstin: data.gstin,
          address: data.address,
          website: data.website || null,
          businessCategory: data.businessCategory || null,
          description: data.description || null,
          bankAccountNumber: data.bankAccountNumber,
          bankIfsc: data.bankIfsc,
          settlementUpiId: data.settlementUpiId || null,
          status: "PENDING",
          testWebhookSecret,
        },
      });

      const user = await tx.user.create({
        data: {
          merchantId: merchant.id,
          email: data.email,
          passwordHash,
          name: data.ownerName,
          role: "MERCHANT",
        },
      });

      // Generate default test keys
      const testSecretKey = generateApiKey("TEST", "SECRET");
      const testPublicKey = generateApiKey("TEST", "PUBLIC");

      await tx.apiKey.create({
        data: {
          merchantId: merchant.id,
          name: "Default Test Secret Key",
          keyPrefix: testSecretKey.prefix,
          keyHash: testSecretKey.keyHash,
          maskedKey: testSecretKey.maskedKey,
          environment: "TEST",
        },
      });

      await tx.apiKey.create({
        data: {
          merchantId: merchant.id,
          name: "Default Test Public Key",
          keyPrefix: testPublicKey.prefix,
          keyHash: testPublicKey.keyHash,
          maskedKey: testPublicKey.maskedKey,
          environment: "TEST",
        },
      });

      return { merchant, user, initialKey: testSecretKey.fullKey };
    });

    // Record audit log
    await recordAuditLog({
      actor: result.user.email,
      actorRole: "MERCHANT",
      action: "MERCHANT_REGISTERED",
      entity: "MERCHANT",
      entityId: result.merchant.id,
      newValue: {
        businessName: result.merchant.businessName,
        legalName: result.merchant.legalName,
        status: "PENDING",
      },
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      role: "MERCHANT",
      merchantId: result.merchant.id,
      name: result.merchant.businessName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Application submitted successfully. Awaiting administrative review.",
      merchant: {
        id: result.merchant.id,
        businessName: result.merchant.businessName,
        status: result.merchant.status,
      },
      initialTestApiKey: result.initialKey,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
