// Controller for admin dashboard statistics
const User = require('../Models/user');
const Vendor = require('../Models/supplyer');
const Budget = require('../Models/budget');
const ProcRequest = require('../Models/procReqest');
const { startOfMonth, endOfMonth } = require('date-fns');

// Helper to get month name
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

exports.getAdminStats = async (req, res) => {
  try {
    // Parse query params for filtering
    let { startDate, endDate, year, month } = req.query;
    let filterStart, filterEnd;
    let monthList = [];
    // Validate and parse month param
    if (month && month !== 'all') {
      monthList = month.split(',').filter(Boolean).map(m => parseInt(m)).filter(m => !isNaN(m) && m >= 1 && m <= 12);
    }
    // Validate year param
    if (year && year !== 'all' && isNaN(Number(year))) {
      year = 'all';
    }
    const now = new Date();
    // If year or month is set, override start/end date
    if (year && year !== 'all') {
      const y = parseInt(year);
      if (!isNaN(y)) {
        if (monthList.length > 0) {
          // Filter for specific months in year
          const minMonth = Math.min(...monthList) - 1;
          const maxMonth = Math.max(...monthList) - 1;
          filterStart = new Date(y, minMonth, 1);
          filterEnd = new Date(y, maxMonth + 1, 0, 23, 59, 59, 999); // last day of last selected month
        } else {
          // Filter for whole year
          filterStart = new Date(y, 0, 1);
          filterEnd = new Date(y, 11, 31, 23, 59, 59, 999);
        }
      }
    }
    function isValidDate(d) {
      return d instanceof Date && !isNaN(d.getTime());
    }
    // Try to use provided start/end date if year/month failed
    if (!isValidDate(filterStart) || !isValidDate(filterEnd)) {
      if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (isValidDate(s) && isValidDate(e)) {
          filterStart = s;
          filterEnd = e;
          filterEnd.setHours(23,59,59,999);
        } else {
          filterStart = new Date('1970-01-01');
          filterEnd = now;
        }
      } else {
        filterStart = new Date('1970-01-01');
        filterEnd = now;
      }
    }
    // Final fallback: if still invalid, use all time
    if (!isValidDate(filterStart) || !isValidDate(filterEnd)) {
      filterStart = new Date('1970-01-01');
      filterEnd = now;
    }


  // For dynamic previous period calculation: use the same duration as current filter range
  let prevStart, prevEnd;
  const rangeMs = filterEnd.getTime() - filterStart.getTime();
  prevEnd = new Date(filterStart.getTime() - 1);
  prevStart = new Date(prevEnd.getTime() - rangeMs);

    // For week-over-week stats, use now as reference
    const nowDate = now;
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    const prevWeek = new Date(now);
    prevWeek.setDate(now.getDate() - 14);

    // For month/year stats
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);

  // Helper for month filter
  function monthMatch(date) {
    if (!monthList.length) return true;
    const d = new Date(date);
    return monthList.includes(d.getMonth() + 1);
  }

  // Total users (all-time)
  const totalUsers = await User.countDocuments({});
  // Total users within current filter window (for reference and optional UI)
  const totalUsersFiltered = await User.countDocuments({
    createdAt: { $gte: filterStart, $lte: filterEnd },
    ...(monthList.length && { $expr: { $in: [{ $month: "$createdAt" }, monthList] } })
  });
  // Previous period total users (filtered window for percent change context)
  const prevTotalUsers = await User.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
  const totalUsersChange = prevTotalUsers ? Math.round(((totalUsersFiltered - prevTotalUsers) / prevTotalUsers) * 100) : (totalUsersFiltered > 0 ? 100 : 0);
  // New users this month (filtered to filterStart/filterEnd's month)
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startMonth, $lte: endMonth } });
  // For dashboard: new users last week
  const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: lastWeek, $lte: nowDate } });

    // Vendors: Active = isDeleted: false, Inactive = isDeleted: true
    
    // Active vendors (filtered): isDeleted = false, filter by createdAt within window
    const activeVendorsFiltered = await Vendor.countDocuments({
      $and: [
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
        { createdAt: { $gte: filterStart, $lte: filterEnd } },
        ...(monthList.length ? [{ $expr: { $in: [{ $month: "$createdAt" }, monthList] } }] : [])
      ]
    });

    // Active vendors (all-time): isDeleted = false
    const activeVendorsAllTime = await Vendor.countDocuments({
      $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ]
    });

    // Inactive vendors (filtered): isDeleted = true, filter by isDeletedAt within window
    const inactiveVendorsFiltered = await Vendor.countDocuments({
      $and: [
        { isDeleted: true },
        { isDeletedAt: { $ne: null } },
        { isDeletedAt: { $gte: filterStart, $lte: filterEnd } },
        ...(monthList.length ? [{ $expr: { $in: [{ $month: "$isDeletedAt" }, monthList] } }] : [])
      ]
    });

    // Inactive vendors (all-time): isDeleted = true
    const inactiveVendorsAllTime = await Vendor.countDocuments({
      isDeleted: true
    });

    // Total vendors = active + inactive (all documents)
    const vendorTotalAllTime = activeVendorsAllTime + inactiveVendorsAllTime;

    // Previous period active vendors (for change calculation)
    const prevActiveVendors = await Vendor.countDocuments({
      $and: [
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
        { createdAt: { $gte: prevStart, $lte: prevEnd } }
      ]
    });
    const activeVendorsChange = prevActiveVendors ? Math.round(((activeVendorsFiltered - prevActiveVendors) / prevActiveVendors) * 100) : (activeVendorsFiltered > 0 ? 100 : 0);
    
    // New vendors this month: created in this month and active
    const newVendorsThisMonth = await Vendor.countDocuments({ 
      $and: [
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
        { createdAt: { $gte: startMonth, $lte: endMonth } }
      ]
    });
    const newVendorsLastWeek = await Vendor.countDocuments({ 
      $and: [
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
        { createdAt: { $gte: lastWeek, $lte: nowDate } }
      ]
    });

    // For charts, use filtered totals
    const vendorTotal = activeVendorsFiltered + inactiveVendorsFiltered;
    const vendorStatus = [
  { name: 'Active', value: activeVendorsFiltered, color: '#3B82F6', percentage: vendorTotal ? Math.round((activeVendorsFiltered / vendorTotal) * 100) : 0 },
  { name: 'Inactive', value: inactiveVendorsFiltered, color: '#EF4444', percentage: vendorTotal ? Math.round((inactiveVendorsFiltered / vendorTotal) * 100) : 0 },
    ];

  // Budget requests (filtered)
  const budgetRequestsFiltered = await Budget.countDocuments({
    createdAt: { $gte: filterStart, $lte: filterEnd },
    ...(monthList.length && { $expr: { $in: [{ $month: "$createdAt" }, monthList] } })
  });
  // Requests in previous period (matching filter)
  const prevBudgetRequests = await Budget.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
  // Show the percent change for dashboard
  const budgetRequestsChange = prevBudgetRequests ? Math.round(((budgetRequestsFiltered - prevBudgetRequests) / prevBudgetRequests) * 100) : (budgetRequestsFiltered > 0 ? 100 : 0);
  // Budget requests (all-time): big number
  const budgetRequests = await Budget.countDocuments({});
  // For reference, keep requestsSinceLastWeek as before
  const requestsSinceLastWeek = await Budget.countDocuments({ createdAt: { $gte: lastWeek, $lt: nowDate } });

    // Budget data by month (filtered)
    const budgetData = [];
    let months = [];
    let start = new Date(filterStart);
    let end = new Date(filterEnd);
    // Build months array between start and end
    let temp = new Date(start.getFullYear(), start.getMonth(), 1);
    while (temp <= end) {
      months.push(new Date(temp));
      temp.setMonth(temp.getMonth() + 1);
    }
    const toNumber = (val) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        // Remove anything that isn't digit, dot, or minus
        const cleaned = val.replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };
    for (let i = 0; i < months.length; i++) {
      const d = months[i];
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      // Only include if month is in monthList or no month filter
      if (!monthList.length || monthList.includes(d.getMonth() + 1)) {
        const monthBudgets = await Budget.find({ createdAt: { $gte: monthStart, $lte: monthEnd } });
        const allocation = monthBudgets.reduce((sum, b) => sum + toNumber(b.budgetAllocation), 0);
        const used = monthBudgets.reduce((sum, b) => sum + toNumber(b.usedAmount), 0);
        const available = monthBudgets.reduce((sum, b) => sum + toNumber(b.availableBalance), 0);
        // Only include months that have at least one non-zero value
        if (allocation !== 0 || used !== 0 || available !== 0) {
          budgetData.push({ month: monthNames[d.getMonth()] + ' ' + d.getFullYear(), allocation, used, available });
        }
      }
    }

    // Monthly purchase requests (filtered to filterStart/filterEnd)
    const monthlyRequests = [];
    for (let i = 0; i < months.length; i++) {
      const d = months[i];
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      if (!monthList.length || monthList.includes(d.getMonth() + 1)) {
        const count = await ProcRequest.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
        monthlyRequests.push(count);
      }
    }

      res.json({
        totalUsers,
        totalUsersFiltered,
        totalUsersChange,
        newUsersThisMonth,
        newUsersLastWeek,
        activeVendors: activeVendorsAllTime,
        activeVendorsFiltered,
        inactiveVendorsFiltered,
        vendorTotalAllTime,
        activeVendorsChange,
        newVendorsThisMonth,
        newVendorsLastWeek,
        budgetRequests,
        budgetRequestsFiltered,
        budgetRequestsChange,
        requestsSinceLastWeek,
        budgetData,
        vendorStatus,
        monthlyRequests,
        vendorTotal
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};