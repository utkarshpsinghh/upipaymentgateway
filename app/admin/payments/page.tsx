"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  CreditCard,
  Search,
  Filter,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const json = await res.json();
        setPayments(json.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div>
            <h1 className="text-xl font-bold text-white">Platform Payment Monitor</h1>
            <p className="text-xs text-slate-400">
              Real-time payment requests across all merchant accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Payment ID</th>
                    <th className="py-3 px-5">Merchant</th>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Gross Amount</th>
                    <th className="py-3 px-5">Gateway Fee</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">UPI Ref (RRN)</th>
                    <th className="py-3 px-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No transactions registered yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3.5 px-5 font-mono text-slate-300">{p.id}</td>
                        <td className="py-3.5 px-5 font-bold text-white">
                          {p.merchant.businessName}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-400">{p.merchantOrderId}</td>
                        <td className="py-3.5 px-5 font-bold text-white tabular-nums">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 tabular-nums">
                          ₹{p.fee.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "SUCCESS"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                                : p.status === "PENDING"
                                ? "bg-amber-950 text-amber-400 border border-amber-800/50"
                                : "bg-rose-950 text-rose-400 border border-rose-800/50"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-400">{p.rrn || "-"}</td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
