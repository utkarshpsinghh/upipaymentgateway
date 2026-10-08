"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function PaymentLinkForm({
  slug,
  amount,
  customerNameRequired,
  customerPhoneRequired,
  customerEmailRequired,
}: {
  slug: string;
  amount: number;
  customerNameRequired: boolean;
  customerPhoneRequired: boolean;
  customerEmailRequired: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pay/initiate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkSlug: slug,
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

      // Redirect to hosted checkout on current domain
      if (data.paymentId) {
        router.push(`/pay/${data.paymentId}`);
      } else if (data.paymentUrl) {
        try {
          const path = new URL(data.paymentUrl, window.location.origin).pathname;
          router.push(path);
        } catch {
          window.location.href = data.paymentUrl;
        }
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {customerNameRequired && (
        <div>
          <label className="text-xs font-semibold text-slate-700">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>
      )}

      {customerEmailRequired && (
        <div>
          <label className="text-xs font-semibold text-slate-700">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@example.com"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>
      )}

      {customerPhoneRequired && (
        <div>
          <label className="text-xs font-semibold text-slate-700">Mobile Number *</label>
          <input
            type="tel"
            required
            pattern="[6-9][0-9]{9}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Opening UPI Checkout...</span>
          </>
        ) : (
          <>
            <span>Proceed to Pay ₹{amount.toFixed(2)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
        <Lock className="h-3 w-3 text-emerald-600" />
        <span>Secure 256-Bit Encrypted UPI Checkout</span>
      </div>
    </form>
  );
}
