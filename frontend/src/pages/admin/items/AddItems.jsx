import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "../../../components/Breadcrumb";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const assets = [
  "Current Assets",
  "Inventory",
  "Supplier Assets",
  "Contractual Assets",
];

export default function AddItemsModal({ isOpen, onClose, onItemAdded }) {
  const [AssetsClass, setAssetsClass] = useState("");
  const [AssetsSubClass, setAssetsSubClass] = useState("");
  const [itemName, setItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setAssetsClass("");
    setAssetsSubClass("");
    setItemName("");
    setValidationErrors({});
  };

  // Validate the form fields
  const validateFields = () => {
    let errors = {};
    let isValid = true;

    if (!AssetsClass) {
      errors.AssetsClass = "Assets class is required";
      isValid = false;
    }
    if (!AssetsSubClass) {
      errors.AssetsSubClass = "Assets sub class is required";
      isValid = false;
    }
    if (!itemName) {
      errors.itemName = "Item name is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  function handleSaveItem(e) {
    e.preventDefault();

    if (!validateFields()) return;

    const newItem = {
      AssetsClass,
      AssetsSubClass,
      itemName,
    };
    setLoading(true);
    axios
      .post("http://localhost:8000/item/create", newItem)
      .then(() => {
        toast.success("Item successfully added!");
        setLoading(false);
        resetForm();
        onItemAdded?.();
        onClose();
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to add item. Please try again.");
        setLoading(false);
      });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Add New Item</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSaveItem} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Item Name */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${
                    validationErrors.itemName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.itemName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.itemName}
                  </p>
                )}
              </div>

              {/* Assets Class */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assets Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={AssetsClass}
                  onChange={(e) => setAssetsClass(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${
                    validationErrors.AssetsClass
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Assets Class</option>
                  {assets.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.AssetsClass && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.AssetsClass}
                  </p>
                )}
              </div>

              {/* Assets Sub Class */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Assets Sub Class <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={AssetsSubClass}
                  onChange={(e) => setAssetsSubClass(e.target.value)}
                  placeholder="Enter assets sub class"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${
                    validationErrors.AssetsSubClass
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.AssetsSubClass && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.AssetsSubClass}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#961C1E] border border-transparent rounded-lg hover:bg-[#7A1517] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#961C1E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
