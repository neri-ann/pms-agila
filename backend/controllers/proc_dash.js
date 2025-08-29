const ProcDashboardModel = require('../Models/proc_dash');

// Get dashboard statistics for procurement officer
const getDashboardStats = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month, startDate, endDate } = req.query;
        
        console.log('Dashboard request filters:', { year, month, startDate, endDate });
        
        const filters = {
            year: year,
            month: month,
            startDate: startDate,
            endDate: endDate
        };

        const dashboardData = await ProcDashboardModel.getDashboardStats(filters);

        res.json({
            success: true,
            data: dashboardData,
            message: 'Dashboard statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const recentActivities = await ProcDashboardModel.getRecentActivities(parseInt(limit));

        res.json({
            success: true,
            data: recentActivities,
            message: 'Recent activities retrieved successfully'
        });

    } catch (error) {
        console.error('Recent activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activities',
            error: error.message
        });
    }
};

// Get vendor performance metrics
const getVendorPerformanceMetrics = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month, startDate, endDate } = req.query;
        
        const filters = {
            year: year,
            month: month,
            startDate: startDate,
            endDate: endDate
        };

        const vendorMetrics = await ProcDashboardModel.getVendorPerformanceMetrics(filters);

        res.json({
            success: true,
            data: vendorMetrics,
            message: 'Vendor performance metrics retrieved successfully'
        });

    } catch (error) {
        console.error('Vendor performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor performance metrics',
            error: error.message
        });
    }
};

// Get budget utilization
const getBudgetUtilization = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month, startDate, endDate } = req.query;
        
        const filters = {
            year: year,
            month: month,
            startDate: startDate,
            endDate: endDate
        };

        const budgetData = await ProcDashboardModel.getBudgetUtilization(filters);

        res.json({
            success: true,
            data: budgetData,
            message: 'Budget utilization data retrieved successfully'
        });

    } catch (error) {
        console.error('Budget utilization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching budget utilization data',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivities,
    getVendorPerformanceMetrics,
    getBudgetUtilization
};
