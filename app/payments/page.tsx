"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import {
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/merchant/dashboard");
      if (res.ok) {
        const json = await res.json();
        setPayments(json.recentPayments || []);
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

  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment? This will debit your ledger.")) return;
    setRefundLoading(true);
    try {
      const res = await fetch(`/api/v1/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use internal session auth or demo api key
          Authorization: "Bearer sk_test_swag_demo_7890abcdef123456",
        },
        body: JSON.stringify({ reason: "Merchant requested refund" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Refund failed");
      } else {
        alert("Payment refunded successfully! Ledger debited.");
        fetchPayments();
        setSelectedPayment(null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchesSearch =
      !search ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.merchantOrderId?.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MerchantSidebar businessName="Swag Fashion Retail" />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail="merchant@swagfashion.in" />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Payments</h1>
              <p className="text-xs text-slate-500">
                Detailed ledger of all UPI intent, QR, and hosted checkout transactions
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Payment ID, Order ID, Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {["ALL", "SUCCESS", "PENDING", "FAILED", "REFUNDED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filterStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Payments Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Payment ID</th>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">UPI Ref (RRN)</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No payments found matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
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
                          <div className="text-[10px] text-slate-400">{p.customerPhone || p.customerEmail || "-"}</div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">
                          {p.rrn || "-"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.status === "PENDING"
                                ? "bg-amber-50 text-amber-700"
                                : p.status === "REFUNDED"
                                ? "bg-purple-50 text-purple-700"
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
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <a
                            href={`/pay/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Checkout ↗
                          </a>
                          {p.status === "SUCCESS" && (
                            <button
                              onClick={() => handleRefund(p.id)}
                              disabled={refundLoading}
                              className="text-purple-600 hover:text-purple-800 font-semibold"
                            >
                              Refund
                            </button>
                          )}
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
