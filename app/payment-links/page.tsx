"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  PowerOff,
  RefreshCw,
  X,
  Share2,
} from "lucide-react";

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [customerNameRequired, setCustomerNameRequired] = useState(true);
  const [customerPhoneRequired, setCustomerPhoneRequired] = useState(true);
  const [customerEmailRequired, setCustomerEmailRequired] = useState(true);
  const [maxPayments, setMaxPayments] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/merchant/links");
      if (res.ok) {
        const json = await res.json();
        setLinks(json.links || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/merchant/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          description,
          customerNameRequired,
          customerPhoneRequired,
          customerEmailRequired,
          maxPayments: maxPayments ? parseInt(maxPayments, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create link");
      } else {
        setShowModal(false);
        setTitle("");
        setAmount("");
        setDescription("");
        fetchLinks();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (linkId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch("/api/merchant/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, status: newStatus }),
      });
      fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (slug: string, id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/l/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MerchantSidebar businessName="Swag Fashion Retail" />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail="merchant@swagfashion.in" />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Payment Links</h1>
              <p className="text-xs text-slate-500">
                Shareable UPI payment links with custom customer requirements and automated expiry
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Link</span>
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Title & Link</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Payments</th>
                    <th className="py-3 px-5">Total Collected</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Created</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {links.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No payment links created yet. Click "Create New Link" above.
                      </td>
                    </tr>
                  ) : (
                    links.map((link) => {
                      const totalCollected = Number(link.amount) * (link.paymentCount || 0);
                      return (
                        <tr key={link.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-900">{link.title}</div>
                            <div className="font-mono text-[11px] text-blue-600 truncate max-w-[200px]">
                              /l/{link.slug}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                            ₹{link.amount.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-5 tabular-nums">
                            {link.paymentCount || 0}{" "}
                            {link.maxPayments ? ` / ${link.maxPayments}` : ""}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                            ₹{totalCollected.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                link.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {link.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">
                            {new Date(link.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="py-3.5 px-5 text-right space-x-2">
                            <button
                              onClick={() => handleCopy(link.slug, link.id)}
                              className="text-slate-600 hover:text-slate-900 font-semibold"
                              title="Copy URL"
                            >
                              {copiedId === link.id ? (
                                <span className="text-emerald-600">Copied!</span>
                              ) : (
                                "Copy"
                              )}
                            </button>
                            <a
                              href={`/l/${link.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              View ↗
                            </a>
                            <button
                              onClick={() => handleToggleStatus(link.id, link.status)}
                              className="text-slate-400 hover:text-rose-600 font-semibold"
                            >
                              {link.status === "ACTIVE" ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Create Payment Link</h2>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Link Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Summer Drop Hoodie"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Amount (INR) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1499"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief notes about the product or service"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-1">
                    <span className="text-xs font-semibold text-slate-700 block mb-2">Customer Details Required</span>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customerNameRequired}
                          onChange={(e) => setCustomerNameRequired(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Customer Name</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customerPhoneRequired}
                          onChange={(e) => setCustomerPhoneRequired(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Customer Mobile Phone</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customerEmailRequired}
                          onChange={(e) => setCustomerEmailRequired(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>Customer Email</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creating ? "Generating..." : "Create Link"}
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
