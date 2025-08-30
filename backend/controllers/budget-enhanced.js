// Enhanced Budget Controller with Time-Based Budgets
const Budget = require('../Models/budget');
const User = require("../Models/user");

// Create new budget with fiscal year support
exports.create = async (req, res) => {
    const { department, budgetAllocation, availableBalance, usedAmount, fiscalYear } = req.body;
    
    try {
        const currentFiscalYear = fiscalYear || new Date().getFullYear();
        
        // Check if budget already exists for this department in this fiscal year
        const existingBudget = await Budget.findOne({ 
            department, 
            fiscalYear: currentFiscalYear 
        });
        
        if (existingBudget) {
            return res.status(400).json({ 
                error: 'Budget already exists for this department in this fiscal year',
                message: `A budget for ${department} department already exists for fiscal year ${currentFiscalYear}`,
                suggestion: 'Use update budget or create budget for a different fiscal year',
                existingBudget: {
                    id: existingBudget._id,
                    department: existingBudget.department,
                    fiscalYear: existingBudget.fiscalYear,
                    budgetAllocation: existingBudget.budgetAllocation
                }
            });
        }

        const newBudget = new Budget({
            department,
            budgetAllocation,
            availableBalance,
            usedAmount,
            fiscalYear: currentFiscalYear
        });

        await newBudget.save();
        
        res.json({ 
            budget: newBudget.toObject(),
            message: `Budget created for ${department} department for fiscal year ${currentFiscalYear}`
        });
        
    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get budgets with fiscal year filtering
exports.viewBudget = async (req, res) => {
    try {
        const { fiscalYear, department, active } = req.query;
        
        let filter = {};
        
        if (fiscalYear) filter.fiscalYear = parseInt(fiscalYear);
        if (department) filter.department = department;
        if (active === 'true') filter.status = 'ACTIVE';
        
        const budgets = await Budget.find(filter).sort({ fiscalYear: -1, department: 1 });
        
        res.json({
            budgets,
            totalCount: budgets.length,
            filters: filter
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
};

// Create new fiscal year budget (budget renewal)
exports.renewBudget = async (req, res) => {
    const { department, newFiscalYear, budgetAllocation, copyFromPrevious } = req.body;
    
    try {
        // Check if budget already exists for new fiscal year
        const existingNewBudget = await Budget.findOne({ 
            department, 
            fiscalYear: newFiscalYear 
        });
        
        if (existingNewBudget) {
            return res.status(400).json({ 
                error: 'Budget already exists for this fiscal year',
                message: `Budget for ${department} already exists for fiscal year ${newFiscalYear}`
            });
        }
        
        let newBudget;
        
        if (copyFromPrevious) {
            // Copy from previous year's budget
            const previousBudget = await Budget.findOne({ 
                department, 
                fiscalYear: newFiscalYear - 1 
            });
            
            if (!previousBudget) {
                return res.status(404).json({
                    error: 'Previous year budget not found',
                    message: `No budget found for ${department} in fiscal year ${newFiscalYear - 1}`
                });
            }
            
            newBudget = new Budget({
                department,
                fiscalYear: newFiscalYear,
                budgetAllocation: budgetAllocation || previousBudget.budgetAllocation,
                availableBalance: budgetAllocation || previousBudget.budgetAllocation,
                usedAmount: 0,
                status: 'ACTIVE'
            });
        } else {
            newBudget = new Budget({
                department,
                fiscalYear: newFiscalYear,
                budgetAllocation,
                availableBalance: budgetAllocation,
                usedAmount: 0,
                status: 'ACTIVE'
            });
        }
        
        await newBudget.save();
        
        res.json({
            budget: newBudget.toObject(),
            message: `New budget created for ${department} for fiscal year ${newFiscalYear}`
        });
        
    } catch (error) {
        console.error('Error renewing budget:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Archive old budgets
exports.archiveBudget = async (req, res) => {
    const { fiscalYear } = req.body;
    
    try {
        const result = await Budget.updateMany(
            { fiscalYear: fiscalYear },
            { status: 'EXPIRED' }
        );
        
        res.json({
            message: `Archived ${result.modifiedCount} budgets for fiscal year ${fiscalYear}`,
            modifiedCount: result.modifiedCount
        });
        
    } catch (error) {
        console.error('Error archiving budgets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = exports;
