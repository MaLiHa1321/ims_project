
const mongoose = require('mongoose');
const crypto = require('crypto');
const Item = require('./Item'); 

const FieldSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['text', 'textarea', 'number', 'boolean', 'document'], required: true },
  showInTableView: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const CustomIdElementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fixed', 'random20', 'random32', 'random6', 'random9', 'guid', 'datetime', 'sequence'],
    required: true
  },
  value: { type: String, default: '' },
  format: { type: String, default: '' },
  order: { type: Number, default: 0 }
});

const InventorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Equipment', 'Furniture', 'Book', 'Document', 'Other'], default: 'Other' },
  tags: { type: [String], trim: true, default: [] },
  image: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  customIdFormat: { type: [CustomIdElementSchema], default: [] },
  fields: { type: [FieldSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allowedUsers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  version: { type: Number, default: 0 }
}, { timestamps: true });

InventorySchema.index({ title: 'text', description: 'text', tags: 'text' });

InventorySchema.statics.search = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .populate('createdBy', 'username');
};

InventorySchema.methods.hasWriteAccess = function(userId, isAdmin) {
  if (isAdmin) return true;
  if (this.createdBy.toString() === userId.toString()) return true;
  if (this.isPublic) return true;
  return (this.allowedUsers || []).some(id => id.toString() === userId.toString());
};

InventorySchema.methods.generateCustomId = async function() {
  const elements = this.customIdFormat.sort((a, b) => a.order - b.order);
  let generatedId = '';

  for (const element of elements) {
    switch (element.type) {
      case 'fixed':
        generatedId += element.value;
        break;
      case 'random20':
        generatedId += Math.random().toString(36).substring(2, 8).toUpperCase();
        break;
      case 'random32':
        generatedId += Math.random().toString(36).substring(2, 10).toUpperCase();
        break;
      case 'random6':
        generatedId += Math.floor(100000 + Math.random() * 900000).toString();
        break;
      case 'random9':
        generatedId += Math.floor(100000000 + Math.random() * 900000000).toString();
        break;
      case 'guid':
        generatedId += crypto.randomUUID();
        break;
      case 'datetime':
        const now = new Date();
        generatedId += element.format
          ? now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14)
          : now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
        break;
      case 'sequence':
        const count = await Item.countDocuments({ inventory: this._id });
        let seq = (count + 1).toString();
        if (element.format) {
          const length = parseInt(element.format);
          seq = seq.padStart(length, '0');
        }
        generatedId += seq;
        break;
      default:
        generatedId += '';
    }
  }

  return generatedId;
};

module.exports = mongoose.model('Inventory', InventorySchema);
