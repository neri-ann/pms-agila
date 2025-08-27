import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import React from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import {
  Button,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";
import UserList from './UserList';

const DeleteUserDetails = () => {
  const [open, setOpen] = useState(true)

  const cancelButtonRef = useRef(null)

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  const handleDeleteUser = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:8000/user/delete/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('User deleted', { variant: 'success' });
        navigate('/userList');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error deleting user', { variant: 'error' });
        console.log(error);
      });
  };

  const handleOpen = () => setOpen(!open);

  const handleClose = () => {
    setOpen(false);
    navigate('/userList');
  };

  return (
    <div>
      <UserList />
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative !z-[9999]" initialFocus={cancelButtonRef} onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[9999]" />
          </Transition.Child>

          <div className="fixed inset-0 !z-[9999] w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200">
                  <DialogHeader className="grid place-items-center pt-6 pb-2">
                    <Typography variant="h5" color="black">
                      <h4 className="text-xl font-semibold text-gray-800">Delete User Details</h4>
                    </Typography>
                  </DialogHeader>
                  
                  <DialogBody divider className="grid place-items-center px-6 py-4">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                      </div>
                    </div>

                    <Typography className="text-center font-normal mb-4">
                      <h4 className="text-lg text-gray-700">Are you sure you want to delete this user?</h4>
                    </Typography>

                    <Typography className="text-center font-normal text-sm px-4" color="red">
                      <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        <strong>Warning:</strong> Once you delete this user, all details of the user will be permanently removed and cannot be recovered.
                      </p>
                    </Typography>
                  </DialogBody>
                  
                  <DialogFooter className="flex justify-center space-x-4 px-6 pb-6">
                    <button
                      type="button"
                      className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={handleClose}
                      ref={cancelButtonRef}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      className="px-6 py-2.5 text-sm font-medium text-white bg-[#961C1E] border border-transparent rounded-lg hover:bg-[#7A1517] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#961C1E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      onClick={handleDeleteUser}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete'
                      )}
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

export default DeleteUserDetails;