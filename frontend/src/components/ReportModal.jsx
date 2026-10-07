import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { createItem } from '../services/api';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Accessories',
  'Clothing',
  'Books',
  'Other'
];

export default function ReportModal({
  initialType = 'LOST',
  onClose,
  onItemCreated
}) {
  const [type, setType] = useState(initialType);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    image_url: '',
    name: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Demo autofill scenarios for fast testing and viva presentation
  const handleQuickFill = scenario => {
    if (scenario === 'lost-laptop') {
      setType('LOST');
      setFormData({
        title: 'Dell Inspiron 15 Laptop',
        category: 'Electronics',
        location: 'Central Library 2nd Floor',
        date: new Date().toISOString().split('T')[0],
        description: 'Black Dell laptop with React sticker on lid and charger inside dark sleeve.',
        image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop',
        name: 'DevOps Demo Student',
        email: 'student@college.edu',
        phone: '+91 98765 12345'
      });
    } else if (scenario === 'found-laptop') {
      setType('FOUND');
      setFormData({
        title: 'Dell Laptop with charger',
        category: 'Electronics',
        location: 'Central Library Reading Hall',
        date: new Date().toISOString().split('T')[0],
        description: 'Found black Dell laptop left near study tables with charger inside dark sleeve.',
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop',
        name: 'Library Admin Staff',
        email: 'admin@college.edu',
        phone: '+91 91234 56789'
      });
    } else if (scenario === 'lost-id') {
      setType('LOST');
      setFormData({
        title: 'RFID College ID Card',
        category: 'Documents',
        location: 'Main Canteen Block A',
        date: new Date().toISOString().split('T')[0],
        description: 'Computer Engineering ID card with blue lanyard.',
        image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&auto=format&fit=crop',
        name: 'Rahul Varma',
        email: 'rahul.v@college.edu',
        phone: '+91 98888 77777'
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { ...formData, type };
      const response = await createItem(payload);

      if (response.matchesCreated > 0) {
        setMatchResult(response);
      } else {
        onItemCreated(response.item);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={e => {
        if (e.target.id === 'report-modal-overlay') onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                type === 'LOST'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {type === 'LOST' ? <AlertCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report {type === 'LOST' ? 'Lost' : 'Found'} Item</h3>
              <p className="text-xs text-slate-400">Rule-based matching engine will check active counterparts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="report-close-btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner if match triggered right away */}
        {matchResult && (
          <div className="p-6 bg-emerald-950/80 border-b border-emerald-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Item Reported & Immediate Match Detected!</h4>
                <p className="text-xs text-emerald-300">
                  {matchResult.matchesCreated} counterpart item(s) matched with score &gt; 60%!
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {matchResult.matches.map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">Matched with: {m.matchedWith}</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Score: {parseFloat(m.match_score).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                onItemCreated(matchResult.item);
                onClose();
              }}
              id="confirm-match-close-btn"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Continue to Feed
            </button>
          </div>
        )}

        {!matchResult && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Quick Fill Pills for Viva Demo */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">⚡ Demo Autofill:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="autofill-lost-laptop"
                  onClick={() => handleQuickFill('lost-laptop')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition text-[11px]"
                >
                  Lost Laptop
                </button>
                <button
                  type="button"
                  id="autofill-found-laptop"
                  onClick={() => handleQuickFill('found-laptop')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition text-[11px]"
                >
                  Found Laptop (Trigger Match)
                </button>
                <button
                  type="button"
                  id="autofill-lost-id"
                  onClick={() => handleQuickFill('lost-id')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition text-[11px]"
                >
                  Student ID
                </button>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Type Selector (LOST vs FOUND) */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                id="select-type-lost"
                onClick={() => setType('LOST')}
                className={`py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  type === 'LOST'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>I Lost Something</span>
              </button>
              <button
                type="button"
                id="select-type-found"
                onClick={() => setType('FOUND')}
                className={`py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  type === 'FOUND'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>I Found Something</span>
              </button>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Item Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-title"
                  type="text"
                  required
                  placeholder="e.g. Dell Inspiron 15 Laptop"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  id="form-category"
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Location <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-location"
                  type="text"
                  required
                  placeholder="e.g. Central Library 2nd Floor"
                  value={formData.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description & Keywords <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="form-description"
                rows={3}
                required
                placeholder="Include color, brand, stickers, unique identification marks (used by matching engine)..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Image URL (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Photo Image URL (Optional)</span>
                <span className="text-[11px] text-slate-500">Unsplash or Web URL</span>
              </label>
              <input
                id="form-image-url"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={e => handleChange('image_url', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reporter Contact Info */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Your Contact Details (Campus Verification)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    placeholder="e.g. Shivam Sharma"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="form-phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="submit-item-btn"
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 transition shadow-lg ${
                  type === 'LOST'
                    ? 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing & Matching...' : `Submit ${type} Item`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
