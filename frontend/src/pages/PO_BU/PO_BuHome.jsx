import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  FiFileText, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiShoppingBag, 
  FiCalendar, 
  FiFilter, 
  FiClipboard, 
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiBarChart3,
  FiPieChart
} from 'react-icons/fi';
import axios from 'axios';

import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";

export default function PO_BuHome() {
    const { id } = useParams();

    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for date filters
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [dateRange, setDateRange] = useState({
      startDate: '',
      endDate: ''
    });

    // Available years and months for filters
    const availableYears = ['2025', '2024', '2023', '2022', '2021'];
    const availableMonths = [
      { value: 'all', label: 'All Months' },
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const params = {
          year: selectedYear,
          month: selectedMonth,
          ...(dateRange.startDate && dateRange.endDate && {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
        };

        const response = await axios.get('http://localhost:8000/api/po/stats', { params });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Load data on component mount and when filters change
    useEffect(() => {
      fetchDashboardData();
    }, [selectedYear, selectedMonth, dateRange]);

    // Handle filter changes
    const handleYearChange = (e) => {
      setSelectedYear(e.target.value);
    };

    const handleMonthChange = (e) => {
      setSelectedMonth(e.target.value);
    };

    const handleDateRangeChange = (field, value) => {
      setDateRange(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const resetFilters = () => {
      setSelectedYear(new Date().getFullYear().toString());
      setSelectedMonth('all');
      setDateRange({ startDate: '', endDate: '' });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Loading dashboard...</span>
          </div>
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

    // Destructure dashboard data with fallbacks
    const {
      totalRequests = 0,
      filteredRequests = 0,
      pendingRequests = 0,
      approvedRequests = 0,
      recentRequests = 0,
      requestsByStatus = [],
      requestsByDepartment = [],
      monthlyRequests = [],
      monthlyRequestsDetails = [],
      peakMonth = { count: 0, monthYear: 'N/A' },
      currentMonth = { count: 0, monthYear: 'N/A' },
      totalRequestsInPeriod = 0,
      averageRequestsPerMonth = 0,
      totalItems = 0,
      itemsByAssetClass = [],
      lowStockItems = 0,
      mostRequestedItems = [],
      totalSuppliers = 0,
      suppliersByType = [],
      totalProjects = 0,
      filteredProjects = 0,
      projectsByBiddingType = [],
      averageProcessingTime = 0
    } = dashboardData || {};

    const maxRequests = monthlyRequests.length > 0 ? Math.max(...monthlyRequests) : 1;

    return (
      <div id="Home">
        <UserTypeNavbar userType="procurement Officer" />
        <div className="bg-NeutralSilver min-h-screen">
          <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto">
            {/* Dashboard Header */}
            <div className="pt-8 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-NeutralDGrey mb-2">
                Procurement Dashboard
              </h1>
              <p className="text-NeutralGrey text-lg">
                Welcome back! Here's an overview of your procurement activities.
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
              {/* Pending Requests Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500 p-3 rounded-full">
                    <FiClock className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <FiAlertCircle className="text-lg" />
                    <span className="text-sm font-semibold">Priority</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Pending Requests</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">{pendingRequests}</span>
                <div className="text-sm text-gray-600 mb-4">
                  {recentRequests} new in last 30 days
                </div>
                <Link 
                  to="/ApprovedRequestList" 
                  className="inline-flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Review Requests
                </Link>
              </div>

              {/* Approved Requests Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <FiCheckCircle className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <FiTrendingUp className="text-lg" />
                    <span className="text-sm font-semibold">
                      {totalRequestsInPeriod > 0 ? `${Math.round((approvedRequests/totalRequestsInPeriod)*100)}%` : '0%'}
                    </span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Approved Requests</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">{approvedRequests}</span>
                <div className="text-sm text-gray-600 mb-4">
                  Avg processing: {Math.round(averageProcessingTime)} days
                </div>
                <Link 
                  to="/ApprovedRequestList" 
                  className="inline-flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Approved
                </Link>
              </div>

              {/* Total Items Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FiPackage className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-red-600">
                    {lowStockItems > 0 && (
                      <>
                        <FiAlertCircle className="text-lg" />
                        <span className="text-sm font-semibold">{lowStockItems} Low Stock</span>
                      </>
                    )}
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Items</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">{totalItems}</span>
                <div className="text-sm text-gray-600 mb-4">
                  {itemsByAssetClass.length} asset classes
                </div>
                <Link 
                  to="/PO_Items" 
                  className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Manage Items
                </Link>
              </div>

              {/* Active Suppliers Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 p-3 rounded-full">
                    <FiUsers className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-purple-600">
                    <FiTrendingUp className="text-lg" />
                    <span className="text-sm font-semibold">Active</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Active Suppliers</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">{totalSuppliers}</span>
                <div className="text-sm text-gray-600 mb-4">
                  {suppliersByType.length} business types
                </div>
                <Link 
                  to="/PO_VendorsList" 
                  className="inline-flex items-center justify-center w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Manage Suppliers
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
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {availableMonths.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
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
                    {selectedYear} {selectedMonth !== 'all' ? `- ${availableMonths.find(m => m.value === selectedMonth)?.label}` : ''}
                    {dateRange.startDate && dateRange.endDate ? ` (${dateRange.startDate} to ${dateRange.endDate})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Data-Driven Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8">
              {/* Request Status Distribution */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Request Status Distribution</h3>
                <div className="flex flex-col items-center">
                  {/* Simple Pie Chart */}
                  <div className="relative w-48 h-48 mb-6">
                    {requestsByStatus.length > 0 && (
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                        <circle
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        {requestsByStatus.map((status, index) => {
                          const total = requestsByStatus.reduce((sum, s) => sum + s.count, 0);
                          const percentage = (status.count / total) * 100;
                          const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#F97316'];
                          const prevPercentages = requestsByStatus
                            .slice(0, index)
                            .reduce((sum, s) => sum + (s.count / total) * 100, 0);
                          
                          return (
                            <circle
                              key={index}
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={colors[index] || '#6B7280'}
                              strokeWidth="3"
                              strokeDasharray={`${percentage} ${100 - percentage}`}
                              strokeDashoffset={-prevPercentages}
                            />
                          );
                        })}
                      </svg>
                    )}
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-NeutralDGrey">{totalRequestsInPeriod}</span>
                      <span className="text-sm text-gray-600">Requests</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {requestsByStatus.map((status, index) => {
                      const colors = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#F97316'];
                      const total = requestsByStatus.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? Math.round((status.count / total) * 100) : 0;
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: colors[index] || '#6B7280' }}
                            ></div>
                            <span className="font-medium text-gray-700">{status._id}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{status.count}</div>
                            <div className="text-sm text-gray-600">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Departments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Top Requesting Departments</h3>
                <div className="space-y-4">
                  {requestsByDepartment.slice(0, 5).map((dept, index) => {
                    const maxDeptRequests = Math.max(...requestsByDepartment.map(d => d.count));
                    const percentage = maxDeptRequests > 0 ? (dept.count / maxDeptRequests) * 100 : 0;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
                    
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium text-gray-600">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700 truncate">
                              {dept._id === null || dept._id === 'NONE' || dept._id === '' 
                                ? 'Not Specified' 
                                : dept._id
                              }
                            </span>
                            <span className="font-semibold text-gray-900">{dept.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${colors[index] || 'bg-gray-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {requestsByDepartment.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No department data available
                    </div>
                  )}
                </div>
              </div>

              {/* Most Requested Items */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Most Requested Items</h3>
                <div className="space-y-4">
                  {mostRequestedItems.slice(0, 5).map((item, index) => {
                    const maxItemRequests = Math.max(...mostRequestedItems.map(i => i.totalQuantityRequested));
                    const percentage = maxItemRequests > 0 ? (item.totalQuantityRequested / maxItemRequests) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium text-gray-600">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700 truncate">
                              {item._id}
                            </span>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{item.totalQuantityRequested}</div>
                              <div className="text-xs text-gray-500">{item.requestCount} requests</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {mostRequestedItems.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No item data available
                    </div>
                  )}
                </div>
              </div>

              {/* Supplier Types Distribution */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Supplier Business Types</h3>
                <div className="space-y-4">
                  {suppliersByType.slice(0, 5).map((type, index) => {
                    const maxSuppliers = Math.max(...suppliersByType.map(t => t.count));
                    const percentage = maxSuppliers > 0 ? (type.count / maxSuppliers) * 100 : 0;
                    const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];
                    
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium text-gray-600">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700 truncate">
                              {type._id || 'Other'}
                            </span>
                            <span className="font-semibold text-gray-900">{type.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${colors[index] || 'bg-gray-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {suppliersByType.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No supplier type data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Purchase Requests Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Monthly Purchase Requests Trend</h3>
              <div className="flex items-end justify-between h-40 space-x-2">
                {monthlyRequests.map((requests, index) => {
                  const height = maxRequests > 0 ? (requests / maxRequests) * 100 : 0;
                  const monthDetail = monthlyRequestsDetails[index];
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '120px' }}>
                        <div 
                          className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t w-full absolute bottom-0 flex items-end justify-center"
                          style={{ height: `${height}%` }}
                          title={monthDetail ? `${monthDetail.monthYear}: ${requests} requests` : `${requests} requests`}
                        >
                          <span className="text-white text-xs font-semibold mb-1">{requests}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">
                        {monthDetail ? monthDetail.month : 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                {peakMonth && currentMonth && (
                  <>
                    Peak: {peakMonth.count} requests in {peakMonth.monthYear} | 
                    Current: {currentMonth.count} requests in {currentMonth.monthYear}
                    {averageRequestsPerMonth > 0 && (
                      <span className="block mt-1">
                        Average: {averageRequestsPerMonth} requests/month | 
                        Total: {totalRequestsInPeriod} requests in selected period
                      </span>
                    )}
                  </>
                )}
                {(!peakMonth || peakMonth.count === 0) && (
                  <span>No data available for the selected period</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
