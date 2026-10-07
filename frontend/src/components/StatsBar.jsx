import React from 'react';
import { Layers, AlertTriangle, CheckCircle, Sparkles, MapPin } from 'lucide-react';

export default function StatsBar({ items, onQuickFilter }) {
  const total = items.length;
  const lostCount = items.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length;
  const foundCount = items.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length;
  const claimedCount = items.filter(i => i.status === 'CLAIMED').length;
  const matchCandidates = items.filter(i => i.matches && i.matches.length > 0).length;

  const stats = [
    {
      id: 'stat-total',
      label: 'Total Registered',
      value: total,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      filter: { type: 'ALL', status: 'ALL' }
    },
    {
      id: 'stat-lost',
      label: 'Active Lost Items',
      value: lostCount,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      filter: { type: 'LOST', status: 'ACTIVE' }
    },
    {
      id: 'stat-found',
      label: 'Active Found Items',
      value: foundCount,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      filter: { type: 'FOUND', status: 'ACTIVE' }
    },
    {
      id: 'stat-claimed',
      label: 'Claimed & Resolved',
      value: claimedCount,
      icon: Sparkles,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      filter: { type: 'ALL', status: 'CLAIMED' }
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            id={s.id}
            onClick={() => onQuickFilter(s.filter)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition hover:scale-[1.01] active:scale-[0.99] ${s.bg}`}
          >
            <div className={`p-2 rounded-lg bg-slate-900/60 ${s.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                {s.value}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium truncate">
                {s.label}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
