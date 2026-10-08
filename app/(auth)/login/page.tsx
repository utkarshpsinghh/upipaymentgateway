"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, Sparkles, Building2, UserCheck, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("merchant@swagfashion.in");
  const [password, setPassword] = useState("MerchantPassword@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: "merchant" | "admin" | "pending") => {
    if (role === "merchant") {
      setEmail("merchant@swagfashion.in");
      setPassword("MerchantPassword@123");
    } else if (role === "admin") {
      setEmail("admin@bharatupi.internal");
      setPassword("AdminPassword@123");
    } else {
      setEmail("onboarding@techsol.in");
      setPassword("MerchantPassword@123");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left panel - Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B132B] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-lg shadow-emerald-500/25">
              ₹
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block leading-tight">BharatUPI</span>
              <span className="text-[11px] text-emerald-400 font-medium">Merchant Console</span>
            </div>
          </Link>

          <div className="mt-24 max-w-md">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simple, Fast & Secure UPI Collections</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage your UPI payments, links, and payouts with complete ease.
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
              Accept money via dynamic QR codes, create branded payment links, and get settled straight into your verified bank account.
            </p>

            <div className="mt-8 space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Instant QR generation with all UPI apps</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>One-click payment links for WhatsApp & SMS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Real-time transaction notifications</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-800 pt-6 text-xs text-slate-400 flex justify-between items-center">
          <span>Direct Bank Payouts</span>
          <span>Zero Setup Fees</span>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
              ₹
            </div>
            <span className="text-lg font-bold text-slate-900">BharatUPI</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter your credentials to access your merchant portal
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                ⚡ Quick Fill Demo Logins
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                One-Click
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("merchant")}
                className="rounded-xl bg-white border border-emerald-200/80 p-2 text-[11px] font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition shadow-xs text-center"
              >
                <div className="font-bold text-emerald-600">Merchant</div>
                <div className="text-[10px] text-slate-400 font-normal">Swag Retail</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="rounded-xl bg-white border border-emerald-200/80 p-2 text-[11px] font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition shadow-xs text-center"
              >
                <div className="font-bold text-indigo-600">Admin</div>
                <div className="text-[10px] text-slate-400 font-normal">Platform Desk</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("pending")}
                className="rounded-xl bg-white border border-emerald-200/80 p-2 text-[11px] font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition shadow-xs text-center"
              >
                <div className="font-bold text-amber-600">Applicant</div>
                <div className="text-[10px] text-slate-400 font-normal">TechSol</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Apply for merchant onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
