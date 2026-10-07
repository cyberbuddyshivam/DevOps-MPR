/**
 * FindIT — Frontend API Client
 * Connects React UI to Express backend (/api and /health)
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Fetch health check status
 */
export async function getHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'DOWN', database: 'disconnected', error: err.message };
  }
}

/**
 * Fetch items with query search and filters
 */
export async function getItems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);

  const url = `${API_BASE}/api/items${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch items');
  return data;
}

/**
 * Fetch single item by ID (with matches)
 */
export async function getItemById(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch item details');
  return data;
}

/**
 * Report a new Lost or Found item
 */
export async function createItem(itemData) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData)
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors ? data.errors.join(', ') : (data.message || 'Failed to create item');
    throw new Error(errorMsg);
  }
  return data;
}

/**
 * Update item status (ACTIVE, CLAIMED, CLOSED)
 */
export async function updateItemStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/items/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update item status');
  return data;
}

/**
 * Fetch potential matches for an item
 */
export async function getItemMatches(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}/matches`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch matches');
  return data;
}
