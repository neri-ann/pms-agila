const Budget = require('../Models/budget');
const User = require("../Models/user");

// Create new budget
exports.create = async (req, res) => {
    const { department, budgetAllocation, availableBalance, usedAmount } = req.body;
    
    try {
        // Check if budget already exists for this department
        const existingBudget = await Budget.findOne({ department });
        if (existingBudget) {
            return res.status(400).json({ 
                error: 'Budget already exists for this department',
                message: `A budget for ${department} department already exists` 
            });
        }

        const newBudget = new Budget({
            department,
            budgetAllocation,
            availableBalance,
            usedAmount
        });

        console.log('New Budget:', newBudget);
        await newBudget.save();
        
        res.json({ budget: newBudget.toObject() });
        console.log('Budget saved to the database');
    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all budgets
exports.viewBudget = async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.json(budgets);
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

// Update budget details
exports.updateBudget = async (req, res) => {
    let budgetId = req.params.id;
    const { department, budgetAllocation, availableBalance, usedAmount } = req.body;

    try {
        // Check if another budget exists for this department (excluding current one)
        if (department) {
            const existingBudget = await Budget.findOne({ 
                department, 
                _id: { $ne: budgetId } 
            });
            if (existingBudget) {
                return res.status(400).json({ 
                    error: 'Budget already exists for this department',
                    message: `Another budget for ${department} department already exists` 
                });
            }
        }

        const updatedBudget = {
            department,
            budgetAllocation,
            availableBalance,
            usedAmount,
        };

        const budget = await Budget.findByIdAndUpdate(budgetId, updatedBudget, { new: true });
        
        if (!budget) {
            return res.status(404).json({ status: "Budget not found" });
        }
        
        res.status(200).json({ status: "Budget updated", budget: budget });
    } catch (err) {
        console.error(err);
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
        
        res.status(200).json({ status: "Budget deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "Error with delete budget", error: err.message });
    }
};