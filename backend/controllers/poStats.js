const ProcRequest = require('../Models/procReqest');
const Item = require('../Models/item');
const Supplier = require('../Models/supplyer');
const ProcProject = require('../Models/ProcProject');
const { format, subMonths, startOfMonth, endOfMonth } = require('date-fns');

// Get Procurement Officer Dashboard Statistics
exports.getPOStats = async (req, res) => {
  try {
    const { year, month, startDate, endDate } = req.query;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Build date filter based on provided parameters
    let dateFilter = {};
    let filterStart = new Date(new Date().getFullYear(), 0, 1); // Default: start of current year
    let filterEnd = new Date(); // Default: current date
    
    if (startDate && endDate) {
      filterStart = new Date(startDate);
      filterEnd = new Date(endDate);
    } else if (year && month && month !== 'all') {
      filterStart = new Date(parseInt(year), parseInt(month) - 1, 1);
      filterEnd = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    } else if (year) {
      filterStart = new Date(parseInt(year), 0, 1);
      filterEnd = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
    }

    dateFilter = { createdAt: { $gte: filterStart, $lte: filterEnd } };



    // === PURCHASE REQUISITIONS STATISTICS ===
    
    // Total requests
    const totalRequests = await ProcRequest.countDocuments({});
    const filteredRequests = await ProcRequest.countDocuments(dateFilter);

    // Requests by status
    const requestsByStatus = await ProcRequest.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Pending requests (priority)
    const pendingRequests = await ProcRequest.countDocuments({ 
      ...dateFilter, 
      status: "Pending" 
    });

    // Approved requests
    const approvedRequests = await ProcRequest.countDocuments({ 
      ...dateFilter, 
      status: "Approved" 
    });

    // Recent requests (last 30 days)
    const recentRequestsDate = new Date();
    recentRequestsDate.setDate(recentRequestsDate.getDate() - 30);
    const recentRequests = await ProcRequest.countDocuments({
      createdAt: { $gte: recentRequestsDate }
    });

    // Requests by department
    const requestsByDepartment = await ProcRequest.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly requests trend (based on filtered date range, not fixed 12-month rolling)
    const monthlyRequests = [];
    const monthlyRequestsDetails = [];
    
    if (month && month !== 'all') {
      // If specific month is selected, show only that month
      const monthStart = filterStart;
      const monthEnd = filterEnd;
      
      const count = await ProcRequest.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      monthlyRequests.push(count);
      monthlyRequestsDetails.push({
        month: monthNames[parseInt(month) - 1],
        year: parseInt(year || new Date().getFullYear()),
        count: count,
        monthYear: `${monthNames[parseInt(month) - 1]} ${parseInt(year || new Date().getFullYear())}`
      });
    } else {
      // If year or date range is selected, show monthly breakdown within that period
      const startYear = filterStart.getFullYear();
      const endYear = filterEnd.getFullYear();
      const startMonth = filterStart.getMonth();
      const endMonth = endYear > startYear ? 11 : filterEnd.getMonth();
      
      // Generate months within the filtered date range
      for (let currentYear = startYear; currentYear <= endYear; currentYear++) {
        const yearStartMonth = currentYear === startYear ? startMonth : 0;
        const yearEndMonth = currentYear === endYear ? (endYear > startYear ? filterEnd.getMonth() : endMonth) : 11;
        
        for (let currentMonth = yearStartMonth; currentMonth <= yearEndMonth; currentMonth++) {
          const monthStart = new Date(currentYear, currentMonth, 1);
          const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
          
          // Ensure we don't go beyond the filter range
          const actualStart = monthStart < filterStart ? filterStart : monthStart;
          const actualEnd = monthEnd > filterEnd ? filterEnd : monthEnd;
          
          const count = await ProcRequest.countDocuments({
            createdAt: { $gte: actualStart, $lte: actualEnd }
          });
          
          monthlyRequests.push(count);
          monthlyRequestsDetails.push({
            month: monthNames[currentMonth],
            year: currentYear,
            count: count,
            monthYear: `${monthNames[currentMonth]} ${currentYear}`
          });
        }
      }
    }

    // === ITEMS STATISTICS ===
    
    // Total items (applying date filter based on when items were created)
    const totalItems = await Item.countDocuments(dateFilter);
    
    // Items by asset class (filtered by creation date)
    const itemsByAssetClass = await Item.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$AssetsClass", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Low stock items (filtered by creation date, quantity available <= 5)
    const lowStockItems = await Item.countDocuments({
      ...dateFilter,
      quantityAvailable: { $lte: 5 }
    });

    // Most requested items (based on procurement requests)
    const mostRequestedItems = await ProcRequest.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      { $group: { 
        _id: "$items.itemName", 
        totalQuantityRequested: { $sum: "$items.qtyRequired" },
        requestCount: { $sum: 1 }
      }},
      { $sort: { totalQuantityRequested: -1 } },
      { $limit: 5 }
    ]);

    // === SUPPLIERS/VENDORS STATISTICS ===
    
    // Total active suppliers (applying date filter based on when suppliers were created)
    const totalSuppliers = await Supplier.countDocuments({ 
      ...dateFilter,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] 
    });

    // Suppliers by business type (filtered by creation date)
    const suppliersByType = await Supplier.aggregate([
      { 
        $match: { 
          ...dateFilter,
          $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] 
        } 
      },
      { $group: { _id: "$typeofBusiness", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // === PROJECT STATISTICS ===
    
    // Total projects
    const totalProjects = await ProcProject.countDocuments({});
    const filteredProjects = await ProcProject.countDocuments({
      createdAt: { $gte: filterStart, $lte: filterEnd }
    });

    // Projects by bidding type
    const projectsByBiddingType = await ProcProject.aggregate([
      { $match: { createdAt: { $gte: filterStart, $lte: filterEnd } } },
      { $group: { _id: "$biddingType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // === PERFORMANCE METRICS ===
    
    // Average processing time (from created to approved, within date filter)
    const averageProcessingTime = await ProcRequest.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: "Approved",
          updatedAt: { $exists: true }
        } 
      },
      {
        $project: {
          processingDays: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgProcessingDays: { $avg: "$processingDays" }
        }
      }
    ]);

    // Peak month and current month info
    const peakMonth = monthlyRequestsDetails.reduce((max, current) => 
      current.count > max.count ? current : max, 
      { count: 0, monthYear: 'N/A' }
    );
    
    const currentMonth = monthlyRequestsDetails.length > 0 ? 
      monthlyRequestsDetails[monthlyRequestsDetails.length - 1] : 
      { count: 0, monthYear: 'N/A' };

    // Calculated metrics
    const totalRequestsInPeriod = monthlyRequests.reduce((sum, count) => sum + count, 0);
    const averageRequestsPerMonth = monthlyRequests.length > 0 ? 
      Math.round(totalRequestsInPeriod / monthlyRequests.length) : 0;

    // === RESPONSE ===
    res.status(200).json({
      // Request statistics
      totalRequests,
      filteredRequests,
      pendingRequests,
      approvedRequests,
      recentRequests,
      requestsByStatus,
      requestsByDepartment,
      monthlyRequests,
      monthlyRequestsDetails,
      peakMonth,
      currentMonth,
      totalRequestsInPeriod,
      averageRequestsPerMonth,
      
      // Items statistics
      totalItems,
      itemsByAssetClass,
      lowStockItems,
      mostRequestedItems,
      
      // Suppliers statistics
      totalSuppliers,
      suppliersByType,
      
      // Projects statistics
      totalProjects,
      filteredProjects,
      projectsByBiddingType,
      
      // Performance metrics
      averageProcessingTime: averageProcessingTime[0]?.avgProcessingDays || 0,
      
      // Filter info
      filterPeriod: {
        start: filterStart,
        end: filterEnd,
        year: year || new Date().getFullYear(),
        month: month || 'all'
      }
    });

  } catch (error) {
    console.error('Error fetching PO stats:', error);
    res.status(500).json({ error: 'Failed to fetch procurement officer statistics' });
  }
};
