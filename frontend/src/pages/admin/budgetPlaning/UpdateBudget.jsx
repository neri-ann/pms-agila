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

const budgetPeriodOptions = [
  { value: "ANNUAL", label: "Annual Budget" },
  { value: "Q1", label: "Q1 (Jan-Mar)" },
  { value: "Q2", label: "Q2 (Apr-Jun)" },
  { value: "Q3", label: "Q3 (Jul-Sep)" },
  { value: "Q4", label: "Q4 (Oct-Dec)" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function UpdateBudget({ id, onClose, onBudgetUpdated }) {
  const [department, setDepartment] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [budgetPeriod, setBudgetPeriod] = useState("ANNUAL");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [existingBudgets, setExistingBudgets] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  // Fetch budget data
  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:8000/budget/previewBudget/${id}`)
      .then((response) => {
        const budgetData = response.data;
        setDepartment(budgetData.department || "");
        setBudgetAllocation(budgetData.budgetAllocation || "");
        setFiscalYear(budgetData.fiscalYear || new Date().getFullYear());
        setBudgetPeriod(budgetData.budgetPeriod || "ANNUAL");
        setDescription(budgetData.description || "");
        setStatus(budgetData.status || "ACTIVE");
      })
      .catch((error) => {
        enqueueSnackbar("Failed to load budget data. Please try again.", {
          variant: "error",
        });
        console.error("Error loading budget data:", error);
      });
  }, [id, enqueueSnackbar]);

  // Fetch existing budgets to check for duplicates
  useEffect(() => {
    axios.get("http://localhost:8000/budget/viewBudget")
      .then((response) => {
        const budgets = response.data?.budgets || response.data || [];
        setExistingBudgets(budgets);
      })
      .catch((error) => {
        console.error("Error fetching existing budgets:", error);
      });
  }, []);

  const validateFields = () => {
    let errors = {};
    let isValid = true;

    const alloc = parseFloat(budgetAllocation);

    if (!department) {
      errors.department = "Department is required. Please select a department from the dropdown.";
      isValid = false;
    } else {
      // Check if department already has a budget for this fiscal year and period
      // Exclude the current budget being edited from the duplicate check
      const existingBudget = existingBudgets.find(budget => 
        budget._id !== id && // Exclude current budget
        budget.department === department && 
        budget.fiscalYear === fiscalYear && 
        budget.budgetPeriod === budgetPeriod
      );
      if (existingBudget) {
        errors.department = `❌ ${budgetPeriod} budget already exists for ${department} department in fiscal year ${fiscalYear}! Current allocation: ₱${parseFloat(existingBudget.budgetAllocation).toLocaleString()}. Please choose a different period.`;
        isValid = false;
      }
    }
    
    if (!budgetAllocation) {
      errors.budgetAllocation = "Budget allocation is required. Enter the total budget amount for this department.";
      isValid = false;
    } else if (isNaN(alloc) || alloc <= 0) {
      errors.budgetAllocation = `Budget allocation must be a positive number greater than 0. Current value: "${budgetAllocation}"`;
      isValid = false;
    }

    if (!fiscalYear) {
      errors.fiscalYear = "Fiscal year is required. Please select or enter a fiscal year.";
      isValid = false;
    } else if (fiscalYear < 2020 || fiscalYear > 2050) {
      errors.fiscalYear = "Fiscal year must be between 2020 and 2050.";
      isValid = false;
    }

    if (!budgetPeriod) {
      errors.budgetPeriod = "Budget period is required. Please select a budget period.";
      isValid = false;
    }

    if (!status) {
      errors.status = "Status is required. Please select a budget status.";
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
      fiscalYear,
      budgetPeriod,
      description,
      status,
    };

    setLoading(true);

    axios
      .put(`http://localhost:8000/budget/updateBudget/${id}`, updatedBudget)
      .then((response) => {
        setLoading(false);
        if (onBudgetUpdated) {
          onBudgetUpdated({ ...updatedBudget, _id: id });
        }
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Update Time-Based Budget</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Update budget information with fiscal year and period tracking</p>
        </div>

        {/* Body */}
        <form
          onSubmit={handleUpdateBudgets}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Fiscal Year - Read-only, locked */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fiscal Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={fiscalYear}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Fiscal year (locked)"
                />
                <p className="text-xs text-gray-600 mt-1">
                  🔒 Locked field. Fiscal year cannot be changed when editing budgets.
                </p>
                {validationErrors.fiscalYear && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.fiscalYear}
                  </p>
                )}
              </div>

              {/* Budget Period */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={budgetPeriod}
                  onChange={(e) => setBudgetPeriod(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.budgetPeriod
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select budget period</option>
                  {budgetPeriodOptions.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
                {validationErrors.budgetPeriod && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.budgetPeriod}
                  </p>
                )}
              </div>

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
                    <span className="mr-1">⚠</span>
                    {validationErrors.department}
                  </p>
                )}
              </div>

              {/* Budget Status - Editable dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.status
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select status</option>
                  {statusOptions.map((statusOption) => (
                    <option key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  ✏️ Status can be updated to manage budget availability.
                </p>
                {validationErrors.status && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.status}
                  </p>
                )}
              </div>

              {/* Budget Description */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter a description for this budget allocation (optional)..."
                  disabled={loading}
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.description}
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
                  min="0"
                  step="any"
                />
                {validationErrors.budgetAllocation && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.budgetAllocation}
                  </p>
                )}
              </div>

              {/* Auto-calculated fields display */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Balance
                </label>
                <input
                  type="text"
                  value="Auto-calculated from usage"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Automatically calculated"
                />
                <p className="text-xs text-gray-600 mt-1">
                  💡 Available balance is calculated automatically based on approved procurement requests.
                </p>
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
                  Updating Budget...
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