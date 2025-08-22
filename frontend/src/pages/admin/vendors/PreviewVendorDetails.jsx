import { Fragment, useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "flowbite-react";
import VendorDetails from "./VendorDetails";



export default function PreviewVendorDetails() {
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [supplyer, setSupplyer] = useState({});

  // Reset modal open state whenever id changes
  useEffect(() => {
    setOpen(true); // <-- This line ensures modal opens every time id changes
    const getSupplyer = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/supplyer/preview-supplyer/${id}`, { withCredentials: true }
        );
        console.log("Supllyer Data:", response.data);
        setSupplyer(response.data);
      } catch (error) {
        console.log("Error fetching supplyer:", error);
      }
    };

    getSupplyer();
  }, [id]);

  const handleClose = () => {
    setOpen(false);
    navigate("/allvendors");
  };

  return (
    <div>
      <VendorDetails />
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          onClose={handleClose}
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

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel>
                  <div className="min-h-screen flex items-center justify-center px-4 mt-28">
                    <div className="max-w-4xl bg-white w-full rounded-lg shadow-xl mt-11 p-12">
                      <div className="p-2 border-b">
                        <h1 className="text-2xl">VENDOR DETAILS</h1>
                        <h3 className="text-lg text-[#404040]">
                          Registered Vendor Details.
                        </h3>
                      </div>
                      <div className="mt-4">
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">User Name</h6>
                          <div>{supplyer.username}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Supplier ID</h6>
                          <div>{supplyer.supplierId}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Supplier Name</h6>
                          <div>{supplyer.supplierName}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Address</h6>
                          <div>{supplyer.address}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Contact Officer</h6>
                          <div>{supplyer.contactOfficer}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Contact Number</h6>
                          <div>
                            {supplyer.contactNumber &&
                              Array.isArray(supplyer.contactNumber) &&
                              supplyer.contactNumber.map((number, index) => (
                                <div
                                  key={index}
                                  className="text-sm leading-5 text-gray-800"
                                >
                                  {number}
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Contact Emails</h6>
                          <div>
                            {supplyer.email &&
                              Array.isArray(supplyer.email) &&
                              supplyer.email.map((email, index) => (
                                <div
                                  key={index}
                                  className="text-sm leading-5 text-gray-800"
                                >
                                  {email}
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Fax Numbers</h6>
                          <div>
                            {supplyer.faxNumber1}, {supplyer.faxNumber2}
                          </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">Business Type</h6>
                          <div>{supplyer.typeofBusiness}</div>
                        </div>
                        <div className="md:grid md:grid-cols-2 hover:bg-gray-50 md:space-y-0 space-y-1 p-2 border-b">
                          <h6 className="text-gray-600">
                            Class of Assets Supplies
                          </h6>
                          <div>{supplyer.classOfAssets}</div>
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <Button
                            variant="outlined"
                            className="rounded-md bg-[#961C1E] h-12 w-30 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#761C1D] focus-visible:outline"
                            onClick={handleClose}
                            ref={cancelButtonRef}
                          >
                            CLOSE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
