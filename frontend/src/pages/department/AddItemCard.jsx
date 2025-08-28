import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function AddItemCard({ isOpen, onClose, handleAddItemsClick }) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [qtyRequired, setQtyRequired] = useState("");
  const [qtyAvailable, setQtyAvailable] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setItemName("");
    setCost("");
    setQtyRequired("");
    setQtyAvailable("");
    setValidationErrors({});
    setLoading(false);
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!itemName.trim()) {
      errors.itemName = "Item name is required";
      isValid = false;
    }
    // if (!description.trim()) {
    //   errors.description = "Description is required";
    //   isValid = false;
    // }
    if (!cost.trim()) {
      errors.cost = "Cost is required";
      isValid = false;
    } else if (isNaN(cost) || parseFloat(cost) <= 0) {
      errors.cost = "Cost must be a valid positive number";
      isValid = false;
    }
    if (!qtyRequired.trim()) {
      errors.qtyRequired = "Quantity required is required";
      isValid = false;
    } else if (isNaN(qtyRequired) || parseInt(qtyRequired) <= 0) {
      errors.qtyRequired = "Quantity required must be positive";
      isValid = false;
    }
    if (!qtyAvailable.trim()) {
      errors.qtyAvailable = "Quantity available is required";
      isValid = false;
    } else if (isNaN(qtyAvailable) || parseInt(qtyAvailable) < 0) {
      errors.qtyAvailable = "Quantity available must be 0 or greater";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = {
      itemName: itemName.trim(),
      description: description.trim() || "N/A",
      cost: parseFloat(cost),
      qtyRequired: parseInt(qtyRequired),
      qtyAvailable: parseInt(qtyAvailable),
    };

    setLoading(true);
    handleAddItemsClick(newItem);
    setLoading(false);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Add Item</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.itemName ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                />
                {validationErrors.itemName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.itemName}
                  </p>
                )}
              </div>

              {/* Item Description */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Item Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Enter item description"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.description
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Cost */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cost (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.cost
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                />
                {validationErrors.cost && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.cost}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 grid grid-cols-2 gap-x-6 mt-2 mb-3">
                {/* Quantity Required */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qtyRequired}
                    onChange={(e) => setQtyRequired(e.target.value)}
                    placeholder="Enter quantity needed"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.qtyRequired ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                  />
                  {validationErrors.qtyRequired && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {validationErrors.qtyRequired}
                    </p>
                  )}
                </div>

                {/* Quantity Available */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity Available <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={qtyAvailable}
                    onChange={(e) => setQtyAvailable(e.target.value)}
                    placeholder="Enter quantity currently available"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.qtyAvailable ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                  />
                  {validationErrors.qtyAvailable && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {validationErrors.qtyAvailable}
                    </p>
                  )}
                </div>
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
