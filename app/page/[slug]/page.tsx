import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import PaymentPageForm from "./PaymentPageForm";

export default async function PaymentPagePublic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  let page = null;
  try {
    page = await prisma.paymentPage.findFirst({
      where: {
        OR: [
          { slug: decodedSlug },
          { slug: slug },
          { slug: { equals: decodedSlug, mode: "insensitive" } },
        ],
      },
      include: {
        merchant: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching payment page:", err);
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Payment Page Not Found</h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            The hosted page with identifier <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{decodedSlug}</code> does not exist or may have been deleted by the merchant.
          </p>
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
          {page.logoUrl ? (
            <img
              src={page.logoUrl}
              alt="Brand logo"
              className="h-12 w-12 rounded-xl object-contain border border-slate-100 p-1"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg text-white shadow-sm">
              {(page.brandName || page.merchant.businessName).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">{page.title}</h1>
            <p className="text-xs text-slate-500">
              Verified Merchant: {page.brandName || page.merchant.businessName}
            </p>
          </div>
        </div>

        {page.description && (
          <p className="mb-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed border border-slate-100">
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
