"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Link2,
  FileText,
  SquareCode,
  Building,
  BarChart3,
  Code2,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Payment Links", href: "/payment-links", icon: Link2 },
  { name: "Payment Pages", href: "/payment-pages", icon: FileText },
  { name: "Payment Buttons", href: "/payment-buttons", icon: SquareCode },
  { name: "Bank Payouts", href: "/settlements", icon: Building },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Developers", href: "/developers", icon: Code2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MerchantSidebar({
  merchantStatus,
  businessName,
}: {
  merchantStatus?: string;
  businessName?: string;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white text-base shadow-sm">
              ₹
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-tight block">BharatUPI</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Merchant Hub</span>
            </div>
          </Link>
        </div>

        {/* Merchant Status Badge */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
              {businessName || "Merchant"}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                merchantStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : merchantStatus === "PENDING"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {merchantStatus || "PENDING"}
            </span>
          </div>

          {merchantStatus !== "APPROVED" && (
            <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>Pending admin review. Only sandbox payments enabled.</span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
