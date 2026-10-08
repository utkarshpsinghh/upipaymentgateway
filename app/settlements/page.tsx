"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import {
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettlements = async () => {
    try {
      const res = await fetch("/api/merchant/settlements");
      if (res.ok) {
        const json = await res.json();
        setSettlements(json.settlements || []);
        setBalance(json.balance);
        setBankDetails(json.bankDetails);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      <MerchantSidebar businessName="Swag Fashion Retail" />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail="merchant@swagfashion.in" />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bank Payouts & Transfers</h1>
            <p className="text-xs text-slate-500">
              Direct bank transfers and payout tracking for your collected UPI payments
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Available Payout Balance</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(balance?.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-emerald-600 font-semibold block">
                Ready for direct transfer to your bank account
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Processing Transfer</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(balance?.pendingSettlement || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-amber-600 font-semibold block">
                In transit with the banking network
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Total Transferred to Bank</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(balance?.totalSettled || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">
                Lifetime successful bank deposits
              </span>
            </div>
          </div>

          {/* Bank Destination Card */}
          {bankDetails && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Registered Bank Account for Payouts
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600 font-mono">
                    <span>Account: {bankDetails.accountMasked}</span>
                    <span>•</span>
                    <span>IFSC: {bankDetails.ifsc}</span>
                    {bankDetails.upiId && (
                      <>
                        <span>•</span>
                        <span>VPA: {bankDetails.upiId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
                Verified Bank KYC
              </span>
            </div>
          )}

          {/* Settlement History Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Payout Transfer History</h2>
              <p className="text-xs text-slate-500">Historical records of deposits sent to your bank account with UTR references</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Payout ID</th>
                    <th className="py-3 px-5">Net Transferred</th>
                    <th className="py-3 px-5">Gross Amount</th>
                    <th className="py-3 px-5">Platform Fees</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Bank UTR Ref</th>
                    <th className="py-3 px-5">Deposited At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No payouts transferred yet. As your sales grow, collected funds are transferred directly into your verified bank account.
                      </td>
                    </tr>
                  ) : (
                    settlements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                          {s.id.slice(0, 12)}...
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                          ₹{s.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 tabular-nums text-slate-600">
                          ₹{s.grossAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 tabular-nums text-slate-500">
                          -₹{s.totalFees.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700"
                                : s.status === "PROCESSING"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                          {s.utr || "PENDING_UTR"}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {s.settledAt
                            ? new Date(s.settledAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
