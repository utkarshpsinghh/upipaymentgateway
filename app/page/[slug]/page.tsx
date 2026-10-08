import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import PaymentPageForm from "./PaymentPageForm";

export default async function PaymentPagePublic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await prisma.paymentPage.findUnique({
    where: { slug },
    include: {
      merchant: {
        select: {
          businessName: true,
          email: true,
        },
      },
    },
  });

  if (!page) {
    notFound();
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
