import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import PaymentLinkForm from "./PaymentLinkForm";

export default async function PaymentLinkPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const link = await prisma.paymentLink.findUnique({
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

  if (!link) {
    notFound();
  }

  const isExpired = link.expiresAt && new Date() > link.expiresAt;
  const isLimitReached = link.maxPayments && link.paymentCount >= link.maxPayments;
  const isInactive = link.status !== "ACTIVE" || isExpired || isLimitReached;

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

        {isInactive ? (
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
