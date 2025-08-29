import React, { useState, useEffect, useMemo } from "react";
// No react-select, using custom dropdown for months
import { Link, useParams } from "react-router-dom";
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiCalendar, FiFilter } from 'react-icons/fi';

// Import your actual components
import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";

function AdminHome() {
  const { id } = useParams();

  // Helper function to get current date in Asia/Manila timezone
  const getManilaDate = () => {
    const now = new Date();
    // Get Manila time offset (UTC+8)
    const manilaOffset = 8 * 60; // 8 hours in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const manilaTime = new Date(utc + (manilaOffset * 60000));
    return manilaTime;
  };

  // Helper function to format date in Manila timezone as YYYY-MM-DD
  const formatManilaDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date filter state - dynamic today that updates with Asia/Manila timezone
  const today = useMemo(() => getManilaDate(), []);
  const defaultStart = useMemo(() => {
    const manilaDate = getManilaDate();
    return new Date(manilaDate.getFullYear(), 0, 1);
  }, []);
  const defaultEnd = useMemo(() => getManilaDate(), []);
  const [dateRange, setDateRange] = useState({
    startDate: formatManilaDate(defaultStart),
    endDate: formatManilaDate(defaultEnd)
  });
  const [selectedYear, setSelectedYear] = useState('all');
  // Multi-select months (custom dropdown)
  const [selectedMonths, setSelectedMonths] = useState(['all']);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [pendingMonths, setPendingMonths] = useState(['all']);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamically generate available years and months based on dateRange
  const getYearRange = (start, end) => {
    const years = [];
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    for (let y = startYear; y <= endYear; y++) years.push(y);
    return years;
  };
  const availableYears = useMemo(() => {
    const s = new Date(dateRange.startDate);
    const e = new Date(dateRange.endDate);
    return ['all', ...getYearRange(s, e)];
  }, [dateRange]);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const formatAmount = (val) => {
    const n = Number(val) || 0;
    const abs = Math.abs(n);
    if (abs < 1000) return `$${n.toLocaleString()}`;
    if (abs < 1_000_000) {
      // Use one decimal for small K to avoid rounding to 0K/1K too aggressively
      const dec = abs < 10_000 ? 1 : 0;
      return `$${(n / 1000).toFixed(dec)}K`;
    }
    return `$${(n / 1_000_000).toFixed(1)}M`;
  };
  // Only show months in selected date range
  const availableMonths = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    let months = [];
    let temp = new Date(start.getFullYear(), start.getMonth(), 1);
    while (temp <= end) {
      months.push({
        value: String(temp.getMonth() + 1).padStart(2, '0'),
        label: monthNames[temp.getMonth()]
      });
      temp.setMonth(temp.getMonth() + 1);
    }
    return months.filter((v, i, arr) => arr.findIndex(m => m.value === v.value) === i);
  }, [dateRange]);

  // Fetch dashboard data from backend with filters
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    // Only send year if not 'all' and is a valid number
    if (selectedYear && selectedYear !== 'all' && !isNaN(Number(selectedYear))) {
      params.append('year', String(Number(selectedYear)));
    }
    // Normalize months to raw string values, avoid objects and NaN
    const rawMonths = Array.isArray(selectedMonths) ? selectedMonths : [];
    const monthVals = rawMonths
      .map(m => (m && typeof m === 'object' ? m.value : m))
      .filter(Boolean);
    if (!(monthVals.length === 1 && monthVals[0] === 'all')) {
      const monthNums = monthVals.map(v => String(Number(v))).filter(v => v !== 'NaN');
      if (monthNums.length > 0) params.append('month', monthNums.join(','));
    }
    fetch(`/api/admin/stats?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [dateRange, selectedYear, selectedMonths]);

  // Handle filter changes
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    // Reset months to simple string values to avoid NaN/objects in query
    setSelectedMonths(['all']);
    setPendingMonths(['all']);
  };

  // Custom month dropdown logic
  // Use pendingMonths for UI, only setSelectedMonths on confirm
  const handleMonthCheckbox = (value) => {
    if (value === 'all') {
      if (pendingMonths.includes('all')) {
        // Uncheck 'All Months' (no selection, so fallback to all months unchecked)
        setPendingMonths([]);
      } else {
        // Check 'All Months'
        setPendingMonths(['all']);
      }
    } else {
      let newSelected = pendingMonths.filter(m => m !== 'all');
      if (newSelected.includes(value)) {
        newSelected = newSelected.filter(m => m !== value);
      } else {
        newSelected.push(value);
      }
      // If nothing is selected, fallback to 'all'
      if (newSelected.length === 0) {
        setPendingMonths(['all']);
      } else {
        setPendingMonths(newSelected);
      }
    }
  };

  const handleMonthConfirm = () => {
    setSelectedMonths(pendingMonths);
    setShowMonthDropdown(false);
  };

  const handleDateRangeChange = (field, value) => {
    let newRange = { ...dateRange, [field]: value };
    // Enforce start < end
    if (field === 'startDate' && value > dateRange.endDate) {
      newRange.endDate = value;
    }
    if (field === 'endDate' && value < dateRange.startDate) {
      newRange.startDate = value;
    }
    setDateRange(newRange);
    setSelectedYear('all');
    setSelectedMonths(['all']);
  };

  const resetFilters = () => {
    // Get current date in Asia/Manila timezone
    const currentDate = getManilaDate();
    const currentStartDate = new Date(currentDate.getFullYear(), 0, 1);
    setDateRange({
      startDate: formatManilaDate(currentStartDate),
      endDate: formatManilaDate(currentDate)
    });
    setSelectedYear('all');
    setSelectedMonths(['all']);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-red-600">{error}</span>
      </div>
    );
  }

  // Destructure dashboard data
  const { totalUsers, totalUsersFiltered, totalUsersChange, newUsersThisMonth, newUsersLastWeek, activeVendors, activeVendorsFiltered, inactiveVendorsFiltered, vendorTotalAllTime, activeVendorsChange, newVendorsThisMonth, newVendorsLastWeek, budgetRequests, budgetRequestsFiltered, budgetRequestsChange, requestsSinceLastWeek, budgetData, vendorStatus, monthlyRequests, vendorTotal } = dashboardData || {};
  const vendorData = vendorStatus || [];
  const requestData = monthlyRequests || [];
  const maxRequests = requestData.length > 0 ? Math.max(...requestData) : 1;
  // For Monthly Requests Chart
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div id="Home">
      <UserTypeNavbar userType="admin" />
      <div className="bg-NeutralSilver min-h-screen">
        <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto">
          {/* Dashboard Header */}
          <div className="pt-8 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-NeutralDGrey mb-2">
              Admin Dashboard
            </h1>
            <p className="text-NeutralGrey text-lg">
              Welcome back! Here's what's happening with your procurement system.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            {/* Total Users Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-3 rounded-full">
                  <FiUsers className="text-white text-2xl" />
                </div>
                <div className="flex items-center space-x-1">
                  {totalUsersChange > 0 ? (
                    <span className="text-sm font-semibold text-green-600 flex items-center"><FiTrendingUp className="mr-1" />+{totalUsersChange}%</span>
                  ) : totalUsersChange < 0 ? (
                    <span className="text-sm font-semibold text-red-600 flex items-center"><FiTrendingDown className="mr-1" />{totalUsersChange}%</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 flex items-center">0%</span>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Users</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">{totalUsersFiltered || 0}</span>
              <div className="text-sm text-gray-600 mb-4">
                +{newUsersLastWeek} new users this week
              </div>
              <Link 
                to="/userList" 
                className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Manage Users
              </Link>
            </div>

            {/* Active Vendors Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <FiShoppingBag className="text-white text-2xl" />
                </div>
                <div className="flex items-center space-x-1">
                  {activeVendorsChange > 0 ? (
                    <span className="text-sm font-semibold text-green-600 flex items-center"><FiTrendingUp className="mr-1" />+{activeVendorsChange}%</span>
                  ) : activeVendorsChange < 0 ? (
                    <span className="text-sm font-semibold text-red-600 flex items-center"><FiTrendingDown className="mr-1" />{activeVendorsChange}%</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 flex items-center">0%</span>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Active Vendors</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">{activeVendorsFiltered || 0}</span>
              <div className="text-sm text-gray-600 mb-4">
                +{newVendorsLastWeek} new vendors approved
              </div>
              <Link 
                to="/allvendors" 
                className="inline-flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Manage Vendors
              </Link>
            </div>

            {/* Budget Requests Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500 p-3 rounded-full">
                  <FiDollarSign className="text-white text-2xl" />
                </div>
                <div className="flex items-center space-x-1">
                  {budgetRequestsChange > 0 ? (
                    <span className="text-sm font-semibold text-green-600 flex items-center"><FiTrendingUp className="mr-1" />+{budgetRequestsChange}%</span>
                  ) : budgetRequestsChange < 0 ? (
                    <span className="text-sm font-semibold text-red-600 flex items-center"><FiTrendingDown className="mr-1" />{budgetRequestsChange}%</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 flex items-center">0%</span>
                  )}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Budget Requests</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">{typeof budgetRequestsFiltered === 'number' ? budgetRequestsFiltered : budgetRequests}</span>
              <div className="text-sm text-gray-600 mb-4">
                {requestsSinceLastWeek} requests since last week
              </div>
              <Link 
                to="/ManageBudget" 
                className="inline-flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                View Budgets
              </Link>
            </div>
          </div>

          {/* Date Filters Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <FiFilter className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-NeutralDGrey">Data Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FiCalendar className="inline mr-2" />
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Years</option>
                  {availableYears.filter(y => y !== 'all').map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onClick={() => {
                      setPendingMonths(selectedMonths);
                      setShowMonthDropdown(v => !v);
                    }}
                  >
                    {selectedMonths.length === 1 && selectedMonths[0] === 'all'
                      ? 'All Months'
                      : availableMonths.filter(m => selectedMonths.includes(m.value)).map(m => m.label).join(', ') || 'Select Month(s)'}
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                        <input
                          type="checkbox"
                          id="all-months"
                          checked={pendingMonths.includes('all')}
                          onChange={() => handleMonthCheckbox('all')}
                        />
                        <label htmlFor="all-months" className="ml-2">All Months</label>
                      </div>
                      {availableMonths.map(m => (
                        <div key={m.value} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                          <input
                            type="checkbox"
                            id={`month-${m.value}`}
                            checked={pendingMonths.includes(m.value)}
                            onChange={() => handleMonthCheckbox(m.value)}
                          />
                          <label htmlFor={`month-${m.value}`} className="ml-2">{m.label}</label>
                        </div>
                      ))}
                      <div className="px-3 py-2 flex justify-end border-t">
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                          onClick={handleMonthConfirm}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  max={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  min={dateRange.startDate}
                  max={formatManilaDate(getManilaDate())}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Reset Filters</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing data for:</span>
                <span className="font-medium text-blue-600">
                  {selectedYear} {selectedMonths.length === 1 && selectedMonths[0] === 'all' ? '' : `- ${availableMonths.filter(m => selectedMonths.includes(m.value)).map(m => m.label).join(', ')}`}
                  {dateRange.startDate && dateRange.endDate ? ` (${dateRange.startDate} to ${dateRange.endDate})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8">
            {/* Budget vs Spending Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Budget vs Spending</h3>
              <div className="space-y-4">
                {budgetData.map((item, index) => {
                  const allocation = item.allocation || 0;
                  const used = item.used || 0;
                  const available = item.available || 0;
                  const total = Math.max(1, allocation + used + available);
                  const allocationPercent = (allocation / total) * 100;
                  const usedPercent = (used / total) * 100;
                  const availablePercent = (available / total) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{item.month}</span>
                        <span>
                          Allocation: {formatAmount(allocation)} | Used: {formatAmount(used)} | Available: {formatAmount(available)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                        <div
                          className="bg-indigo-500 h-4"
                          style={{ width: `${allocationPercent}%` }}
                          title={`Allocation: ${allocation.toLocaleString()}`}
                        />
                        <div
                          className="bg-emerald-500 h-4"
                          style={{ width: `${usedPercent}%` }}
                          title={`Used: ${used.toLocaleString()}`}
                        />
                        <div
                          className="bg-sky-500 h-4"
                          style={{ width: `${availablePercent}%` }}
                          title={`Available: ${available.toLocaleString()}`}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-center flex-wrap gap-6 mt-4 text-sm">
                  <span className="flex items-center"><span className="w-4 h-4 bg-indigo-500 rounded mr-2"></span>Allocation</span>
                  <span className="flex items-center"><span className="w-4 h-4 bg-emerald-500 rounded mr-2"></span>Used</span>
                  <span className="flex items-center"><span className="w-4 h-4 bg-sky-500 rounded mr-2"></span>Available</span>
                </div>
              </div>
            </div>

            {/* Vendor Status Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Vendor Status Distribution</h3>
              <div className="flex flex-col items-center">
                {/* Pie Chart (Active/Inactive only) */}
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    {/* Active */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray={`${vendorData[0]?.percentage || 0} ${100 - (vendorData[0]?.percentage || 0)}`}
                      strokeDashoffset="0"
                    />
                    {/* Inactive */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="3"
                      strokeDasharray={`${vendorData[1]?.percentage || 0} ${100 - (vendorData[1]?.percentage || 0)}`}
                      strokeDashoffset={`-${vendorData[0]?.percentage || 0}`}
                    />
                  </svg>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-NeutralDGrey">{vendorTotal}</span>
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-1 gap-3 w-full">
                  {vendorData.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: vendor.color }}
                        ></div>
                        <span className="font-medium text-gray-700">{vendor.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{vendor.value}</div>
                        <div className="text-sm text-gray-600">{vendor.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Requests Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Monthly Purchase Requests</h3>
              <div className="flex items-end justify-between h-40 space-x-2">
                {requestData.map((requests, index) => {
                  const height = (requests / maxRequests) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '120px' }}>
                        <div 
                          className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t w-full absolute bottom-0 flex items-end justify-center"
                          style={{ height: `${height}%` }}
                        >
                          <span className="text-white text-xs font-semibold mb-1">{requests}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{monthsShort[index]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Peak: 32 requests in May | Current: 25 requests in June
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;