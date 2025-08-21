import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

import {
  Button,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";


import VendorDetails from "./VendorDetails";

const DeleteSupplier = () => {
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteVendor = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:8000/supplyer/delete/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Supplier deleted", { variant: "success" });
        navigate("/allvendors");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("Error deleting supplier", { variant: "error" });
        console.log(error);
      });
  };

  const handleOpen = () => setOpen(!open);

  return (
    <div>
      <VendorDetails />
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
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
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <DialogHeader className="grid place-items-center">
                    <Typography variant="h5" color="black">
                      <h4>Delete Supplier Details</h4>
                    </Typography>
                  </DialogHeader>
                  <DialogBody divider className="grid place-items-center">
                    <img
                      src="https://www.bitdefender.com/images/Knowledge%20Base%20SMB/admonitions/important.png"
                      alt=""
                      className="max-w-24 h-24 md:max-w-md lg:max-w-24 md:h-24 w-24"
                    ></img>
                   
                    <Typography className="text-center font-normal mt-8">
                      <h4>Are you sure want to delete this Supplier details?</h4>
                    </Typography>

                    <Typography className="text-center font-normal text-sm" color="red">
                      <h6>
                        Note : Once you delete this Supplier all details of the
                        supplier will be removed.
                      </h6>
                    </Typography>
                  </DialogBody>
                  <DialogFooter className="space-x-6">
                    <button
                      type="submit"
                      className="rounded-md bg-[#961C1E] h-12 w-24 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#761C1D]"
                      onClick={handleDeleteVendor}
                    >
                      <h6 className="mt-2">Yes</h6>
                    </button>
                    <button
                      type="submit"
                      className="rounded-md h-12 w-24 bg-[#404040] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </DialogFooter>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};
export default DeleteSupplier;