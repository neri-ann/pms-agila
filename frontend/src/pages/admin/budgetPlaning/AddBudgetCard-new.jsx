import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
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

const AddBudgetCard = ({ onSave, onCancel }) => {
  const [department, setDepartment] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");
  const [availableBalance, setAvailableBalance] = useState("");
  const [usedAmount, setUsedAmount] = useState("");
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [budgetPeriod, setBudgetPeriod] = useState("ANNUAL");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [existingBudgets, setExistingBudgets] = useState([]);

  // Generate fiscal year options (current year ± 2 years)
  const currentYear = new Date().getFullYear();
  const fiscalYearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

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

  // Auto-fill usedAmount when availableBalance or budgetAllocation changes
  useEffect(() => {
    const alloc = parseFloat(budgetAllocation);
    const avail = parseFloat(availableBalance);
    if (!isNaN(alloc) && !isNaN(avail)) {
      const used = alloc - avail;
      setUsedAmount(used >= 0 ? used.toString() : "");
    } else {
      setUsedAmount("");
    }
  }, [availableBalance, budgetAllocation]);

  const resetForm = () => {
    setDepartment("");
    setBudgetAllocation("");
    setAvailableBalance("");
    setUsedAmount("");
    setFiscalYear(new Date().getFullYear());
    setBudgetPeriod("ANNUAL");
    setDescription("");
    setValidationErrors({});
  };

  const validateFields = () => {
    let errors = {};
    let isValid = true;

    const alloc = parseFloat(budgetAllocation);
    const avail = parseFloat(availableBalance);
    const used = parseFloat(usedAmount);

    if (!department) {
      errors.department = "Department is required. Please select a department from the dropdown.";
      isValid = false;
    } else {
      // Check if department already has a budget for this fiscal year and period
      const existingBudget = existingBudgets.find(budget => 
        budget.department === department && 
        budget.fiscalYear === fiscalYear && 
        budget.budgetPeriod === budgetPeriod
      );
      if (existingBudget) {
        errors.department = `❌ ${budgetPeriod} budget already exists for ${department} department in fiscal year ${fiscalYear}! Current allocation: ₱${parseFloat(existingBudget.budgetAllocation).toLocaleString()}. Please use 'Update Budget' or choose a different period/year.`;
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
    
    if (!availableBalance) {
      errors.availableBalance = "Available balance is required. Enter the current remaining balance.";
      isValid = false;
    } else if (isNaN(avail) || avail < 0) {
      errors.availableBalance = `Available balance must be a non-negative number (≥ 0). Current value: "${availableBalance}"`;
      isValid = false;
    }

    if (!usedAmount && usedAmount !== 0) {
      errors.usedAmount = "Used amount is required (auto-calculated from Budget - Available).";
      isValid = false;
    } else if (isNaN(used) || used < 0) {
      errors.usedAmount = `Used amount must be a non-negative number (≥ 0). Current value: "${usedAmount}"`;
      isValid = false;
    }
    
    // Enhanced mathematical validation with detailed explanation
    if (isValid && (Math.abs((avail + used) - alloc) > 0.01)) {
      const calculatedSum = avail + used;
      const difference = Math.abs(calculatedSum - alloc);
      
      errors.availableBalance = `Mathematical error: Available Balance (${avail}) + Used Amount (${used}) = ${calculatedSum.toFixed(2)}, but Budget Allocation is ${alloc}. Difference: ${difference.toFixed(2)}`;
      errors.usedAmount = `Budget equation must balance: ${alloc} = ${avail} + ${used}. Current calculation: ${alloc} ≠ ${calculatedSum.toFixed(2)}`;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateFields()) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    
    setLoading(true);
    const budgetData = {
      department,
      budgetAllocation: parseFloat(budgetAllocation),
      usedAmount: parseFloat(usedAmount) || 0,
      fiscalYear: parseInt(fiscalYear),
      budgetPeriod,
      description: description.trim() || `${budgetPeriod} budget for ${department} department - FY${fiscalYear}`,
    };

    axios
      .post("http://localhost:8000/budget/create", budgetData)
      .then((response) => {
        console.log("Budget created successfully:", response.data);
        
        // Display success message with budget details
        const budgetInfo = response.data.budget;
        toast.success(
          `✅ ${budgetInfo.budgetPeriod} budget created successfully for ${budgetInfo.department} department (FY${budgetInfo.fiscalYear})! 
          Allocation: ₱${parseFloat(budgetInfo.budgetAllocation).toLocaleString()}`
        );
        
        resetForm();
        onSave(response.data.budget);
      })
      .catch((error) => {
        console.error("Error creating budget:", error);
        
        if (error.response?.status === 400) {
          const errorData = error.response.data;
          
          if (errorData.error === 'Budget already exists' || errorData.error === 'Duplicate budget') {
            toast.error(`❌ ${errorData.message}`);
            
            // Set specific field error for duplicate budget
            setValidationErrors({
              department: `${errorData.message}. Try selecting a different fiscal year or budget period.`
            });
          } else {
            toast.error(`❌ Validation Error: ${errorData.message}`);
          }
        } else {
          toast.error("❌ Failed to create budget. Please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Get helper text showing existing budgets for the selected fiscal year and department
  const getExistingBudgetInfo = () => {
    if (!department || !fiscalYear) return "";
    
    const deptBudgets = existingBudgets.filter(budget => 
      budget.department === department && budget.fiscalYear === fiscalYear
    );
    
    if (deptBudgets.length === 0) {
      return `✅ No existing budgets found for ${department} in FY${fiscalYear}`;
    }
    
    const periods = deptBudgets.map(b => b.budgetPeriod).join(", ");
    return `⚠️ ${department} already has budgets for: ${periods} in FY${fiscalYear}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Add Time-Based Budget</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Create budgets with fiscal year and period tracking for better budget management</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
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
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {validationErrors.department && (
                  <p className="text-sm text-red-600">{validationErrors.department}</p>
                )}
              </div>

              {/* Fiscal Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fiscal Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.fiscalYear
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  {fiscalYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year} {year === currentYear && "(Current)"}
                    </option>
                  ))}
                </select>
                {validationErrors.fiscalYear && (
                  <p className="text-sm text-red-600">{validationErrors.fiscalYear}</p>
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
                >
                  {budgetPeriodOptions.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
                {validationErrors.budgetPeriod && (
                  <p className="text-sm text-red-600">{validationErrors.budgetPeriod}</p>
                )}
              </div>

              {/* Budget Allocation */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Budget Allocation (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetAllocation}
                  onChange={(e) => setBudgetAllocation(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.budgetAllocation
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter total budget amount"
                />
                {validationErrors.budgetAllocation && (
                  <p className="text-sm text-red-600">{validationErrors.budgetAllocation}</p>
                )}
              </div>

              {/* Available Balance */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Balance (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={availableBalance}
                  onChange={(e) => setAvailableBalance(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.availableBalance
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter available balance"
                />
                {validationErrors.availableBalance && (
                  <p className="text-sm text-red-600">{validationErrors.availableBalance}</p>
                )}
              </div>

              {/* Used Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Used Amount (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={usedAmount}
                  onChange={(e) => setUsedAmount(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 ${
                    validationErrors.usedAmount
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Auto-calculated"
                  readOnly
                />
                {validationErrors.usedAmount && (
                  <p className="text-sm text-red-600">{validationErrors.usedAmount}</p>
                )}
                <p className="text-xs text-gray-500">
                  Auto-calculated: Budget Allocation - Available Balance
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={`Enter description or leave empty for auto-generated description...`}
              />
              <p className="text-xs text-gray-500">
                Auto-generated if empty: "{budgetPeriod} budget for {department || '[Department]'} department - FY{fiscalYear}"
              </p>
            </div>

            {/* Existing Budget Info */}
            {getExistingBudgetInfo() && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Existing Budget Information</h4>
                <p className="text-sm text-blue-700">{getExistingBudgetInfo()}</p>
              </div>
            )}

            {/* Budget Calculation Preview */}
            {budgetAllocation && availableBalance && usedAmount && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-sm font-medium text-green-900 mb-2">Budget Calculation Preview</h4>
                <div className="text-sm text-green-700">
                  <p><strong>Budget Allocation:</strong> ₱{parseFloat(budgetAllocation).toLocaleString()}</p>
                  <p><strong>Used Amount:</strong> ₱{parseFloat(usedAmount).toLocaleString()}</p>
                  <p><strong>Available Balance:</strong> ₱{parseFloat(availableBalance).toLocaleString()}</p>
                  <p><strong>Utilization:</strong> {((parseFloat(usedAmount) / parseFloat(budgetAllocation)) * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                  Creating Budget...
                </span>
              ) : (
                "Create Budget"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetCard;
