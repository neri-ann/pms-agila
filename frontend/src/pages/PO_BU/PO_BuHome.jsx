import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiFileText, FiUsers, FiDollarSign, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiCalendar, FiFilter, FiClipboard, FiPackage } from 'react-icons/fi';

import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";

export default function PO_BuHome() {
    const { id } = useParams();

    // State for date filters
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [dateRange, setDateRange] = useState({
      startDate: '',
      endDate: ''
    });

    // Sample data for procurement-specific charts
    const projectData = [
      { month: 'Jan', projects: 8, completed: 6 },
      { month: 'Feb', projects: 12, completed: 10 },
      { month: 'Mar', projects: 10, completed: 8 },
      { month: 'Apr', projects: 15, completed: 13 },
      { month: 'May', projects: 18, completed: 16 },
      { month: 'Jun', projects: 14, completed: 11 },
    ];

    const bidData = [
      { name: 'Submitted', value: 28, color: '#3B82F6', percentage: 54 },
      { name: 'Pending Review', value: 15, color: '#F59E0B', percentage: 29 },
      { name: 'Under Evaluation', value: 9, color: '#EF4444', percentage: 17 },
    ];

    const requisitionData = [12, 18, 22, 16, 25, 20];
    const maxRequisitions = Math.max(...requisitionData);

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
      setSelectedYear('2024');
      setSelectedMonth('all');
      setDateRange({ startDate: '', endDate: '' });
    };

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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
              {/* Active Projects Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FiClipboard className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <FiTrendingUp className="text-lg" />
                    <span className="text-sm font-semibold">+15%</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Active Projects</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">24</span>
                <div className="text-sm text-gray-600 mb-4">
                  +4 new projects this month
                </div>
                <Link 
                  to="/projectList" 
                  className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Projects
                </Link>
              </div>

              {/* Approved Vendors Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <FiUsers className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <FiTrendingUp className="text-lg" />
                    <span className="text-sm font-semibold">+12%</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Approved Vendors</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">52</span>
                <div className="text-sm text-gray-600 mb-4">
                  +6 vendors approved this month
                </div>
                <Link 
                  to="/VendorsList" 
                  className="inline-flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Manage Vendors
                </Link>
              </div>

              {/* Pending Requisitions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500 p-3 rounded-full">
                    <FiFileText className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center space-x-1 text-red-600">
                    <FiTrendingDown className="text-lg" />
                    <span className="text-sm font-semibold">-8%</span>
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Pending Requisitions</h2>
                <span className="text-3xl font-bold text-gray-900 mb-3 block">18</span>
                <div className="text-sm text-gray-600 mb-4">
                  -3 requisitions since last week
                </div>
                <Link 
                  to="/ApprovedRequestList" 
                  className="inline-flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  View Requisitions
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
              {/* Projects vs Completion Chart - Combined Bar and Line Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Projects vs Completion</h3>
                <div className="relative">
                  {/* Chart Container */}
                  <div className="h-64 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                      <span>20</span>
                      <span>15</span>
                      <span>10</span>
                      <span>5</span>
                      <span>0</span>
                    </div>
                    
                    {/* Chart area */}
                    <div className="ml-8 h-full relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div 
                            key={i} 
                            className="absolute w-full border-t border-gray-100"
                            style={{ top: `${i * 25}%` }}
                          />
                        ))}
                      </div>
                      
                      {/* Bars and Line */}
                      <div className="flex items-end justify-between h-full relative">
                        {projectData.map((item, index) => {
                          const maxValue = 20;
                          const projectHeight = (item.projects / maxValue) * 100;
                          const completedHeight = (item.completed / maxValue) * 100;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center relative" style={{ maxWidth: '60px' }}>
                              {/* Bars */}
                              <div className="w-full flex justify-center space-x-1 relative" style={{ height: '200px' }}>
                                {/* Total Projects Bar */}
                                <div className="relative w-4">
                                  <div 
                                    className="bg-blue-500 w-full absolute bottom-0 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ height: `${projectHeight}%` }}
                                    title={`${item.projects} projects`}
                                  />
                                </div>
                                {/* Completed Projects Bar */}
                                <div className="relative w-4">
                                  <div 
                                    className="bg-green-500 w-full absolute bottom-0 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ height: `${completedHeight}%` }}
                                    title={`${item.completed} completed`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Completion Rate Line */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          <polyline
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={projectData.map((item, index) => {
                              const x = (index / (projectData.length - 1)) * 100;
                              const completionRate = (item.completed / item.projects) * 100;
                              const y = 100 - completionRate;
                              return `${x}%,${y}%`;
                            }).join(' ')}
                          />
                          {/* Line dots */}
                          {projectData.map((item, index) => {
                            const x = (index / (projectData.length - 1)) * 100;
                            const completionRate = (item.completed / item.projects) * 100;
                            const y = 100 - completionRate;
                            return (
                              <circle
                                key={index}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="4"
                                fill="#F59E0B"
                                stroke="white"
                                strokeWidth="2"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-2 ml-8 text-sm text-gray-600">
                    {projectData.map((item, index) => (
                      <span key={index} className="text-center" style={{ width: '60px' }}>
                        {item.month}
                      </span>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-center space-x-6 mt-6 text-sm">
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-blue-500 rounded mr-2 opacity-80"></span>
                      Total Projects
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded mr-2 opacity-80"></span>
                      Completed
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-1 bg-amber-500 mr-2"></span>
                      Completion Rate
                    </span>
                  </div>
                  
                  {/* Data Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Projects/Month:</span>
                        <span className="font-semibold text-blue-600 ml-2">
                          {(projectData.reduce((sum, item) => sum + item.projects, 0) / projectData.length).toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Completion Rate:</span>
                        <span className="font-semibold text-amber-600 ml-2">
                          {(projectData.reduce((sum, item) => sum + (item.completed / item.projects * 100), 0) / projectData.length).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bid Status Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Bid Status Distribution</h3>
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
                      {/* Submitted - 54% */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="54 46"
                        strokeDashoffset="0"
                      />
                      {/* Pending Review - 29% */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeDasharray="29 71"
                        strokeDashoffset="-54"
                      />
                      {/* Under Evaluation - 17% */}
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="3"
                        strokeDasharray="17 83"
                        strokeDashoffset="-83"
                      />
                    </svg>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-NeutralDGrey">52</span>
                      <span className="text-sm text-gray-600">Total</span>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {bidData.map((bid, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: bid.color }}
                          ></div>
                          <span className="font-medium text-gray-700">{bid.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{bid.value}</div>
                          <div className="text-sm text-gray-600">{bid.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Requisitions Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-NeutralDGrey mb-6">Monthly Purchase Requisitions</h3>
                <div className="flex items-end justify-between h-40 space-x-2">
                  {requisitionData.map((requisitions, index) => {
                    const height = (requisitions / maxRequisitions) * 100;
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '120px' }}>
                          <div 
                            className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t w-full absolute bottom-0 flex items-end justify-center"
                            style={{ height: `${height}%` }}
                          >
                            <span className="text-white text-xs font-semibold mb-1">{requisitions}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 mt-2">{months[index]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Peak: 25 requisitions in May | Current: 20 requisitions in June
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
