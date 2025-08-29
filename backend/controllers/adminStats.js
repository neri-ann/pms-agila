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

  // Total users (filtered)
  const totalUsers = await User.countDocuments({
    createdAt: { $gte: filterStart, $lte: filterEnd },
    ...(monthList.length && { $expr: { $in: [{ $month: "$createdAt" }, monthList] } })
  });
  // Previous period total users
  const prevTotalUsers = await User.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
  const totalUsersChange = prevTotalUsers ? Math.round(((totalUsers - prevTotalUsers) / prevTotalUsers) * 100) : (totalUsers > 0 ? 100 : 0);
  // New users this month (filtered to filterStart/filterEnd's month)
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startMonth, $lte: endMonth } });
  // For dashboard: new users last week
  const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: lastWeek, $lte: nowDate } });

    // Vendors: Active = isDeleted: false, Inactive = isDeleted: true
      // Active vendors: not deleted, and effective date (createdAt) within filter window
      const activeVendors = await Vendor.countDocuments({
        $and: [
          { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
          { createdAt: { $gte: filterStart, $lte: filterEnd } },
          ...(monthList.length ? [{ $expr: { $in: [{ $month: "$createdAt" }, monthList] } }] : [])
        ]
      });

      // Inactive vendors: deleted, and effective deletion date within filter window
      // Use isDeletedAt if present, otherwise fallback to createdAt (as a last resort)
      const inactiveDateMatch = monthList.length
        ? { $expr: { $in: [{ $month: { $ifNull: ["$isDeletedAt", "$createdAt"] } }, monthList] } }
        : {};
      const inactiveVendors = await Vendor.countDocuments({
        $and: [
          { isDeleted: true },
          { $expr: { $gte: [ { $ifNull: ["$isDeletedAt", "$createdAt"] }, filterStart ] } },
          { $expr: { $lte: [ { $ifNull: ["$isDeletedAt", "$createdAt"] }, filterEnd ] } },
          inactiveDateMatch
        ]
      });
    // Previous period
    const prevActiveVendors = await Vendor.countDocuments({
      $and: [
        { $or: [ { isDeleted: false }, { isDeleted: { $exists: false } } ] },
        { createdAt: { $gte: prevStart, $lte: prevEnd } }
      ]
    });
    const activeVendorsChange = prevActiveVendors ? Math.round(((activeVendors - prevActiveVendors) / prevActiveVendors) * 100) : (activeVendors > 0 ? 100 : 0);
    // New vendors this month: created in this month
    const newVendorsThisMonth = await Vendor.countDocuments({ isDeleted: false, createdAt: { $gte: startMonth, $lte: endMonth } });
    const newVendorsLastWeek = await Vendor.countDocuments({ isDeleted: false, createdAt: { $gte: lastWeek, $lte: nowDate } });
  const vendorTotal = activeVendors + inactiveVendors;
    const vendorStatus = [
      { name: 'Active', value: activeVendors, color: '#3B82F6', percentage: vendorTotal ? Math.round((activeVendors / vendorTotal) * 100) : 0 },
      { name: 'Inactive', value: inactiveVendors, color: '#EF4444', percentage: vendorTotal ? Math.round((inactiveVendors / vendorTotal) * 100) : 0 },
    ];

  // Budget requests (filtered)
  const budgetRequests = await Budget.countDocuments({
    createdAt: { $gte: filterStart, $lte: filterEnd },
    ...(monthList.length && { $expr: { $in: [{ $month: "$createdAt" }, monthList] } })
  });
  // Requests in previous period (matching filter)
  const prevBudgetRequests = await Budget.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
  // Show the percent change for dashboard
  const budgetRequestsChange = prevBudgetRequests ? Math.round(((budgetRequests - prevBudgetRequests) / prevBudgetRequests) * 100) : (budgetRequests > 0 ? 100 : 0);
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
        totalUsersChange,
        newUsersThisMonth,
        newUsersLastWeek,
        activeVendors,
        activeVendorsChange,
        newVendorsThisMonth,
        newVendorsLastWeek,
        budgetRequests,
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