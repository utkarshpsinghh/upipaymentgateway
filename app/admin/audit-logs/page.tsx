"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  ClipboardList,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
          <div>
            <h1 className="text-xl font-bold text-white">Security Audit Trail</h1>
            <p className="text-xs text-slate-400">
              Tamper-evident log of all sensitive admin actions, approvals, settlements, and security events
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-5">Timestamp (UTC)</th>
                    <th className="py-3 px-5">Actor</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Action</th>
                    <th className="py-3 px-5">Entity</th>
                    <th className="py-3 px-5">Details / Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                        No audit records found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-5 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toISOString()}
                        </td>
                        <td className="py-3 px-5 font-semibold text-white font-sans">
                          {log.actor}
                        </td>
                        <td className="py-3 px-5 font-sans">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {log.actorRole}
                          </span>
                        </td>
                        <td className="py-3 px-5 font-bold text-red-400">
                          {log.action}
                        </td>
                        <td className="py-3 px-5 text-slate-300">
                          {log.entity}:{log.entityId?.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-5 text-slate-400 max-w-xs truncate">
                          {log.newValue ? JSON.stringify(log.newValue) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
