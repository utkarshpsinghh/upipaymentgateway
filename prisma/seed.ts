import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash("AdminPassword@123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bharatupi.internal" },
    update: {},
    create: {
      email: "admin@bharatupi.internal",
      name: "Gateway Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", adminUser.email);

  // 2. Create Approved Merchant: "Swag Fashion Retail"
  const merchantPasswordHash = await bcrypt.hash("MerchantPassword@123", 10);
  const approvedMerchant = await prisma.merchant.upsert({
    where: { email: "merchant@swagfashion.in" },
    update: {},
    create: {
      businessName: "Swag Fashion Retail",
      legalName: "Swag Apparel Private Limited",
      email: "merchant@swagfashion.in",
      phone: "9876543210",
      status: "APPROVED",
      merchantType: "PRIVATE_LIMITED",
      ownerName: "Vikram Malhotra",
      pan: "AAECS1234K",
      gstin: "27AAECS1234K1Z5",
      address: "Plot 42, Bandra Kurla Complex, Mumbai, Maharashtra - 400051",
      website: "https://swagfashion.in",
      businessCategory: "E-Commerce / Apparel",
      description: "Designer streetwear and activewear brand",
      bankAccountNumber: "9876543210123",
      bankIfsc: "HDFC0000060",
      settlementUpiId: "swagfashion@hdfcbank",
      testWebhookUrl: "https://webhook.site/test-receiver",
      testWebhookSecret: "whsec_test_c0989f6b86ab88d6174a89",
    },
  });

  // Create User for approved merchant
  await prisma.user.upsert({
    where: { email: "merchant@swagfashion.in" },
    update: { merchantId: approvedMerchant.id },
    create: {
      merchantId: approvedMerchant.id,
      email: "merchant@swagfashion.in",
      name: "Vikram Malhotra",
      passwordHash: merchantPasswordHash,
      role: "MERCHANT",
    },
  });

  // Seed default test API keys for Swag Fashion
  const secretKey = "sk_test_swag_demo_7890abcdef123456";
  const publicKey = "pk_test_swag_demo_pub_1234567890";

  await prisma.apiKey.deleteMany({ where: { merchantId: approvedMerchant.id } });

  await prisma.apiKey.create({
    data: {
      merchantId: approvedMerchant.id,
      name: "Default Test Secret Key",
      keyPrefix: "sk_test_",
      keyHash: hashKey(secretKey),
      maskedKey: "sk_test_...123456",
      environment: "TEST",
    },
  });

  await prisma.apiKey.create({
    data: {
      merchantId: approvedMerchant.id,
      name: "Default Test Public Key",
      keyPrefix: "pk_test_",
      keyHash: hashKey(publicKey),
      maskedKey: "pk_test_...7890",
      environment: "TEST",
    },
  });

  // Create Sample Payment Link
  await prisma.paymentLink.upsert({
    where: { slug: "summer-hoodie" },
    update: {},
    create: {
      merchantId: approvedMerchant.id,
      slug: "summer-hoodie",
      title: "Signature Summer Hoodie",
      description: "100% Organic Cotton, Limited Edition Drop",
      amount: 1499.0,
      currency: "INR",
      status: "ACTIVE",
      environment: "TEST",
      customerNameRequired: true,
      customerPhoneRequired: true,
      customerEmailRequired: true,
    },
  });

  // Create Sample Payment Page
  await prisma.paymentPage.upsert({
    where: { slug: "swag-vip-membership" },
    update: {},
    create: {
      merchantId: approvedMerchant.id,
      slug: "swag-vip-membership",
      title: "Swag Club VIP Annual Membership",
      description: "Enjoy 20% off all drops, early access, and free express shipping.",
      brandName: "Swag Fashion Retail",
      amountMode: "FIXED",
      fixedAmount: 2499.0,
      status: "ACTIVE",
      environment: "TEST",
    },
  });

  // 3. Create Pending Merchant for Testing Admin Verification Flow
  const pendingMerchant = await prisma.merchant.upsert({
    where: { email: "onboarding@techsol.in" },
    update: {},
    create: {
      businessName: "TechSol IT Solutions",
      legalName: "TechSol Technologies LLP",
      email: "onboarding@techsol.in",
      phone: "9123456789",
      status: "PENDING",
      merchantType: "LLP",
      ownerName: "Pooja Sharma",
      pan: "AALCT9876M",
      gstin: "29AALCT9876M1Z2",
      address: "100ft Road, Indiranagar, Bengaluru, Karnataka - 560038",
      website: "https://techsol.in",
      businessCategory: "SaaS & Cloud Services",
      description: "Enterprise workflow automation solutions",
      bankAccountNumber: "1234567890987",
      bankIfsc: "ICIC0000002",
      settlementUpiId: "techsol@icici",
    },
  });

  await prisma.user.upsert({
    where: { email: "onboarding@techsol.in" },
    update: { merchantId: pendingMerchant.id },
    create: {
      merchantId: pendingMerchant.id,
      email: "onboarding@techsol.in",
      name: "Pooja Sharma",
      passwordHash: merchantPasswordHash,
      role: "MERCHANT",
    },
  });

  console.log("Seeding complete!");
  console.log("Admin credentials: admin@bharatupi.internal / AdminPassword@123");
  console.log("Merchant credentials: merchant@swagfashion.in / MerchantPassword@123");
  console.log("Pending Merchant credentials: onboarding@techsol.in / MerchantPassword@123");
  console.log("Test Secret API Key for Swag Fashion:", secretKey);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
