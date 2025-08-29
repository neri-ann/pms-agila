const mongoose = require('mongoose');
const ProcProject = require('./ProcProject');
const Supplyer = require('./supplyer');
const ProcRequest = require('./procReqest');
const Item = require('./item'); // Add Item model for procurement officer dashboard

class ProcDashboardModel {
    // Get active projects count with date filtering
    static async getActiveProjectsCount(filters = {}) {
        try {
            console.log('Getting active projects count with filters:', filters);
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            // Only apply date filtering if specific dates are provided
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            }
            // Don't filter by year only - show all data if no specific date range

            console.log('Date filter for active projects:', dateFilter);
            
            // First, let's count all documents to see if there's any data
            const totalCount = await ProcProject.countDocuments({});
            console.log('Total ProcProject documents:', totalCount);
            
            // If no specific date filter, return total count
            if (Object.keys(dateFilter).length === 0) {
                console.log('No date filtering, returning total count:', totalCount);
                return totalCount;
            }
            
            const count = await ProcProject.countDocuments({
                ...dateFilter
            });
            
            console.log('Filtered active projects count:', count);
            // If filtered count is 0, return total count to show actual data
            return count > 0 ? count : totalCount;
        } catch (error) {
            console.error('Error getting active projects count:', error);
            return 0;
        }
    }

    // Get approved vendors count with date filtering
    static async getApprovedVendorsCount(filters = {}) {
        try {
            console.log('Getting approved vendors count with filters:', filters);
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            // Only apply date filtering if specific dates are provided
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            }
            // Don't filter by year only - show all data if no specific date range

            console.log('Date filter for approved vendors:', dateFilter);
            
            // First, let's count all suppliers to see if there's any data
            const totalCount = await Supplyer.countDocuments({});
            console.log('Total Supplyer documents:', totalCount);
            
            // If no specific date filter, return total count
            if (Object.keys(dateFilter).length === 0) {
                console.log('No date filtering, returning total suppliers count:', totalCount);
                return totalCount;
            }
            
            // Check how many have status 'approved' vs 'active'
            const approvedCount = await Supplyer.countDocuments({
                status: 'approved',
                ...dateFilter
            });
            const activeCount = await Supplyer.countDocuments({
                status: 'active',
                ...dateFilter
            });
            
            console.log('Approved vendors count:', approvedCount);
            console.log('Active vendors count:', activeCount);
            
            // Return active count instead of approved if that's what the data uses
            return activeCount > 0 ? activeCount : approvedCount;
        } catch (error) {
            console.error('Error getting approved vendors count:', error);
            return 0;
        }
    }

    // Get pending requisitions count with optional date filtering
    static async getPendingRequisitionsCount(filters = {}) {
        try {
            console.log('Getting pending requisitions count with filters:', filters);
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            // Only apply date filtering if specific dates are provided
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            }
            // Don't filter by year only - show all data if no specific date range

            console.log('Date filter for pending requisitions:', dateFilter);
            
            // First, let's count all requisitions to see if there's any data
            const totalCount = await ProcRequest.countDocuments({});
            console.log('Total ProcRequest documents:', totalCount);
            
            // Count pending requisitions regardless of date filter
            const pendingCount = await ProcRequest.countDocuments({
                status: 'Pending'
            });
            console.log('Pending requisitions (no date filter):', pendingCount);
            
            // Check all statuses to debug
            const allStatuses = await ProcRequest.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            console.log('All ProcRequest statuses:', allStatuses);
            
            // If no specific date filter, return pending count
            if (Object.keys(dateFilter).length === 0) {
                console.log('No date filtering, returning pending requisitions count:', pendingCount);
                return pendingCount;
            }
            
            const count = await ProcRequest.countDocuments({
                status: 'Pending',
                ...dateFilter
            });
            
            console.log('Date-filtered pending requisitions count:', count);
            return count;
        } catch (error) {
            console.error('Error getting pending requisitions count:', error);
            return 0;
        }
    }

    // Get items count for procurement officer dashboard
    static async getItemsCount(filters = {}) {
        try {
            console.log('Getting items count with filters:', filters);
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            // Only apply date filtering if specific dates are provided
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            }

            console.log('Date filter for items:', dateFilter);
            
            // First, let's count all items to see if there's any data
            const totalCount = await Item.countDocuments({});
            console.log('Total Item documents:', totalCount);
            
            // If no specific date filter, return total count
            if (Object.keys(dateFilter).length === 0) {
                console.log('No date filtering, returning total items count:', totalCount);
                return totalCount;
            }
            
            const count = await Item.countDocuments({
                ...dateFilter
            });
            
            console.log('Filtered items count:', count);
            return count > 0 ? count : totalCount;
        } catch (error) {
            console.error('Error getting items count:', error);
            return 0;
        }
    }

    // Get monthly projects data for chart
    static async getMonthlyProjectsData(year) {
        try {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31);

            const result = await ProcProject.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYear,
                            $lte: endOfYear
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        total_projects: { $sum: 1 },
                        completed_projects: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "completed"] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        month_name: {
                            $arrayElemAt: [
                                ["", "January", "February", "March", "April", "May", "June",
                                 "July", "August", "September", "October", "November", "December"],
                                "$_id"
                            ]
                        },
                        total_projects: 1,
                        completed_projects: 1
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
            
            return result;
        } catch (error) {
            console.error('Error getting monthly projects data:', error);
            return [];
        }
    }

    // Get bid status distribution
    static async getBidStatusDistribution(filters = {}) {
        try {
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            } else if (year) {
                const startOfYear = new Date(year, 0, 1);
                const endOfYear = new Date(year, 11, 31);
                dateFilter.createdAt = {
                    $gte: startOfYear,
                    $lte: endOfYear
                };
            }

            const result = await ProcRequest.aggregate([
                {
                    $match: dateFilter
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        statuses: {
                            $push: {
                                status: "$_id",
                                count: "$count"
                            }
                        },
                        total: { $sum: "$count" }
                    }
                },
                {
                    $unwind: "$statuses"
                },
                {
                    $project: {
                        _id: 0,
                        status: "$statuses.status",
                        count: "$statuses.count",
                        percentage: {
                            $round: [
                                { $multiply: [{ $divide: ["$statuses.count", "$total"] }, 100] },
                                1
                            ]
                        }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            
            return result;
        } catch (error) {
            console.error('Error getting bid status distribution:', error);
            return [];
        }
    }

    // Get monthly requisitions data
    static async getMonthlyRequisitionsData(year) {
        try {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31);

            const result = await ProcRequest.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYear,
                            $lte: endOfYear
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        requisitions: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        month_name: {
                            $arrayElemAt: [
                                ["", "January", "February", "March", "April", "May", "June",
                                 "July", "August", "September", "October", "November", "December"],
                                "$_id"
                            ]
                        },
                        requisitions: 1
                    }
                },
                {
                    $sort: { month: 1 }
                }
            ]);
            
            return result;
        } catch (error) {
            console.error('Error getting monthly requisitions data:', error);
            return [];
        }
    }

    // Get previous year data for trend calculation
    static async getPreviousYearData(currentYear) {
        try {
            const prevYear = parseInt(currentYear) - 1;
            const startOfPrevYear = new Date(prevYear, 0, 1);
            const endOfPrevYear = new Date(prevYear, 11, 31);

            const dateFilter = {
                createdAt: {
                    $gte: startOfPrevYear,
                    $lte: endOfPrevYear
                }
            };
            
            const [projectsCount, vendorsCount, requisitionsCount] = await Promise.all([
                ProcProject.countDocuments(dateFilter),
                Supplyer.countDocuments({ status: 'approved', ...dateFilter }),
                ProcRequest.countDocuments({ status: 'Pending', ...dateFilter })
            ]);

            return {
                projects: projectsCount || 0,
                vendors: vendorsCount || 0,
                requisitions: requisitionsCount || 0
            };
        } catch (error) {
            console.error('Error getting previous year data:', error);
            return { projects: 0, vendors: 0, requisitions: 0 };
        }
    }

    // Get all dashboard statistics in one call
    static async getDashboardStats(filters = {}) {
        try {
            const { year = new Date().getFullYear() } = filters;
            
            // Get current data
            const [
                itemsCount,
                approvedVendorsCount,
                pendingRequisitionsCount,
                monthlyProjectsData,
                bidStatusData,
                monthlyRequisitionsData,
                previousYearData
            ] = await Promise.all([
                this.getItemsCount(filters),
                this.getApprovedVendorsCount(filters),
                this.getPendingRequisitionsCount(filters),
                this.getMonthlyProjectsData(year),
                this.getBidStatusDistribution(filters),
                this.getMonthlyRequisitionsData(year),
                this.getPreviousYearData(year)
            ]);

            // Calculate trends
            const calculateTrend = (current, previous) => {
                if (previous === 0) return { percentage: 0, direction: 'neutral' };
                const change = ((current - previous) / previous) * 100;
                return {
                    percentage: Math.abs(Math.round(change)),
                    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
                };
            };

            const itemsTrend = calculateTrend(itemsCount, previousYearData.projects);
            const vendorsTrend = calculateTrend(approvedVendorsCount, previousYearData.vendors);
            const requisitionsTrend = calculateTrend(pendingRequisitionsCount, previousYearData.requisitions);

            return {
                stats: {
                    activeProjects: {
                        count: itemsCount,
                        trend: itemsTrend
                    },
                    approvedVendors: {
                        count: approvedVendorsCount,
                        trend: vendorsTrend
                    },
                    pendingRequisitions: {
                        count: pendingRequisitionsCount,
                        trend: requisitionsTrend
                    }
                },
                charts: {
                    monthlyProjects: monthlyProjectsData,
                    bidStatus: bidStatusData,
                    monthlyRequisitions: monthlyRequisitionsData
                }
            };
        } catch (error) {
            console.error('Error getting dashboard statistics:', error);
            throw new Error(`Error getting dashboard statistics: ${error.message}`);
        }
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const [projects, vendors, requisitions] = await Promise.all([
                ProcProject.find({
                    createdAt: { $gte: sevenDaysAgo }
                })
                .select('_id projectId createdAt status')
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),

                Supplyer.find({
                    createdAt: { $gte: sevenDaysAgo }
                })
                .select('_id supplierName createdAt status')
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),

                ProcRequest.find({
                    createdAt: { $gte: sevenDaysAgo }
                })
                .select('_id requestId createdAt status')
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean()
            ]);

            // Transform and combine results
            const activities = [
                ...projects.map(p => ({
                    type: 'project',
                    id: p._id,
                    description: `Project: ${p.projectId || 'New Project'}`,
                    created_at: p.createdAt,
                    status: p.status,
                    action_type: 'Project created'
                })),
                ...vendors.map(v => ({
                    type: 'vendor',
                    id: v._id,
                    description: `Vendor: ${v.supplierName || 'New Vendor'}`,
                    created_at: v.createdAt,
                    status: v.status,
                    action_type: 'Vendor registered'
                })),
                ...requisitions.map(r => ({
                    type: 'requisition',
                    id: r._id,
                    description: `Purchase Requisition #${r.requestId || r._id}`,
                    created_at: r.createdAt,
                    status: r.status,
                    action_type: 'Requisition submitted'
                }))
            ];

            // Sort all activities by creation date and limit
            return activities
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent activities:', error);
            return [];
        }
    }

    // Get vendor performance metrics
    static async getVendorPerformanceMetrics(filters = {}) {
        try {
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            } else if (year) {
                const startOfYear = new Date(year, 0, 1);
                const endOfYear = new Date(year, 11, 31);
                dateFilter.createdAt = {
                    $gte: startOfYear,
                    $lte: endOfYear
                };
            }

            const vendors = await Supplyer.find({
                status: 'approved',
                ...dateFilter
            })
            .select('_id supplierName status createdAt')
            .limit(10)
            .sort({ createdAt: -1 })
            .lean();

            // For now, return basic vendor info since we don't have bid relationships set up yet
            const result = vendors.map(vendor => ({
                id: vendor._id,
                company_name: vendor.supplierName,
                status: vendor.status,
                total_requests: 0, // Will need to implement when bid system is connected
                approved_requests: 0,
                rating: 5, // Default rating
                created_at: vendor.createdAt
            }));

            return result;
        } catch (error) {
            console.error('Error getting vendor performance metrics:', error);
            return [];
        }
    }

    // Get budget utilization data
    static async getBudgetUtilization(filters = {}) {
        try {
            const { year, month, startDate, endDate } = filters;
            let dateFilter = {};

            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (year && month && month !== 'all') {
                const startOfMonth = new Date(year, parseInt(month) - 1, 1);
                const endOfMonth = new Date(year, parseInt(month), 0);
                dateFilter.createdAt = {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                };
            } else if (year) {
                const startOfYear = new Date(year, 0, 1);
                const endOfYear = new Date(year, 11, 31);
                dateFilter.createdAt = {
                    $gte: startOfYear,
                    $lte: endOfYear
                };
            }

            const result = await ProcProject.aggregate([
                {
                    $match: dateFilter
                },
                {
                    $group: {
                        _id: null,
                        allocated_budget: {
                            $sum: {
                                $cond: [
                                    { $in: ["$status", ["approved", "completed"]] },
                                    { $toDouble: "$budgetAllocation" },
                                    0
                                ]
                            }
                        },
                        spent_budget: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "completed"] },
                                    { $toDouble: "$usedAmount" },
                                    0
                                ]
                            }
                        },
                        total_budget: { $sum: { $toDouble: "$budgetAllocation" } },
                        total_projects: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        allocated_budget: { $ifNull: ["$allocated_budget", 0] },
                        spent_budget: { $ifNull: ["$spent_budget", 0] },
                        total_budget: { $ifNull: ["$total_budget", 0] },
                        total_projects: 1
                    }
                }
            ]);

            return result[0] || {
                allocated_budget: 0,
                spent_budget: 0,
                total_budget: 0,
                total_projects: 0
            };
        } catch (error) {
            console.error('Error getting budget utilization:', error);
            return {
                allocated_budget: 0,
                spent_budget: 0,
                total_budget: 0,
                total_projects: 0
            };
        }
    }
}

module.exports = ProcDashboardModel;
