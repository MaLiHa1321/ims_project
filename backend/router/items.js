// // backend/routes/items.js
// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const { auth } = require('../middleware/auth');
// const Item = require('../models/Item');
// const Inventory = require('../models/Inventory');

// const router = express.Router();

// // Get all items for an inventory
// router.get('/inventory/:inventoryId', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const items = await Item.find({ inventory: req.params.inventoryId })
//       .populate('createdBy', 'username')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Item.countDocuments({ inventory: req.params.inventoryId });

//     res.json({
//       items,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalItems: total
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get single item
// router.get('/:id', async (req, res) => {
//   try {
//     const item = await Item.findById(req.params.id)
//       .populate('createdBy', 'username')
//       .populate('inventory');

//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Create new item
// router.post(
//   '/',
//   auth,
//   [body('inventory').isMongoId().withMessage('Valid inventory ID is required')],
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const {
//         inventory,
//         textFields,
//         textareaFields,
//         numberFields,
//         booleanFields,
//         documentFields
//       } = req.body;

//       // Check if inventory exists and user has write access
//       const inventoryDoc = await Inventory.findById(inventory);
//       if (!inventoryDoc) {
//         return res.status(404).json({ message: 'Inventory not found' });
//       }

//       if (!inventoryDoc.hasWriteAccess(req.user._id, req.user.isAdmin)) {
//         return res.status(403).json({ message: 'Access denied' });
//       }

//       // --- Auto-generate Custom ID ---
//       let customId;
//       try {
//         customId = await inventoryDoc.generateCustomId();
//       } catch (error) {
//         return res
//           .status(500)
//           .json({ message: 'Error generating custom ID', error: error.message });
//       }

//       console.log('Creating item with body:', req.body);
// console.log('User:', req.user);

//       // Check if customId is unique within the inventory
//       let existingItem = await Item.findOne({ inventory, customId });
//       if (existingItem) {
//         // If there's a collision, try again once (good for random values)
//         try {
//           customId = await inventoryDoc.generateCustomId();
//         } catch (error) {
//           return res
//             .status(500)
//             .json({ message: 'Error generating custom ID', error: error.message });
//         }
//       }

//       // Create item
//       const item = new Item({
//         inventory,
//         customId,
//         createdBy: req.user._id,
//         textFields: textFields || [],
//         textareaFields: textareaFields || [],
//         numberFields: numberFields || [],
//         booleanFields: booleanFields || [],
//         documentFields: documentFields || []
//       });

//       await item.save();
//       await item.populate('createdBy', 'username');

//       res.status(201).json(item);
//     } catch (error) {
//       if (error.code === 11000) {
//         return res
//           .status(400)
//           .json({ message: 'Custom ID must be unique within this inventory' });
//       }
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }
// );

// // Update item
// router.put(
//   '/:id',
//   auth,
//   [body('customId').notEmpty().withMessage('Custom ID is required')],
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       const item = await Item.findById(req.params.id);
//       if (!item) {
//         return res.status(404).json({ message: 'Item not found' });
//       }

//       // Check if user has write access to the inventory
//       const inventory = await Inventory.findById(item.inventory);
//       if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
//         return res.status(403).json({ message: 'Access denied' });
//       }

//       // Check version for optimistic locking
//       if (req.body.version !== item.version) {
//         return res
//           .status(409)
//           .json({ message: 'Item has been modified by another user' });
//       }

//       const {
//         customId,
//         textFields,
//         textareaFields,
//         numberFields,
//         booleanFields,
//         documentFields
//       } = req.body;

//       // Check if customId is unique within the inventory (if changed)
//       if (customId !== item.customId) {
//         const existingItem = await Item.findOne({
//           inventory: item.inventory,
//           customId
//         });
//         if (existingItem) {
//           return res
//             .status(400)
//             .json({ message: 'Custom ID must be unique within this inventory' });
//         }
//       }

//       // Update item
//       item.customId = customId;
//       item.textFields = textFields || [];
//       item.textareaFields = textareaFields || [];
//       item.numberFields = numberFields || [];
//       item.booleanFields = booleanFields || [];
//       item.documentFields = documentFields || [];
//       item.version = item.version + 1;

//       await item.save();
//       await item.populate('createdBy', 'username');

//       res.json(item);
//     } catch (error) {
//       if (error.code === 11000) {
//         return res
//           .status(400)
//           .json({ message: 'Custom ID must be unique within this inventory' });
//       }
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   }
// );

