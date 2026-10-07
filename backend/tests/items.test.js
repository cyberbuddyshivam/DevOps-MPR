/**
 * API Integration Tests for Items & Health Endpoints
 */

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models/db');

describe('API Integration Tests — FindIT Endpoints', () => {
  beforeEach(() => {
    // Reset test memory store if running in memory mode
    if (!db.isPostgres()) {
      db._resetMemoryStore();
    }
  });

  afterAll(async () => {
    if (db.pool) {
      await db.pool.end().catch(() => {});
    }
  });

  describe('GET /health', () => {
    test('returns 200 OK with health status and memory info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('database');
    });
  });

  describe('GET /api/items', () => {
    test('returns list of items with success true', async () => {
      const res = await request(app).get('/api/items');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('filters items by keyword query', async () => {
      const res = await request(app).get('/api/items?q=Laptop');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(item => 
        item.title.toLowerCase().includes('laptop') || 
        item.description.toLowerCase().includes('laptop')
      )).toBe(true);
    });

    test('filters items by type=LOST', async () => {
      const res = await request(app).get('/api/items?type=LOST');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(item => item.type === 'LOST')).toBe(true);
    });
  });

  describe('POST /api/items', () => {
    test('rejects payload with missing required fields with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ title: 'Just a title' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    test('creates a new LOST item and returns 201 Created', async () => {
      const newItem = {
        title: 'Casio fx-991EX Scientific Calculator',
        category: 'Electronics',
        description: 'Black calculator with silver buttons inside white case',
        location: 'Lecture Hall 104',
        date: '2026-10-05',
        type: 'LOST',
        name: 'Neha Verma',
        email: 'neha.verma@college.edu',
        phone: '+91 91234 56780'
      };

      const res = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.item.title).toBe(newItem.title);
      expect(res.body.item.type).toBe('LOST');
      expect(res.body.item.status).toBe('ACTIVE');
    });

    test('automatically triggers matching engine and returns matches for similar item', async () => {
      // Seed item 1 is a LOST 'Black Dell Inspiron Laptop' in 'Central Library 2nd Floor'
      // Reporting a matching FOUND laptop should create a match with score > 60
      const matchingFoundItem = {
        title: 'Black Dell Inspiron Laptop with charger',
        category: 'Electronics',
        description: 'Found black Dell 15-inch laptop with React sticker and charger',
        location: 'Central Library 2nd Floor',
        date: '2026-10-05',
        type: 'FOUND',
        name: 'Campus Security Desk',
        email: 'security@college.edu',
        phone: '+91 90000 11111'
      };

      const res = await request(app)
        .post('/api/items')
        .send(matchingFoundItem);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.matchesCreated).toBeGreaterThan(0);
      expect(res.body.matches[0].match_score).toBeGreaterThan(60.0);
    });
  });

  describe('GET /api/items/:id', () => {
    test('returns 200 with item details and matches array', async () => {
      const res = await request(app).get('/api/items/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.id).toBe(1);
      expect(res.body).toHaveProperty('matches');
    });

    test('returns 404 for non-existent item id', async () => {
      const res = await request(app).get('/api/items/99999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/items/:id/status', () => {
    test('updates item status to CLAIMED', async () => {
      const res = await request(app)
        .patch('/api/items/1/status')
        .send({ status: 'CLAIMED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.status).toBe('CLAIMED');
    });

    test('returns 400 for invalid status', async () => {
      const res = await request(app)
        .patch('/api/items/1/status')
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/items/:id/matches', () => {
    test('returns matches list for item 1', async () => {
      const res = await request(app).get('/api/items/1/matches');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.matches)).toBe(true);
    });
  });
});
