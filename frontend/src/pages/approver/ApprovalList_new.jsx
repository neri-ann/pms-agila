import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import UserTypeNavbar from "../../components/UserTypeNavbar";
import Breadcrumb from "../../components/Breadcrumb";
import DefaultPagination from "../../components/DefaultPagination";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer } from "react-toastify";
import ViewApprovalDetails from "./ViewApprovalDetails";
import UpdateApproval from "./UpdateApproval";
import DenyRequest from "./DenyRequest";

const TABLE_HEAD = [
  "No",
  "Department",
  "Requested Date",
  "Status",
  "Priority",
  "Actions",
];

const ApprovalList = ({ userType: propUserType }) => {
  const location = useLocation();
  const { loggedInUser } = useAuth();
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Function to determine userType with fallback logic
  const getUserType = () => {
    if (loggedInUser?.role) {
      return loggedInUser.role;
    }
    
    if (propUserType) {
      return propUserType;
    }
    
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.role || 'admin';
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
    
    return location.pathname === '/ViewForApproval' ? 'admin' : 'procOfficer';
  };

  // Function to determine priority based on purpose
  const getPriorityFromPurpose = (purpose) => {
    if (!purpose) return 'Low';
    
    const purposeLower = purpose.toLowerCase();
    
    if (purposeLower === 'urgent') {
      return 'High';
    } else if (purposeLower === 'fast track') {
      return 'Medium';
    } else if (purposeLower === 'normal') {
      return 'Low';
    }
    
    // Default fallback
    return 'Low';
  };

  const userType = getUserType();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRequests = requests.filter((request) => {
    const priority = getPriorityFromPurpose(request.purpose);
    return (
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priority.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/procReqest/viewRequests")
      .then((response) => {
        setRequests(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Modal handlers
  const handleView = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const onApprovalSuccess = () => {
    fetchRequests(); // Refresh the list
  };

  const onRejectSuccess = () => {
    fetchRequests(); // Refresh the list
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType={userType} />
      
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/ApproverHome/:id" },
            { label: "Pending Approval list", link: "/ViewForApproval" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Approval Management</h1>
              <p className="text-gray-600 mt-1">Review and approve pending procurement requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {requests.length} requests</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending: {requests.filter(r => r.status === 'Pending').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="search"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((request, index) => {
                  const priority = getPriorityFromPurpose(request.purpose);
                  
                  return (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {indexOfFirstItem + index + 1}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                          {request.department}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.date).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(priority)}`}>
                          {priority}
                        </span>
                      </td>
                        
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(request)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleApprove(request)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleReject(request)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
            </div>
            <DefaultPagination onPageChange={handlePageChange} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewApprovalDetails
        open={showViewModal}
        setOpen={setShowViewModal}
        request={selectedRequest}
      />

      <UpdateApproval
        open={showApproveModal}
        setOpen={setShowApproveModal}
        request={selectedRequest}
        onApprovalSuccess={onApprovalSuccess}
      />

      <DenyRequest
        open={showRejectModal}
        setOpen={setShowRejectModal}
        request={selectedRequest}
        onRejectSuccess={onRejectSuccess}
      />

      <ToastContainer />
    </div>
  );
};

export default ApprovalList;