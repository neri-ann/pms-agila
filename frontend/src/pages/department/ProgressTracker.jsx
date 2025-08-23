import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import DefaultPagination from "../../components/DefaultPagination";
import Breadcrumb from "../../components/Breadcrumb";
import { useAuth } from "../../context/AuthContext";

function ProgressTracker({
  isAuthenticated,
  handleSignOut,
  username,
  userId,
  department,
}) {
  const { loggedInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOption, setSearchOption] = useState("requestId");
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (loggedInUser) {
      setLoading(true);
      axios
        .get(
          `http://localhost:8000/procReqest/viewRequestsByDepartment/${loggedInUser.id}`
        )
        .then((response) => {
          const requestsWithNextPendingAction = response.data.map(
            (request) => ({
              ...request,
              nextPendingAction: getNextPendingAction(request.status),
            })
          );
          setRequests(requestsWithNextPendingAction);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching requests:", error);
          setLoading(false);
        });
    }
  }, [loggedInUser]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchOptionChange = (e) => {
    setSearchOption(e.target.value);
    setCurrentPage(1);
  };

  // Filter the requests based on searchTerm and searchOption
  const filteredRequests = requests.filter((request) =>
    request[searchOption].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getNextPendingAction = (status) => {
    switch (status) {
      case "Pending":
        return "Approval";
      case "Approved":
        return "Bid Opening";
      case "Bid Opening":
        return "Invite Bids";
      case "Invite Bids":
        return "TEC Evaluation";
      case "Rejected":
        return "No Pending Action";
      default:
        return "No Pending Action";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Bid Opening":
        return "bg-blue-100 text-blue-800";
      case "Invite Bids":
        return "bg-purple-100 text-purple-800";
      case "TEC Evaluation":
        return "bg-orange-100 text-orange-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextActionColor = (action) => {
    switch (action) {
      case "Approval":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Bid Opening":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Invite Bids":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "TEC Evaluation":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "No Pending Action":
        return "bg-gray-50 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/department/:departmentId/:userId" },
            { label: "Requisition Tracker", link: "/ProgressTrack" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Requisition Progress Tracker</h1>
                <p className="text-gray-600 mt-1">Monitor the status and progress of your procurement requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {requests.length} requests</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Pending: {requests.filter(r => r.status === 'Pending').length}
                </span>
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
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={searchOption}
              onChange={handleSearchOptionChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="requestId">Request ID</option>
              <option value="purpose">Purpose</option>
              <option value="department">Department</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading progress data...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Next Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Approver
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((request, index) => (
                  <tr key={request._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.requestId}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.purpose}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                        {request.department}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status === "Pending" && <ClockIcon className="h-3 w-3 mr-1" />}
                        {request.status === "Approved" && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {request.status === "Rejected" && <XCircleIcon className="h-3 w-3 mr-1" />}
                        {request.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.date).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getNextActionColor(request.nextPendingAction)}`}>
                        {request.nextPendingAction !== "No Pending Action" && (
                          <ArrowRightIcon className="h-3 w-3 mr-1" />
                        )}
                        {request.nextPendingAction}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.sendTo}
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
    </div>
  );
}

export default ProgressTracker;
