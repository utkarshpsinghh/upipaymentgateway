import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Share2,
  Wallet,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white selection:bg-emerald-500 selection:text-black font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/15 blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-slate-950 shadow-lg shadow-emerald-500/25">
              ₹
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">BharatUPI</span>
              <span className="text-[10px] text-emerald-400 font-medium">Merchant Payments</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95 transition shadow-md shadow-emerald-500/20"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen UPI Acquiring for Modern Businesses</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Accept Instant <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                UPI Payments
              </span>{" "}
              Everywhere.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Empower your business with zero-friction UPI checkout. Generate smart QR codes, share payment links on WhatsApp, build reusable payment pages, and get settled directly to your bank account.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-xs font-bold text-slate-950 hover:brightness-105 transition shadow-lg shadow-emerald-500/25"
              >
                <span>Open Merchant Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/page/swag-vip-membership"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition"
              >
                <span>View Live Hosted Page</span>
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Instant Bank Settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Works with 100% of UPI Apps</span>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-emerald-500/5 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-medium">Checkout Preview</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  LIVE SIMULATOR
                </span>
              </div>

              {/* Mock Payment Card */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Payable to</span>
                    <div className="text-sm font-bold text-white">Swag Fashion Retail</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Amount</span>
                    <div className="text-lg font-black text-emerald-400">₹1,499.00</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="mx-auto h-32 w-32 rounded-xl bg-white p-2.5 flex items-center justify-center shadow-md">
                    <QrCode className="h-full w-full text-slate-900" />
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400 font-medium">
                    Scan with any UPI app to pay
                  </p>
                </div>

                {/* UPI App Pills */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-300">
                  <div className="rounded-lg bg-indigo-950/60 border border-indigo-800/40 py-1.5 text-indigo-300">GPay</div>
                  <div className="rounded-lg bg-purple-950/60 border border-purple-800/40 py-1.5 text-purple-300">PhonePe</div>
                  <div className="rounded-lg bg-cyan-950/60 border border-cyan-800/40 py-1.5 text-cyan-300">Paytm</div>
                  <div className="rounded-lg bg-emerald-950/60 border border-emerald-800/40 py-1.5 text-emerald-300">CRED</div>
                </div>

                <Link
                  href="/l/summer-hoodie"
                  className="block w-full text-center rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Open Live Link Test →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-7 hover:border-slate-700 transition">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-5">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant UPI Intent & QR</h3>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-normal">
              Seamlessly open Google Pay, PhonePe, or Paytm directly on customer mobile devices, or show an instant auto-updating QR code on desktop checkout.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-7 hover:border-slate-700 transition">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-5">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Payment Links</h3>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-normal">
              Create and share custom branded payment links in seconds via WhatsApp, SMS, or social media. Configure limits, customer details, and expiry timers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-7 hover:border-slate-700 transition">
            <div className="h-11 w-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-5">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Transparent Settlements</h3>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-normal">
              Always know exactly what you've earned. Track payouts, review transaction history, and get settled straight into your bank account with complete clarity.
            </p>
          </div>
        </div>

        {/* Quick Demo Access Box */}
        <div className="mt-20 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                <Zap className="h-3.5 w-3.5" />
                <span>Instant Demo Access</span>
              </div>
              <h3 className="text-xl font-bold text-white">Test the Merchant Console Right Now</h3>
              <p className="text-xs text-slate-400 mt-1">
                Log in immediately with our pre-configured demo merchant account to explore all features.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
              >
                Sign In as Merchant
              </Link>
              <Link
                href="/admin"
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-200 hover:text-white transition"
              >
                Sign In as Admin
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 BharatUPI Gateway. All rights reserved. Fast & secure UPI collections.</p>
      </footer>
    </div>
  );
}
