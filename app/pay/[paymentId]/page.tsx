"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Smartphone, 
  AtSign, 
  Lock, 
  RefreshCw, 
  ArrowRight,
  Clock
} from "lucide-react";

interface PaymentData {
  id: string;
  merchantOrderId: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  merchantName: string;
  environment: string;
  rrn?: string;
  upiUri: string;
  qrDataUrl: string;
  expiresAt?: string;
  createdAt: string;
}

export default function HostedCheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "intent" | "vpa">("qr");
  const [vpaInput, setVpaInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(899); // ~15 mins countdown

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/pay/${paymentId}`);
      if (!res.ok) {
        throw new Error("Payment request not found or expired");
      }
      const data = await res.json();
      setPayment(data.payment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
    const interval = setInterval(fetchPayment, 3500); // Poll status
    return () => clearInterval(interval);
  }, [paymentId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateStatus = async (status: "SUCCESS" | "FAILED") => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/pay/${paymentId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          upiVpa: vpaInput || "rahul@okaxis",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Simulation failed");
      } else {
        await fetchPayment();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "BHARATUPI_PAYMENT_COMPLETED",
              paymentId,
              status: data.status,
              rrn: data.rrn,
            },
            "*"
          );
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white p-6 shadow-sm">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-slate-600">Initializing secure UPI checkout...</span>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Unavailable</h2>
          <p className="mt-2 text-sm text-slate-600">{error || "Unable to retrieve payment information."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100/80 p-2 sm:p-4">
      {/* Test Mode Banner */}
      <div className="mb-3 flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-800 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        TEST MODE SIMULATOR • No actual funds will be debited
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl transition-all">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm shadow-blue-500/20">
                {payment.merchantName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {payment.merchantName}
                </h1>
                <p className="text-xs text-slate-500">Order: {payment.merchantOrderId}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>
          </div>

          {payment.description && (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 border border-slate-100">
              {payment.description}
            </div>
          )}
        </div>

        {/* Status Views */}
        {payment.status === "SUCCESS" ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="mt-1 text-sm text-slate-500">
              ₹{payment.amount.toFixed(2)} paid via UPI
            </p>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-mono font-medium text-slate-800">{payment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">UPI Ref (RRN)</span>
                <span className="font-mono font-bold text-slate-900">{payment.rrn || "628290184712"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-600">COMPLETED</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Receipt sent to {payment.customerEmail || "customer email"}. You can safely close this window.
            </p>
          </div>
        ) : payment.status === "FAILED" ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Failed</h2>
            <p className="mt-1 text-sm text-slate-500">
              Transaction was declined or cancelled.
            </p>

            <button
              onClick={() => handleSimulateStatus("SUCCESS")}
              disabled={processing}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              Retry Payment
            </button>
          </div>
        ) : (
          <div className="p-5">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  activeTab === "qr" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>UPI QR</span>
              </button>
              <button
                onClick={() => setActiveTab("intent")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  activeTab === "intent" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>UPI Apps</span>
              </button>
              <button
                onClick={() => setActiveTab("vpa")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  activeTab === "vpa" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                <AtSign className="h-4 w-4" />
                <span>UPI ID</span>
              </button>
            </div>

            {/* Tab 1: QR Code */}
            {activeTab === "qr" && (
              <div className="mt-5 flex flex-col items-center">
                <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-inner">
                  {payment.qrDataUrl ? (
                    <img
                      src={payment.qrDataUrl}
                      alt="UPI QR Code"
                      width={220}
                      height={220}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center text-xs text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-lg bg-white/90 p-1.5 shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold text-blue-700">UPI</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium text-slate-500 text-center">
                  Scan with any UPI app: Google Pay, PhonePe, Paytm, BHIM, CRED
                </p>
              </div>
            )}

            {/* Tab 2: UPI Apps / Intent */}
            {activeTab === "intent" && (
              <div className="mt-5 space-y-3">
                <a
                  href={payment.upiUri}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-blue-400 hover:bg-blue-50/40 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Open Default UPI App</div>
                      <div className="text-xs text-slate-500">Tap to launch PhonePe, GPay, or Paytm</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </a>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {["Google Pay", "PhonePe", "Paytm"].map((app) => (
                    <a
                      key={app}
                      href={payment.upiUri}
                      className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center hover:bg-slate-100 transition"
                    >
                      <span className="text-xs font-bold text-slate-700">{app}</span>
                      <span className="text-[10px] text-slate-400">Installed</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: UPI VPA Collect */}
            {activeTab === "vpa" && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Enter UPI ID / VPA</label>
                  <div className="mt-1 flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                      type="text"
                      placeholder="mobile@upi or name@okaxis"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">A payment collect request will be sent to your UPI app.</p>
                </div>

                <button
                  onClick={() => handleSimulateStatus("SUCCESS")}
                  disabled={processing}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Verify & Pay ₹{payment.amount.toFixed(2)}
                </button>
              </div>
            )}

            {/* MVP Test Simulator Controls */}
            <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Mock UPI Simulator
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                  Sandbox
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 mb-3">
                Trigger mock bank responses to verify webhook dispatch and immutable ledger credit.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateStatus("SUCCESS")}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Simulate Success
                </button>
                <button
                  onClick={() => handleSimulateStatus("FAILED")}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Simulate Failure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>Encrypted NPCI UPI Standard • Powered by </span>
            <span className="font-bold text-slate-800">BharatUPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
