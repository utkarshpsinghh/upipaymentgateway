# BharatUPI Payment Gateway MVP

A production-foundation **UPI-only payment gateway** built for approved Indian merchants, inspired by Razorpay and NPCI specifications.

---

## 🌟 Key Features

### For Merchants
* **Merchant Onboarding Flow**: Complete compliance dossier (PAN, GSTIN, Bank Account, IFSC, Entity Classification). Status lifecycle: `PENDING` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED` / `SUSPENDED`.
* **Razorpay-Inspired Merchant Dashboard**: Real-time metrics (Today's Volume, Total Collected, Available Ledger Balance, Pending Settlements, Success Rates, 7-day volume charts).
* **Payment Links (`/l/:slug`)**: Custom branded payment links with customer requirement checks and automated expiration.
* **Hosted Payment Pages (`/page/:slug`)**: Multi-purpose hosted pages supporting fixed pricing and customer-determined amounts (e.g., donations, club passes).
* **Payment Buttons & Embed SDK (`/sdk.js`)**: Drop-in JavaScript SDK that embeds a responsive modal checkout into any webpage without exposing secret API keys.
* **Unified UPI Checkout (`/pay/:paymentId`)**: Standard NPCI UPI URI schemes, dynamic QR code generation, UPI App Intent buttons (GPay, PhonePe, Paytm, BHIM), and VPA Collect requests.
* **Webhook System**: Automated event notifications (`payment.created`, `payment.success`, `payment.failed`, `settlement.completed`) signed with **HMAC-SHA256** and delivery retry logging.
* **Developer Console**: API key generation (`sk_test_`, `pk_test_`), webhook configuration, live payment simulator, and REST API documentation.

### For Platform Administrators
* **Merchant KYC Underwriting**: Review business profiles, verify PAN and bank IFSC details, approve, reject, or suspend merchants.
* **Double-Entry Immutable Ledger**: Dynamic balance calculation from immutable `CREDIT` and `DEBIT` entries. Zero manually editable balance fields.
* **Escrow Settlement Desk**: Batch payout reviews, balance validation checks (ensuring payout ≤ available balance), recording bank UTR reference numbers, and automated ledger debiting.
* **Security Audit Trail**: Tamper-evident logging of every sensitive administrative action (`ADMIN_APPROVED_MERCHANT`, `ADMIN_CREATED_SETTLEMENT`, `ADMIN_COMPLETED_SETTLEMENT`).

---

## 🏗️ Architecture & Compliance Boundaries

```
Client App / Storefront
        │  (POST /api/v1/payments with sk_test_...)
        ▼
REST API Layer (Zod Validation & Bearer Auth)
        │
Payment Service (Idempotency & Approval Checks)
        │
PaymentProvider Abstraction
        ├── MockUPIProvider (TEST MODE Simulator)
        └── [Bank/PSP Authorised UPI Adapter] (LIVE MODE)
        │
Double-Entry Immutable Ledger
        ├── PAYMENT (CREDIT)
        ├── FEE (DEBIT)
        ├── REFUND (DEBIT)
        └── SETTLEMENT (DEBIT)
        │
HMAC-SHA256 Webhook Dispatcher ──► Merchant Server
```

* **No Card/CVV Storage**: System is strictly UPI-native.
* **Abstracted Escrow Layer**: Merchant settlement bank accounts are held behind a regulated payment account abstraction layer in accordance with RBI guidelines.
* **Strict Test Separation**: The Mock provider is explicitly prohibited from generating simulated success in `LIVE` mode.

---

## 🚀 Quick Start

### 1. Database & Prerequisites
* Node.js 18+
* PostgreSQL running locally on port 5432 (`upi_gateway` database)

### 2. Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/upi_gateway?schema=public"
JWT_SECRET="bharatpay-upi-gateway-jwt-secret-2026-very-secure-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="BharatUPI Gateway"
NODE_ENV="development"
```

### 3. Setup & Seed
```bash
# Push Prisma models to database
npx prisma db push

# Seed default admin, approved merchant, and sample data
npx tsx prisma/seed.ts

# Start production server
npm run build
npm start
```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Super Admin** | `admin@bharatupi.internal` | `AdminPassword@123` | Merchant approvals, settlements, UTR recording, ledger, audit logs |
| **Approved Merchant** | `merchant@swagfashion.in` | `MerchantPassword@123` | Swag Fashion dashboard, links, pages, API keys, settlements |
| **Pending Merchant** | `onboarding@techsol.in` | `MerchantPassword@123` | Pending applicant view (tests admin approval flow) |

**Sample Test Secret API Key for Swag Fashion:**
```text
sk_test_swag_demo_7890abcdef123456
```

---

## 🧪 Automated Verification Suite

Run the end-to-end verification script testing all 22 criteria:
```bash
node scripts/verify-all.mjs
```
