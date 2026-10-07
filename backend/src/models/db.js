/**
 * FindIT — Database Access Layer
 * Supports PostgreSQL connection pool via 'pg'
 * Gracefully provides fallback in-memory data store when PostgreSQL is offline or unauthenticated
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configure PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'findit_db',
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000
});

let isPostgresConnected = false;

// Fallback In-Memory Storage (mirrors database/init.sql schema & seed rows)
const memoryStore = {
  users: [
    { id: 1, name: 'Aarav Patel', email: 'aarav.patel@college.edu', phone: '+91 98765 43210', created_at: new Date('2026-10-01') },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@college.edu', phone: '+91 98234 56789', created_at: new Date('2026-10-02') },
    { id: 3, name: 'Rohan Mehta', email: 'rohan.mehta@college.edu', phone: '+91 97123 45678', created_at: new Date('2026-10-03') },
    { id: 4, name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', phone: '+91 99887 76655', created_at: new Date('2026-10-04') }
  ],
  items: [
    {
      id: 1,
      user_id: 1,
      title: 'Black Dell Inspiron Laptop',
      category: 'Electronics',
      description: 'Black 15-inch laptop with React sticker on lid and Dell charger in navy bag.',
      location: 'Central Library 2nd Floor',
      date: '2026-10-01',
      type: 'LOST',
      status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop',
      created_at: new Date('2026-10-01')
    },
    {
      id: 2,
      user_id: 2,
      title: 'Black Dell Laptop with charger',
      category: 'Electronics',
      description: 'Black Dell laptop discovered on study desk near reading section, includes navy bag and charger.',
      location: 'Central Library Reading Hall',
      date: '2026-10-02',
      type: 'FOUND',
      status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop',
      created_at: new Date('2026-10-02')
    },
    {
      id: 3,
      user_id: 3,
      title: 'Computer Science Student ID Card',
      category: 'Documents',
      description: 'RFID ID card belonging to Rohan Mehta (Roll No. 2024CS042) in black lanyard.',
      location: 'Canteen Block A',
      date: '2026-10-03',
      type: 'LOST',
      status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&auto=format&fit=crop',
      created_at: new Date('2026-10-03')
    },
    {
      id: 4,
      user_id: 4,
      title: 'Milton Insulated Steel Bottle',
      category: 'Accessories',
      description: 'Silver 1-litre Milton thermosteel water bottle found under bench.',
      location: 'Sports Complex Pavilion',
      date: '2026-10-04',
      type: 'FOUND',
      status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop',
      created_at: new Date('2026-10-04')
    }
  ],
  matches: [
    {
      id: 1,
      lost_item_id: 1,
      found_item_id: 2,
      match_score: 77.0,
      status: 'POTENTIAL',
      created_at: new Date('2026-10-02')
    }
  ]
};

let nextUserId = 5;
let nextItemId = 5;
let nextMatchId = 2;

/**
 * Initialize database tables if connected to live PostgreSQL
 */
