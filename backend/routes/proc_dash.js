const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getRecentActivities,
    getVendorPerformanceMetrics,
    getBudgetUtilization
} = require('../controllers/proc_dash');

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get recent activities
router.get('/activities', getRecentActivities);

// Get vendor performance metrics
router.get('/vendor-performance', getVendorPerformanceMetrics);

// Get budget utilization
router.get('/budget-utilization', getBudgetUtilization);

module.exports = router;
