"use client";

import { Shield } from "lucide-react";

export default function AdminNavbar({ adminEmail }: { adminEmail?: string }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 text-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-1 text-xs font-bold text-indigo-300">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          SYSTEM OPERATOR ACCESS
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-200">{adminEmail || "admin@bharatupi.internal"}</div>
          <div className="text-[10px] text-slate-400">Super Administrator</div>
        </div>
        <div className="h-8 w-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
          A
        </div>
      </div>
    </header>
  );
}
