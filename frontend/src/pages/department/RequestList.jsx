import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../../components/Breadcrumb";
import DefaultPagination from "../../components/DefaultPagination";
import { ToastContainer } from "react-toastify";
import PreviewRequestDetails from "./PreviewRequestDetails";

const TABLE_HEAD = [
  "No",
  "Requestor Name",
  "Department",
  "Purpose",
  "Status",
  "Actions",
];

const RequestList = ({ isAuthenticated, handleSignOut, username, userId, department }) => {
  const { loggedInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const filteredRequests = requests.filter((request) => {
    return (
      request.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.faculty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  // Add automatic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/procReqest/viewRequests");
      console.log("Fetched requests:", response.data);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      // Keep an empty array if request fails
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Sent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/Home/:id" },
            { label: "Purchase Requisition", link: "/reqForm" },
            { label: "Purchase Requisition List", link: "/ViewForRequest" },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Request Management</h1>
              <p className="text-gray-600 mt-1">Manage and track your procurement requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {requests.length} requests</span>
              <Link to="/reqForm" className="no-underline">
                <button className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-4 py-2 rounded-md transition-colors duration-200">
                  <PlusIcon className="h-4 w-4" />
                  <span>New Request</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              type="search"
              placeholder="Search by requestor, department, or purpose..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={TABLE_HEAD.length} className="text-center py-4">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={TABLE_HEAD.length} className="text-center py-4">No requests found</td></tr>
              ) : (
                currentItems.map((request, index) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{indexOfFirstItem + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{request.contactPerson || request.faculty || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{request.department || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{request.purpose || 'Normal'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(request.status)}`}>
                        {request.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleView(request)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length}
          </div>
          <DefaultPagination
            totalItems={filteredRequests.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <PreviewRequestDetails
        open={showModal}
        setOpen={setShowModal}
        request={selectedRequest}
      />

      {/* Toast */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RequestList;