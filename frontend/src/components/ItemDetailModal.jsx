import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  User,
  Mail,
  Phone,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { getItemMatches, updateItemStatus } from '../services/api';

export default function ItemDetailModal({
  item,
  onClose,
  onStatusUpdated,
  onSelectMatchedItem
}) {
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'matches'

  useEffect(() => {
    if (!item?.id) return;
    setLoadingMatches(true);
    getItemMatches(item.id)
      .then(res => {
        setMatches(res.matches || []);
        if (res.matches && res.matches.length > 0) {
          // If matches exist, default or highlight them
        }
      })
      .catch(err => console.error('Failed to load matches:', err))
      .finally(() => setLoadingMatches(false));
  }, [item?.id]);

  if (!item) return null;

  const isLost = item.type === 'LOST';
  const hasMatches = matches.length > 0;

  const handleStatusChange = async newStatus => {
    try {
      setStatusUpdating(true);
      await updateItemStatus(item.id, newStatus);
      onStatusUpdated(item.id, newStatus);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div
      id="item-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target.id === 'item-detail-modal-overlay') onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                isLost ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {item.type}
            </span>
            <span className="text-xs text-slate-400 font-mono">ID #{item.id}</span>
          </div>

          <button
            onClick={onClose}
            id="close-modal-btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Possible Match Alert Banner */}
        {hasMatches && item.status === 'ACTIVE' && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-b border-emerald-500/30 p-4 px-6 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Rule-Based Match Detected!</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
                    {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} &gt; 60%
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  FindIT matching engine detected counterpart items matching category, title, or location.
                </p>
              </div>
            </div>

            <button
              id="view-matches-tab-btn"
              onClick={() => setActiveTab('matches')}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Inspect ({matches.length})
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition mr-6 ${
              activeTab === 'details'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Item Details
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Potential Matches</span>
            {matches.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {matches.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Media & Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                {/* Image */}
                <div className="sm:col-span-5 h-48 sm:h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop';
                      }}
                    />
                  ) : (
                    <Tag className="w-14 h-14 text-slate-700" />
                  )}
                </div>

                {/* Core Attributes */}
                <div className="sm:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                        {item.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                          item.status === 'CLAIMED'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                            : item.status === 'CLOSED'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        Status: {item.status}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Reported: {new Date(item.created_at || Date.now()).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Change Status:</span>
                    <button
                      onClick={() => handleStatusChange('CLAIMED')}
                      disabled={statusUpdating || item.status === 'CLAIMED'}
                      id="mark-claimed-btn"
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold border border-blue-500/30 disabled:opacity-50 transition"
                    >
                      Mark Claimed
                    </button>
                    <button
                      onClick={() => handleStatusChange('CLOSED')}
                      disabled={statusUpdating || item.status === 'CLOSED'}
                      id="mark-closed-btn"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 disabled:opacity-50 transition"
                    >
                      Close
                    </button>
                    {item.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange('ACTIVE')}
                        disabled={statusUpdating}
                        id="mark-active-btn"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Reporter Contact Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <User className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 text-[10px]">Name</p>
                      <p className="font-semibold text-white">{item.reporter_name || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-slate-400 text-[10px]">Email</p>
                      <a
                        href={`mailto:${item.reporter_email}`}
                        className="font-semibold text-cyan-300 hover:underline truncate block"
                      >
                        {item.reporter_email || 'N/A'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-slate-400 text-[10px]">Phone</p>
                      <a href={`tel:${item.reporter_phone}`} className="font-semibold text-emerald-300 hover:underline">
                        {item.reporter_phone || 'N/A'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              {loadingMatches ? (
                <div className="py-12 text-center text-slate-400 text-sm">Evaluating matches with database...</div>
              ) : matches.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No matches exceeding 60% threshold yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When someone reports a matching {isLost ? 'FOUND' : 'LOST'} item in the same category or location,
                    it will appear here automatically.
                  </p>
                </div>
              ) : (
                matches.map(m => {
                  const counterpart = m.counterpart_item || {};
                  const score = parseFloat(m.match_score || 0);

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-lg relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                counterpart.type === 'FOUND'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              COUNTERPART: {counterpart.type}
                            </span>
                            <span className="text-xs text-slate-400">ID #{counterpart.id}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{counterpart.title}</h4>
                        </div>

                        {/* Match Score Gauge */}
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-emerald-400 leading-none">
                            {score.toFixed(1)}%
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Confidence</span>
                        </div>
                      </div>

                      {/* Score Breakdown Pills */}
                      <div className="grid grid-cols-4 gap-2 mb-3 text-center text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <p className="text-slate-400">Category</p>
                          <p className="font-bold text-emerald-400">30% Max</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Title Jaccard</p>
                          <p className="font-bold text-cyan-400">30% Max</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="font-bold text-blue-400">25% Max</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Description</p>
                          <p className="font-bold text-purple-400">15% Max</p>
                        </div>
                      </div>

                      {/* Details of matched item */}
                      <p className="text-xs text-slate-300 mb-2">{counterpart.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          {counterpart.location}
                        </span>
                        {counterpart.reporter_name && (
                          <span>Contact: {counterpart.reporter_name} ({counterpart.reporter_phone})</span>
                        )}
                      </div>

                      {/* Jump to Matched Item Button */}
                      <button
                        onClick={() => {
                          onClose();
                          onSelectMatchedItem(counterpart);
                        }}
                        className="mt-3 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <span>Open Matched Item #{counterpart.id}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
