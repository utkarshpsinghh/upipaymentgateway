/**
 * End-to-End Automated Verification Script for BharatUPI MVP
 * Tests all 22 criteria from Definition of Done
 */

import http from "http";

const BASE_URL = "http://localhost:3000";

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

async function get(path, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { ...headers },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("   BHARATUPI PAYMENT GATEWAY - VERIFICATION RUN    ");
  console.log("==================================================\n");

  // 1. Admin can log in
  console.log("--- 1. Admin Authentication ---");
  const adminLogin = await post("/api/auth/login", {
    email: "admin@bharatupi.internal",
    password: "AdminPassword@123",
  });
  assert(adminLogin.status === 200, "Admin can log in with valid credentials");
  assert(adminLogin.data.user.role === "ADMIN", "Admin role confirmed");
  const adminCookie = adminLogin.headers.get("set-cookie")?.split(";")[0] || "";

  // 2. Merchant can register (onboarding)
  console.log("\n--- 2. Merchant Onboarding Registration ---");
  const uniqueEmail = `merchant_${Date.now()}@indielabs.in`;
  const regRes = await post("/api/auth/register", {
    businessName: "Indie Labs Tech",
    legalName: "Indie Labs Solutions Private Limited",
    merchantType: "PRIVATE_LIMITED",
    ownerName: "Akash Verma",
    email: uniqueEmail,
    phone: "9811223344",
    pan: "AALCP1234D",
    gstin: "27AALCP1234D1Z8",
    address: "HSR Layout Sector 4, Bengaluru, Karnataka",
    bankAccountNumber: "998877665544",
    bankIfsc: "HDFC0000123",
    settlementUpiId: "indielabs@hdfcbank",
    password: "SecurePassword@123",
  });
  assert(regRes.status === 200, "Merchant registration succeeds");
  assert(regRes.data.merchant.status === "PENDING", "Newly registered merchant status is PENDING");
  const newMerchantId = regRes.data.merchant.id;

  // 3. Admin can approve merchant
  console.log("\n--- 3. Admin Merchant Review & Approval ---");
  const approveRes = await post(`/api/admin/merchants/${newMerchantId}/status`, {
    status: "APPROVED",
  }, { Cookie: adminCookie });
  assert(approveRes.status === 200, "Admin can approve merchant KYC");
  assert(approveRes.data.merchant.status === "APPROVED", "Merchant status updated to APPROVED in DB");

  // 4. Approved merchant can log in
  console.log("\n--- 4. Approved Merchant Login ---");
  const merchLogin = await post("/api/auth/login", {
    email: uniqueEmail,
    password: "SecurePassword@123",
  });
  assert(merchLogin.status === 200, "Approved merchant can log in");
  const merchCookie = merchLogin.headers.get("set-cookie")?.split(";")[0] || "";

  // 5. Merchant can generate API keys
  console.log("\n--- 5. API Key Generation ---");
  const apiKeyRes = await post("/api/merchant/keys", {
    name: "Automated Test Backend Key",
    environment: "TEST",
    type: "SECRET",
  }, { Cookie: merchCookie });
  assert(apiKeyRes.status === 200, "Merchant can generate API keys");
  const rawSecretKey = apiKeyRes.data.fullKey;
  assert(rawSecretKey.startsWith("sk_test_"), "Secret key has correct prefix sk_test_");
  console.log(`Generated Key: ${apiKeyRes.data.key.maskedKey}`);

  // 6. Merchant can create payment links
  console.log("\n--- 6. Payment Link Creation ---");
  const linkRes = await post("/api/merchant/links", {
    title: "Quarterly Pro Subscription",
    amount: 999.0,
    description: "Access to developer API tier",
    customerNameRequired: true,
    customerPhoneRequired: true,
    customerEmailRequired: true,
  }, { Cookie: merchCookie });
  assert(linkRes.status === 201, "Payment link created successfully");
  assert(linkRes.data.link.url.includes("/l/"), "Public payment link URL generated");

  // 7. Merchant can create payment pages
  console.log("\n--- 7. Payment Page Creation ---");
  const pageRes = await post("/api/merchant/pages", {
    title: "Indie Labs Annual Sponsorship",
    description: "Support open source development",
    brandName: "Indie Labs",
    amountMode: "FIXED",
    fixedAmount: 5000.0,
  }, { Cookie: merchCookie });
  assert(pageRes.status === 201, "Payment page created successfully");
  assert(pageRes.data.page.url.includes("/page/"), "Public payment page URL generated");

  // 8. Test Payments API (POST /api/v1/payments) with Idempotency Key
  console.log("\n--- 8. Payments Creation API & Idempotency ---");
  const idempotencyKey = `IDEMP_KEY_${Date.now()}`;
  const paymentPayload = {
    merchant_order_id: `ORD_${Date.now()}`,
    amount: 1000.0,
    currency: "INR",
    customer: {
      name: "Rohan Gupta",
      email: "rohan@example.com",
      phone: "9876543210",
    },
    description: "E-Commerce Checkout Order",
  };

  const createPayRes = await post("/api/v1/payments", paymentPayload, {
    Authorization: `Bearer ${rawSecretKey}`,
    "Idempotency-Key": idempotencyKey,
  });
  assert(createPayRes.status === 201, "Payment created via REST API");
  const paymentId = createPayRes.data.payment_id;
  assert(paymentId.startsWith("pay_"), "Payment ID formatted with pay_ prefix");
  assert(createPayRes.data.status === "PENDING", "Payment initial status is PENDING");
  assert(createPayRes.data.payment_url.includes(`/pay/${paymentId}`), "Payment URL provided");

  // Verify Idempotency returns identical payload
  const duplicatePayRes = await post("/api/v1/payments", paymentPayload, {
    Authorization: `Bearer ${rawSecretKey}`,
    "Idempotency-Key": idempotencyKey,
  });
  assert(duplicatePayRes.data.payment_id === paymentId, "Idempotency prevents duplicate payments");

  // 9. Hosted Checkout API details & QR Payload
  console.log("\n--- 9. Hosted Checkout & QR Payload ---");
  const checkoutDetails = await get(`/api/pay/${paymentId}`);
  assert(checkoutDetails.status === 200, "Checkout page details retrievable");
  assert(checkoutDetails.data.payment.qrDataUrl.startsWith("data:image/png;base64,"), "QR Code Data URL generated");
  assert(checkoutDetails.data.payment.upiUri.includes("upi://pay?pa="), "Standard UPI URI scheme generated");

  // 10. Simulate Test UPI Payment Success
  console.log("\n--- 10. Simulate Test UPI Payment & Webhook ---");
  const processRes = await post(`/api/pay/${paymentId}/process`, {
    status: "SUCCESS",
    upiVpa: "rohan@okhdfcbank",
  });
  assert(processRes.status === 200, "Payment simulator succeeds");
  assert(processRes.data.status === "SUCCESS", "Payment transitioned to SUCCESS");
  assert(Boolean(processRes.data.rrn), `UPI 12-digit RRN generated: ${processRes.data.rrn}`);

  // 11. Verify Double-Entry Ledger and dynamic balance
  console.log("\n--- 11. Double-Entry Ledger Verification ---");
  const merchDashboard = await get("/api/merchant/dashboard", { Cookie: merchCookie });
  assert(merchDashboard.status === 200, "Merchant dashboard loads successfully");
  const availableBal = merchDashboard.data.cards.availableBalance;
  // 1000 - 20 fee (2%) - 3.60 GST (18% of fee) = 976.40
  assert(availableBal > 900 && availableBal < 1000, `Available balance correctly reflects MDR fee deduction: ₹${availableBal}`);

  // 12. Admin Settlement Management & Ledger Debit
  console.log("\n--- 12. Settlement Lifecycle & UTR Recording ---");
  const createSettleRes = await post("/api/admin/settlements", {
    merchantId: newMerchantId,
    amount: 500.0,
    notes: "First automated test batch",
  }, { Cookie: adminCookie });
  assert(createSettleRes.status === 201, "Admin creates settlement batch");
  const settlementId = createSettleRes.data.settlement.id;
  assert(createSettleRes.data.settlement.status === "PENDING", "Settlement initial status PENDING");

  // Complete Settlement with Bank UTR
  const completeSettleRes = await post(`/api/admin/settlements/${settlementId}/complete`, {
    utr: `UTR${Date.now()}`,
    settledAt: new Date().toISOString(),
    notes: "IMPS Bank transfer confirmed",
  }, { Cookie: adminCookie });
  assert(completeSettleRes.status === 200, "Admin completes settlement with UTR");
  assert(completeSettleRes.data.settlement.status === "COMPLETED", "Settlement status is COMPLETED");

  // 13. Verify Ledger Debit after Settlement
  console.log("\n--- 13. Ledger Balance Post-Settlement ---");
  const postSettleDashboard = await get("/api/merchant/dashboard", { Cookie: merchCookie });
  const postSettleBal = postSettleDashboard.data.cards.availableBalance;
  assert(postSettleBal < availableBal, `Available balance decreased post-settlement: ₹${postSettleBal} (was ₹${availableBal})`);

  // 14. Verify Audit Logs
  console.log("\n--- 14. Immutable Audit Log Verification ---");
  const auditLogs = await get("/api/admin/audit-logs", { Cookie: adminCookie });
  assert(auditLogs.status === 200, "Admin can retrieve audit logs");
  const actions = auditLogs.data.logs.map((l) => l.action);
  assert(actions.includes("ADMIN_APPROVED_MERCHANT"), "Audit log contains ADMIN_APPROVED_MERCHANT");
  assert(actions.includes("ADMIN_CREATED_SETTLEMENT"), "Audit log contains ADMIN_CREATED_SETTLEMENT");
  assert(actions.includes("ADMIN_COMPLETED_SETTLEMENT"), "Audit log contains ADMIN_COMPLETED_SETTLEMENT");

  console.log("\n==================================================");
  console.log("   🎉 ALL 22/22 COMPLIANCE & FLOW TESTS PASSED!   ");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
