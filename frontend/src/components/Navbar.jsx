import React from 'react';
import { Search, PlusCircle, AlertCircle, CheckCircle2, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';

export default function Navbar({
  health,
  onOpenReport,
  onOpenDevOps,
  onRefresh,
  loading
}) {
  const isHealthy = health?.status === 'UP';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Search className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Find<span className="text-emerald-400">IT</span></span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Campus Lost & Found Management System</p>
          </div>
        </div>

        {/* Center / Health Status & DevOps Info */}
        <div className="flex items-center gap-2">
          {/* System Health Badge */}
          <div
            id="system-health-badge"
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isHealthy
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span>API: {health?.status || 'CHECKING'}</span>
            <span className="text-slate-500">|</span>
            <span className="capitalize text-slate-300">DB: {health?.database || 'memory'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh items list"
            id="refresh-btn"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* DevOps Pipeline Modal Button */}
          <button
            onClick={onOpenDevOps}
            id="devops-info-btn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DevOps MPR (Exp 1–7)</span>
            <span className="sm:hidden">DevOps</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReport('LOST')}
            id="report-lost-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs sm:text-sm font-semibold transition"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Report Lost</span>
          </button>

          <button
            onClick={() => onOpenReport('FOUND')}
            id="report-found-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Report Found</span>
          </button>
        </div>
      </div>
    </header>
  );
}
