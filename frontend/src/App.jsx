import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import SearchFilters from './components/SearchFilters';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import ReportModal from './components/ReportModal';
import DevOpsInfoModal from './components/DevOpsInfoModal';
import Toast from './components/Toast';
import { getItems, getHealthStatus, getItemById } from './services/api';
import { Sparkles, Layers, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    q: '',
    category: 'ALL',
    location: '',
    type: 'ALL',
    status: 'ALL'
  });

  // Modals State
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('LOST');
  const [devOpsModalOpen, setDevOpsModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch health status
  const checkHealth = useCallback(async () => {
    try {
      const data = await getHealthStatus();
      setHealth(data);
    } catch {
      setHealth({ status: 'DOWN', database: 'disconnected' });
    }
  }, []);

  // Fetch items list
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getItems(filters);
      setItems(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenReport = type => {
    setReportType(type);
    setReportModalOpen(true);
  };

  const handleItemCreated = newItem => {
    showToast(`Successfully reported: ${newItem.title}`);
    loadItems();
  };

  const handleStatusUpdated = (itemId, newStatus) => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
    if (selectedItem?.id === itemId) {
      setSelectedItem(prev => ({ ...prev, status: newStatus }));
    }
    showToast(`Status updated to ${newStatus}`);
  };

  const handleSelectMatchedItem = async counterpart => {
    try {
      const res = await getItemById(counterpart.id);
      setSelectedItem(res.item);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      q: '',
      category: 'ALL',
      location: '',
      type: 'ALL',
      status: 'ALL'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        health={health}
        onOpenReport={handleOpenReport}
        onOpenDevOps={() => setDevOpsModalOpen(true)}
        onRefresh={loadItems}
        loading={loading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Rule-Based Matching Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              Reuniting Lost Belongings with <span className="text-emerald-400">Precision</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              FindIT correlates lost and found reports using weighted semantic matching across
              Category (30%), Title similarity (30%), Location (25%), and Description keywords (15%).
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="hero-report-lost"
                onClick={() => handleOpenReport('LOST')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
              >
                Report Lost Item
              </button>
              <button
                id="hero-report-found"
                onClick={() => handleOpenReport('FOUND')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                Report Found Item
              </button>
              <button
                id="hero-view-devops"
                onClick={() => setDevOpsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                View DevOps MPR Details
              </button>
            </div>
          </div>
        </div>

        {/* Stats Metrics */}
        <StatsBar
          items={items}
          onQuickFilter={filterPatch => setFilters(prev => ({ ...prev, ...filterPatch }))}
        />

        {/* Filter Toolbar */}
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Items Listing Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Catalog Items</span>
            <span className="text-xs font-normal text-slate-400">({items.length} items found)</span>
          </h2>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Failed to load items: {error}</span>
            </div>
            <button
              onClick={loadItems}
              className="px-3 py-1 bg-rose-500/20 text-rose-200 rounded-lg text-xs font-bold hover:bg-rose-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading catalog items...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="py-20 text-center glass-card rounded-3xl border border-slate-800 p-8 max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Items Match Your Filter</h3>
            <p className="text-xs text-slate-400 mb-6">
              Try adjusting your search terms, changing the category, or clearing the active filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={setSelectedItem}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            FindIT &copy; 2026 — DevOps Mini-Project (MPR) Semester 5. Built with React, Node.js & PostgreSQL.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setDevOpsModalOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Exp 1–7 Specs
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="/health"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition"
            >
              /health Probe
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStatusUpdated={handleStatusUpdated}
          onSelectMatchedItem={handleSelectMatchedItem}
        />
      )}

      {reportModalOpen && (
        <ReportModal
          initialType={reportType}
          onClose={() => setReportModalOpen(false)}
          onItemCreated={handleItemCreated}
        />
      )}

      {devOpsModalOpen && (
        <DevOpsInfoModal
          health={health}
          onClose={() => setDevOpsModalOpen(false)}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
