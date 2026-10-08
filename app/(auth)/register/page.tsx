"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Building2, UserCheck, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    legalName: "",
    merchantType: "PROPRIETORSHIP",
    ownerName: "",
    email: "",
    phone: "",
    pan: "",
    gstin: "",
    address: "",
    website: "",
    businessCategory: "E-Commerce",
    description: "",
    bankAccountNumber: "",
    bankIfsc: "",
    settlementUpiId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
          <p className="mt-2 text-sm text-slate-600">
            Your merchant account for <span className="font-semibold text-slate-900">{success.merchant.businessName}</span> has been received and is currently in <span className="font-bold text-amber-600">PENDING</span> status.
          </p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-left text-xs text-amber-900">
            <span className="font-bold block mb-1">KYC Review in Progress:</span>
            According to RBI and NPCI guidelines, live transaction processing will activate once an administrator reviews your PAN, business registration, and settlement bank details.
          </div>

          {success.initialTestApiKey && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Sandbox Test Secret Key (Save this now):
              </span>
              <code className="text-xs font-mono font-bold text-blue-700 select-all break-all">
                {success.initialTestApiKey}
              </code>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link
              href="/dashboard"
              className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Go to Merchant Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              ₹
            </div>
            <span className="text-lg font-bold text-slate-900">BharatUPI Gateway</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Merchant Onboarding Application
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Apply to accept UPI payments with real-time settlement tracking and developer APIs.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
          {/* Section 1: Business Profile */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Business Information
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Brand / Business Name *</label>
                <input
                  type="text"
                  required
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Swag Retail"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Legal Registered Name *</label>
                <input
                  type="text"
                  required
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleChange}
                  placeholder="e.g. Swag Apparel Pvt Ltd"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Merchant Entity Type *</label>
                <select
                  name="merchantType"
                  value={formData.merchantType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 bg-white"
                >
                  <option value="INDIVIDUAL">Individual / Freelancer</option>
                  <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                  <option value="PARTNERSHIP">Partnership Firm</option>
                  <option value="PRIVATE_LIMITED">Private Limited Company (Pvt Ltd)</option>
                  <option value="PUBLIC_LIMITED">Public Limited Company</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="TRUST_NGO">Trust / Society / NGO</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Business Category</label>
                <input
                  type="text"
                  name="businessCategory"
                  value={formData.businessCategory}
                  onChange={handleChange}
                  placeholder="e.g. Retail, SaaS, Education"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Business Website / App URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Operating Address *</label>
                <textarea
                  required
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full office or registered business address with PIN code"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Owner & KYC */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              2. Owner Identification & Tax KYC
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Authorized Signatory / Owner Name *</label>
                <input
                  type="text"
                  required
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Vikram Malhotra"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Business Email *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="merchant@example.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Permanent Account Number (PAN) *</label>
                <input
                  type="text"
                  required
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase font-mono text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">GSTIN (Optional for small businesses)</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="27ABCDE1234F1Z5"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase font-mono text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Settlement Bank Account Layer */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>3. Settlement Account Details</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">Escrow payout destination</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 50100234567890"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Bank IFSC Code *</label>
                <input
                  type="text"
                  required
                  name="bankIfsc"
                  value={formData.bankIfsc}
                  onChange={handleChange}
                  placeholder="HDFC0000060"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono uppercase text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Settlement UPI VPA (Optional)</label>
                <input
                  type="text"
                  name="settlementUpiId"
                  value={formData.settlementUpiId}
                  onChange={handleChange}
                  placeholder="merchant@hdfcbank"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Portal Security */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              4. Account Password
            </h2>
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700">Password (Min 8 characters) *</label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Onboarding Dossier...</span>
                </>
              ) : (
                <>
                  <span>Submit Merchant Onboarding Application</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Log in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
