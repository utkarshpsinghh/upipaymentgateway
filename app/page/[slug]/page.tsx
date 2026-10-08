"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import PaymentPageForm from "./PaymentPageForm";

interface PageData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  brandName?: string;
  logoUrl?: string;
  amountMode: "FIXED" | "CUSTOMER_DECIDES";
  fixedAmount: number | null;
  status: string;
  merchant: {
    businessName: string;
    email: string;
  };
}

export default function PaymentPagePublic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/pay/page/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Payment page not found");
        }
        setPage(data.page);
      } catch (err: any) {
        setError(err.message || "Failed to load payment page");
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xl">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-4 text-xs font-semibold text-slate-500">Loading checkout page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Payment Page Not Found</h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            The hosted page with identifier <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{slug}</code> does not exist or may have been deleted.
          </p>
          {error && error !== "Payment page not found" && (
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
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 mb-5">
          {page.logoUrl ? (
            <img
              src={page.logoUrl}
              alt="Brand logo"
              className="h-12 w-12 rounded-2xl object-contain border border-slate-100 p-1"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-md shadow-emerald-500/20">
              {(page.brandName || page.merchant.businessName).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{page.title}</h1>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified Merchant: {page.brandName || page.merchant.businessName}
            </p>
          </div>
        </div>

        {page.description && (
          <p className="mb-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed border border-slate-100">
            {page.description}
          </p>
        )}

        <PaymentPageForm
          slug={page.slug}
          amountMode={page.amountMode}
          fixedAmount={page.fixedAmount ? Number(page.fixedAmount) : null}
        />
      </div>
    </div>
  );
}
