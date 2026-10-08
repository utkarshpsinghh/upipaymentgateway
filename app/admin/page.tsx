"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import Link from "next/link";
import {
  Users,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 403 || res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const json = await res.json();
      setData(json.metrics || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <RefreshCw className="h-6 w-6 animate-spin text-red-500" />
      </div>
    );
  }

  const m = data || {};

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div>
            <h1 className="text-xl font-bold text-white">Gateway Operations Console</h1>
            <p className="text-xs text-slate-400">
              Platform-wide merchant underwriting, escrow liquidity, settlement processing, and audit trail
            </p>
          </div>

          {/* Pending Underwriting Alert */}
          {m.pendingMerchants > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-amber-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-xs">
                    {m.pendingMerchants} Merchant Onboarding Application(s) Awaiting Review
                  </span>
                  <p className="text-[11px] text-amber-300/80">
                    Verify business entity credentials, PAN, and settlement destination before granting live UPI collection.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/merchants"
                className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                Review Applications →
              </Link>
            </div>
          )}

          {/* Top Operational Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-400 block">Total Payment Volume</span>
              <div className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                ₹{Number(m.totalVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-emerald-400 block font-semibold">
                Across all active merchants
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-400 block">Today's Collections</span>
              <div className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                ₹{Number(m.todayVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">
                {m.todayCount || 0} today's transactions
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-400 block">Pending Settlements</span>
              <div className="mt-1 text-2xl font-extrabold text-amber-400 tabular-nums">
                ₹{Number(m.pendingSettlementVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">
                {m.pendingSettlementCount || 0} batches requiring UTR
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-400 block">Completed Payouts</span>
              <div className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                ₹{Number(m.completedSettlementVolume || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <span className="mt-2 text-[11px] text-slate-400 block">
                {m.completedSettlementCount || 0} bank transfers executed
              </span>
            </div>
          </div>

          {/* Merchant Ecosystem Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Approved Merchants</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{m.approvedMerchants || 0}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Live transaction enabled</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Pending KYC</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{m.pendingMerchants || 0}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Awaiting documentation signoff</span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Registered</span>
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{m.totalMerchants || 0}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Platform accounts created</span>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/admin/merchants"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition group"
            >
              <Users className="h-6 w-6 text-blue-400 mb-3" />
              <h3 className="text-sm font-bold text-white group-hover:text-blue-300">Merchant Directory</h3>
              <p className="text-xs text-slate-400 mt-1">Approve KYC, inspect bank records, manage accounts</p>
            </Link>

            <Link
              href="/admin/settlements"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition group"
            >
              <Building className="h-6 w-6 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300">Settlement Desk</h3>
              <p className="text-xs text-slate-400 mt-1">Review payouts, record bank UTR, debit ledger</p>
            </Link>

            <Link
              href="/admin/ledger"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition group"
            >
              <TrendingUp className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">Double-Entry Ledger</h3>
              <p className="text-xs text-slate-400 mt-1">View immutable credit and debit entries</p>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition group"
            >
              <ShieldCheck className="h-6 w-6 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300">Audit Logs</h3>
              <p className="text-xs text-slate-400 mt-1">Immutable security trail for all admin actions</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
