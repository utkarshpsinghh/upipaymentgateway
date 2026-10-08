"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import {
  FileText,
  Plus,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";

export default function PaymentPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [amountMode, setAmountMode] = useState<"FIXED" | "CUSTOMER_DECIDES">("FIXED");
  const [fixedAmount, setFixedAmount] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/merchant/pages");
      if (res.ok) {
        const json = await res.json();
        setPages(json.pages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/merchant/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          brandName,
          amountMode,
          fixedAmount: amountMode === "FIXED" ? parseFloat(fixedAmount) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create payment page");
      } else {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setFixedAmount("");
        fetchPages();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (slug: string, id: string) => {
    const origin = window.location.origin;
    const url = `${origin}/page/${slug}`;
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
              <h1 className="text-xl font-bold text-slate-900">Payment Pages</h1>
              <p className="text-xs text-slate-500">
                Custom branded hosted checkout destinations for donations, fees, memberships, and product campaigns
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Payment Page</span>
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Title & Path</th>
                    <th className="py-3 px-5">Brand Name</th>
                    <th className="py-3 px-5">Amount Type</th>
                    <th className="py-3 px-5">Fixed Price</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No hosted payment pages configured yet.
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{page.title}</div>
                          <div className="font-mono text-[11px] text-emerald-600">
                            /page/{page.slug}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-800">
                          {page.brandName || "Default Brand"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {page.amountMode === "FIXED" ? "Fixed Price" : "Customer Choice"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                          {page.fixedAmount ? `₹${page.fixedAmount.toFixed(2)}` : "Variable"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {page.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2">
                          <button
                            onClick={() => handleCopy(page.slug, page.id)}
                            className="text-slate-600 hover:text-slate-900 font-semibold"
                          >
                            {copiedId === page.id ? (
                              <span className="text-emerald-600">Copied!</span>
                            ) : (
                              "Copy URL"
                            )}
                          </button>
                          <a
                            href={`/page/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            Open Page ↗
                          </a>
                        </td>
                      </tr>
                    ))
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
                  <h2 className="text-base font-bold text-slate-900">Create Payment Page</h2>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Page Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Annual Club Pass"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Display Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Swag Retail"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide details of the service, event, or product"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Pricing Mode</label>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAmountMode("FIXED")}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold border transition ${
                          amountMode === "FIXED"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Fixed Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountMode("CUSTOMER_DECIDES")}
                        className={`flex-1 rounded-xl py-2 text-xs font-semibold border transition ${
                          amountMode === "CUSTOMER_DECIDES"
                            ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Customer Chooses
                      </button>
                    </div>
                  </div>

                  {amountMode === "FIXED" && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Fixed Amount (INR) *</label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={fixedAmount}
                        onChange={(e) => setFixedAmount(e.target.value)}
                        placeholder="e.g. 2499"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

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
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-semibold text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 shadow-sm"
                    >
                      {creating ? "Publishing..." : "Publish Page"}
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
