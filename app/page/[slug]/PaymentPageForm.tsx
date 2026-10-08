"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function PaymentPageForm({
  slug,
  amountMode,
  fixedAmount,
}: {
  slug: string;
  amountMode: "FIXED" | "CUSTOMER_DECIDES";
  fixedAmount: number | null;
}) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payableAmount = amountMode === "FIXED" ? fixedAmount : parseFloat(customAmount);
    if (!payableAmount || payableAmount <= 0) {
      setError("Please enter a valid contribution or payment amount");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/pay/initiate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: slug,
          customAmount: payableAmount,
          customer: {
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to proceed to payment");
      }

      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
          {error}
        </div>
      )}

      {amountMode === "FIXED" ? (
        <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-100 text-center">
          <span className="text-xs text-slate-500 font-medium">Fixed Amount</span>
          <div className="text-3xl font-extrabold text-blue-900 mt-0.5">
            ₹{fixedAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      ) : (
        <div>
          <label className="text-xs font-semibold text-slate-700">Payment Amount (INR) *</label>
          <div className="relative mt-1">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mt-2 flex gap-2">
            {[100, 250, 500, 1000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setCustomAmount(preset.toString())}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                +₹{preset}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Verma"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting to UPI Gateway...</span>
          </>
        ) : (
          <>
            <span>Proceed to UPI Payment</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
