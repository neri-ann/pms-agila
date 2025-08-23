import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/24/outline";
import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";
import Breadcrumb from "../../components/Breadcrumb.jsx";
import DefaultPagination from "../../components/DefaultPagination.js";
import { Tooltip } from "flowbite-react";
import { IconButton } from "@material-tailwind/react";
import InvitesBidsCard from "./InvitesBidsCard";

export default function InvitesBids() {
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitedProjects, setInvitedProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/procProject/viewProjects")
      .then((response) => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching project:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/supplyer/view-supplyers")
      .then((response) => {
        setVendors(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
      });
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generateFileName = (projectId, biddingType) => {
    if (biddingType === "Direct Purchasing") {
      return `Direct_Purchasing_${projectId}.pdf`;
    } else if (biddingType === "Shopping Method") {
      return `National_Shopping_${projectId}.pdf`;
    } else {
      return `Bidding_Document_${projectId}.pdf`;
    }
  };

  const navigateToViewProject = (projectId, biddingType) => {
    if (biddingType === "Shopping Method") {
      navigate(`/ViewShoppingPdf/${projectId}`);
    } else if (biddingType === "Direct Purchasing") {
      navigate(`/ViewDirectPurchasingPdf/${projectId}`);
    } else {
      navigate(`/ViewBidDoc/${projectId}`);
    }
  };

  const handleInviteBidsClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };
  const handleInviteSuccess = (projectId) => {
    setInvitedProjects((prev) => [...prev, projectId]);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="procurement Officer" />

      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/PO_BuHome/:id" },
            { label: "Invite Bids", link: "/InvitesBids" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Invite Bids
              </h1>
              <p className="text-gray-600 mt-1">
                List of all projects for inviting bids
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Total: {filteredProjects.length} projects
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="search"
                placeholder="Search by Project Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No invites found.
                  </td>
                </tr>
              ) : (
                currentItems.map((project, idx) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstItem + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.projectId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {generateFileName(project.projectId, project.biddingType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-x-2">
                        <Tooltip content="Preview the Project">
                          <IconButton
                            variant="text"
                            onClick={() =>
                              navigateToViewProject(
                                project.projectId,
                                project.biddingType
                              )
                            }
                          >
                            <EyeIcon className="h-6 w-6 text-green-500" />
                          </IconButton>
                        </Tooltip>
                        {invitedProjects.includes(project.projectId) ? (
                          <button
                            className="text-white bg-green-500 px-3 py-1 rounded"
                            disabled
                          >
                            Invited
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInviteBidsClick(project)}
                            className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
                          >
                            Invite Bids
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              {filteredProjects.length === 0
                ? 0
                : indexOfFirstItem + 1}{" "}
              to{" "}
              {Math.min(indexOfLastItem, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
            </div>
            <DefaultPagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredProjects.length}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>

      {modalOpen && (
        <InvitesBidsCard
          project={selectedProject}
          vendors={vendors}
          onClose={handleCloseModal}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
}