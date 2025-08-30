const Budget = require('../Models/budget');
const User = require("../Models/user");

// Create new budget with fiscal year and period support
exports.create = async (req, res) => {
    const { department, budgetAllocation, fiscalYear, budgetPeriod, description, status } = req.body;
    
    try {
        // Set default values
        const currentFiscalYear = fiscalYear || new Date().getFullYear();
        const period = budgetPeriod || 'ANNUAL';
        const allocation = parseFloat(budgetAllocation);
        const budgetStatus = status || 'ACTIVE';

        // Validate input
        if (!allocation || allocation <= 0) {
            return res.status(400).json({ 
                error: 'Invalid budget allocation',
                message: 'Budget allocation must be a positive number'
            });
        }

        // Check if budget already exists for this department in this fiscal year and period
        const existingBudget = await Budget.findOne({ 
            department, 
            fiscalYear: currentFiscalYear,
            budgetPeriod: period
        });
        
        if (existingBudget) {
            return res.status(400).json({ 
                error: 'Budget already exists',
                message: `A ${period} budget for ${department} department already exists for fiscal year ${currentFiscalYear}`,
                suggestion: 'Use update budget or create budget for a different period/year',
                existingBudget: {
                    id: existingBudget._id,
                    department: existingBudget.department,
                    fiscalYear: existingBudget.fiscalYear,
                    budgetPeriod: existingBudget.budgetPeriod,
                    budgetAllocation: existingBudget.budgetAllocation
                }
            });
        }

        const newBudget = new Budget({
            department,
            budgetAllocation: allocation,
            usedAmount: 0, // Initialize to 0, will be calculated from approved ProcRequests
            fiscalYear: currentFiscalYear,
            budgetPeriod: period,
            description,
            status: budgetStatus,
            approvedBy: req.user?.id,
            approvedAt: new Date()
        });

        console.log('New Budget:', newBudget);
        await newBudget.save();
        
        // Populate the approvedBy field for response
        await newBudget.populate('approvedBy', 'username email');
        
        res.json({ 
            budget: newBudget.toObject(),
            message: `${period} budget created for ${department} department for fiscal year ${currentFiscalYear}`
        });
        console.log('Budget saved to the database');
    } catch (error) {
        console.error('Error saving budget:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'Duplicate budget',
                message: 'A budget for this department, fiscal year, and period already exists'
            });
        }
        
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Get all budgets with filtering support
exports.viewBudget = async (req, res) => {
    try {
        const { fiscalYear, department, budgetPeriod, status, page = 1, limit = 50 } = req.query;
        
        let filter = {};
        
        // Build filter object
        if (fiscalYear) filter.fiscalYear = parseInt(fiscalYear);
        if (department) filter.department = department;
        if (budgetPeriod) filter.budgetPeriod = budgetPeriod;
        if (status) filter.status = status;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get budgets with population
        const budgets = await Budget.find(filter)
            .populate('approvedBy', 'username email')
            .sort({ fiscalYear: -1, department: 1, budgetPeriod: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const totalCount = await Budget.countDocuments(filter);
        
        // Get summary statistics
        const totalBudgetAllocation = await Budget.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$budgetAllocation' } } }
        ]);
        
        const totalUsedAmount = await Budget.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$usedAmount' } } }
        ]);
        
        res.json({
            budgets,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                hasNext: skip + budgets.length < totalCount,
                hasPrev: parseInt(page) > 1
            },
            summary: {
                totalBudgetAllocation: totalBudgetAllocation[0]?.total || 0,
                totalUsedAmount: totalUsedAmount[0]?.total || 0,
                totalAvailableBalance: (totalBudgetAllocation[0]?.total || 0) - (totalUsedAmount[0]?.total || 0)
            },
            filters: filter
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
};

// View details of particular budget
exports.previewBudget = async (req, res) => {
    const budgetId = req.params.id;

    try {
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            return res.status(404).json({ status: "Budget not found" });
        }
        
        res.status(200).json(budget); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "Error with getting budget", error: err.message });
    }
};

