"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Building,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MerchantDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/merchant/dashboard");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  const cards = data?.cards || {};
  const merchant = data?.merchant || {};
  const recentPayments = data?.recentPayments || [];
  const chartData = data?.chartData || [];

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      <MerchantSidebar
        merchantStatus={merchant.status}
        businessName={merchant.businessName}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail={merchant.email} />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-xs text-slate-500">
                Real-time UPI payment performance, collections, and available funds
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/payment-links"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Payment Link</span>
              </Link>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Available Balance */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Available Balance</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-emerald-600 font-semibold block">
                Ready to transfer to bank
              </span>
            </div>

            {/* Total Collected */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Total Collected</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.totalCollected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">
                All-time UPI payments
              </span>
            </div>

            {/* Pending Settlement */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Scheduled Payouts</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.pendingSettlement || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-amber-600 font-semibold block">
                Processing bank transfer
              </span>
            </div>

            {/* Today's Payments */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block">Today's Collections</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{Number(cards.todayVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-500 block">
                {cards.todayCount || 0} attempts today
              </span>
            </div>
          </div>

          {/* Secondary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{cards.successfulCount || 0}</div>
                <div className="text-[11px] text-slate-500">Successful</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{cards.pendingCount || 0}</div>
                <div className="text-[11px] text-slate-500">Pending</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <XCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{cards.failedCount || 0}</div>
                <div className="text-[11px] text-slate-500">Failed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{cards.successRate || 0}%</div>
                <div className="text-[11px] text-slate-500">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">7-Day Payment Volume</h2>
                <p className="text-xs text-slate-500">Daily gross UPI payment volume in INR</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Volume"]}
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#volumeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
                <p className="text-xs text-slate-500">Latest UPI checkout and link payments</p>
              </div>
              <Link href="/payments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                View all payments
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Payment ID</th>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Created</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions recorded yet. Use the Developers section or create a payment link to simulate your first payment.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5 font-mono font-medium text-slate-900">
                          {p.id}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">
                          {p.merchantOrderId}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                          ₹{p.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-slate-800">{p.customerName || "Customer"}</div>
                          <div className="text-[10px] text-slate-400">{p.customerPhone || p.customerEmail || "N/A"}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <a
                            href={`/pay/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            Checkout ↗
                          </a>
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
