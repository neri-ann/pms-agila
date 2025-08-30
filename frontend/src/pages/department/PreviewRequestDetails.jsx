import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "flowbite-react";
import React from "react";

export default function PreviewRequestDetails({ open, setOpen, request }) {
  const cancelButtonRef = useRef(null);

  if (!request) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={() => setOpen(false)}
        static
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center px-4 mt-12">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="max-w-4xl bg-white w-full rounded-lg shadow-xl mt-11 p-12">
                {/* Header */}
                <div className="p-2 border-b mb-4">
                  <h1 className="text-2xl">REQUEST DETAILS</h1>
                  <h3 className="text-lg text-[#404040]">
                    Registered Procurement Request Details.
                  </h3>
                </div>

                {/* User Details */}
                <div className="space-y-2 border-b pb-2 mb-4">
                  <h3 className="text-xl font-semibold">User Details</h3>
                  <div className="md:grid md:grid-cols-2 gap-2">
                    <p><span className="font-medium text-gray-600">Faculty/Admin:</span> {request.faculty}</p>
                    <p><span className="font-medium text-gray-600">Department/Branch:</span> {request.department}</p>
                    <p><span className="font-medium text-gray-600">Contact Person:</span> {request.contactPerson}</p>
                    <p><span className="font-medium text-gray-600">Contact No:</span> {request.contactNo}</p>
                  </div>
                </div>

                {/* Requested Items */}
                <div className="mb-4 border-b pb-8">
                  <h3 className="text-xl font-semibold mb-2">Requested Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-md">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm">Item Name</th>
                          <th className="px-4 py-2 text-left text-sm">Cost (Approx.)</th>
                          <th className="px-4 py-2 text-left text-sm">Qty Required</th>
                          <th className="px-4 py-2 text-left text-sm">Qty Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.items?.map((item, i) => (
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{item.itemName}</td>
                            <td className="px-4 py-2">{item.cost}</td>
                            <td className="px-4 py-2">{item.qtyRequired}</td>
                            <td className="px-4 py-2">{item.qtyAvailable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-4 border-b pb-2">
                  <h3 className="text-xl font-semibold mb-2">Purpose</h3>
                  <p>{request.purpose}</p>
                </div>

                {/* Attachments */}
                <div className="mb-4 border-b pb-2">
                  <h3 className="text-xl font-semibold mb-2">Attachments</h3>
                  {((request.files && request.files.length > 0) || (request.specifications && request.specifications.length > 0)) ? (
                    <div className="space-y-4">
                      {/* Regular Files Section */}
                      {request.files && request.files.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium mb-2 text-gray-700">Files ({request.files.length})</h4>
                          <div className="space-y-2">
                            {request.files.map((file, i) => (
                              <div key={`file-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {file.mimeType?.includes('image') ? (
                                      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c0-1.1-.9-2-2-2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    ) : file.mimeType?.includes('pdf') ? (
                                      <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                      </svg>
                                    ) : (
                                      <svg className="h-8 w-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.filename}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {file.mimeType || 'Unknown type'} • File
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {file.filepath && (
                                    <a 
                                      href={file.filepath} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      View
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specifications Section */}
                      {request.specifications && request.specifications.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium mb-2 text-gray-700">Specifications ({request.specifications.length})</h4>
                          <div className="space-y-2">
                            {request.specifications.map((spec, i) => (
                              <div key={`spec-${i}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {spec.mimeType?.includes('image') ? (
                                      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c0-1.1-.9-2-2-2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                      </svg>
                                    ) : spec.mimeType?.includes('pdf') ? (
                                      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                      </svg>
                                    ) : (
                                      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {spec.filename}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                      {spec.mimeType || 'Unknown type'} • Specification
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {spec.filepath && (
                                    <a 
                                      href={spec.filepath} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      View
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No attachments</p>
                  )}
                </div>

                {/* Close button */}
                <div className="flex justify-end mt-6">
                  <Button
                    variant="outlined"
                    className="rounded-md !bg-[#961C1E] h-12 px-4 text-sm font-semibold text-white shadow-sm hover:!bg-[#761C1D]"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    CLOSE
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
