const router = require('express').Router();
const {
    create, 
    viewBudget, 
    previewBudget, 
    getBudgetByDepartment, 
    getBudgetByDepartmentName, 
    getActiveBudgets,
    updateBudget, 
    deleterBudget,
    renewBudget,
    archiveBudgets,
    getBudgetAnalytics
} = require('../controllers/budget');

// Budget CRUD operations
router.post("/create", create);
router.get('/viewBudget', viewBudget);
router.get("/previewBudget/:id", previewBudget);
router.put("/updateBudget/:id", updateBudget);
router.delete("/deleterBudget/:id", deleterBudget);

// Department-specific budget retrieval
router.get('/active/list', getActiveBudgets);  // Must come before /:department route
router.get('/:department', getBudgetByDepartmentName);
router.get("/getBudgetByDepartment/:id", getBudgetByDepartment);

// New time-based budget operations
router.post("/renew", renewBudget);
router.post("/archive", archiveBudgets);
router.get("/analytics/summary", getBudgetAnalytics);

module.exports = router;