import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Lock,
  Building2,
  Code2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20">
              ₹
            </div>
            <span className="text-lg font-bold tracking-tight">BharatUPI Gateway</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
            >
              Onboard Merchant →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-medium text-blue-300 mb-6">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Razorpay-Inspired • Indian UPI Acquiring Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            High-Performance <span className="text-blue-500">UPI Gateway</span> for Approved Merchants.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
            Full-stack UPI payments platform featuring dynamic QR codes, app intent flows, double-entry immutable ledgers, manual bank escrow settlements, and verified HMAC webhooks.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30"
            >
              <span>Merchant Console (Swag Retail)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <span>Admin Operations Console</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <span>Submit KYC Application</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="h-10 w-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold mb-4">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Unified UPI Checkout</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Standard NPCI QR payloads, direct UPI app intent (PhonePe, GPay, Paytm, BHIM), and VPA collect with instant simulator sandbox.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Double-Entry Immutable Ledger</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Zero editable balance columns. Balances are calculated dynamically from immutable credit/debit records, MDR fee deductions, and settlement payouts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="h-10 w-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Escrow & Settlement Desk</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Admin review desk for bank batch transfers, balance validation checks, UTR number recording, and automated merchant notification.
            </p>
          </div>
        </div>

        {/* Credentials cheat-sheet */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 max-w-2xl">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick-Start Demo Credentials
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="font-semibold text-blue-400 block">Approved Merchant Portal:</span>
              <span className="text-slate-300">Email: merchant@swagfashion.in</span>
              <br />
              <span className="text-slate-400">Password: MerchantPassword@123</span>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <span className="font-semibold text-red-400 block">Super Administrator Console:</span>
              <span className="text-slate-300">Email: admin@bharatupi.internal</span>
              <br />
              <span className="text-slate-400">Password: AdminPassword@123</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
