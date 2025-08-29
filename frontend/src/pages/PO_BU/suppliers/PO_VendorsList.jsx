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
import PO_AddSupplierModal from "./PO_AddSupplier.jsx";
import PO_UpdateSupplierModal from "./PO_UpdateSupplier.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABLE_HEAD = [
  "No",
  "Supplier Name",
  "Address",
  "Contact Officer",
  "Contact Number",
  "Contact Email",
  "Type of Business",
  "Actions",
];

export default function PO_VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isUpdateSupplierOpen, setIsUpdateSupplierOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch vendors
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = () => {
    setLoading(true);
    axios
      .get("http://localhost:8000/supplyer/view-supplyers")
      .then((response) => {
        // Only show non-deleted vendors (should already be filtered by backend, but double check)
        setVendors(response.data.filter(v => v.isDeleted === false || v.isDeleted === undefined));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
        setLoading(false);
      });
  };

  // After adding
  const handleSupplierAdded = () => {
    fetchVendors();
    toast.success("Supplier was successfully added!");
    setIsAddSupplierOpen(false);
  };

  // After updating
  const handleSupplierUpdated = () => {
    fetchVendors();
    toast.success("Supplier was successfully updated!");
    setIsUpdateSupplierOpen(false);
  };

  // Filtered search (searches across multiple fields)
  const filteredVendors = vendors.filter((vendor) => {
    const term = searchTerm.toLowerCase();
    return (
      vendor.supplierName?.toLowerCase().includes(term) ||
      vendor.address?.toLowerCase().includes(term) ||
      vendor.contactOfficer?.toLowerCase().includes(term) ||
      vendor.contactNumber?.some((num) =>
        num.toLowerCase().includes(term)
      ) ||
      vendor.email?.some((email) =>
        email.toLowerCase().includes(term)
      ) ||
      vendor.typeofBusiness?.toLowerCase().includes(term)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="procurement Officer" />

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/PO_BuHome/:id" },
            { label: "Vendor Details", link: "/PO_VendorsList" },
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
                Supplier Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all approved suppliers
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Total: {vendors.length} suppliers
              </span>
              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <UserPlusIcon className="h-4 w-4" />
                <span>Add Supplier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              type="search"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  <td
                    colSpan={TABLE_HEAD.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEAD.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No suppliers found
                  </td>
                </tr>
              ) : (
                currentItems.map((supplier, index) => (
                  <tr key={supplier._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {supplier.supplierName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {supplier.contactOfficer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {supplier.contactNumber?.map((num, i) => (
                          <div key={i} className="text-xs">{num}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {supplier.email?.map((mail, i) => (
                          <div key={i} className="text-xs text-blue-600">{mail}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {supplier.typeofBusiness}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/PO_PreviewSupplier/${supplier._id}`}>
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          onClick={() => {
                            setSelectedSupplierId(supplier._id);
                            setIsUpdateSupplierOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <Link to={`/PO_DeleteSupplier/${supplier._id}`}>
                          <button className="text-red-600 hover:text-red-900 p-1">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Link>
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
              Showing {filteredVendors.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredVendors.length)} of{" "}
              {filteredVendors.length} suppliers
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

      {/* Add Supplier Modal */}
      <PO_AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSupplierAdded={handleSupplierAdded}
      />

      {/* Update Supplier Modal */}
      <PO_UpdateSupplierModal
        isOpen={isUpdateSupplierOpen}
        onClose={() => setIsUpdateSupplierOpen(false)}
        onSupplierUpdated={handleSupplierUpdated}
        supplierId={selectedSupplierId}
      />

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
