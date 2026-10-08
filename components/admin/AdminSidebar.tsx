"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Building,
  BookOpen,
  ClipboardList,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Merchants", href: "/admin/merchants", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Settlements", href: "/admin/settlements", icon: Building },
  { name: "Ledger", href: "/admin/ledger", icon: BookOpen },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 text-white flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 font-bold text-white text-sm shadow-md">
              ⚡
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-tight block">BharatUPI</span>
              <span className="text-[10px] text-red-400 font-semibold tracking-wide uppercase">Admin Control</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-800 text-white border-l-2 border-red-500"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-red-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
}
