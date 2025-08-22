import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import axios from "axios";
import UserTypeNavbar from "../../components/UserTypeNavbar";
import { Button } from "@material-tailwind/react";
import { AddReqCard } from "./AddItemCard";

export default function ProjectCreationForm({ forms }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAddRequestCard, setShowAddRequestCard] = useState(false);
  const [requests, setRequests] = useState([]);
  const [searchOption, setSearchOption] = useState("requestId");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState({});
  const [projectId, setProjectId] = useState("");
  const [quotationRequirement, setQuotationRequirement] = useState("");

  const [selectedRequests, setSelectedRequests] = "";
  const [formData, setFormData] = useState({
    projectId: "",
    procurementRequests: [],
    projectTitle: "",
    biddingType: "",
    closingDate: "",
    closingTime: "",
    quotationRequirement: "",
    appointTEC: [],
    appointBOCommite: [],
  });
  const { id } = useParams();
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [biddingType, setBiddingType] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [appointTEC, setAppointTEC] = useState([]);
  const [appointBOCommite, setAppointBOCommite] = useState([]);
  const [projectCreated, setProjectCreated] = useState(false);
  const biddingTypes = ["Direct Purchasing", "Shopping Method"];

  useEffect(() => {
    const formDataFromStorage = localStorage.getItem("formData");
    if (formDataFromStorage) {
      const savedFormData = JSON.parse(formDataFromStorage);
      setFormData(savedFormData);
      setProjectId(savedFormData.projectId);
    } else if (!projectId) {
      handleGenerateProjectId();
    }
  }, []);

  useEffect(() => {
    handleViewRequest();
  }, [projectId]);

  const handleGenerateProjectId = async () => {
    try {
      console.log("Generate Project ID button clicked");
      const response = await axios.get(
        `http://localhost:8000/procProject/generateProjectId`
      );
      const generatedId = response.data.projectId;
      setProjectId(generatedId);
    } catch (error) {
      console.error("Error generating project ID", error);
    }
  };

  const handleAddRequestClick = (requestData) => {
    setShowAddRequestCard(true);
    setRequests((prevRequests) => [...prevRequests, requestData]);
    const formData = {
      projectId,
      procurementRequests,
      projectTitle,
      biddingType,
      closingDate,
      closingTime,
      appointTEC,
      appointBOCommite,
      quotationRequirement,
    };
    setLoading(true);
    try {
      // Fetch updated items after submitting the form
    } catch (error) {
      console.error("Error submitting project", error);
      console.dir(error);
    }
    navigate(`/ReqSelection/${projectId}`);
    localStorage.setItem("formData", JSON.stringify(formData));
  };

  const handleViewRequest = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/procProject/viewAddedRequests/${projectId}`
      );
      const requestData = response.data;

      setRequests(requestData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleGenerateShoppingMethodPdf = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/procProject/createNationalShoppingPdf",
        formData
      );
      console.log("Shopping Method PDF created successfully", response.data);
      clearFormInputs();
    } catch (error) {
      console.error("Error generating Shopping Method PDF:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleGenerateDirectPurchasingPdf = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/procProject/createPdf",
        formData
      );
      console.log("Direct Purchasing PDF created successfully", response.data);
      clearFormInputs();
    } catch (error) {
      console.error("Error generating Direct Purchasing PDF:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      projectId,
      procurementRequests,
      projectTitle,
      biddingType,
      closingDate,
      closingTime,
      appointTEC,
      appointBOCommite,
      quotationRequirement,
    };
    const newProject = {
      projectId,
      procurementRequests,
      projectTitle,
      biddingType,
      closingDate,
      closingTime,
      appointTEC,
      appointBOCommite,
      quotationRequirement,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/procProject/createProject/${projectId}`,
        newProject
      );
      const updatedProject = response.data.updatedProject;
      console.log("Project created:", response.data);

      setLoading(false);

      setFormData("");
      clearFormInputs();
      localStorage.removeItem("formData");
      console.log("Request submitted successfully", response.data);
      navigate("/projectList");
      // navigateToViewProject();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToViewProject = () => {
    if (formData.biddingType === "Shopping Method")
      navigate(`/ViewShoppingPdf/${projectId}`);
    else if (formData.biddingType === "Direct Purchasing");
    navigate(`/ViewDirectPurchasingPdf/${projectId}`);
  };

  const clearFormInputs = () => {
    setFormData({
      projectId: "",
      projectTitle: "",
      biddingType: "",
      closingDate: "",
      closingTime: "",
      quotationRequirement: "",
      appointTEC: [],
      appointBOCommite: [],
    });
    setRequests([]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredRequests = requests.filter((request) =>
    request[searchOption].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="procurement Officer" />

      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: `/PO_BuHome/${id}` },
            { label: "Procurement Project List", link: `/projectList/${id}` },
            { label: "Project Form Creation", link: "#" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <form onSubmit={(e) => handleFormSubmit(e, requests)}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Create Procurement Project
          </h2>

          {/* Project ID and Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <Button
                className="flex items-center gap-3 h-10 bg-[#404040] hover:bg-black"
                size="sm"
                onClick={handleGenerateProjectId}
              >
                <span>Generate Project ID</span>
              </Button>
              <input
                type="text"
                value={projectId}
                name="projectId"
                onChange={(e) => setProjectId(e.target.value)}
                disabled={true}
                className="block w-full h-12 rounded-md border py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mt-3 mb-2.5">
                Project Title
              </label>
              <input
                type="text"
                name="projectTitle"
                placeholder="Enter the Project Title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="block w-full h-12 rounded-md border py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Closing Date & Bidding Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Closing Date & Time
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  className="rounded border-gray-300"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                />
                <input
                  type="time"
                  className="rounded border-gray-300"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select the Bidding Type
              </label>
              <select
                value={biddingType}
                onChange={(e) => setBiddingType(e.target.value)}
                className="block w-full h-12 rounded-md border py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                <option value="">Select method</option>
                {biddingTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Requests */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">
              Add the Requests into Projects
            </h5>
            <button
              type="button"
              onClick={handleAddRequestClick}
              className="inline-flex items-center px-4 py-2 bg-[#961C1E] text-white rounded hover:bg-[#761C1D] transition"
            >
              <span className="text-xl mr-2">+</span> Add Requests
            </button>
            <div className="mt-6">
              <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request, index) => (
                      <tr key={request.requestId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requestId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {showAddRequestCard && (
                  <AddReqCard
                    handleAddRequestClick={handleAddRequestClick}
                    handleViewRequest={handleViewRequest}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Appoint Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-4">
                Appoint Members to TEC
              </legend>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="tec-chairman"
                    name="tec-chairman"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="tec-chairman"
                    className="font-medium text-gray-900"
                  >
                    Chairman
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="tec-member2"
                    name="tec-member2"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="tec-member2"
                    className="font-medium text-gray-900"
                  >
                    Member 2
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="tec-member3"
                    name="tec-member3"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="tec-member3"
                    className="font-medium text-gray-900"
                  >
                    Member 3
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 mb-4">
                Appoint Members to Bid Opening Committee
              </legend>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="bo-chairman"
                    name="bo-chairman"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="bo-chairman"
                    className="font-medium text-gray-900"
                  >
                    Chairman
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="bo-member2"
                    name="bo-member2"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="bo-member2"
                    className="font-medium text-gray-900"
                  >
                    Member 2
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="bo-member3"
                    name="bo-member3"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="bo-member3"
                    className="font-medium text-gray-900"
                  >
                    Member 3
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-x-6 mt-8">
            <button
              type="button"
              className="rounded-md h-14 w-30 bg-[#404040] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={clearFormInputs}
            >
              CLEAR FORM
            </button>
            {biddingType === "Shopping Method" ? (
              <button
                type="submit"
                className="rounded-md bg-[#961C1E] h-14 w-30 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7A1517] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={(e) => {
                  handleFormSubmit(e);
                  handleGenerateShoppingMethodPdf();
                }}
              >
                CREATE PROJECT
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-md bg-[#961C1E] h-14 w-30 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7A1517] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={(e) => {
                  handleFormSubmit(e);
                  handleGenerateDirectPurchasingPdf();
                }}
              >
                CREATE PROJECT
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
