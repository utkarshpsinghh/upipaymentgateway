"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-xs font-medium text-slate-500">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
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
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
            {link.merchant.businessName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Payment Request
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-snug">{link.title}</h1>
            <p className="text-xs text-slate-500">By {link.merchant.businessName}</p>
          </div>
        </div>

        {link.description && (
          <p className="mb-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
            {link.description}
          </p>
        )}

        <div className="mb-6 rounded-xl bg-blue-50/60 p-4 border border-blue-100 text-center">
          <span className="text-xs font-medium text-slate-500">Total Payable Amount</span>
          <div className="text-3xl font-extrabold text-blue-900">
            ₹{Number(link.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {link.isInactive ? (
          <div className="rounded-xl bg-amber-50 p-4 text-center text-xs font-medium text-amber-800 border border-amber-200">
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