// // Delete item
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const item = await Item.findById(req.params.id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // Check if user has write access to the inventory
//     const inventory = await Inventory.findById(item.inventory);
//     if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     await Item.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Item deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Search items
// router.get('/search/:inventoryId/:query', async (req, res) => {
//   try {
//     const { inventoryId, query } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const items = await Item.find({
//       inventory: inventoryId,
//       $text: { $search: query }
//     })
//       .populate('createdBy', 'username')
//       .sort({ score: { $meta: 'textScore' } })
//       .skip(skip)
//       .limit(limit);

//     const total = await Item.countDocuments({
//       inventory: inventoryId,
//       $text: { $search: query }
//     });

//     res.json({
//       items,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalItems: total
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get item statistics
// router.get('/stats', auth, async (req, res) => {
//   try {
//     // Get all inventories created by the user
//     const userInventories = await Inventory.find({ createdBy: req.user._id });
//     const inventoryIds = userInventories.map((inv) => inv._id);

//     // Count items in those inventories
//     const totalItems = await Item.countDocuments({
//       inventory: { $in: inventoryIds }
//     });

//     res.json({ totalItems });
//   } catch (error) {
//     console.error('Error fetching item stats:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // In backend/routes/items.js - Add this endpoint for inventory-specific items
// router.get('/inventory/:inventoryId', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const items = await Item.find({ inventory: req.params.inventoryId })
//       .populate('createdBy', 'username')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Item.countDocuments({ inventory: req.params.inventoryId });

//     res.json({
//       items,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalItems: total
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;


// backend/routes/items.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Item = require('../models/Item');
const Inventory = require('../models/Inventory');

const router = express.Router();

// ---------------------------
// Get all items for an inventory
// ---------------------------
router.get('/inventory/:inventoryId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await Item.find({ inventory: req.params.inventoryId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments({ inventory: req.params.inventoryId });

    res.json({
      items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------------------
// Get single item
// ---------------------------
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('inventory');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('inventory').isMongoId().withMessage('Valid inventory ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { inventory, title, description, quantity } = req.body;

      // 🔎 Check if inventory exists
      const inventoryDoc = await Inventory.findById(inventory);
      if (!inventoryDoc) {
        return res.status(404).json({ message: 'Inventory not found' });
      }

      // 🔎 Check write access
      if (typeof inventoryDoc.hasWriteAccess === 'function') {
        if (!inventoryDoc.hasWriteAccess(req.user._id, req.user.isAdmin)) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      // 🔎 Generate random customId for Option 2
      const customId = `ITEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      console.log('Generated customId:', customId);

      // ✅ Create new item
      const item = new Item({
        inventory,
        customId,
        title,
        description,
        quantity,
        createdBy: req.user._id,
      });

      await item.save();
      await item.populate('createdBy', 'username');

      console.log('✅ New Item Created:', item);
      res.status(201).json(item);
    } catch (error) {
      console.error('❌ Error creating item:', error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: 'Custom ID must be unique within this inventory' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check write access
    const inventory = await Inventory.findById(item.inventory);
    if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check version for optimistic locking
    if (req.body.version !== item.version) {
      return res.status(409).json({ message: 'Item has been modified by another user' });
    }

    // Update core fields
    const { title, description, quantity } = req.body;
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (quantity !== undefined) item.quantity = quantity;

    // Update dynamic fields
    const { textFields, textareaFields, numberFields, booleanFields, documentFields } = req.body;
    item.textFields = textFields || [];
    item.textareaFields = textareaFields || [];
    item.numberFields = numberFields || [];
    item.booleanFields = booleanFields || [];
    item.documentFields = documentFields || [];

    // Increment version
    item.version += 1;

    await item.save();
    await item.populate('createdBy', 'username');

    res.json(item);
  } catch (error) {
    console.error('❌ Error updating item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------------------
// Delete item
// ---------------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const inventory = await Inventory.findById(item.inventory);
    if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------------------
// Search items
// ---------------------------
router.get('/search/:inventoryId/:query', async (req, res) => {
  try {
    const { inventoryId, query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await Item.find({ inventory: inventoryId, $text: { $search: query } })
      .populate('createdBy', 'username')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Item.countDocuments({ inventory: inventoryId, $text: { $search: query } });

    res.json({
      items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------------------
// Get item statistics
// ---------------------------
router.get('/stats', auth, async (req, res) => {
  try {
    const userInventories = await Inventory.find({ createdBy: req.user._id });
    const inventoryIds = userInventories.map(inv => inv._id);

    const totalItems = await Item.countDocuments({ inventory: { $in: inventoryIds } });

    res.json({ totalItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
