"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";

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
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel - brand info */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
              ₹
            </div>
            <span className="text-xl font-bold tracking-tight">BharatUPI Gateway</span>
          </div>

          <div className="mt-20 max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 px-3 py-1 text-xs font-semibold text-blue-200 mb-4">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              Regulated Indian Fintech Architecture
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Next-generation UPI acquiring infrastructure for Indian businesses.
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Accept zero-friction UPI QR, intent payments, dynamic links, and webhook automation backed by double-entry immutable ledger accounting.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-slate-800 pt-6 text-xs text-slate-400 flex justify-between items-center">
          <span>NPCI UPI Standards Compliant</span>
          <span>Abstracted Settlement Architecture</span>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Access merchant portal or administrative controls
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-2">
              ⚡ Quick Fill Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("merchant")}
                className="rounded-lg bg-white border border-blue-200 px-2 py-1.5 text-[11px] font-semibold text-blue-800 hover:bg-blue-50 transition shadow-xs text-center"
              >
                Approved Merchant
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                className="rounded-lg bg-white border border-blue-200 px-2 py-1.5 text-[11px] font-semibold text-blue-800 hover:bg-blue-50 transition shadow-xs text-center"
              >
                Platform Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials("pending")}
                className="rounded-lg bg-white border border-blue-200 px-2 py-1.5 text-[11px] font-semibold text-blue-800 hover:bg-blue-50 transition shadow-xs text-center"
              >
                Pending Merchant
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
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
            Need a merchant account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Submit merchant onboarding application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
