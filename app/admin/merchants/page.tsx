"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  RefreshCw,
  Search,
  ExternalLink,
  X,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [merchantDetails, setMerchantDetails] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMerchants = async () => {
    try {
      const res = await fetch("/api/admin/merchants");
      if (res.ok) {
        const json = await res.json();
        setMerchants(json.merchants || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const openMerchantDetails = async (id: string) => {
    setSelectedMerchant(id);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}`);
      if (res.ok) {
        const json = await res.json();
        setMerchantDetails(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    if (!confirm(`Are you sure you want to mark this merchant as ${status}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/merchants/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update status");
      } else {
        alert(`Merchant updated to ${status}`);
        fetchMerchants();
        openMerchantDetails(id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = merchants.filter((m) => {
    return (
      !search ||
      m.businessName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.pan.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Merchant Directory</h1>
              <p className="text-xs text-slate-400">
                Onboarding KYC approvals, risk suspension, and ledger balance audits
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search business, PAN, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Merchants Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Business Name</th>
                    <th className="py-3 px-5">Entity / PAN</th>
                    <th className="py-3 px-5">Contact</th>
                    <th className="py-3 px-5">KYC Status</th>
                    <th className="py-3 px-5">Available Balance</th>
                    <th className="py-3 px-5">Payments</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-white">{m.businessName}</div>
                        <div className="text-[11px] text-slate-400">{m.legalName}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-mono text-slate-300">{m.pan}</div>
                        <div className="text-[10px] text-slate-500">{m.merchantType}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div>{m.email}</div>
                        <div className="text-[10px] text-slate-400">{m.phone}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === "APPROVED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                              : m.status === "PENDING"
                              ? "bg-amber-950 text-amber-400 border border-amber-800/50"
                              : "bg-rose-950 text-rose-400 border border-rose-800/50"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-white tabular-nums">
                        ₹{Number(m.balance?.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-5 tabular-nums text-slate-400">
                        {m._count?.payments || 0}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => openMerchantDetails(m.id)}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                          Inspect & Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Drawer Modal */}
          {selectedMerchant && merchantDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {merchantDetails.merchant.businessName}
                    </h2>
                    <p className="text-xs text-slate-400">
                      ID: {merchantDetails.merchant.id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMerchant(null);
                      setMerchantDetails(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Status action buttons */}
                <div className="my-4 flex items-center justify-between rounded-xl bg-slate-900 p-3 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Status:</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        merchantDetails.merchant.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400"
                          : merchantDetails.merchant.status === "PENDING"
                          ? "bg-amber-950 text-amber-400"
                          : "bg-rose-950 text-rose-400"
                      }`}
                    >
                      {merchantDetails.merchant.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {merchantDetails.merchant.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateStatus(merchantDetails.merchant.id, "APPROVED")}
                        disabled={actionLoading}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                      >
                        Approve Merchant
                      </button>
                    )}
                    {merchantDetails.merchant.status !== "SUSPENDED" && (
                      <button
                        onClick={() => handleUpdateStatus(merchantDetails.merchant.id, "SUSPENDED")}
                        disabled={actionLoading}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition"
                      >
                        Suspend
                      </button>
                    )}
                    {merchantDetails.merchant.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateStatus(merchantDetails.merchant.id, "REJECTED")}
                        disabled={actionLoading}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* KYC Dossier */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Business Details
                    </span>
                    <div><span className="text-slate-500">Legal Name:</span> {merchantDetails.merchant.legalName}</div>
                    <div><span className="text-slate-500">Entity:</span> {merchantDetails.merchant.merchantType}</div>
                    <div><span className="text-slate-500">PAN:</span> <span className="font-mono">{merchantDetails.merchant.pan}</span></div>
                    <div><span className="text-slate-500">GSTIN:</span> <span className="font-mono">{merchantDetails.merchant.gstin || "None"}</span></div>
                    <div><span className="text-slate-500">Address:</span> {merchantDetails.merchant.address}</div>
                  </div>

                  <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Settlement Bank Account
                    </span>
                    <div><span className="text-slate-500">Account No:</span> <span className="font-mono">{merchantDetails.merchant.bankAccountNumber}</span></div>
                    <div><span className="text-slate-500">IFSC:</span> <span className="font-mono">{merchantDetails.merchant.bankIfsc}</span></div>
                    <div><span className="text-slate-500">Settlement UPI:</span> {merchantDetails.merchant.settlementUpiId || "None"}</div>
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500">Available Ledger Balance:</span>{" "}
                      <span className="font-bold text-emerald-400">
                        ₹{Number(merchantDetails.balance?.availableBalance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="mt-5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Recent Payments
                  </h3>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden text-xs">
                    {merchantDetails.recentPayments.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">No transactions recorded yet</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-500 uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Payment ID</th>
                            <th className="py-2 px-3">Amount</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">RRN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {merchantDetails.recentPayments.slice(0, 5).map((p: any) => (
                            <tr key={p.id}>
                              <td className="py-2 px-3 font-mono">{p.id}</td>
                              <td className="py-2 px-3 font-bold text-white">₹{p.amount.toFixed(2)}</td>
                              <td className="py-2 px-3">{p.status}</td>
                              <td className="py-2 px-3 font-mono text-slate-400">{p.rrn || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
