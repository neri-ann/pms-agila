import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiUsers, FiFileText, FiDollarSign, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiCalendar, FiFilter } from 'react-icons/fi';

// Import your actual components
import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";

function AdminHome() {
  const { id } = useParams();

  // State for date filters
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Sample data for visual charts
  const budgetData = [
    { month: 'Jan', budget: 45000, spent: 38000 },
    { month: 'Feb', budget: 52000, spent: 47000 },
    { month: 'Mar', budget: 48000, spent: 41000 },
    { month: 'Apr', budget: 55000, spent: 52000 },
    { month: 'May', budget: 62000, spent: 58000 },
    { month: 'Jun', budget: 58000, spent: 51000 },
  ];

  const vendorData = [
    { name: 'Active', value: 34, color: '#3B82F6', percentage: 63 },
    { name: 'Pending', value: 12, color: '#F59E0B', percentage: 22 },
    { name: 'Inactive', value: 8, color: '#EF4444', percentage: 15 },
  ];

  const requestData = [18, 22, 15, 28, 32, 25];
  const maxRequests = Math.max(...requestData);

  // Available years and months for filters
  const availableYears = ['2024', '2023', '2022', '2021'];
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

  // Handle filter changes
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    // Here you would typically filter your data based on the selected year
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    // Here you would typically filter your data based on the selected month
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
    // Here you would typically filter your data based on the date range
  };

  const resetFilters = () => {
    setSelectedYear('2024');
    setSelectedMonth('all');
    setDateRange({ startDate: '', endDate: '' });
  };

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
                <div className="flex items-center space-x-1 text-green-600">
                  <FiTrendingUp className="text-lg" />
                  <span className="text-sm font-semibold">+12%</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Users</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">128</span>
              <div className="text-sm text-gray-600 mb-4">
                +15 new users this month
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
                <div className="flex items-center space-x-1 text-green-600">
                  <FiTrendingUp className="text-lg" />
                  <span className="text-sm font-semibold">+8%</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Active Vendors</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">34</span>
              <div className="text-sm text-gray-600 mb-4">
                +3 new vendors approved
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
                <div className="flex items-center space-x-1 text-red-600">
                  <FiTrendingDown className="text-lg" />
                  <span className="text-sm font-semibold">-5%</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Budget Requests</h2>
              <span className="text-3xl font-bold text-gray-900 mb-3 block">12</span>
              <div className="text-sm text-gray-600 mb-4">
                -2 requests since last week
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

          {/* Visual Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8">
            {/* Budget vs Spending Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Budget vs Spending</h3>
              <div className="space-y-4">
                {budgetData.map((item, index) => {
                  const budgetPercent = (item.budget / 62000) * 100;
                  const spentPercent = (item.spent / 62000) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{item.month}</span>
                        <span>Budget: ${(item.budget / 1000).toFixed(0)}K | Spent: ${(item.spent / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full flex items-center justify-center text-xs text-white"
                            style={{ width: `${budgetPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-green-500 h-4 rounded-full"
                            style={{ width: `${spentPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                  <span className="flex items-center"><span className="w-4 h-4 bg-blue-500 rounded mr-2"></span>Budget</span>
                  <span className="flex items-center"><span className="w-4 h-4 bg-green-500 rounded mr-2"></span>Spent</span>
                </div>
              </div>
            </div>

            {/* Vendor Status Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Vendor Status Distribution</h3>
              <div className="flex flex-col items-center">
                {/* Pie Chart */}
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
                    {/* Active - 63% */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="63 37"
                      strokeDashoffset="0"
                    />
                    {/* Pending - 22% */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeDasharray="22 78"
                      strokeDashoffset="-63"
                    />
                    {/* Inactive - 15% */}
                    <circle
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="3"
                      strokeDasharray="15 85"
                      strokeDashoffset="-85"
                    />
                  </svg>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-NeutralDGrey">54</span>
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
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
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
                      <span className="text-xs text-gray-600 mt-2">{months[index]}</span>
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