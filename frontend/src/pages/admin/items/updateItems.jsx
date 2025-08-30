import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { toast } from "react-toastify";

const assets = [
    "Current Assets",
    "Inventory",
    "Supplier Assets",
    "Contractual Assets",
];

export default function PO_UpdateItemsModal({ isOpen, onClose, onItemUpdated, id }) {
    const [AssetsClass, setAssetsClass] = useState("");
    const [AssetsSubClass, setAssetsSubClass] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [cost, setCost] = useState("");
    const [quantityAvailable, setQuantityAvailable] = useState("0");
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // Fetch item data when modal opens
    useEffect(() => {
        if (isOpen && id) {
            setLoading(true);
            axios
                .get(`http://localhost:8000/item/preview-item/${id}`)
                .then((response) => {
                    const itemData = response.data;
                    setAssetsClass(itemData.AssetsClass || "");
                    setAssetsSubClass(itemData.AssetsSubClass || "");
                    setItemName(itemData.itemName || "");
                    setItemDescription(itemData.itemDescription || "");
                    setCost(itemData.cost ? itemData.cost.toString() : "");
                    setQuantityAvailable(itemData.quantityAvailable ? itemData.quantityAvailable.toString() : "0");
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                    enqueueSnackbar("An error occurred. Please check the console.", {
                        variant: "error",
                    });
                    console.error(error);
                });
        }
        // eslint-disable-next-line
    }, [isOpen, id]);

    const resetForm = () => {
        setAssetsClass("");
        setAssetsSubClass("");
        setItemName("");
        setItemDescription("");
        setCost("");
        setQuantityAvailable("0");
        setValidationErrors({});
    };

    // Validate the form fields
    const validateFields = () => {
        let errors = {};
        let isValid = true;

        if (!itemName.trim()) {
            errors.itemName = "Item name is required";
            isValid = false;
        }
        if (!AssetsClass) {
            errors.AssetsClass = "Assets class is required";
            isValid = false;
        }
        if (!AssetsSubClass.trim()) {
            errors.AssetsSubClass = "Assets sub class is required";
            isValid = false;
        }
        if (!itemDescription.trim()) {
            errors.itemDescription = "Item description is required";
            isValid = false;
        }
        if (!cost || isNaN(cost) || parseFloat(cost) < 0) {
            errors.cost = "Valid cost is required";
            isValid = false;
        }
        if (isNaN(quantityAvailable) || parseInt(quantityAvailable) < 0) {
            errors.quantityAvailable = "Quantity available must be 0 or greater";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    function handleUpdateItems(e) {
        e.preventDefault();

        if (!validateFields()) return;

        const updatedItem = {
            itemName: itemName.trim(),
            AssetsClass,
            AssetsSubClass: AssetsSubClass.trim(),
            itemDescription: itemDescription.trim(),
            cost: parseFloat(cost),
            quantityAvailable: parseInt(quantityAvailable),
        };

        setLoading(true);
        axios
            .put(`http://localhost:8000/item/update/${id}`, updatedItem)
            .then(() => {
                toast.success("Item updated successfully!");
                setLoading(false);
                resetForm();
                onItemUpdated?.();
                onClose();
            })
            .catch((error) => {
                setLoading(false);
                toast.error("Error updating item details");
                console.error(error);
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
                        <h3 className="text-lg font-medium text-gray-900">Update Item Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleUpdateItems}
                    className="flex flex-col flex-1 min-h-0"
                >
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
                                    placeholder="Enter unique item name"
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.itemName
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        }`}
                                />
                                {validationErrors.itemName && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                        <span className="mr-1">⚠ </span>
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
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.AssetsClass
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
                                        <span className="mr-1">⚠ </span>
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
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.AssetsSubClass
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        }`}
                                />
                                {validationErrors.AssetsSubClass && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                        <span className="mr-1">⚠ </span>
                                        {validationErrors.AssetsSubClass}
                                    </p>
                                )}
                            </div>

                            {/* Item Description */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Item Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    placeholder="Enter item description"
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.itemDescription
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                        }`}
                                />
                                {validationErrors.itemDescription && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                        <span className="mr-1">⚠ </span>
                                        {validationErrors.itemDescription}
                                    </p>
                                )}
                            </div>

                            {/* Cost */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Cost (₱) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    placeholder="Enter item cost"
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.cost
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                        }`}
                                />
                                {validationErrors.cost && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                        <span className="mr-1">⚠ </span>
                                        {validationErrors.cost}
                                    </p>
                                )}
                            </div>

                            {/* Quantity Available */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Quantity Available
                                </label>
                                <input
                                    type="number"
                                    value={quantityAvailable}
                                    onChange={(e) => setQuantityAvailable(e.target.value)}
                                    placeholder="Enter quantity available"
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors ${validationErrors.quantityAvailable
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                        }`}
                                />
                                {validationErrors.quantityAvailable && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center">
                                        <span className="mr-1">⚠ </span>
                                        {validationErrors.quantityAvailable}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    This will be automatically calculated from approved requests
                                </p>
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