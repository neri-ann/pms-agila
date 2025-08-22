import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "../../../components/Breadcrumb.jsx";
import UserTypeNavbar from "../../../components/UserTypeNavbar.jsx";
import DefaultPagination from "../../../components/DefaultPagination.js";
import { useAuth } from "../../../context/AuthContext"; // <-- Use the hook

const TABLE_HEAD = [
  "No",
  "Supplier ID",
  "Supplier Name",
  "Address",
  "Contact Officer",
  "Fax Number",
  "Contact Number",
  "Contact Email",
  "Type of Business",
  "Actions",
];

export default function VendorDetails() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get loggedInUser from AuthContext
  const { loggedInUser } = useAuth();

  const filteredVendors = vendors.filter((vendor) =>
    vendor.supplierId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/supplyer/view", { withCredentials: true })
      .then((response) => {
        setVendors(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching supplyer:", error);
        setLoading(false);
      });
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Allow admin and procurement Officer to manage vendors
  const canManageVendors =
    loggedInUser && (loggedInUser.role === "admin" || loggedInUser.role === "procurement Officer");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType={loggedInUser?.role || "admin"} />

      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/adminhome/:id" },
            { label: "Vendor Details", link: "/vendorsDetails" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Supplier Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all approved suppliers</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {vendors.length} suppliers</span>
              {canManageVendors && (
                <Link
                  to="/AddSupplier"
                  className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Add Supplier</span>
                </Link>
              )}
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
                placeholder="Search by supplier ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                currentItems.map((supplier, index) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.supplierId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.supplierName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.contactOfficer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {supplier.faxNumber1 && (
                          <div className="text-xs">{supplier.faxNumber1}</div>
                        )}
                        {supplier.faxNumber2 && (
                          <div className="text-xs">{supplier.faxNumber2}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {supplier.contactNumber?.map((number, idx) => (
                          <div key={idx} className="text-xs">{number}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {supplier.email?.map((email, idx) => (
                          <div key={idx} className="text-xs text-blue-600">{email}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {supplier.typeofBusiness}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/previewVendorDetails/${supplier._id}`}>
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        {canManageVendors && (
                          <>
                            <Link to={`/updateSupplier/${supplier._id}`}>
                              <button className="text-green-600 hover:text-green-900 p-1">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link to={`/deleteSupplier/${supplier._id}`}>
                              <button className="text-red-600 hover:text-red-900 p-1">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} suppliers
            </span>
            <DefaultPagination
              totalItems={filteredVendors.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}