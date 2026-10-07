/**
 * FindIT — Express Application Setup
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const itemsRoutes = require('./routes/items.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows cross-origin for local testing, Docker, and K8s
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Routes
app.use('/health', healthRoutes);
app.use('/api/items', itemsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FindIT College Lost & Found API',
    version: '1.0.0',
    documentation: '/api/items',
    health: '/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
