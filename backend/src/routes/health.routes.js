/**
 * FindIT — Health Check Endpoint
 * Used by Docker HEALTHCHECK and Kubernetes liveness/readiness probes
 */

const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
  const isPostgres = db.isPostgres();
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime * 100) / 100,
    database: isPostgres ? 'postgresql_connected' : 'in_memory_resilient_store',
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
    },
    version: '1.0.0'
  };

  return res.status(200).json(healthData);
});

module.exports = router;
