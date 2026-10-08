import { z } from "zod";

// Indian PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
// Indian GSTIN: 2 digits, 10 char PAN, 1 digit, 1 char, 1 char (optional)
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
// Indian IFSC: 4 alphabetic chars, 0, 6 alphanumeric chars
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
// Indian 10-digit phone
const phoneRegex = /^[6-9]\d{9}$/;

export const RegisterMerchantSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  legalName: z.string().min(2, "Legal registered name is required"),
  merchantType: z.enum([
    "INDIVIDUAL",
    "PROPRIETORSHIP",
    "PARTNERSHIP",
    "PRIVATE_LIMITED",
    "PUBLIC_LIMITED",
    "LLP",
    "TRUST_NGO",
  ]),
  ownerName: z.string().min(2, "Owner full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Must be a valid 10-digit Indian mobile number"),
  pan: z.string().regex(panRegex, "Valid PAN required (e.g. ABCDE1234F)").transform((val) => val.toUpperCase()),
  gstin: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine((val) => !val || gstinRegex.test(val), "Invalid GSTIN format"),
  address: z.string().min(5, "Full business address is required"),
  website: z.string().url().optional().or(z.literal("")),
  businessCategory: z.string().optional(),
  description: z.string().optional(),

  // Settlement banking details
  bankAccountNumber: z.string().min(8, "Valid bank account number required"),
  bankIfsc: z
    .string()
    .regex(ifscRegex, "Valid IFSC required (e.g. HDFC0001234)")
    .transform((val) => val.toUpperCase()),
  settlementUpiId: z.string().optional(),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const CreatePaymentApiSchema = z.object({
  merchant_order_id: z.string().min(1, "merchant_order_id is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.literal("INR", {
    errorMap: () => ({ message: "Only INR is supported for UPI" }),
  }),
  customer: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
    })
    .optional(),
  description: z.string().optional(),
});

export const CreatePaymentLinkSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  expiresAt: z.string().optional().nullable(),
  maxPayments: z.number().int().positive().optional().nullable(),
  customerNameRequired: z.boolean().default(true),
  customerPhoneRequired: z.boolean().default(true),
  customerEmailRequired: z.boolean().default(true),
});

export const CreatePaymentPageSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  brandName: z.string().optional(),
  amountMode: z.enum(["FIXED", "CUSTOMER_DECIDES"]).default("FIXED"),
  fixedAmount: z.number().positive().optional().nullable(),
  successRedirectUrl: z.string().url().optional().or(z.literal("")),
  failureRedirectUrl: z.string().url().optional().or(z.literal("")),
});

export const CompleteSettlementSchema = z.object({
  utr: z.string().min(6, "UTR / Bank reference is required"),
  settledAt: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).default("Default API Key"),
  environment: z.enum(["TEST", "LIVE"]).default("TEST"),
  type: z.enum(["SECRET", "PUBLIC"]).default("SECRET"),
});

export const UpdateWebhookConfigSchema = z.object({
  webhookUrl: z.string().url().optional().or(z.literal("")),
  testWebhookUrl: z.string().url().optional().or(z.literal("")),
});
