"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminLedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const fetchLedger = async () => {
    try {
      const url = typeFilter === "ALL" ? "/api/admin/ledger" : `/api/admin/ledger?type=${typeFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setEntries(json.entries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [typeFilter]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Immutable Double-Entry Ledger</h1>
              <p className="text-xs text-slate-400">
                Audited financial records for every payment credit, platform fee deduction, and settlement payout
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["ALL", "PAYMENT", "FEE", "SETTLEMENT", "REFUND"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    typeFilter === t
                      ? "bg-slate-700 text-white"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Entry ID</th>
                    <th className="py-3 px-5">Merchant</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5">Direction</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Timestamp (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        No ledger entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    entries.map((e) => {
                      const isCredit = e.direction === "CREDIT";
                      return (
                        <tr key={e.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3.5 px-5 text-slate-400">
                            {e.id.slice(0, 10)}...
                          </td>
                          <td className="py-3.5 px-5 font-sans font-semibold text-white">
                            {e.merchant.businessName}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`font-sans rounded px-2 py-0.5 text-[10px] font-bold ${
                                e.type === "PAYMENT"
                                  ? "bg-blue-950 text-blue-400"
                                  : e.type === "FEE"
                                  ? "bg-purple-950 text-purple-400"
                                  : e.type === "SETTLEMENT"
                                  ? "bg-amber-950 text-amber-400"
                                  : "bg-rose-950 text-rose-400"
                              }`}
                            >
                              {e.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`flex items-center gap-1 font-bold text-xs ${
                                isCredit ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              )}
                              <span>{e.direction}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-sm">
                            <span className={isCredit ? "text-emerald-400" : "text-rose-400"}>
                              {isCredit ? "+" : "-"}₹{e.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-sans text-slate-400 text-xs">
                            {e.description}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                            {new Date(e.createdAt).toISOString()}
                          </td>
                        </tr>
                      );
                    })
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
