"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import PaymentLinkForm from "./PaymentLinkForm";

interface LinkData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: string;
  isExpired: boolean;
  isLimitReached: boolean;
  isInactive: boolean;
  customerNameRequired: boolean;
  customerPhoneRequired: boolean;
  customerEmailRequired: boolean;
  merchant: {
    businessName: string;
    email: string;
  };
}

export default function PaymentLinkPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLink() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/pay/link/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Payment link not found");
        }
        setLink(data.link);
      } catch (err: any) {
        setError(err.message || "Failed to load payment link");
      } finally {
        setLoading(false);
      }
    }
    loadLink();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-4 text-xs font-semibold text-slate-500">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Payment Link Not Found</h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            The link with identifier <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{slug}</code> does not exist or may have been deleted.
          </p>
          {error && error !== "Payment link not found" && (
            <p className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>
          )}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/90 p-4 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xl">
        {/* Merchant Header */}
        <div className="mb-5 flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-md shadow-emerald-500/20">
            {link.merchant.businessName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              Payment Request
            </div>
            <h1 className="text-base font-bold text-slate-900 leading-snug mt-1">{link.title}</h1>
            <p className="text-xs text-slate-500">By {link.merchant.businessName}</p>
          </div>
        </div>

        {link.description && (
          <p className="mb-5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-100 leading-relaxed">
            {link.description}
          </p>
        )}

        {/* Amount Box */}
        <div className="mb-6 rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100/80 text-center">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Total Payable Amount</span>
          <div className="text-3xl font-black text-emerald-950 mt-0.5">
            ₹{Number(link.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {link.isInactive ? (
          <div className="rounded-2xl bg-amber-50 p-4 text-center text-xs font-semibold text-amber-800 border border-amber-200">
            This payment link is currently unavailable or expired.
          </div>
        ) : (
          <PaymentLinkForm
            slug={link.slug}
            amount={Number(link.amount)}
            customerNameRequired={link.customerNameRequired}
            customerPhoneRequired={link.customerPhoneRequired}
            customerEmailRequired={link.customerEmailRequired}
          />
        )}
      </div>
    </div>
  );
}
