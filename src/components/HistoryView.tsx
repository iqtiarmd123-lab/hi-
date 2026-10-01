import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Search,
  Filter,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AuditEvent } from '../types';
import { clearAuditLogs } from '../services/securityEngine';

interface HistoryViewProps {
  auditEvents: AuditEvent[];
  onRefreshEvents: () => void;
  language: 'auto' | 'en' | 'bn';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  auditEvents,
  onRefreshEvents,
  language,
}) => {
  const isBengali = language === 'bn';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredEvents = auditEvents.filter((ev) => {
    const matchesSearch =
      ev.toolName.toLowerCase().includes(search.toLowerCase()) ||
      ev.target.toLowerCase().includes(search.toLowerCase()) ||
      ev.scope.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || ev.resultStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleClear = () => {
    if (confirm(isBengali ? 'আপনি কি নিশ্চিত যে সমস্ত অডিট লগ মুছে ফেলতে চান?' : 'Are you sure you want to clear all audit logs?')) {
      clearAuditLogs();
      onRefreshEvents();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Tool', 'Target', 'Scope', 'Status', 'Permission', 'ActionsCount', 'Details'];
    const rows = auditEvents.map((e) => [
      e.timestamp,
      e.toolName,
      e.target,
      e.scope,
      e.resultStatus,
      `${e.permissionLevel}%`,
      e.actionCount,
      `"${(e.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            {isBengali ? 'সিকিউরিটি অডিট লগ ও ইতিহাস' : 'Security Audit Trail & History'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'প্ল্যাটফর্মে সম্পাদিত প্রতিটি ডায়াগনস্টিক, পারমিশন লেভেল এবং টার্গেট স্কোপের অপরিবর্তনীয় রেকর্ড।'
              : 'Audit log of actions, permission validations, target scopes, and execution timestamps.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={auditEvents.length === 0}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleClear}
            disabled={auditEvents.length === 0}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-500/40 text-zinc-400 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder={isBengali ? 'টার্গেট, টুল বা স্কোপ দিয়ে খুঁজুন...' : 'Search logs by target, tool, or scope...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">{isBengali ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
          <option value="SIMULATED">SIMULATED</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Perm / Acts</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                    {isBengali ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি।' : 'No audit records match your query.'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-[11px] text-zinc-500 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-100">{ev.toolName}</td>
                    <td className="px-4 py-3 text-cyan-400 font-semibold">{ev.target}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {ev.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {ev.permissionLevel}% · {ev.actionCount} acts
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          ev.resultStatus === 'SIMULATED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : ev.resultStatus === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ev.resultStatus === 'BLOCKED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {ev.resultStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
