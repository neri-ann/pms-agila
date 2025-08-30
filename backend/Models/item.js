const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  username: {
    type: String,
   // required: true,
  },
  itemName: {
    type: String,
    required: true,
    unique: true, // Ensure item name is unique
  },
  AssetsClass: {
    type: String,
    required: true,
    default: 'Current Assets',
    enum: ['Current Assets', 'Inventory', 'Supplier Assets', 'Contractual Assets'],
  },
  AssetsSubClass: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  quantityAvailable: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

// Virtual field to dynamically calculate quantity available from approved procurement requests
ItemSchema.virtual('calculatedQuantityAvailable').get(function() {
  // This will be populated by the controller when needed
  return this.quantityAvailable;
});

// Ensure virtual fields are serialized
ItemSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Item', ItemSchema);
