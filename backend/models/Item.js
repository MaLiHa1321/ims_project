// // backend/models/Item.js
// const mongoose = require('mongoose');

// const FieldValueSchema = new mongoose.Schema({
//   fieldId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true
//   },
//   value: mongoose.Schema.Types.Mixed
// });

// const ItemSchema = new mongoose.Schema({
//   inventory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Inventory',
//     required: true
//   },
//   customId: {
//     type: String,
//     required: true
//   },
//   // Fixed fields
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   // Custom field values
//   textFields: [FieldValueSchema],
//   textareaFields: [FieldValueSchema],
//   numberFields: [FieldValueSchema],
//   booleanFields: [FieldValueSchema],
//   documentFields: [FieldValueSchema],
//   // For optimistic locking
//   version: {
//     type: Number,
//     default: 0
//   }
// }, {
//   timestamps: true
// });

// // Compound index for customId uniqueness within an inventory
// ItemSchema.index({ inventory: 1, customId: 1 }, { unique: true });

// // Index for search functionality
// ItemSchema.index({
//   'textFields.value': 'text',
//   'textareaFields.value': 'text',
//   'numberFields.value': 1
// });

// module.exports = mongoose.model('Item', ItemSchema);

// backend/models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    customId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index to keep customId unique within an inventory
ItemSchema.index({ inventory: 1, customId: 1 }, { unique: true });

module.exports = mongoose.model('Item', ItemSchema);
