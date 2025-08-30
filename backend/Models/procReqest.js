const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    filename: {type: String,},
    file: {type: String,},
    filepath:{type: String,}, // Now stores Google Drive view link
    googleDriveId: {type: String,}, // Google Drive file ID
    mimeType: {type: String,}, // File MIME type
});
  const specificationSchema = new Schema({
    filename: {type: String,},
    file: {type: String,},
    filepath:{type: String,}, // Now stores Google Drive view link
    googleDriveId: {type: String,}, // Google Drive file ID
    mimeType: {type: String,}, // File MIME type
});
  const itemSchema = new Schema({
    itemId: {
      type: String,
      default: function () {
          // Ensure the counter is initialized and incremented
          this.constructor.counter = this.constructor.counter || 1;
          return 'Item' + String(this.constructor.counter++).padStart(3, '0');
      },
  },
    itemName: {type: String,},
      cost: {type: Number,},
      qtyRequired: {type: Number,},
      qtyAvailable: {type: Number,},
      action: {type: String,},
   
  });
const procRequestSchema = new Schema({
  requestId: {
    type: String,
    unique: true,
  },
  faculty: {type: String,},
  department: {type: String,},
  budgetPeriod: {
    type: String,
    enum: ['ANNUAL', 'Q1', 'Q2', 'Q3', 'Q4'],
    required: true
  },
  fiscalYear: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  date: {type: Date,},
  contactPerson: {type: String,},
  contactNo: {type: Number,},
  usedAmount: {type: Number, default: 0},
  purpose: {
    type: String,
    default: 'normal',
    enum: ['', 'normal', 'Fast Track', 'Urgent', 'Normal']
  },
  sendTo: {
    type: String,
    default: 'dean',
    enum: ['', 'dean', 'registrar', 'viceChancellor']
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Bid Opening", "Invite Bids", "TEC Evaluation"],
    default: "Pending",
  },
  items: [itemSchema],  // Array of items within ProcurementRequest schema
  files: [fileSchema],  // Array of files within ProcurementRequest schema
  specifications: [specificationSchema]
}, { timestamps: true });

// Pre-save middleware to calculate usedAmount from items
procRequestSchema.pre('save', function(next) {
  // Calculate total cost from items (quantity * cost for each item)
  if (this.items && this.items.length > 0) {
    this.usedAmount = this.items.reduce((total, item) => {
      const itemCost = parseFloat(item.cost) || 0;
      const itemQty = parseInt(item.qtyRequired) || 0;
      return total + (itemCost * itemQty);
    }, 0);
  } else {
    this.usedAmount = 0;
  }
  next();
});

// Post-save middleware to update Budget usedAmount when ProcRequest status changes
procRequestSchema.post('save', async function(doc) {
  if (doc.status === 'Approved' && doc.budgetId) {
    try {
      const Budget = require('./budget');
      const budget = await Budget.findById(doc.budgetId);
      if (budget) {
        await budget.updateUsedAmount();
        console.log(`Budget ${budget._id} updated after request ${doc.requestId} approval`);
      }
    } catch (error) {
      console.error('Error updating budget usedAmount:', error);
    }
  }
});

// Post-findOneAndUpdate middleware to handle updates via findByIdAndUpdate (approval workflow)
procRequestSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'Approved' && doc.budgetId) {
    try {
      const Budget = require('./budget');
      const budget = await Budget.findById(doc.budgetId);
      if (budget) {
        await budget.updateUsedAmount();
        console.log(`Budget ${budget._id} updated after request ${doc.requestId} approval via findOneAndUpdate`);
      }
    } catch (error) {
      console.error('Error updating budget usedAmount via findOneAndUpdate:', error);
    }
  }
});

const procReqest = mongoose.model('procRequest', procRequestSchema);

module.exports = procReqest;