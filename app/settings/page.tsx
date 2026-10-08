"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import { Building2, ShieldCheck, CreditCard, Lock } from "lucide-react";

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.merchant) {
          setMerchant(data.user.merchant);
        }
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MerchantSidebar businessName={merchant?.businessName || "Swag Fashion Retail"} />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail={merchant?.email || "merchant@swagfashion.in"} />

        <main className="p-6 sm:p-8 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Merchant Settings</h1>
            <p className="text-xs text-slate-500">
              Verified business profile, regulatory compliance dossier, and settlement routing
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Business Identification</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Brand / Trade Name</span>
                  <div className="font-semibold text-slate-900">{merchant?.businessName || "Swag Fashion Retail"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Legal Registered Entity</span>
                  <div className="font-semibold text-slate-900">{merchant?.legalName || "Swag Apparel Private Limited"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Entity Classification</span>
                  <div className="font-semibold text-slate-900">{merchant?.merchantType || "PRIVATE_LIMITED"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">PAN</span>
                  <div className="font-mono font-semibold text-slate-900">{merchant?.pan || "AAECS1234K"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">GSTIN</span>
                  <div className="font-mono font-semibold text-slate-900">{merchant?.gstin || "27AAECS1234K1Z5"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Operating Address</span>
                  <div className="text-slate-700">{merchant?.address || "Bandra Kurla Complex, Mumbai"}</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Settlement Bank Account</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Account Number</span>
                  <div className="font-mono font-semibold text-slate-900">
                    {merchant?.bankAccountNumber || "••••••••123"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">IFSC Code</span>
                  <div className="font-mono font-semibold text-slate-900">{merchant?.bankIfsc || "HDFC0000060"}</div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Settlement VPA</span>
                  <div className="font-mono text-slate-900">{merchant?.settlementUpiId || "swagfashion@hdfcbank"}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
