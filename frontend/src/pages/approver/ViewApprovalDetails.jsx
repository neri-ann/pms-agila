import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "flowbite-react";
import React from "react";

export default function ViewApprovalDetails({ open, setOpen, request }) {
   const cancelButtonRef = useRef(null);

   if (!request) return null;

   const getStatusColor = (status) => {
      switch (status) {
         case "Pending":
            return "bg-yellow-100 text-yellow-800";
         case "Approved":
            return "bg-green-100 text-green-800";
         case "Rejected":
            return "bg-red-100 text-red-800";
         case "Sent":
            return "bg-blue-100 text-blue-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

   const getPriorityColor = (priority) => {
      switch (priority) {
         case "High":
            return "bg-red-100 text-red-800";
         case "Medium":
            return "bg-yellow-100 text-yellow-800";
         case "Low":
            return "bg-green-100 text-green-800";
         default:
            return "bg-gray-100 text-gray-800";
      }
   };

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
                              Procurement Request Details for Approval.
                           </h3>
                        </div>

                        {/* Request Info */}
                        <div className="space-y-2 border-b pb-2 mb-4">
                           <h3 className="text-xl font-semibold mb-4">Request Information</h3>
                           <div className="md:grid md:grid-cols-2 gap-2">
                              <p>
                                 <span className="font-medium text-gray-600">Status:</span>
                                 <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(request.status)}`}>
                                    {request.status}
                                 </span>
                              </p>
                              <p>
                                 <span className="font-medium text-gray-600">Priority:</span>
                                 <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(request.priority || 'Medium')}`}>
                                    {request.priority || 'Medium'}
                                 </span>
                              </p>
                           </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2 border-b pb-2 mb-4">
                           <h3 className="text-xl font-semibold mb-4">User Details</h3>
                           <div className="md:grid md:grid-cols-2 gap-2">
                              <p><span className="font-medium text-gray-600">Faculty/Admin:</span> {request.faculty}</p>
                              <p><span className="font-medium text-gray-600">Department/Branch:</span> {request.department}</p>
                              <p><span className="font-medium text-gray-600">Contact Person:</span> {request.contactPerson}</p>
                              <p><span className="font-medium text-gray-600">Contact No:</span> {request.contactNo}</p>
                           </div>
                        </div>

                        {/* Requested Items */}
                        <div className="mb-4 border-b pb-8">
                           <h3 className="text-xl font-semibold mb-4">Requested Items</h3>
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
                                          <td className="px-4 py-2">{item.name}</td>
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
                           <h3 className="text-xl font-semibold mb-4">Purpose</h3>
                           <p>{request.purpose.toUpperCase()}</p>
                        </div>

                        {/* Attachments */}
                        <div className="mb-4 border-b pb-2">
                           <h3 className="text-xl font-semibold mb-4">Attachments</h3>
                           {request.attachments && request.attachments.length > 0 ? (
                              <ul className="list-disc list-inside">
                                 {request.attachments.map((file, i) => (
                                    <li key={i} className="text-blue-600">{file}</li>
                                 ))}
                              </ul>
                           ) : (
                              <p>NONE</p>
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