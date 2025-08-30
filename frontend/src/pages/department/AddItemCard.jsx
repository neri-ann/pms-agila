import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export function AddItemCard({ isOpen, onClose, handleAddItemsClick }) {
  const [items, setItems] = useState([]); // Available items from database
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [qtyRequired, setQtyRequired] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Fetch items when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchItems();
    }
  }, [isOpen]);

  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/item/view-item");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItemId("");
    setSelectedItem(null);
    setQtyRequired("");
    setValidationErrors({});
    setLoading(false);
  };

  // Handle item selection
  const handleItemSelection = (itemId) => {
    setSelectedItemId(itemId);
    const item = items.find(i => i._id === itemId);
    setSelectedItem(item);
    // Clear validation errors when item is selected
    if (validationErrors.selectedItemId) {
      setValidationErrors(prev => ({ ...prev, selectedItemId: null }));
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!selectedItemId) {
      errors.selectedItemId = "Please select an item";
      isValid = false;
    }
    if (!qtyRequired.trim()) {
      errors.qtyRequired = "Quantity required is required";
      isValid = false;
    } else if (isNaN(qtyRequired) || parseInt(qtyRequired) <= 0) {
      errors.qtyRequired = "Quantity required must be positive";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = {
      itemName: selectedItem.itemName,
      description: selectedItem.itemDescription,
      cost: parseFloat(selectedItem.cost),
      qtyRequired: parseInt(qtyRequired),
      qtyAvailable: selectedItem.calculatedQuantityAvailable || selectedItem.quantityAvailable || 0,
      itemId: selectedItem._id, // Include the database ID for reference
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
            <div className="grid grid-cols-1 gap-x-6 gap-y-6">
              {/* Item Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Item <span className="text-red-500">*</span>
                </label>
                {itemsLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Loading items...
                  </div>
                ) : (
                  <select
                    value={selectedItemId}
                    onChange={(e) => handleItemSelection(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.selectedItemId ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                  >
                    <option value="">Select an item...</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.itemName} - {item.AssetsClass} ({item.AssetsSubClass})
                      </option>
                    ))}
                  </select>
                )}
                {validationErrors.selectedItemId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.selectedItemId}
                  </p>
                )}
              </div>

              {/* Item Details Display (Auto-filled when item is selected) */}
              {selectedItem && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Item Details (Auto-filled)</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Item Name</label>
                      <p className="text-gray-900 font-medium">{selectedItem.itemName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Assets Class</label>
                      <p className="text-gray-900">{selectedItem.AssetsClass}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <p className="text-gray-900">{selectedItem.itemDescription}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost per Unit</label>
                      <p className="text-green-600 font-semibold">₱{parseFloat(selectedItem.cost || 0).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity Available</label>
                      <p className="text-blue-600 font-semibold">
                        {selectedItem.calculatedQuantityAvailable || selectedItem.quantityAvailable || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedItem.calculatedQuantityAvailable ? 'From approved requests' : 'Default/Manual'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Required (User Input) */}
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

              {/* Total Cost Calculation */}
              {selectedItem && qtyRequired && !isNaN(qtyRequired) && parseInt(qtyRequired) > 0 && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Estimated Cost:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₱{(parseFloat(selectedItem.cost || 0) * parseInt(qtyRequired)).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {qtyRequired} × ₱{parseFloat(selectedItem.cost || 0).toLocaleString()} per unit
                  </p>
                </div>
              )}
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
