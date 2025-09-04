// backend/routes/stats.js
const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const Item = require('../models/Item');
const { 
  calculateNumericStats, 
  calculateStringStats, 
  calculateBooleanStats 
} = require('../utilis/statsCalculator'); 

const router = express.Router();


router.get('/inventory/:inventoryId', auth, async (req, res) => {
  try {
    const { inventoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (!inventory.hasWriteAccess(req.user._id, req.user.isAdmin)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const items = await Item.find({ inventory: inventoryId });

    const totalItems = items.length;
    const createdDates = items.map(item => item.createdAt).filter(d => d);
    const lastUpdated = items.length > 0 ? new Date(Math.max(...items.map(item => item.updatedAt))) : null;

    const fieldStats = {
      text: {},
      textarea: {},
      number: {},
      boolean: {}
    };

    (inventory.fields || []).forEach(field => {
      const values = items.map(item => {
        let fieldValues = [];

        switch (field.type) {
          case 'text': fieldValues = item.textFields || []; break;
          case 'textarea': fieldValues = item.textareaFields || []; break;
          case 'number': fieldValues = item.numberFields || []; break;
          case 'boolean': fieldValues = item.booleanFields || []; break;
        }

        const fieldValue = fieldValues.find(fv => fv.fieldId?.toString() === field._id.toString());
        return fieldValue ? fieldValue.value : null;
      }).filter(v => v !== null && v !== undefined);

      switch (field.type) {
        case 'text':
          fieldStats.text[field._id] = { field: field.title, ...calculateStringStats(values) };
          break;
        case 'textarea':
          fieldStats.textarea[field._id] = { field: field.title, ...calculateStringStats(values) };
          break;
        case 'number':
          fieldStats.number[field._id] = { field: field.title, ...calculateNumericStats(values) };
          break;
        case 'boolean':
          fieldStats.boolean[field._id] = { field: field.title, ...calculateBooleanStats(values) };
          break;
      }
    });

    res.json({
      totalItems,
      createdDates: {
        oldest: createdDates.length > 0 ? new Date(Math.min(...createdDates)) : null,
        newest: createdDates.length > 0 ? new Date(Math.max(...createdDates)) : null
      },
      lastUpdated,
      fieldStats
    });
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const inventories = await Inventory.find({
      $or: [
        { owner: req.user._id },
        { editors: req.user._id }
      ]
    });

    const stats = await Promise.all(inventories.map(async inv => {
      const items = await Item.find({ inventory: inv._id });

      const fieldStats = {
        text: {},
        textarea: {},
        number: {},
        boolean: {}
      };

      (inv.fields || []).forEach(field => {
        const values = items.map(item => {
          let fieldValues = [];

          switch (field.type) {
            case 'text': fieldValues = item.textFields || []; break;
            case 'textarea': fieldValues = item.textareaFields || []; break;
            case 'number': fieldValues = item.numberFields || []; break;
            case 'boolean': fieldValues = item.booleanFields || []; break;
          }

          const fieldValue = fieldValues.find(fv => fv.fieldId?.toString() === field._id.toString());
          return fieldValue ? fieldValue.value : null;
        }).filter(v => v !== null && v !== undefined);

        switch (field.type) {
          case 'text':
            fieldStats.text[field._id] = { field: field.title, ...calculateStringStats(values) };
            break;
          case 'textarea':
            fieldStats.textarea[field._id] = { field: field.title, ...calculateStringStats(values) };
            break;
          case 'number':
            fieldStats.number[field._id] = { field: field.title, ...calculateNumericStats(values) };
            break;
          case 'boolean':
            fieldStats.boolean[field._id] = { field: field.title, ...calculateBooleanStats(values) };
            break;
        }
      });

      return {
        inventoryId: inv._id,
        inventoryName: inv.name,
        totalItems: items.length,
        fieldStats
      };
    }));

    res.json(stats);
  } catch (err) {
    console.error('Error in /api/stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
