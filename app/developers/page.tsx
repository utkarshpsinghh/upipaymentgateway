"use client";

import { useEffect, useState } from "react";
import MerchantSidebar from "@/components/dashboard/MerchantSidebar";
import MerchantNavbar from "@/components/dashboard/MerchantNavbar";
import {
  Code2,
  Key,
  Webhook,
  BookOpen,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs" | "simulator">("keys");

  // API Keys state
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("Server Backend Integration");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Webhooks state
  const [webhookConfig, setWebhookConfig] = useState<any>(null);
  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Simulator state
  const [simAmount, setSimAmount] = useState("499");
  const [simOrderId, setSimOrderId] = useState(`ORD_${Math.floor(100000 + Math.random() * 900000)}`);
  const [simCustomerName, setSimCustomerName] = useState("Rahul Sharma");
  const [simCreatedPayment, setSimCreatedPayment] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/merchant/keys");
      if (res.ok) {
        const json = await res.json();
        setKeys(json.keys || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/merchant/webhooks");
      if (res.ok) {
        const json = await res.json();
        setWebhookConfig(json.config);
        setTestWebhookUrl(json.config?.testWebhookUrl || "");
        setDeliveries(json.recentDeliveries || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/merchant/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName, environment: "TEST", type: "SECRET" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate key");
      } else {
        setNewlyCreatedKey(data.fullKey);
        fetchKeys();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      await fetch(`/api/merchant/keys?id=${id}`, { method: "DELETE" });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveWebhooks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/merchant/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testWebhookUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Webhook settings saved successfully!");
        fetchWebhooks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestPing = async () => {
    setPingStatus("sending");
    try {
      const res = await fetch("/api/merchant/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TEST_PING" }),
      });
      if (res.ok) {
        setPingStatus("dispatched");
        setTimeout(() => {
          fetchWebhooks();
          setPingStatus(null);
        }, 1500);
      }
    } catch (e) {
      setPingStatus("error");
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sk_test_swag_demo_7890abcdef123456",
          "Idempotency-Key": `IDEMP_${Date.now()}`,
        },
        body: JSON.stringify({
          merchant_order_id: simOrderId,
          amount: parseFloat(simAmount),
          currency: "INR",
          customer: {
            name: simCustomerName,
            email: "rahul@example.com",
            phone: "9876543210",
          },
          description: "Developer Sandbox Test Order",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "Payment creation failed");
      } else {
        setSimCreatedPayment(data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MerchantSidebar businessName="Swag Fashion Retail" />

      <div className="flex-1 flex flex-col min-w-0">
        <MerchantNavbar userEmail="merchant@swagfashion.in" />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Developer Center</h1>
            <p className="text-xs text-slate-500">
              API credentials, HMAC webhook configurations, interactive simulator, and integration specs
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600 max-w-md">
            <button
              onClick={() => setActiveTab("keys")}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === "keys" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("webhooks")}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === "webhooks" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Webhooks
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === "simulator" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Test Simulator
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`flex-1 py-2 rounded-lg transition ${
                activeTab === "docs" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              API Reference
            </button>
          </div>

          {/* TAB 1: API KEYS */}
          {activeTab === "keys" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">API Credentials</h2>
                  <p className="text-xs text-slate-500">
                    Use secret keys (<code>sk_test_</code>) server-side only. Do not expose in client browsers.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewlyCreatedKey(null);
                    setNewKeyModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate New Key</span>
                </button>
              </div>

              {/* Demo Notice */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-bold">Pre-configured Demo Secret Key:</span>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-blue-200 select-all">
                    <span>sk_test_swag_demo_7890abcdef123456</span>
                    <button
                      onClick={() => copyToClipboard("sk_test_swag_demo_7890abcdef123456")}
                      className="ml-auto text-blue-600 font-semibold text-[10px]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Keys Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-5">Name</th>
                      <th className="py-3 px-5">Masked Key</th>
                      <th className="py-3 px-5">Environment</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5">Created</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">{k.name}</td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{k.maskedKey}</td>
                        <td className="py-3.5 px-5">
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            {k.environment}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          {k.revokedAt ? (
                            <span className="text-[10px] font-bold text-rose-600">REVOKED</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {new Date(k.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {!k.revokedAt && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-rose-600 hover:text-rose-800 font-semibold"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Generate Key Modal */}
              {newKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                    <h2 className="text-base font-bold text-slate-900">Generate API Key</h2>

                    {newlyCreatedKey ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold block mb-1">Save this key now!</span>
                          For security, this secret key will never be displayed again.
                        </div>

                        <div className="rounded-xl bg-slate-900 p-3 text-xs font-mono text-emerald-400 select-all break-all">
                          {newlyCreatedKey}
                        </div>

                        <button
                          onClick={() => {
                            copyToClipboard(newlyCreatedKey);
                            setNewKeyModal(false);
                          }}
                          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Copy and Done
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateKey} className="mt-4 space-y-3.5">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Key Name</label>
                          <input
                            type="text"
                            required
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="e.g. Primary Node.js Backend"
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewKeyModal(false)}
                            className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Generate
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEBHOOKS */}
          {activeTab === "webhooks" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Webhook Configuration</h2>
                    <p className="text-xs text-slate-500">
                      We notify your endpoint on payment.success, payment.failed, and settlement.completed events.
                    </p>
                  </div>
                  <button
                    onClick={handleTestPing}
                    disabled={pingStatus === "sending"}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Send className="h-3.5 w-3.5 text-blue-600" />
                    <span>{pingStatus === "sending" ? "Sending..." : "Send Test Ping"}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveWebhooks} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Test Webhook URL</label>
                    <input
                      type="url"
                      value={testWebhookUrl}
                      onChange={(e) => setTestWebhookUrl(e.target.value)}
                      placeholder="https://yourdomain.com/api/webhooks/bharatpay"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Webhook Signing Secret</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookConfig?.testWebhookSecret || "whsec_test_c0989f6b86ab88d6174a89"}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(webhookConfig?.testWebhookSecret || "")}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Save Webhook URL
                  </button>
                </form>
              </div>

              {/* Recent Deliveries */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Recent Webhook Deliveries</h2>
                  <p className="text-xs text-slate-500">Live delivery status and HTTP response codes</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-5">Event</th>
                        <th className="py-3 px-5">Destination URL</th>
                        <th className="py-3 px-5">Status</th>
                        <th className="py-3 px-5">Attempts</th>
                        <th className="py-3 px-5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {deliveries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No webhook deliveries dispatched yet. Click "Send Test Ping" or simulate a payment.
                          </td>
                        </tr>
                      ) : (
                        deliveries.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-5 font-mono font-bold text-slate-900">{d.event}</td>
                            <td className="py-3 px-5 font-mono text-slate-600 truncate max-w-[240px]">{d.url}</td>
                            <td className="py-3 px-5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  d.status === "SUCCESS"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {d.status} ({d.statusCode || "N/A"})
                              </span>
                            </td>
                            <td className="py-3 px-5">{d.attempts}</td>
                            <td className="py-3 px-5 text-slate-500">
                              {new Date(d.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATOR */}
          {activeTab === "simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Payment Simulator</h2>
                  <p className="text-xs text-slate-500">
                    Instantly create a sandbox UPI payment request to test checkout and webhooks
                  </p>
                </div>

                <form onSubmit={handleSimulatePayment} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Order ID</label>
                    <input
                      type="text"
                      required
                      value={simOrderId}
                      onChange={(e) => setSimOrderId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Customer Name</label>
                    <input
                      type="text"
                      value={simCustomerName}
                      onChange={(e) => setSimCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={simulating}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {simulating ? "Creating..." : "Create Test Payment via API"}
                  </button>
                </form>
              </div>

              {/* Result Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">API Response</h2>
                  {simCreatedPayment ? (
                    <div className="space-y-4">
                      <pre className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                        <code>{JSON.stringify(simCreatedPayment, null, 2)}</code>
                      </pre>

                      <a
                        href={simCreatedPayment.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Launch Hosted Checkout ↗
                      </a>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      Submit the form on the left to invoke <code>POST /api/v1/payments</code> and preview the payload.
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                  In hosted checkout, use the "Simulate Success" button to complete the cycle.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API REFERENCE */}
          {activeTab === "docs" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">REST API Reference</h2>
                <p className="text-xs text-slate-500">
                  Authenticate all requests using the Bearer Authorization header: <code>Authorization: Bearer sk_test_...</code>
                </p>
              </div>

              {/* Endpoint 1 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/payments</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600">Creates a new UPI payment and returns a hosted checkout URL.</p>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Request Payload:</span>
                    <pre className="rounded-lg bg-slate-950 p-3 text-xs font-mono text-slate-200 overflow-x-auto">
{`{
  "merchant_order_id": "ORDER-10001",
  "amount": 499,
  "currency": "INR",
  "customer": {
    "name": "Rahul",
    "email": "customer@example.com",
    "phone": "9999999999"
  },
  "description": "Premium Product"
}`}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Response (201 Created):</span>
                    <pre className="rounded-lg bg-slate-950 p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
{`{
  "payment_id": "pay_m6z1k8...",
  "merchant_order_id": "ORDER-10001",
  "amount": 499,
  "currency": "INR",
  "status": "PENDING",
  "payment_url": "http://localhost:3000/pay/pay_m6z1k8..."
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">GET</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/payments/:id</span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-600">Retrieves real-time status and bank RRN of a payment.</p>
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                  <span className="rounded bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/payments/:id/refund</span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-600">Refunds a successful payment and debits the merchant ledger.</p>
                </div>
              </div>

              {/* Webhook Signature Verification Guide */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                <h3 className="text-xs font-bold text-slate-900">Verifying HMAC-SHA256 Webhooks</h3>
                <p className="text-xs text-slate-600">
                  Validate the <code>X-Gateway-Signature</code> header:
                </p>
                <pre className="rounded-lg bg-slate-950 p-3 text-xs font-mono text-slate-200 overflow-x-auto">
{`const crypto = require("crypto");

function verifyWebhook(rawPayload, headerSignature, secret, timestamp) {
  const signed = timestamp + "." + rawPayload;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  return headerSignature === ("v1=" + expected);
}`}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