async function initializePostgres() {
  try {
    const client = await pool.connect();
    isPostgresConnected = true;
    console.log('[DB] Successfully connected to PostgreSQL instance.');

    // Check if tables exist, otherwise run init.sql
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'items'
      );
    `);

    if (!res.rows[0].exists) {
      console.log('[DB] Items table does not exist. Initializing schema from init.sql...');
      const sqlPath = path.resolve(__dirname, '../../../database/init.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sqlContent);
        console.log('[DB] Schema and seed data applied successfully.');
      }
    }
    client.release();
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`[DB] Live PostgreSQL connection failed (${err.message}). Using built-in resilient in-memory storage.`);
  }
}

// Attempt connection on startup
initializePostgres();

/**
 * Universal Query Adapter
 */
const db = {
  isPostgres: () => isPostgresConnected,

  async query(text, params = []) {
    if (isPostgresConnected) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        console.error('[DB Query Error]', err);
        throw err;
      }
    }
    throw new Error('Postgres not connected. Use specialized repository methods.');
  },

  // Repositories abstraction
  users: {
    async create({ name, email, phone }) {
      if (isPostgresConnected) {
        const res = await pool.query(
          'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
          [name, email, phone]
        );
        return res.rows[0];
      }
      const user = { id: nextUserId++, name, email, phone, created_at: new Date() };
      memoryStore.users.push(user);
      return user;
    },
    async findById(id) {
      if (isPostgresConnected) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      return memoryStore.users.find(u => u.id === parseInt(id, 10)) || null;
    }
  },

  items: {
    async create({ user_id, title, category, description, location, date, type, status = 'ACTIVE', image_url = null }) {
      if (isPostgresConnected) {
        const res = await pool.query(
          `INSERT INTO items (user_id, title, category, description, location, date, type, status, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [user_id, title, category, description, location, date, type, status, image_url]
        );
        return res.rows[0];
      }
      const item = {
        id: nextItemId++,
        user_id: parseInt(user_id, 10),
        title,
        category,
        description,
        location,
        date,
        type,
        status,
        image_url,
        created_at: new Date()
      };
      memoryStore.items.unshift(item);
      return item;
    },

    async findAll({ q, category, location, type, status, date } = {}) {
      if (isPostgresConnected) {
        let query = `
          SELECT i.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone
          FROM items i
          JOIN users u ON i.user_id = u.id
          WHERE 1=1
        `;
        const values = [];

        if (q) {
          values.push(`%${q}%`);
          query += ` AND (i.title ILIKE $${values.length} OR i.description ILIKE $${values.length})`;
        }
        if (category) {
          values.push(category);
          query += ` AND i.category ILIKE $${values.length}`;
        }
        if (location) {
          values.push(`%${location}%`);
          query += ` AND i.location ILIKE $${values.length}`;
        }
        if (type) {
          values.push(type.toUpperCase());
          query += ` AND i.type = $${values.length}`;
        }
        if (status) {
          values.push(status.toUpperCase());
          query += ` AND i.status = $${values.length}`;
        }
        if (date) {
          values.push(date);
          query += ` AND i.date = $${values.length}`;
        }

        query += ' ORDER BY i.created_at DESC';
        const res = await pool.query(query, values);
        return res.rows;
      }

      // Memory store filtering
      return memoryStore.items.filter(item => {
        if (q) {
          const matchQ = item.title.toLowerCase().includes(q.toLowerCase()) ||
                         item.description.toLowerCase().includes(q.toLowerCase());
          if (!matchQ) return false;
        }
        if (category && item.category.toLowerCase() !== category.toLowerCase()) return false;
        if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
        if (type && item.type.toUpperCase() !== type.toUpperCase()) return false;
        if (status && item.status.toUpperCase() !== status.toUpperCase()) return false;
        if (date && item.date !== date) return false;
        return true;
      }).map(item => {
        const user = memoryStore.users.find(u => u.id === item.user_id) || {};
        return {
          ...item,
          reporter_name: user.name || 'Anonymous',
          reporter_email: user.email || '',
          reporter_phone: user.phone || ''
        };
      });
    },

    async findById(id) {
      const parsedId = parseInt(id, 10);
      if (isPostgresConnected) {
        const res = await pool.query(
          `SELECT i.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone
           FROM items i
           JOIN users u ON i.user_id = u.id
           WHERE i.id = $1`,
          [parsedId]
        );
        return res.rows[0] || null;
      }

      const item = memoryStore.items.find(i => i.id === parsedId);
      if (!item) return null;
      const user = memoryStore.users.find(u => u.id === item.user_id) || {};
      return {
        ...item,
        reporter_name: user.name || 'Anonymous',
        reporter_email: user.email || '',
        reporter_phone: user.phone || ''
      };
    },

    async updateStatus(id, newStatus) {
      const parsedId = parseInt(id, 10);
      if (isPostgresConnected) {
        const res = await pool.query(
          'UPDATE items SET status = $1 WHERE id = $2 RETURNING *',
          [newStatus.toUpperCase(), parsedId]
        );
        return res.rows[0] || null;
      }

      const item = memoryStore.items.find(i => i.id === parsedId);
      if (!item) return null;
      item.status = newStatus.toUpperCase();
      return item;
    },

    async findActiveOpposites(type) {
      const oppositeType = type === 'LOST' ? 'FOUND' : 'LOST';
      if (isPostgresConnected) {
        const res = await pool.query(
          "SELECT * FROM items WHERE type = $1 AND status = 'ACTIVE'",
          [oppositeType]
        );
        return res.rows;
      }
      return memoryStore.items.filter(i => i.type === oppositeType && i.status === 'ACTIVE');
    }
  },

  matches: {
    async create({ lost_item_id, found_item_id, match_score, status = 'POTENTIAL' }) {
      if (isPostgresConnected) {
        const res = await pool.query(
          `INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (lost_item_id, found_item_id)
           DO UPDATE SET match_score = EXCLUDED.match_score, status = EXCLUDED.status
           RETURNING *`,
          [lost_item_id, found_item_id, match_score, status]
        );
        return res.rows[0];
      }

      const existingIndex = memoryStore.matches.findIndex(
        m => m.lost_item_id === lost_item_id && m.found_item_id === found_item_id
      );

      const record = {
        id: existingIndex >= 0 ? memoryStore.matches[existingIndex].id : nextMatchId++,
        lost_item_id,
        found_item_id,
        match_score: parseFloat(match_score),
        status,
        created_at: new Date()
      };

      if (existingIndex >= 0) {
        memoryStore.matches[existingIndex] = record;
      } else {
        memoryStore.matches.push(record);
      }
      return record;
    },

    async findByItemId(itemId) {
      const parsedId = parseInt(itemId, 10);
      if (isPostgresConnected) {
        const res = await pool.query(
          `SELECT m.*, 
                  li.title as lost_title, li.category as lost_category, li.location as lost_location,
                  fi.title as found_title, fi.category as found_category, fi.location as found_location
           FROM matches m
           JOIN items li ON m.lost_item_id = li.id
           JOIN items fi ON m.found_item_id = fi.id
           WHERE m.lost_item_id = $1 OR m.found_item_id = $1
           ORDER BY m.match_score DESC`,
          [parsedId]
        );
        return res.rows;
      }

      const matchedRecords = memoryStore.matches.filter(
        m => m.lost_item_id === parsedId || m.found_item_id === parsedId
      );

      return matchedRecords.map(m => {
        const lost = memoryStore.items.find(i => i.id === m.lost_item_id) || {};
        const found = memoryStore.items.find(i => i.id === m.found_item_id) || {};
        return {
          ...m,
          lost_title: lost.title,
          lost_category: lost.category,
          lost_location: lost.location,
          found_title: found.title,
          found_category: found.category,
          found_location: found.location
        };
      });
    }
  },

  pool,
  _resetMemoryStore: () => {
    // Helper for test cleanup
    memoryStore.items = memoryStore.items.slice(0, 4);
    memoryStore.matches = memoryStore.matches.slice(0, 1);
  }
};

module.exports = db;
