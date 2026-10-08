"use client";

import { useEffect, useState, use } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Smartphone, 
  AtSign, 
  Lock, 
  RefreshCw, 
  ArrowRight,
  Clock,
  Copy,
  Check,
  Zap
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
  const [copiedVpa, setCopiedVpa] = useState(false);

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
          upiVpa: vpaInput || "payer@okaxis",
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

  const copyUpiId = () => {
    navigator.clipboard.writeText("test-merchant@bharatupi");
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-xl border border-slate-200/80">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Opening secure UPI checkout...</span>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl border border-slate-200/80">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Request Unavailable</h2>
          <p className="mt-2 text-xs text-slate-500">{error || "Unable to retrieve payment information."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100/90 p-3 sm:p-6 font-sans">
      {/* Test Sandbox Pill */}
      <div className="mb-3.5 flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-[11px] font-bold text-emerald-800 shadow-xs">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>TEST MODE • Test checkout sandbox</span>
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-md shadow-emerald-500/20">
                {payment.merchantName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {payment.merchantName}
                </h1>
                <p className="text-[11px] text-slate-500 font-mono">Order: {payment.merchantOrderId}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>
          </div>

          {payment.description && (
            <div className="mt-3.5 rounded-xl bg-slate-50 px-3.5 py-2 text-xs text-slate-600 border border-slate-100">
              {payment.description}
            </div>
          )}
        </div>

        {/* Status Views */}
        {payment.status === "SUCCESS" ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Payment Successful!</h2>
            <p className="mt-1 text-sm font-bold text-emerald-600">
              ₹{payment.amount.toFixed(2)} paid via UPI
            </p>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-medium text-slate-800">{payment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Bank Reference (UTR)</span>
                <span className="font-mono font-bold text-slate-900">{payment.rrn || "628290184712"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600">SUCCESS</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Receipt sent to customer. You can safely close this window.
            </p>
          </div>
        ) : payment.status === "FAILED" ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Payment Failed</h2>
            <p className="mt-1 text-xs text-slate-500">
              Transaction was declined or cancelled.
            </p>

            <button
              onClick={() => handleSimulateStatus("SUCCESS")}
              disabled={processing}
              className="mt-6 w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
            >
              Retry Payment
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Payment Method Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
                  activeTab === "qr" ? "bg-white text-emerald-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={() => setActiveTab("intent")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
                  activeTab === "intent" ? "bg-white text-emerald-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>UPI Apps</span>
              </button>
              <button
                onClick={() => setActiveTab("vpa")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
                  activeTab === "vpa" ? "bg-white text-emerald-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                <AtSign className="h-4 w-4" />
                <span>UPI ID</span>
              </button>
            </div>

            {/* Tab 1: QR Code */}
            {activeTab === "qr" && (
              <div className="mt-6 flex flex-col items-center">
                <div className="relative rounded-3xl border-2 border-emerald-500/20 bg-white p-3.5 shadow-lg">
                  {payment.qrDataUrl ? (
                    <img
                      src={payment.qrDataUrl}
                      alt="UPI QR Code"
                      width={210}
                      height={210}
                      className="rounded-2xl"
                    />
                  ) : (
                    <div className="flex h-52 w-52 items-center justify-center text-xs text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-xl bg-white px-2 py-1 shadow-md border border-slate-200">
                      <span className="text-[11px] font-black tracking-wider text-emerald-700">UPI</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                  <span className="font-mono text-[11px]">test-merchant@bharatupi</span>
                  <button
                    onClick={copyUpiId}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <p className="mt-3 text-[11px] font-medium text-slate-500 text-center">
                  Scan using Google Pay, PhonePe, Paytm, BHIM, or any banking app
                </p>
              </div>
            )}

            {/* Tab 2: UPI Apps / Intent */}
            {activeTab === "intent" && (
              <div className="mt-5 space-y-3">
                <a
                  href={payment.upiUri}
                  className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 hover:bg-emerald-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm">
                      UPI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Open Installed UPI App</div>
                      <div className="text-[11px] text-slate-500">Tap to launch PhonePe, GPay, or Paytm</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                </a>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a
                    href={payment.upiUri}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center hover:border-emerald-500 transition shadow-2xs"
                  >
                    <span className="text-xs font-bold text-indigo-600">Google Pay</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Pay via GPay</span>
                  </a>
                  <a
                    href={payment.upiUri}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center hover:border-emerald-500 transition shadow-2xs"
                  >
                    <span className="text-xs font-bold text-purple-600">PhonePe</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Pay via PhonePe</span>
                  </a>
                  <a
                    href={payment.upiUri}
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center hover:border-emerald-500 transition shadow-2xs"
                  >
                    <span className="text-xs font-bold text-cyan-600">Paytm</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Pay via Paytm</span>
                  </a>
                </div>
              </div>
            )}

            {/* Tab 3: UPI VPA Collect */}
            {activeTab === "vpa" && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Enter your UPI ID</label>
                  <div className="mt-1 flex rounded-2xl border border-slate-200 overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or name@okaxis"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">A payment collect request will be sent to your UPI app.</p>
                </div>

                <button
                  onClick={() => handleSimulateStatus("SUCCESS")}
                  disabled={processing}
                  className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
                >
                  Request & Pay ₹{payment.amount.toFixed(2)}
                </button>
              </div>
            )}

            {/* Instant Test Payment Box */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-500" />
                  Instant Sandbox Simulation
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Click below to instantly test a successful or failed payment callback.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateStatus("SUCCESS")}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Test Success
                </button>
                <button
                  onClick={() => handleSimulateStatus("FAILED")}
                  disabled={processing}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-50 shadow-xs"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Test Failure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>100% Secure UPI Payments • Powered by </span>
            <span className="font-bold text-slate-900">BharatUPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
