import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AddItemCard }from "./AddItemCard.jsx";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Breadcrumb from "../../components/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

const ReqForm = ({ forms }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAddItemCard, setShowAddItemCard] = useState(false);
  const { loggedInUser } = useAuth();
  const [date, setDate] = useState("");
  const [requestId, setRequestId] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [budgetAllocation, setBudgetAllocation] = useState("");
  const [usedAmount, setUsedAmount] = useState("");
  const [balanceAvailable, setBalanceAvailable] = useState("");
  const [purpose, setPurpose] = useState("Normal");
  const [items, setItems] = useState({});
  const [files, setFiles] = useState({});
  const [specifications, setSpecifications] = useState({});
  const departments = ["DEIE", "DCEE", "DMME", "DCE", "DMNNE", "DIS", "NONE"];
  const [requestCreated, setRequestCreated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Generate request ID in the required format
  const generateRequestId = async () => {
    try {
      // You might want to fetch the last request number from your backend
      // For now, I'll show a placeholder - replace this with actual API call
      const response = await axios.get("http://localhost:8000/procReqest/getLastRequestNumber");
      const lastNumber = response.data.lastNumber || 0;
      const newNumber = String(lastNumber + 1).padStart(3, '0');
      return `REQ-${newNumber}`;
    } catch (error) {
      console.error("Error generating request ID:", error);
      // Fallback: generate based on timestamp
      const timestamp = Date.now().toString().slice(-3);
      return `REQ-${timestamp}`;
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

    // Set department from logged in user
    if (loggedInUser && loggedInUser.department) {
      setDepartment(loggedInUser.department);
    }
  }, [loggedInUser]);

  // Fetch budget data when department changes
  useEffect(() => {
    if (department && loggedInUser?.id) {
      fetchBudgetData(department);
    }
  }, [department, loggedInUser?.id]);

  const fetchBudgetData = async (selectedDepartment) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/budget/getBudgetByDepartment/${loggedInUser.id}?department=${selectedDepartment}`
      );
      const { budgetAllocation, usedAmount, availableBalance } = response.data;
      setBudgetAllocation(budgetAllocation);
      setUsedAmount(usedAmount);
      setBalanceAvailable(availableBalance);
    } catch (error) {
      console.error("Error fetching budget data:", error);
      // Reset budget fields if error
      setBudgetAllocation("");
      setUsedAmount("");
      setBalanceAvailable("");
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

  const handleFileUpload = async (requestId, files) => {
    files = document.getElementById("formFileMultiple").files;
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });
    try {
      const response = await axios.post(
        `http://localhost:8000/procReqest/uploadFile/${requestId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("File uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSpecificationUpload = async (requestId, specifications) => {
    specifications = document.getElementById("formFileMultiple1").files;
    const formData = new FormData();
    Array.from(specifications).forEach((specification) => {
      formData.append("specification", specification);
    });

    try {
      const response = await axios.post(
        `http://localhost:8000/procReqest/uploadSpecification/${requestId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Specification uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading specification:", error);
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

    // Keep department and budget info if user has department
    if (loggedInUser && loggedInUser.department) {
      setDepartment(loggedInUser.department);
      fetchBudgetData(loggedInUser.department);
    } else {
      setDepartment("");
      setBudgetAllocation("");
      setUsedAmount("");
      setBalanceAvailable("");
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
    if (!department) errors.department = "Department is required";
    if (!contactPerson) errors.contactPerson = "Contact person is required";
    if (!contactNo) {
      errors.contactNo = "Contact number is required";
    } else if (!/^\d+$/.test(contactNo)) {
      errors.contactNo = "Contact number must contain only digits";
    }

    if (Object.keys(items).length === 0) errors.items = "At least one item is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    const data = {
      requestId,
      department,
      date,
      faculty,
      contactPerson,
      contactNo,
      budgetAllocation,
      usedAmount,
      balanceAvailable,
      purpose,
      items,
      files,
      specifications,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8000/procReqest/createRequest/${requestId}`,
        data
      );
      console.log("Request created successfully:", response.data);
      toast.success("Request created successfully!");

      // Clear the form after successful submission
      await clearForm();

    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Error creating request");
    } finally {
      setLoading(false);
    }
  };

  // Show AddItemCard modal
  // if (showAddItemCard) {
  //   return (
  //     <AddItemCard
  //       handleAddItemsClick={handleItemAdded}
  //       onCancel={() => setShowAddItemCard(false)}
  //     />
  //   );
  // }

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
                      Department/Branch *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${validationErrors.department
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select your department</option>
                      {departments.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {validationErrors.department && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.department}
                      </p>
                    )}
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

              {/* Budget Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Annual Budget Details</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Budget information is automatically loaded based on selected department.
                </p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Allocation
                    </label>
                    <input
                      type="number"
                      value={budgetAllocation}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Used Amount So Far
                    </label>
                    <input
                      type="text"
                      value={usedAmount}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      disabled
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Balance Available
                    </label>
                    <input
                      type="text"
                      value={balanceAvailable}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                      disabled
                      readOnly
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Please check your available balance here before requesting purchasing items.
                    </p>
                  </div>
                </div>
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
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
                      {purpose === "Urgent" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Justification Document (Required for Urgent)
                          </label>
                          <input
                            type="file"
                            id="formFileMultiple"
                            onClick={handleFileUpload}
                            multiple
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attach Specifications
                        </label>
                        <input
                          type="file"
                          id="formFileMultiple1"
                          onClick={handleSpecificationUpload}
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