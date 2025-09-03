const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth'); 

// GET /api/search?q=keyword
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    // Case-insensitive regex search
    const regex = new RegExp(query, 'i');

    // Search inventories
    const inventories = await Inventory.find({
      title: regex
    }).limit(5);

    // Search items
    const items = await Item.find({
      title: regex
    }).limit(5);

    // Map to frontend-friendly structure
    const results = [
      ...inventories.map(inv => ({
        _id: inv._id,
        title: inv.title,
        type: 'inventory',
        url: `/inventories/${inv._id}`
      })),
      ...items.map(item => ({
        _id: item._id,
        title: item.title,
        type: 'item',
        url: `/inventories/${item.inventory}/items/${item._id}`
      }))
    ];

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