// Get budget by user ID (using user's department)
exports.getBudgetByDepartment = async (req, res) => {
    const userId = req.params.id;

    try {
        // Fetch the logged-in user to get their department
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: "User not found" });
        }

        const budget = await Budget.findOne({ department: user.department });
        if (!budget) {
            return res.status(404).json({ 
                status: "No budget found for this department",
                department: user.department 
            });
        }

        const { budgetAllocation, usedAmount, availableBalance } = budget;
        res.status(200).json({ budgetAllocation, usedAmount, availableBalance });
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get budget by department name directly (IMPROVED VERSION)
exports.getBudgetByDepartmentName = async (req, res) => {
    const departmentName = req.params.department;

    try {
        console.log("=== BUDGET ENDPOINT CALLED ===");
        console.log("Searching for budget with department:", departmentName);
        
        // Validate department name
        if (!departmentName || departmentName.trim() === '') {
            return res.status(400).json({ 
                status: "Invalid department name",
                message: "Department name is required"
            });
        }

        // Trim whitespace and convert to consistent case for comparison
        const cleanDepartmentName = departmentName.trim();
        
        // First, let's see all budgets in the database for debugging
        const allBudgets = await Budget.find();
        console.log("All budgets in database:", allBudgets.map(b => ({ 
            id: b._id, 
            department: b.department,
            budgetAllocation: b.budgetAllocation,
            availableBalance: b.availableBalance,
            usedAmount: b.usedAmount
        })));
        
        // Try exact match first
        let budget = await Budget.findOne({ department: cleanDepartmentName });
        
        // If no exact match, try case-insensitive search
        if (!budget) {
            budget = await Budget.findOne({ 
                department: { $regex: new RegExp(`^${cleanDepartmentName}$`, 'i') } 
            });
        }
        
        console.log("Found budget for department", cleanDepartmentName, ":", budget);
        
        if (!budget) {
            console.log("No budget found, returning 404");
            return res.status(404).json({ 
                status: "No budget found for this department",
                message: `No budget found for department: ${cleanDepartmentName}`,
                searchedFor: cleanDepartmentName,
                availableDepartments: allBudgets.map(b => b.department)
            });
        }

        const { budgetAllocation, usedAmount, availableBalance } = budget;
        console.log("Returning budget data:", { budgetAllocation, usedAmount, availableBalance });

        res.status(200).json({ 
            budgetAllocation: budgetAllocation || 0, 
            usedAmount: usedAmount || 0, 
            availableBalance: availableBalance || 0,
            department: budget.department
        });
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            department: departmentName
        });
    }
};

// Get active budgets for ProcRequests dropdown
exports.getActiveBudgets = async (req, res) => {
    try {
        console.log("=== ACTIVE BUDGETS ENDPOINT CALLED ===");
        
        // Find all active budgets
        const activeBudgets = await Budget.find({ 
            status: 'ACTIVE' 
        }).select('department budgetPeriod fiscalYear budgetAllocation usedAmount _id');

        if (!activeBudgets || activeBudgets.length === 0) {
            return res.status(404).json({ 
                status: "No active budgets found",
                message: "No budgets with ACTIVE status are available"
            });
        }

        // Format budgets with available balance for dropdown display
        const formattedBudgets = activeBudgets.map(budget => ({
            _id: budget._id,
            department: budget.department,
            budgetPeriod: budget.budgetPeriod,
            fiscalYear: budget.fiscalYear,
            budgetAllocation: budget.budgetAllocation,
            usedAmount: budget.usedAmount,
            availableBalance: budget.availableBalance, // This will be calculated by the virtual
            displayText: `${budget.department} - ${budget.budgetPeriod} FY${budget.fiscalYear} (₱${budget.availableBalance?.toLocaleString() || (budget.budgetAllocation - budget.usedAmount).toLocaleString()} remaining)`
        }));

        console.log("Active budgets found:", formattedBudgets.length);
        
        res.status(200).json({ 
            status: "Success",
            count: formattedBudgets.length,
            budgets: formattedBudgets
        });
    } catch (error) {
        console.error("Error fetching active budgets:", error);
        res.status(500).json({ 
            status: "Error with getting active budgets",
            message: "Server error", 
            error: error.message 
        });
    }
};

