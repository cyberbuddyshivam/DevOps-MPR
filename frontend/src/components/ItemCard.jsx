import React from 'react';
import { Calendar, MapPin, Tag, Sparkles, User, ExternalLink, ArrowRight } from 'lucide-react';

export default function ItemCard({ item, onViewDetails }) {
  const isLost = item.type === 'LOST';
  const hasMatches = item.matches && item.matches.length > 0;
  const bestMatchScore = hasMatches
    ? Math.max(...item.matches.map(m => parseFloat(m.match_score || 0)))
    : null;

  const isClaimed = item.status === 'CLAIMED';
  const isClosed = item.status === 'CLOSED';

  // Category Colors
  const categoryColorMap = {
    Electronics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Documents: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Accessories: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Clothing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Books: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const catStyle = categoryColorMap[item.category] || categoryColorMap.Other;

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group relative rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
        hasMatches && item.status === 'ACTIVE'
          ? 'ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'border border-slate-800'
      }`}
    >
      {/* Top Banner if Matches Exist */}
      {hasMatches && item.status === 'ACTIVE' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-slate-950 font-bold px-3 py-1 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>POSSIBLE MATCH FOUND</span>
          </div>
          <span className="bg-slate-950/20 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
            {bestMatchScore ? `${Math.round(bestMatchScore)}% Match` : 'Rule Match'}
          </span>
        </div>
      )}

      {/* Image or Category Fallback */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden border-b border-slate-800/80">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <Tag className="w-12 h-12 text-slate-700 group-hover:scale-110 transition" />
          </div>
        )}

        {/* Type Badge (LOST / FOUND) */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase shadow-md ${
              isLost
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-md ${
              isClaimed
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                : isClosed
                ? 'bg-slate-950/80 text-slate-400 border-slate-700'
                : 'bg-slate-950/80 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={`px-2 py-0.5 rounded-md border font-medium ${catStyle}`}>
              {item.category}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition line-clamp-1 mb-1.5">
            {item.title}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {item.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>

        {/* Footer info & View Details button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <User className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[100px]">{item.reporter_name || 'Campus Student'}</span>
          </div>

          <button
            onClick={() => onViewDetails(item)}
            id={`view-details-${item.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-0.5 transition"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
