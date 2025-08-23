import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AddItemCard } from "./AddItemCard ";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import UserTypeNavbar from "../../components/UserTypeNavbar";
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
  const [purpose, setPurpose] = useState("normal");
  const [sendTo, setSendTo] = useState("dean");
  const [items, setItems] = useState({});
  const [files, setFiles] = useState({});
  const [specifications, setSpecifications] = useState({});
  const departments = ["DCEE", "DEIE", "MENA", "MME", "IS", "NONE"];
  const [requestCreated, setRequestCreated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const formDataFromStorage = localStorage.getItem("formData");
    if (formDataFromStorage) {
      const formData = JSON.parse(formDataFromStorage);
      setRequestId(formData.requestId);
      setDepartment(formData.department);
      setFaculty(formData.faculty);
      setDate(formData.date);
      setContactPerson(formData.contactPerson);
      setContactNo(formData.contactNo);
      setBudgetAllocation(formData.budgetAllocation);
      setUsedAmount(formData.usedAmount);
      setBalanceAvailable(formData.balanceAvailable);
      setPurpose(formData.purpose);
      setSendTo(formData.sendTo);
      setItems(formData.items || {});
      setFiles(formData.files || {});
      setSpecifications(formData.specifications || {});
    }
    if (loggedInUser && loggedInUser.department) {
      setDepartment(loggedInUser.department);
      fetchBudgetData(loggedInUser.department);
    }
  }, [loggedInUser]);

  const fetchBudgetData = async (department) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/budget/getBudgetByDepartment/${loggedInUser.id}`
      );
      const { budgetAllocation, usedAmount, availableBalance } = response.data;
      setBudgetAllocation(budgetAllocation);
      setUsedAmount(usedAmount);
      setBalanceAvailable(availableBalance);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  const handleGenerateRequestId = async () => {
    try {
      console.log("Generate Request ID button clicked");
      const response = await axios.post(
        `http://localhost:8000/procReqest/generateRequestId`
      );
      const generatedId = response.data.requestId;
      setRequestId(generatedId);
    } catch (error) {
      console.error("Error generating request ID", error);
    }
  };

  const handleAddItemsClick = (itemData) => {
    setShowAddItemCard(true);
    setItems((prevItems) => ({
      ...prevItems,
      [Date.now()]: itemData,
    }));

    const formData = {
      requestId,
      faculty,
      department,
      date,
      contactPerson,
      contactNo,
      budgetAllocation,
      usedAmount,
      balanceAvailable,
      purpose,
      sendTo,
      items,
      files,
      specifications,
    };
    setLoading(true);
    try {
      // Fetch updated items after submitting the form
    } catch (error) {
      console.error("Error submitting request", error);
      console.dir(error);
    }
    navigate(`/formview/${requestId}`);
    localStorage.setItem("formData", JSON.stringify(formData));
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

  const handleSubmit = async (e, items) => {
    e.preventDefault();
    
    // Validation logic here
    const errors = {};
    if (!faculty) errors.faculty = "Faculty/Admin is required";
    if (!department) errors.department = "Department is required";
    if (!contactPerson) errors.contactPerson = "Contact person is required";
    if (!contactNo) errors.contactNo = "Contact number is required";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
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
      sendTo,
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
      setRequestCreated(true);
      toast.success("Request created successfully!");
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Error creating request");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    // PDF generation logic here
    console.log("Generating PDF...");
  };

  const navigateToViewRequest = () => {
    navigate(`/ViewFormRequest/${requestId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="department" />

      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/Home/:id" },
            { label: "Purchase Requisition Form", link: "/reqForm" },
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
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleGenerateRequestId}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <span>Generate Request ID</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={(e) => handleSubmit(e, items)}>
            <div className="space-y-8">
              {/* Request ID Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request ID
                    </label>
                    <input
                      type="text"
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                      disabled={true}
                    />
                  </div>
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* User Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty/Admin
                    </label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.faculty
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
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
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.department
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
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.contactPerson
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {validationErrors.contactPerson && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.contactPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telephone No
                    </label>
                    <input
                      type="text"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.contactNo
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Annual Budget Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Allocation
                    </label>
                    <input
                      type="number"
                      value={budgetAllocation}
                      onChange={(e) => setBudgetAllocation(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Used Amount So Far
                    </label>
                    <input
                      type="text"
                      value={usedAmount}
                      onChange={(e) => setUsedAmount(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Balance Available
                    </label>
                    <input
                      type="text"
                      value={balanceAvailable}
                      onChange={(e) => setBalanceAvailable(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                  <h3 className="text-lg font-medium text-gray-900">Requesting Item Details</h3>
                  <button
                    type="button"
                    onClick={handleAddItemsClick}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Items</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cost (Approx.)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty Required</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty Available</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(items).map(([key, item], index) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.itemName}
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
                            <Link to={`/DeleteItem/${requestId}/${item.itemId}`}>
                              <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purpose and Settings Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                  {/* Send To Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Send Request To</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="viceChancellor"
                          name="sendTo"
                          type="radio"
                          value="viceChancellor"
                          checked={sendTo === "viceChancellor"}
                          onChange={() => setSendTo("viceChancellor")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="viceChancellor" className="ml-3 text-sm font-medium text-gray-700">
                          Vice Chancellor <span className="text-gray-500">(Up to 1,000,000)</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="dean"
                          name="sendTo"
                          type="radio"
                          value="dean"
                          checked={sendTo === "dean"}
                          onChange={() => setSendTo("dean")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="dean" className="ml-3 text-sm font-medium text-gray-700">
                          Dean <span className="text-gray-500">(Up to 100,000)</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="registrar"
                          name="sendTo"
                          type="radio"
                          value="registrar"
                          checked={sendTo === "registrar"}
                          onChange={() => setSendTo("registrar")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="registrar" className="ml-3 text-sm font-medium text-gray-700">
                          Registrar <span className="text-gray-500">(Up to 25,000)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                {requestCreated ? (
                  <button
                    type="button"
                    onClick={navigateToViewRequest}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors duration-200"
                  >
                    <span>Generate PDF</span>
                  </button>
                ) : (
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
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ReqForm;