// Update budget details with fiscal year support
exports.updateBudget = async (req, res) => {
    let budgetId = req.params.id;
    const { department, budgetAllocation, usedAmount, fiscalYear, budgetPeriod, description, status } = req.body;

    try {
        // Get the current budget
        const currentBudget = await Budget.findById(budgetId);
        if (!currentBudget) {
            return res.status(404).json({ status: "Budget not found" });
        }

        // Validate numeric inputs
        const allocation = budgetAllocation !== undefined ? parseFloat(budgetAllocation) : currentBudget.budgetAllocation;
        const used = usedAmount !== undefined ? parseFloat(usedAmount) : currentBudget.usedAmount;

        if (allocation <= 0) {
            return res.status(400).json({ 
                error: 'Invalid budget allocation',
                message: 'Budget allocation must be a positive number'
            });
        }

        if (used < 0) {
            return res.status(400).json({ 
                error: 'Invalid used amount',
                message: 'Used amount cannot be negative'
            });
        }

        if (used > allocation) {
            return res.status(400).json({ 
                error: 'Invalid budget calculation',
                message: 'Used amount cannot exceed budget allocation'
            });
        }

        // Check for duplicate if department, fiscal year, or period is being changed
        if (department || fiscalYear || budgetPeriod) {
            const checkDepartment = department || currentBudget.department;
            const checkFiscalYear = fiscalYear || currentBudget.fiscalYear;
            const checkBudgetPeriod = budgetPeriod || currentBudget.budgetPeriod;
            
            const existingBudget = await Budget.findOne({ 
                department: checkDepartment,
                fiscalYear: checkFiscalYear,
                budgetPeriod: checkBudgetPeriod,
                _id: { $ne: budgetId } 
            });
            
            if (existingBudget) {
                return res.status(400).json({ 
                    error: 'Budget already exists',
                    message: `Another ${checkBudgetPeriod} budget for ${checkDepartment} department already exists for fiscal year ${checkFiscalYear}` 
                });
            }
        }

        const updatedBudget = {
            department: department || currentBudget.department,
            budgetAllocation: allocation,
            usedAmount: used,
            availableBalance: allocation - used,
            fiscalYear: fiscalYear || currentBudget.fiscalYear,
            budgetPeriod: budgetPeriod || currentBudget.budgetPeriod,
            description: description !== undefined ? description : currentBudget.description,
            status: status || currentBudget.status
        };

        const budget = await Budget.findByIdAndUpdate(budgetId, updatedBudget, { 
            new: true,
            runValidators: true 
        }).populate('approvedBy', 'username email');
        
        res.status(200).json({ 
            status: "Budget updated successfully", 
            budget: budget,
            message: `${budget.budgetPeriod} budget for ${budget.department} department updated for fiscal year ${budget.fiscalYear}`
        });
    } catch (err) {
        console.error(err);
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                error: 'Duplicate budget',
                message: 'A budget for this department, fiscal year, and period already exists'
            });
        }
        
        res.status(500).json({ status: "Error with updating budget", error: err.message });
    }
};

