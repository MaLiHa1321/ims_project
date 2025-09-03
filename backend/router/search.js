const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Item = require('../models/Item');
const User = require('../models/User'); // optional, if you want to search users

// GET /api/search?q=keyword
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const regex = new RegExp(query, 'i'); // case-insensitive

    // Search Inventories
    const inventories = await Inventory.find({ title: regex }).limit(5);

    // Search Items
    const items = await Item.find({ $or: [{ title: regex }, { customId: regex }] }).limit(5);

    // Optional: search Users
    const users = await User.find({ username: regex }).limit(5);

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
      })),
      ...users.map(user => ({
        _id: user._id,
        title: user.username,
        type: 'user',
        url: `/users/${user._id}`
      }))
    ];

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
