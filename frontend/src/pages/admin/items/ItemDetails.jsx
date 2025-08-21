import React, { useState, useEffect } from "react";
import axios from "axios";
import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "../../../components/Breadcrumb.jsx";
import { Link } from "react-router-dom";
import UserTypeNavbar from "../../../components/UserTypeNavbar.jsx";
import DefaultPagination from "../../../components/DefaultPagination.js";



const TABLE_HEAD = [
  "No",
  "Assets Class",
  "Assets Sub Class",
  "Items Name",
  "Actions",
];

const TABLE_ROWS = [
  {
    no: "01",
    assetsClass: "Electrical",
    assetsSubClass: "Electronic",
    itemName: "Diodes",

  },
  {
    no: "02",
    assetsClass: "Electrical",
    assetsSubClass: "Electronic",
    itemName: "Diodes",
  },
  {
    no: "03",
    assetsClass: "Electrical",
    assetsSubClass: "Electronic",
    itemName: "Diodes",
  },
  {
    no: "04",
    assetsClass: "Electrical",
    assetsSubClass: "Electronic",
    itemName: "Diodes",
  },
  {
    no: "05",
    assetsClass: "Electrical",
    assetsSubClass: "Electronic",
    itemName: "Diodes",
  },
];
export default function ItemDetails() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredVendors = items.filter((item) =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.AssetsClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.AssetsSubClass?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch users data from your API endpoint
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8000/item/view-item") // Update the API endpoint
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        setLoading(false);
      });
  }, []);

  // Calculate index of the last item to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  // Calculate index of the first item to display on the current page
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the array of filtered requests to display only the items for the current page
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="admin" />
      
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/adminhome/:id" },
            { label: "Item Details", link: "/itemDetails" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Simple Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Item Management</h1>
              <p className="text-gray-600 mt-1">Manage inventory items and classifications</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total: {items.length} items</span>
              <Link
                to="/AddItems"
                className="flex items-center space-x-2 bg-[#961C1E] hover:bg-[#761C1D] text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <UserPlusIcon className="h-4 w-4" />
                <span>Add Item</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Simple Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="search"
                placeholder="Search by item name, class, or subclass..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
        {/* Simple Table */}
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
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEAD.length} className="px-6 py-4 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {indexOfFirstItem + index + 1}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                        {item.AssetsClass}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                        {item.AssetsSubClass}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-xs text-gray-500">ITM-{String(indexOfFirstItem + index + 1).padStart(3, '0')}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/previewItemDetails/${item._id}`}>
                          <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        
                        <Link to={`/updateItems/${item._id}`}>
                          <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        
                        <Link to={`/deleteItems/${item._id}`}>
                          <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
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

        {/* Simple Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} items
            </div>
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
  )
}