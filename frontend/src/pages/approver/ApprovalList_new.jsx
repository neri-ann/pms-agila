import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import UserTypeNavbar from "../../components/UserTypeNavbar";
import Breadcrumb from "../../components/Breadcrumb";
import DefaultPagination from "../../components/DefaultPagination";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer } from "react-toastify";

const TABLE_HEAD = [
  "No",
  "Request ID",
  "Department",
  "Requested Date",
  "Status",
  "Priority",
  "Actions",
];

const ApprovalList = ({ userType: propUserType }) => {
  const location = useLocation();
  const { loggedInUser } = useAuth();
  
  // Function to determine userType with fallback logic
  const getUserType = () => {
    // First try to get from AuthContext
    if (loggedInUser?.role) {
      return loggedInUser.role;
    }
    
    // If userType is passed as prop, use it
    if (propUserType) {
      return propUserType;
    }
    
    // Try to get user data from localStorage for page refresh
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.role || 'admin';
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
    
    // Default to admin for admin routes, procOfficer otherwise
    return location.pathname === '/ViewForApproval' ? 'admin' : 'procOfficer';
  };

  const userType = getUserType();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRequests = requests.filter((request) => {
    return (
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase())
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
        const requestsWithIsSent = response.data.map((request) => ({
          ...request,
          isSent: false,
        }));
        setRequests(requestsWithIsSent);
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

  const handleSendRequest = (requestId) => {
    axios
      .post(`http://localhost:8000/sendApproval/${requestId}`)
      .then((response) => {
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.requestId === requestId
              ? { ...request, isSent: true }
              : request
          )
        );
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
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
                {currentItems.map((request, index) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.requestId}</div>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(request.priority || 'Medium')}`}>
                        {request.priority || 'Medium'}
                      </span>
                    </td>
                      
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/ViewForApproval/${request.requestId}`}>
                          <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        
                        <Link to={`/ApprovalForm/${request.requestId}`}>
                          <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        
                        <Link to={`/DenyApproval/${request.requestId}`}>
                          <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleSendRequest(request.requestId)}
                          disabled={request.isSent}
                          className={`p-2 rounded-md transition-colors ${
                            request.isSent
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                          }`}
                        >
                          {request.isSent ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            <PaperAirplaneIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <ToastContainer />
    </div>
  );
};

export default ApprovalList;
