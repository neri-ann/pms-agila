import React, { useState, useEffect } from "react";
import axios from "axios";
import { AddItemCard } from "./AddItemCard";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../../components/Breadcrumb";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReqForm = ({ forms }) => {
  const [loading, setLoading] = useState(false);
  const [showAddItemCard, setShowAddItemCard] = useState(false);
  const { loggedInUser } = useAuth();
  const [date, setDate] = useState("");
  const [requestId, setRequestId] = useState("");
  const [department, setDepartment] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [activeBudgets, setActiveBudgets] = useState([]);
  const [faculty, setFaculty] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [purpose, setPurpose] = useState("Normal");
  const [items, setItems] = useState({});
  const [files, setFiles] = useState({});
  const [specifications, setSpecifications] = useState({});
  const [requestCreated, setRequestCreated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Budget loading states
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);

  // Generate request ID in the required format
  const generateRequestId = async () => {
    try {
      const response = await axios.post("http://localhost:8000/procReqest/generateRequestId");
      const generatedId = response.data.requestId;
      setRequestId(generatedId);
      return generatedId;
    } catch (error) {
      console.error("Error generating request ID:", error);
      // Fallback: generate based on timestamp
      const timestamp = Date.now().toString().slice(-3);
      const fallbackId = `REQ-${timestamp}`;
      setRequestId(fallbackId);
      return fallbackId;
    }
  };

  // Initialize form with request ID and current date
  useEffect(() => {
    const initializeForm = async () => {
      const newRequestId = await generateRequestId();
      const currentDate = new Date().toISOString().split('T')[0];
      setRequestId(newRequestId);
      setDate(currentDate);
    };

    initializeForm();
    fetchActiveBudgets(); // Fetch active budgets on component mount

    // Set department from logged in user
    if (loggedInUser && loggedInUser.department) {
      setDepartment(loggedInUser.department);
    }
  }, [loggedInUser]);

  // Fetch active budgets for dropdown selection
  const fetchActiveBudgets = async () => {
    try {
      setBudgetLoading(true);
      console.log("Fetching active budgets...");
      
      const response = await axios.get("http://localhost:8000/budget/active/list");
      const budgets = response.data?.budgets || [];
      
      console.log("Active budgets received:", budgets.length);
      setActiveBudgets(budgets);
      setBudgetError(null);
    } catch (error) {
      console.error("Error fetching active budgets:", error);
      setBudgetError("Failed to load active budgets. Please refresh the page.");
      setActiveBudgets([]);
    } finally {
      setBudgetLoading(false);
    }
  };

  // Handle budget selection
  const handleBudgetSelection = (budgetId) => {
    const budget = activeBudgets.find(b => b._id === budgetId);
    if (budget) {
      setSelectedBudgetId(budgetId);
      setSelectedBudget(budget);
      setDepartment(budget.department);
      setBudgetPeriod(budget.budgetPeriod);
      
      console.log("Selected budget:", budget);
    } else {
      setSelectedBudgetId("");
      setSelectedBudget(null);
      setDepartment("");
      setBudgetPeriod("");
    }
  };

  const handleAddItemsClick = () => {
    setShowAddItemCard(true);
  };

  const handleItemAdded = (newItem) => {
    // Add the new item to the items state
    const itemKey = Date.now().toString();
    setItems(prevItems => ({
      ...prevItems,
      [itemKey]: {
        ...newItem,
        itemId: itemKey // Use timestamp as itemId for now
      }
    }));
    setShowAddItemCard(false);
    toast.success("Item added successfully!");
  };

  const handleRemoveItem = (itemKey) => {
    setItems(prevItems => {
      const newItems = { ...prevItems };
      delete newItems[itemKey];
      return newItems;
    });
  };

  const handleFileUpload = async (requestId) => {
    const fileInput = document.getElementById("formFileMultiple");
    if (!fileInput || fileInput.files.length === 0) {
      console.log("No files selected");
      return;
    }

    const files = fileInput.files;
    console.log(`Uploading ${files.length} files for request ${requestId}`);

    try {
      // Upload each file individually since backend expects single file uploads
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        
        const response = await axios.post(
          `http://localhost:8000/procReqest/uploadFile/${requestId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(`File ${i + 1} uploaded successfully:`, response.data);
      }
      console.log("All files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const handleSpecificationUpload = async (requestId) => {
    const specInput = document.getElementById("formFileMultiple1");
    if (!specInput || specInput.files.length === 0) {
      console.log("No specification files selected");
      return;
    }

    const specifications = specInput.files;
    console.log(`Uploading ${specifications.length} specification files for request ${requestId}`);

    try {
      // Upload each specification file individually
      for (let i = 0; i < specifications.length; i++) {
        const formData = new FormData();
        formData.append("specification", specifications[i]);

        const response = await axios.post(
          `http://localhost:8000/procReqest/uploadSpecification/${requestId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(`Specification file ${i + 1} uploaded successfully:`, response.data);
      }
      console.log("All specification files uploaded successfully");
    } catch (error) {
      console.error("Error uploading specification files:", error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const clearForm = async () => {
    // Generate new request ID and date
    const newRequestId = await generateRequestId();
    const currentDate = new Date().toISOString().split('T')[0];

    // Reset all form fields
    setRequestId(newRequestId);
    setDate(currentDate);
    setFaculty("");
    setContactPerson("");
    setContactNo("");
    setPurpose("Normal");
    setItems({});
    setFiles({});
    setSpecifications({});
    setValidationErrors({});
    setRequestCreated(false);
    setBudgetError(null);

    // Reset budget selection
    setSelectedBudgetId("");
    setSelectedBudget(null);
    setBudgetPeriod("");

    // Keep department if user has department
    if (loggedInUser && loggedInUser.department) {
      setDepartment(loggedInUser.department);
    } else {
      setDepartment("");
    }

    // Clear file inputs
    const fileInput = document.getElementById("formFileMultiple");
    const specInput = document.getElementById("formFileMultiple1");
    if (fileInput) fileInput.value = "";
    if (specInput) specInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation logic
    const errors = {};
    if (!faculty) errors.faculty = "Faculty/Admin is required";
    if (!selectedBudgetId) errors.budget = "Budget selection is required";
    if (!contactPerson) errors.contactPerson = "Contact person is required";
    if (!contactNo) {
      errors.contactNo = "Contact number is required";
    } else if (!/^\d+$/.test(contactNo)) {
      errors.contactNo = "Contact number must contain only digits";
    }

    if (Object.keys(items).length === 0) errors.items = "At least one item is required";

    // Add budget validation - check if total cost exceeds available balance
    if (selectedBudget) {
      const totalCost = Object.values(items).reduce((sum, item) => {
        return sum + (parseFloat(item.cost) || 0) * (parseInt(item.qtyRequired) || 0);
      }, 0);
      
      if (totalCost > selectedBudget.availableBalance) {
        errors.budget = `Total cost (₱${totalCost.toLocaleString()}) exceeds available balance (₱${selectedBudget.availableBalance.toLocaleString()})`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix validation errors before submitting");
      return;
    }

    // Calculate total usedAmount for this request
    const totalUsedAmount = Object.values(items).reduce((sum, item) => {
      return sum + (parseFloat(item.cost) || 0) * (parseInt(item.qtyRequired) || 0);
    }, 0);

    const data = {
      requestId,
      department,
      budgetPeriod,
      fiscalYear: selectedBudget?.fiscalYear || new Date().getFullYear(),
      budgetId: selectedBudgetId,
      date,
      faculty,
      contactPerson,
      contactNo,
      usedAmount: totalUsedAmount,
      purpose,
      items,
      files,
      specifications,
    };

    console.log("Data being sent to backend:", data);
    console.log("Items being sent:", items);
    console.log("Items count:", Object.keys(items).length);

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8000/procReqest/createRequest/${requestId}`,
        data
      );
      console.log("Request created successfully:", response.data);

      // Upload files after request creation if files are selected
      const fileInput = document.getElementById("formFileMultiple");
      if (fileInput && fileInput.files.length > 0) {
        console.log("Uploading files...");
        await handleFileUpload(requestId);
        toast.success("Request created and files uploaded successfully!");
      } else {
        toast.success("Request created successfully!");
      }

      // Upload specifications after request creation if specifications are selected
      const specificationInput = document.getElementById("formFileMultiple1");
      if (specificationInput && specificationInput.files.length > 0) {
        console.log("Uploading specifications...");
        await handleSpecificationUpload(requestId);
      }

      // Clear the form after successful submission
      await clearForm();

    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Error creating request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/Home/:id" },
            { label: "Purchase Requisition Form", link: "/reqform" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Purchase Requisition Form</h1>
              <p className="text-gray-600 mt-1">Create a new procurement request</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* User Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty/Admin *
                    </label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.faculty
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder="Enter faculty/admin name"
                    />
                    {validationErrors.faculty && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.faculty}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department/Branch
                    </label>
                    <input
                      type="text"
                      value={selectedBudget ? selectedBudget.department : (department || '')}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
                      placeholder="Department will be auto-filled from budget selection"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      📋 Auto-populated from selected budget
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.contactPerson
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder="Enter contact person name"
                    />
                    {validationErrors.contactPerson && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.contactPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telephone No *
                    </label>
                    <input
                      type="text"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.contactNo
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder="Enter telephone number"
                    />
                    {validationErrors.contactNo && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.contactNo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Selection Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Selection *</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Select a budget from active budgets for your procurement request.
                </p>
                
                {budgetLoading ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-700 text-sm">Loading active budgets...</p>
                  </div>
                ) : budgetError ? (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{budgetError}</p>
                    <button 
                      onClick={fetchActiveBudgets}
                      className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Retry Loading Budgets
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Budget *
                      </label>
                      <select
                        value={selectedBudgetId}
                        onChange={(e) => handleBudgetSelection(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a budget...</option>
                        {activeBudgets.map((budget) => (
                          <option key={budget._id} value={budget._id}>
                            {budget.displayText}
                          </option>
                        ))}
                      </select>
                      {validationErrors.budget && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.budget}
                        </p>
                      )}
                    </div>
                    
                    {selectedBudget && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Allocation
                          </label>
                          <p className="text-lg font-semibold text-green-600">
                            ₱{selectedBudget.budgetAllocation?.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Used Amount
                          </label>
                          <p className="text-lg font-semibold text-red-600">
                            ₱{selectedBudget.usedAmount?.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Available Balance
                          </label>
                          <p className="text-lg font-semibold text-blue-600">
                            ₱{selectedBudget.availableBalance?.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <p className="text-sm text-gray-600 mt-2">
                            💡 Department: {selectedBudget.department} | Period: {selectedBudget.budgetPeriod} | FY{selectedBudget.fiscalYear}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Item Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Requesting Item Details *
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemsClick}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Items</span>
                  </button>
                </div>

                {validationErrors.items && (
                  <p className="text-red-500 text-sm mb-4">
                    {validationErrors.items}
                  </p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cost (Approx.)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty Required</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty Available</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.keys(items).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                            No items added yet. Click "Add Items" to get started.
                          </td>
                        </tr>
                      ) : (
                        Object.entries(items).map(([key, item], index) => (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.itemName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.cost}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.qtyRequired}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.qtyAvailable}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(key)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purpose and File Upload Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Purpose Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Purpose</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="normal"
                          name="purpose"
                          type="radio"
                          value="Normal"
                          checked={purpose === "Normal"}
                          onChange={() => setPurpose("Normal")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="normal" className="ml-3 text-sm font-medium text-gray-700">
                          Normal
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="fastTrack"
                          name="purpose"
                          type="radio"
                          value="Fast Track"
                          checked={purpose === "Fast Track"}
                          onChange={() => setPurpose("Fast Track")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="fastTrack" className="ml-3 text-sm font-medium text-gray-700">
                          Fast Track
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="urgent"
                          name="purpose"
                          type="radio"
                          value="Urgent"
                          checked={purpose === "Urgent"}
                          onChange={() => setPurpose("Urgent")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="urgent" className="ml-3 text-sm font-medium text-gray-700">
                          Urgent
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attach Files
                          {purpose === "Urgent" && (
                            <span className="text-red-600 ml-1">
                              (Justification Document Required for Urgent)
                            </span>
                          )}
                        </label>
                        <input
                          type="file"
                          id="formFileMultiple"
                          multiple
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attach Specifications
                        </label>
                        <input
                          type="file"
                          id="formFileMultiple1"
                          multiple
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-6 py-3 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Creating...</span>
                  ) : (
                    <span>Create New Request</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showAddItemCard && (
        <AddItemCard
          isOpen={showAddItemCard}
          onClose={() => setShowAddItemCard(false)}
          handleAddItemsClick={handleItemAdded}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default ReqForm;