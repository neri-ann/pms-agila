import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PO_PreviewItemModal({ isOpen, onClose, item }) {
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
                        <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        {/* Item Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Item Name
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                                {item.itemName || 'N/A'}
                            </div>
                        </div>

                        {/* Two column layout for Assets Class and Sub Class */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            {/* Assets Class */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Assets Class
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                                    {item.AssetsClass || 'N/A'}
                                </div>
                            </div>

                            {/* Assets Sub Class */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Assets Sub Class
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                                    {item.AssetsSubClass || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Item Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Item Description
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[80px]">
                                {item.itemDescription || 'N/A'}
                            </div>
                        </div>

                        {/* Two column layout for Cost and Quantity */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            {/* Cost */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Cost (₱)
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                                    ₱ {item.cost ? parseFloat(item.cost).toFixed(2) : 'N/A'}
                                </div>
                            </div>

                            {/* Quantity Available */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Quantity Available
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                                    {item.calculatedQuantityAvailable !== undefined ? 
                                        item.calculatedQuantityAvailable : 
                                        (item.quantityAvailable || 0)
                                    }
                                </div>
                                <p className="text-xs text-gray-500">
                                    Calculated from approved procurement requests
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[#961C1E] border border-transparent rounded-lg hover:bg-[#7A1517] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#961C1E] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
