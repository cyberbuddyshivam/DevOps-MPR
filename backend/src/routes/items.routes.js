/**
 * FindIT — Items Routes
 * Defines endpoints for items CRUD, filtering, status modification, and matches
 */

const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items.controller');

// Item CRUD & Search
router.post('/', itemsController.createItem);
router.get('/', itemsController.getItems);
router.get('/:id', itemsController.getItemById);
router.patch('/:id/status', itemsController.updateItemStatus);

// Item Matches
router.get('/:id/matches', itemsController.getItemMatches);

module.exports = router;
