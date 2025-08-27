import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSnackbar } from "notistack";
import { toast } from "react-toastify";

const departmentOptions = [
  "DEIE",
  "DCEE",
  "DMME",
  "DCE",
  "DMNNE",
  "DIS",
  "NONE",
];

export default function UpdateBudget({ id, onClose, onBudgetUpdated }) {
  const [department, setDepartment] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [usedAmount, setUsedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!id) {
      console.error("No ID provided to UpdateBudget component");
      return;
    }

    axios
      .get(`http://localhost:8000/budget/previewBudget/${id}`)
      .then((response) => {
        const budgetData = response.data;
        setDepartment(budgetData.department || "");
        setBudgetAllocation(budgetData.budgetAllocation || "");
        setAvailableBalance(budgetData.availableBalance || "");
        setUsedAmount(budgetData.usedAmount || "");
      })
      .catch((error) => {
        enqueueSnackbar("Failed to load budget data. Please try again.", {
          variant: "error",
        });
        console.error("Error loading budget data:", error);
      });
  }, [id, enqueueSnackbar]);

  const validateFields = () => {
    let errors = {};
    let isValid = true;

    if (!department) {
      errors.department = "Department is required";
      isValid = false;
    }
    if (!budgetAllocation || parseFloat(budgetAllocation) <= 0) {
      errors.budgetAllocation = "Budget Allocation must be a positive number";
      isValid = false;
    }
    if (!availableBalance || parseFloat(availableBalance) < 0) {
      errors.availableBalance = "Available Balance cannot be negative";
      isValid = false;
    }
    if (!usedAmount || parseFloat(usedAmount) < 0) {
      errors.usedAmount = "Used Amount cannot be negative";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleUpdateBudgets = (e) => {
    e.preventDefault();
    
    if (!validateFields()) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    const updatedBudget = {
      department,
      budgetAllocation: parseFloat(budgetAllocation),
      availableBalance: parseFloat(availableBalance),
      usedAmount: parseFloat(usedAmount),
    };

    setLoading(true);

    axios
      .put(`http://localhost:8000/budget/updateBudget/${id}`, updatedBudget)
      .then((response) => {
        setLoading(false);
        toast.success("Budget updated successfully!");
        
        // Call the parent's update handler with the updated data
        if (onBudgetUpdated) {
          onBudgetUpdated({ ...updatedBudget, _id: id });
        }
        
        // Close the modal
        onClose();
      })
      .catch((error) => {
        setLoading(false);
        const errorMessage = error.response?.data?.message || error.message || "Failed to update budget";
        toast.error(`Error updating budget: ${errorMessage}`);
        console.error("Update error:", error);
      });
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Update Budget</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleUpdateBudgets}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.department
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {validationErrors.department && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">âš </span>
                    {validationErrors.department}
                  </p>
                )}
              </div>

              {/* Budget Allocation */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Allocation <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={budgetAllocation}
                  onChange={(e) => setBudgetAllocation(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.budgetAllocation
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter budget allocation here..."
                  disabled={loading}
                />
                {validationErrors.budgetAllocation && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">âš </span>
                    {validationErrors.budgetAllocation}
                  </p>
                )}
              </div>

              {/* Available Balance */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Balance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={availableBalance}
                  onChange={(e) => setAvailableBalance(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.availableBalance
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter available balance here..."
                  disabled={loading}
                />
                {validationErrors.availableBalance && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">âš </span>
                    {validationErrors.availableBalance}
                  </p>
                )}
              </div>

              {/* Used Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Used Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={usedAmount}
                  onChange={(e) => setUsedAmount(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.usedAmount
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter used amount here..."
                  disabled={loading}
                />
                {validationErrors.usedAmount && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">âš </span>
                    {validationErrors.usedAmount}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#961C1E] border border-transparent rounded-lg hover:bg-[#7A1517] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#961C1E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Budget"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}