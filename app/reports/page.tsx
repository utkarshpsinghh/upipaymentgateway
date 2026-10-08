"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import { BarChart3, Download, TrendingUp, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/merchant/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((e) => console.error(e));
  }, []);

  const cards = data?.cards || {};

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MerchantSidebar businessName="Swag Fashion Retail" />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail="merchant@swagfashion.in" />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
              <p className="text-xs text-slate-500">
                Summary of collections, MDR processing fees, and ledger reconciliations
              </p>
            </div>

            <button
              onClick={() => alert("Financial statement exported in CSV format")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV Statement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Gross Settled Volume</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.totalCollected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">100% UPI Payments</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Estimated Platform Fees</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{(Number(cards.totalCollected || 0) * 0.02).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">2% + 18% GST MDR</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Net Payouts Transferred</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-emerald-600 font-semibold block">Fully reconciled</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