// Delete budget
exports.deleterBudget = async (req, res) => {
    let budgetId = req.params.id;
    
    try {
        const deletedBudget = await Budget.findByIdAndDelete(budgetId);
        
        if (!deletedBudget) {
            return res.status(404).json({ status: "Budget not found" });
        }
        
        res.status(200).json({ 
            status: "Budget deleted successfully",
            deletedBudget: {
                department: deletedBudget.department,
                fiscalYear: deletedBudget.fiscalYear,
                budgetPeriod: deletedBudget.budgetPeriod
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error with delete budget", error: err.message });
    }
};

// Create new fiscal year budget (budget renewal)
exports.renewBudget = async (req, res) => {
    const { department, newFiscalYear, budgetAllocation, budgetPeriod, copyFromPrevious, description } = req.body;
    
    try {
        const fiscalYear = parseInt(newFiscalYear);
        const period = budgetPeriod || 'ANNUAL';
        
        // Check if budget already exists for new fiscal year and period
        const existingNewBudget = await Budget.findOne({ 
            department, 
            fiscalYear: fiscalYear,
            budgetPeriod: period
        });
        
        if (existingNewBudget) {
            return res.status(400).json({ 
                error: 'Budget already exists',
                message: `${period} budget for ${department} already exists for fiscal year ${fiscalYear}`
            });
        }
        
        let newBudget;
        
        if (copyFromPrevious) {
            // Copy from previous year's budget
            const previousBudget = await Budget.findOne({ 
                department, 
                fiscalYear: fiscalYear - 1,
                budgetPeriod: period
            }).sort({ createdAt: -1 });
            
            if (!previousBudget) {
                return res.status(404).json({
                    error: 'Previous budget not found',
                    message: `No ${period} budget found for ${department} in fiscal year ${fiscalYear - 1}`
                });
            }
            
            newBudget = new Budget({
                department,
                fiscalYear: fiscalYear,
                budgetPeriod: period,
                budgetAllocation: parseFloat(budgetAllocation) || previousBudget.budgetAllocation,
                usedAmount: 0,
                availableBalance: parseFloat(budgetAllocation) || previousBudget.budgetAllocation,
                description: description || `Renewed from ${fiscalYear - 1} budget`,
                status: 'ACTIVE',
                approvedBy: req.user?.id,
                approvedAt: new Date()
            });
        } else {
            const allocation = parseFloat(budgetAllocation);
            if (!allocation || allocation <= 0) {
                return res.status(400).json({
                    error: 'Invalid budget allocation',
                    message: 'Budget allocation must be a positive number'
                });
            }
            
            newBudget = new Budget({
                department,
                fiscalYear: fiscalYear,
                budgetPeriod: period,
                budgetAllocation: allocation,
                usedAmount: 0,
                availableBalance: allocation,
                description: description || `New ${period} budget for ${fiscalYear}`,
                status: 'ACTIVE',
                approvedBy: req.user?.id,
                approvedAt: new Date()
            });
        }
        
        await newBudget.save();
        await newBudget.populate('approvedBy', 'username email');
        
        res.json({
            budget: newBudget.toObject(),
            message: `New ${period} budget created for ${department} for fiscal year ${fiscalYear}`
        });
        
    } catch (error) {
        console.error('Error renewing budget:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Archive old budgets
exports.archiveBudgets = async (req, res) => {
    const { fiscalYear, department } = req.body;
    
    try {
        let filter = {};
        if (fiscalYear) filter.fiscalYear = parseInt(fiscalYear);
        if (department) filter.department = department;
        
        const result = await Budget.updateMany(
            filter,
            { status: 'EXPIRED' }
        );
        
        res.json({
            message: `Archived ${result.modifiedCount} budgets`,
            modifiedCount: result.modifiedCount,
            filter: filter
        });
        
    } catch (error) {
        console.error('Error archiving budgets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get budget summary and analytics
exports.getBudgetAnalytics = async (req, res) => {
    try {
        const { fiscalYear, department } = req.query;
        const currentYear = new Date().getFullYear();
        const targetYear = fiscalYear ? parseInt(fiscalYear) : currentYear;
        
        let baseFilter = { fiscalYear: targetYear };
        if (department) baseFilter.department = department;
        
        // Get budget summary by department
        const departmentSummary = await Budget.aggregate([
            { $match: baseFilter },
            {
                $group: {
                    _id: '$department',
                    totalBudget: { $sum: '$budgetAllocation' },
                    totalUsed: { $sum: '$usedAmount' },
                    totalAvailable: { $sum: '$availableBalance' },
                    budgetCount: { $sum: 1 },
                    periods: { $push: '$budgetPeriod' }
                }
            },
            {
                $addFields: {
                    utilizationPercentage: {
                        $round: [{
                            $multiply: [{
                                $divide: ['$totalUsed', '$totalBudget']
                            }, 100]
                        }, 2]
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Get budget summary by period
        const periodSummary = await Budget.aggregate([
            { $match: baseFilter },
            {
                $group: {
                    _id: '$budgetPeriod',
                    totalBudget: { $sum: '$budgetAllocation' },
                    totalUsed: { $sum: '$usedAmount' },
                    totalAvailable: { $sum: '$availableBalance' },
                    departmentCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Get overall summary
        const overallSummary = await Budget.aggregate([
            { $match: baseFilter },
            {
                $group: {
                    _id: null,
                    totalBudget: { $sum: '$budgetAllocation' },
                    totalUsed: { $sum: '$usedAmount' },
                    totalAvailable: { $sum: '$availableBalance' },
                    activeBudgets: { 
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
                    },
                    expiredBudgets: { 
                        $sum: { $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        res.json({
            fiscalYear: targetYear,
            departmentFilter: department,
            departmentSummary,
            periodSummary,
            overallSummary: overallSummary[0] || {
                totalBudget: 0,
                totalUsed: 0,
                totalAvailable: 0,
                activeBudgets: 0,
                expiredBudgets: 0
            }
        });
        
    } catch (error) {
        console.error('Error getting budget analytics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};