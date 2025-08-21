import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "../../../components/Breadcrumb.jsx";
import AddBudgetCard from "./AddBudgetCard";
import UserTypeNavbar from "../../../components/UserTypeNavbar.jsx";
import DefaultPagination from "../../../components/DefaultPagination.js";

const TABLE_HEAD = [
  "No",
  "Department",
  "Budget Allocation",
  "Available Balance",
  "Used Amount",
  "Actions",
];

export default function ManageBudget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddBudgetCard, setShowAddBudgetCard] = useState(false);
  const itemsPerPage = 5;

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.department &&
      typeof budget.department === "string" &&
      budget.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/budget/viewBudget")
      .then((response) => {
        setBudgets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddBudgetClick = () => {
    setShowAddBudgetCard(true);
  };

  const handleBudgetAdded = (newBudget) => {
    setBudgets([...budgets, newBudget]);
    setShowAddBudgetCard(false);
  };

  const handleCancelClick = () => {
    setShowAddBudgetCard(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBudgets.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="admin" />
      
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/adminhome/:id" },
            { label: "Budget Details", link: "/budgetDetails" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Simple Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Budget Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage departmental budgets</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {budgets.length} budgets</span>
              <button
                onClick={handleAddBudgetClick}
                className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <UserPlusIcon className="h-4 w-4" />
                <span>Add Budget</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simple Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="search"
                placeholder="Search by department..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Simple Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    No budgets found
                  </td>
                </tr>
              ) : (
                currentItems.map((budget, index) => (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {budget.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${budget.budgetAllocation?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${budget.availableBalance?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${budget.usedAmount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/updateBudget/${budget._id}`}>
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link to={`/DeleteBudget/${budget._id}`}>
                          <button className="text-red-600 hover:text-red-900 p-1">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <DefaultPagination
            totalItems={filteredBudgets.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {showAddBudgetCard && (
        <AddBudgetCard
          onSave={handleBudgetAdded}
          onCancel={handleCancelClick}
        />
      )}
    </div>
  );
}
