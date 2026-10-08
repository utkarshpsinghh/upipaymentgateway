"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  Building,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  X,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Complete Settlement Modal
  const [activeSettlement, setActiveSettlement] = useState<any | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [completing, setCompleting] = useState(false);

  // New Settlement Batch Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [customSettlementAmount, setCustomSettlementAmount] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);

  const fetchSettlements = async () => {
    try {
      const [resSettle, resMerch] = await Promise.all([
        fetch("/api/admin/settlements"),
        fetch("/api/admin/merchants"),
      ]);

      if (resSettle.ok) {
        const json = await resSettle.json();
        setSettlements(json.settlements || []);
      }
      if (resMerch.ok) {
        const json = await resMerch.json();
        setMerchants(json.merchants || []);
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

  const handleMarkProcessing = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/settlements/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PROCESSING" }),
      });
      if (res.ok) {
        fetchSettlements();
        if (activeSettlement && activeSettlement.id === id) {
          setActiveSettlement({ ...activeSettlement, status: "PROCESSING" });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput || utrInput.length < 6) {
      alert("Please provide a valid UTR / Bank Reference (min 6 characters)");
      return;
    }

    setCompleting(true);
    try {
      const res = await fetch(`/api/admin/settlements/${activeSettlement.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: utrInput,
          settledAt: new Date().toISOString(),
          notes: notesInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to complete settlement");
      } else {
        alert("Settlement completed! DEBIT ledger entry created and webhook dispatched.");
        setActiveSettlement(null);
        setUtrInput("");
        setNotesInput("");
        fetchSettlements();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantId) {
      alert("Please select a merchant");
      return;
    }

    setCreatingBatch(true);
    try {
      const res = await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: selectedMerchantId,
          amount: customSettlementAmount ? parseFloat(customSettlementAmount) : undefined,
          notes: batchNotes || "Admin payout batch",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create settlement batch");
      } else {
        alert("Settlement batch created!");
        setShowCreateModal(false);
        setSelectedMerchantId("");
        setCustomSettlementAmount("");
        fetchSettlements();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingBatch(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Settlements Operations Desk</h1>
              <p className="text-xs text-slate-400">
                Execute bank payouts, record UTR references, and reconcile ledger balances
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Payout Batch</span>
            </button>
          </div>

          {/* Settlements Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Merchant</th>
                    <th className="py-3 px-5">Payable Amount</th>
                    <th className="py-3 px-5">Gross Collected</th>
                    <th className="py-3 px-5">Fees Deducted</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Bank UTR</th>
                    <th className="py-3 px-5">Created</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No settlements created yet. Click "Create Payout Batch" to initiate.
                      </td>
                    </tr>
                  ) : (
                    settlements.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white">{s.merchant.businessName}</div>
                          <div className="text-[10px] text-slate-500">
                            A/C: {s.merchant.bankAccountNumber} • {s.merchant.bankIfsc}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-white tabular-nums">
                          ₹{s.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 tabular-nums text-slate-400">
                          ₹{s.grossAmount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 tabular-nums text-slate-500">
                          -₹{s.totalFees.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === "COMPLETED"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                                : s.status === "PROCESSING"
                                ? "bg-blue-950 text-blue-400 border border-blue-800/50"
                                : "bg-amber-950 text-amber-400 border border-amber-800/50"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-white">
                          {s.utr || "PENDING"}
                        </td>
                        <td className="py-3.5 px-5 text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setActiveSettlement(s);
                              setUtrInput(s.utr || `UTR${Date.now()}`);
                              setNotesInput(s.notes || "");
                            }}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                          >
                            Review & Payout
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Settlement Drawer / Modal */}
          {activeSettlement && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Review Settlement: {activeSettlement.merchant.businessName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">ID: {activeSettlement.id}</p>
                  </div>
                  <button onClick={() => setActiveSettlement(null)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Settlement financial summary */}
                <div className="my-4 rounded-xl bg-slate-900 p-4 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Collected:</span>
                    <span className="font-semibold text-white">₹{activeSettlement.grossAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gateway Fees:</span>
                    <span className="text-rose-400">-₹{activeSettlement.totalFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refunds:</span>
                    <span className="text-slate-400">₹0.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                    <span className="text-amber-400">Net Payable:</span>
                    <span className="text-white">₹{activeSettlement.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payout Bank Info */}
                <div className="mb-4 rounded-xl bg-slate-900/50 p-3 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-[11px] text-slate-400 uppercase block mb-1">
                    Beneficiary Bank Account
                  </span>
                  <div>Account: {activeSettlement.merchant.bankAccountNumber}</div>
                  <div>IFSC: {activeSettlement.merchant.bankIfsc}</div>
                  {activeSettlement.merchant.settlementUpiId && (
                    <div>UPI VPA: {activeSettlement.merchant.settlementUpiId}</div>
                  )}
                </div>

                {activeSettlement.status === "COMPLETED" ? (
                  <div className="rounded-xl bg-emerald-950/60 border border-emerald-800/60 p-4 text-xs text-emerald-300">
                    <span className="font-bold block mb-1">Settlement Completed:</span>
                    <div>Bank UTR: <span className="font-mono font-bold">{activeSettlement.utr}</span></div>
                    <div>Settled Date: {new Date(activeSettlement.settledAt || activeSettlement.updatedAt).toLocaleString()}</div>
                  </div>
                ) : (
                  <form onSubmit={handleCompleteSettlement} className="space-y-3.5">
                    <div className="flex gap-2">
                      {activeSettlement.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleMarkProcessing(activeSettlement.id)}
                          className="w-full rounded-xl bg-blue-600/30 border border-blue-500/40 py-2 text-xs font-bold text-blue-300 hover:bg-blue-600/40"
                        >
                          Mark Processing
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300">
                        Bank UTR / Transaction Reference Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="e.g. UTR1234567890"
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300">Settlement Notes</label>
                      <textarea
                        rows={2}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Bank transfer execution notes"
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSettlement(null)}
                        className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={completing}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                      >
                        {completing ? "Recording DEBIT..." : "Mark Completed & Debit Ledger"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Create Batch Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white">Create Settlement Batch</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateBatch} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Select Merchant *</label>
                    <select
                      required
                      value={selectedMerchantId}
                      onChange={(e) => setSelectedMerchantId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="">-- Choose Merchant --</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.businessName} (Available: ₹{Number(m.balance?.availableBalance || 0).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">
                      Amount (Leave blank for full available balance)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customSettlementAmount}
                      onChange={(e) => setCustomSettlementAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Batch Notes</label>
                    <textarea
                      rows={2}
                      value={batchNotes}
                      onChange={(e) => setBatchNotes(e.target.value)}
                      placeholder="Cycle settlement batch"
                      className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingBatch}
                      className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                      {creatingBatch ? "Creating..." : "Create Settlement"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
