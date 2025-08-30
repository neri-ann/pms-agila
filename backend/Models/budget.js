const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
    department: {
        type: String,
        enum: ['DEIE', 'DCEE', 'DMME', 'DCE', 'DMNNE', 'DIS', 'NONE'],
        required: true
    }, 
    fiscalYear: {
        type: Number,
        required: true,
        default: () => new Date().getFullYear()
    },
    budgetPeriod: {
        type: String,
        enum: ['ANNUAL', 'Q1', 'Q2', 'Q3', 'Q4'],
        default: 'ANNUAL',
        required: true
    },
    budgetAllocation: {
        type: Number,
        required: true,
        min: 0
    }, 
    usedAmount: {
        type: Number,
        default: 0,
        min: 0
    }, 
    description: {
        type: String,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED'],
        default: 'ACTIVE',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, { timestamps: true });

// Create compound unique index for department + fiscalYear + budgetPeriod
budgetSchema.index({ department: 1, fiscalYear: 1, budgetPeriod: 1 }, { unique: true });

// Virtual for availableBalance calculation
budgetSchema.virtual('availableBalance').get(function() {
    return this.budgetAllocation - this.usedAmount;
});

// Virtual for budget utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
    if (this.budgetAllocation === 0) return 0;
    return Math.round((this.usedAmount / this.budgetAllocation) * 100);
});

// Ensure virtual fields are serialized
budgetSchema.set('toJSON', { virtuals: true });

// Method to update usedAmount based on approved ProcRequests
budgetSchema.methods.updateUsedAmount = async function() {
    const ProcRequest = require('./procReqest');
    
    // Calculate total used amount from approved procurement requests that reference this specific budget
    const approvedRequests = await ProcRequest.find({
        budgetId: this._id,
        status: 'Approved'
    });
    
    // Calculate total cost for each request by summing (quantity * cost) for all items
    this.usedAmount = approvedRequests.reduce((totalUsed, request) => {
        const requestTotalCost = (request.items || []).reduce((requestSum, item) => {
            const itemCost = parseFloat(item.cost) || 0;
            const itemQty = parseInt(item.qtyRequired) || 0;
            return requestSum + (itemCost * itemQty);
        }, 0);
        return totalUsed + requestTotalCost;
    }, 0);
    
    return this.save();
};

module.exports = mongoose.model('Budget', budgetSchema);