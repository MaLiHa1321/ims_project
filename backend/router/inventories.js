const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const inventories = await Inventory.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      inventories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInventories: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { createdBy: req.user._id };
    const inventories = await Inventory.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      inventories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInventories: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/shared', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { allowedUsers: req.user._id },
        { isPublic: true, createdBy: { $ne: req.user._id } }
      ]
    };
    
    const inventories = await Inventory.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      inventories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInventories: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('allowedUsers', 'username email');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['Equipment', 'Furniture', 'Book', 'Document', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, tags, isPublic, customIdFormat, fields } = req.body;

    const inventory = new Inventory({
      title,
      description,
      category,
      tags: tags || [],
      isPublic: isPublic || false,
      customIdFormat: customIdFormat || [],
      fields: fields || [],
      createdBy: req.user._id,
      allowedUsers: []
    });

    await inventory.save();
    await inventory.populate('createdBy', 'username');

    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.put('/:id', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').isIn(['Equipment', 'Furniture', 'Book', 'Document', 'Other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

  
    if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.body.version !== inventory.version) {
      return res.status(409).json({ message: 'Inventory has been modified by another user' });
    }

    const { title, description, category, tags, isPublic, customIdFormat, fields, allowedUsers } = req.body;

    inventory.title = title;
    inventory.description = description;
    inventory.category = category;
    inventory.tags = tags || [];
    inventory.isPublic = isPublic || false;
    inventory.customIdFormat = customIdFormat || [];
    inventory.fields = fields || [];
    inventory.allowedUsers = allowedUsers || [];
    inventory.version = inventory.version + 1;

    await inventory.save();
    await inventory.populate('createdBy', 'username');
    await inventory.populate('allowedUsers', 'username email');

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const inventories = await Inventory.search(query)
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments({ $text: { $search: query } });

    res.json({
      inventories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalInventories: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/:id/users', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (inventory.allowedUsers.includes(user._id)) {
      return res.status(400).json({ message: 'User already has access' });
    }

    inventory.allowedUsers.push(user._id);
    await inventory.save();
    await inventory.populate('allowedUsers', 'username email');

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id/users/:userId', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    inventory.allowedUsers = inventory.allowedUsers.filter(
      userId => userId.toString() !== req.params.userId
    );

    await inventory.save();
    await inventory.populate('allowedUsers', 'username email');

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.put('/:id/custom-id-format', auth, async (req, res) => {
  try {
    const { customIdFormat } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

    if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin))
      return res.status(403).json({ message: 'Access denied' });

    inventory.customIdFormat = customIdFormat || [];
    inventory.version += 1;
    await inventory.save();

    res.json({ message: 'Custom ID format updated', customIdFormat: inventory.customIdFormat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/generate-preview', async (req, res) => {
  const inventoryId = req.params.id;
  try {
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

    const preview = `ITEM-${Math.floor(Math.random() * 10000)}`;
    res.json({ preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;