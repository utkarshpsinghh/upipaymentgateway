"use client";

import { Bell, ShieldCheck } from "lucide-react";

export default function MerchantNavbar({
  userEmail,
  environment = "TEST",
}: {
  userEmail?: string;
  environment?: string;
}) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Environment toggle badge */}
        <div className="flex items-center rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
          <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
          TEST MODE
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Transactions use simulated UPI responses
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-slate-800">{userEmail || "merchant"}</div>
          <div className="text-[10px] text-slate-400">Approved Merchant Portal</div>
        </div>

        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs text-blue-700">
          {(userEmail || "M").slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
