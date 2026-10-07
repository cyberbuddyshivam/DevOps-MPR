/**
 * FindIT — Items Controller
 * Handles CRUD operations, search/filtering, and automatic matching engine orchestration
 */

const db = require('../models/db');
const { calculateMatchScore } = require('../services/matching.service');

/**
 * POST /api/items
 * Create a new LOST or FOUND item, create user contact, and trigger matching engine
 */
exports.createItem = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      location,
      date,
      type,
      image_url,
      name,
      email,
      phone
    } = req.body;

    // Field Validations
    const errors = [];
    if (!title || !title.trim()) errors.push('Title is required');
    if (!category || !category.trim()) errors.push('Category is required');
    if (!description || !description.trim()) errors.push('Description is required');
    if (!location || !location.trim()) errors.push('Location is required');
    if (!date) errors.push('Date is required');
    if (!type || !['LOST', 'FOUND'].includes(type.toUpperCase())) {
      errors.push("Type must be either 'LOST' or 'FOUND'");
    }
    if (!name || !name.trim()) errors.push('Contact name is required');
    if (!email || !email.includes('@')) errors.push('A valid contact email is required');
    if (!phone || phone.trim().length < 7) errors.push('A valid contact phone is required');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const normalizedType = type.toUpperCase();

    // 1. Create User / Contact
    const user = await db.users.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    });

    // 2. Create Item
    const item = await db.items.create({
      user_id: user.id,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      date,
      type: normalizedType,
      status: 'ACTIVE',
      image_url: image_url ? image_url.trim() : null
    });

    // 3. Trigger Matching Engine against active items of opposite type
    const oppositeItems = await db.items.findActiveOpposites(normalizedType);
    const createdMatches = [];

    for (const candidate of oppositeItems) {
      const matchResult = calculateMatchScore(item, candidate);

      if (matchResult.isMatch) {
        // Determine lost_item_id and found_item_id
        const lostId = normalizedType === 'LOST' ? item.id : candidate.id;
        const foundId = normalizedType === 'FOUND' ? item.id : candidate.id;

        const matchRecord = await db.matches.create({
          lost_item_id: lostId,
          found_item_id: foundId,
          match_score: matchResult.score,
          status: 'POTENTIAL'
        });

        createdMatches.push({
          ...matchRecord,
          breakdown: matchResult.breakdown,
          matchedWith: candidate.title
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `${normalizedType} item reported successfully`,
      item: {
        ...item,
        reporter_name: user.name,
        reporter_email: user.email,
        reporter_phone: user.phone
      },
      matchesCreated: createdMatches.length,
      matches: createdMatches
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing item submission',
      error: error.message
    });
  }
};

/**
 * GET /api/items
 * Retrieve items with optional keyword search and category/location/type filters
 */
exports.getItems = async (req, res) => {
  try {
    const { q, category, location, type, status, date } = req.query;

    const items = await db.items.findAll({
      q,
      category,
      location,
      type,
      status,
      date
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error retrieving items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve items',
      error: error.message
    });
  }
};

/**
 * GET /api/items/:id
 * Retrieve specific item details by ID
 */
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.items.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
    }

    // Also fetch associated matches if any exist
    const matches = await db.matches.findByItemId(id);

    return res.status(200).json({
      success: true,
      item,
      matches
    });
  } catch (error) {
    console.error('Error retrieving item by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve item',
      error: error.message
    });
  }
};

/**
 * PATCH /api/items/:id/status
 * Update status of an item (ACTIVE, CLAIMED, CLOSED)
 */
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['ACTIVE', 'CLAIMED', 'CLOSED'];
    if (!status || !allowedStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const updatedItem = await db.items.updateStatus(id, status);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item status updated to ${status.toUpperCase()}`,
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item status',
      error: error.message
    });
  }
};

/**
 * GET /api/items/:id/matches
 * Retrieve potential matches (score > 60) for a specific item
 */
exports.getItemMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.items.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${id} not found`
      });
    }

    const matches = await db.matches.findByItemId(id);

    return res.status(200).json({
      success: true,
      itemId: parseInt(id, 10),
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error retrieving item matches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve matches',
      error: error.message
    });
  }
};
