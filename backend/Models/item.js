const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
    index: true
  },
  itemName: {
    type: String,
    // required: true,
    index: true
  },
  AssetsClass: {
    type: String,
    index: true,
    default: 'Current Assets',
    enum: ['Current Assets', 'Inventory', 'Supplier Assets', 'Contractual Assets'],
  },
  AssetsSubClass: {
    type: String,
    index: true
  },
});

module.exports = mongoose.model('Item', ItemSchema);
