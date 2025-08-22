import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import Breadcrumb from "../../../components/Breadcrumb.jsx";

import "../../../styles/button2.css";
import UserTypeNavbar from "../../../components/UserTypeNavbar.jsx";

export default function UpdateSupplier() {
  const [username, setUsername] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [contactOfficer, setContactOfficer] = useState("");
  const [contactNumbers1, setContactNumbers1] = useState("");
  const [contactNumbers2, setContactNumbers2] = useState("");
  const [emails1, setEmails1] = useState("");
  const [emails2, setEmails2] = useState("");

  const [faxNumber1, setFaxNumber1] = useState("");
  const [faxNumber2, setFaxNumber2] = useState("");
  const [typeofBusiness, setTypesOFBusiness] = useState("");
  const [classOfAssets, setClassOfAssets] = useState("");
  const [loading, setLoading] = useState(false);
  const types = [
    "SoleImporter",
    "SoleDistributor",
    "LocalAgent",
    "contractors",
  ];
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // React Router Hook to get the parameter from the URL
  const { id } = useParams();

  // Snackbar Hook for displaying notifications
  const { enqueueSnackbar } = useSnackbar();

  // Fetch user data from the API based on the ID
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/supplyer/preview-supplyer/${id}`, { withCredentials: true })
      .then((response) => {
        const userData = response.data;
        setUsername(userData.username);
        setSupplierId(userData.supplierId);
        setSupplierName(userData.supplierName);

        // Split address into parts
        const addressParts = (userData.address || "").split(",");
        setAddressStreet(addressParts[0]?.trim() || "");
        setAddressCity(addressParts[1]?.trim() || "");
        setAddressProvince(addressParts[2]?.trim() || "");

        setContactOfficer(userData.contactOfficer || "");
        setContactNumbers1(userData.contactNumber?.[0] || "");
        setContactNumbers2(userData.contactNumber?.[1] || "");
        setEmails1(userData.email?.[0] || "");
        setEmails2(userData.email?.[1] || "");
        setFaxNumber1(userData.faxNumber1 || "");
        setFaxNumber2(userData.faxNumber2 || "");
        setTypesOFBusiness(userData.typeofBusiness || "");
        setClassOfAssets(userData.classOfAssets || "");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("An error occurred. Please check the console.", {
          variant: "error",
        });
        console.error(error);
      });
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [id]);

  const handleUpdateVendors = (event) => {
    event.preventDefault(); // <-- Add this line!
    const UpdateSupplyer = {
      username,
      supplierId,
      supplierName,
      address: addressStreet,
      contactOfficer,
      contactNumber: [contactNumbers1, contactNumbers2],
      email: [emails1, emails2],
      faxNumber1,
      faxNumber2,
      typeofBusiness,
      classOfAssets,
    };

    setLoading(true);

    axios
      .put(`http://localhost:8000/supplyer/update/${id}`, UpdateSupplyer, { withCredentials: true })
      .then(() => {
        alert("Supplyer Updated");
        // Reset form fields
        setUsername("");
        setSupplierName("");
        setSupplierId("");
        setAddressStreet("");
        setAddressCity("");
        setAddressProvince("");

        setContactOfficer("");
        setContactNumbers1("");
        setContactNumbers2("");
        setEmails1("");
        setEmails2("");
        setFaxNumber1("");
        setFaxNumber2("");
        setTypesOFBusiness("");
        setClassOfAssets("");
        setLoading(false);
        enqueueSnackbar("Vendor is updated successfully", {
          variant: "success",
        });
        navigate("/allvendors");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar(`Error updating vendor account: ${error.message}`, {
          variant: "error",
        });
        console.error(error);
      });
  };
  // React Router Hook for navigation

  const selected = (crumb) => {
    console.log(crumb);
  };

  const navigate = useNavigate();

  return (
    <form onSubmit={handleUpdateVendors}>
      <div className="space-y-12 ml-40 mr-40 mt-40">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/adminhome/:id" },
            { label: "Vendor Details", link: "/allvendors" },

            { label: "Add Vendor Details", link: "/addvendors" },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className=" text-gray-900">SUPPLIER REGISTRATION.</h2>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium leading-6 text-gray-900 "
              >
                <h6>User Name</h6>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Enter the User Name"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Supplier ID </h6>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  autoComplete="family-name"
                  placeholder="Enter the Supplier ID"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium leading-6 text-gray-900 "
              >
                <h6>Supplier Name </h6>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Enter the Supplier Name"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Contact Officer </h6>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  value={contactOfficer}
                  onChange={(e) => setContactOfficer(e.target.value)}
                  autoComplete="family-name"
                  placeholder="Enter the Contact Officer Name"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Address </h6>
              </label>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Street"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2">
                <input
                  type="text"
                  name="region"
                  id="region"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  autoComplete="address-level1"
                  placeholder="City"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2">
                <input
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  value={addressProvince}
                  onChange={(e) => setAddressProvince(e.target.value)}
                  autoComplete="postal-code"
                  placeholder="Province"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Fax Numbers </h6>
              </label>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={faxNumber1}
                  onChange={(e) => setFaxNumber1(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Fax Number 1"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2">
                <input
                  type="text"
                  name="region"
                  id="region"
                  value={faxNumber2}
                  onChange={(e) => setFaxNumber2(e.target.value)}
                  autoComplete="address-level1"
                  placeholder="Fax Number 2"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Contact Numbers </h6>
              </label>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={contactNumbers1}
                  onChange={(e) => setContactNumbers1(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Contact Number 1"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2">
                <input
                  type="text"
                  name="region"
                  id="region"
                  value={contactNumbers2}
                  onChange={(e) => setContactNumbers2(e.target.value)}
                  autoComplete="address-level1"
                  placeholder="Contact Number 2"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Contact Email Addresses </h6>
              </label>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <div className="mt-2">
                <input
                  type="email"
                  name="city"
                  id="city"
                  value={emails1}
                  onChange={(e) => setEmails1(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Email address 1"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="mt-2">
                <input
                  type="email"
                  name="region"
                  id="region"
                  value={emails2}
                  onChange={(e) => setEmails2(e.target.value)}
                  autoComplete="address-level1"
                  placeholder="Email address 2"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Business Type</h6>
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  value={typeofBusiness}
                  onChange={(e) => setTypesOFBusiness(e.target.value)}
                  name="country"
                  autoComplete="country-name"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600  sm:text-sm sm:leading-6"
                >
                  <option value="">business Type</option>
                  {types.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <h6>Class of Assets Supply </h6>
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  value={classOfAssets}
                  onChange={(e) => setClassOfAssets(e.target.value)}
                  name="country"
                  autoComplete="country-name"
                  className="block w-full h-12 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600  sm:text-sm sm:leading-6"
                >
                  <option value="">Assets Class</option>
                  {types.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6 mr-40 mb-10">
      <Link to="/allvendors">
        <button
          type="button"
          className="rounded-md h-12 w-24 bg-[#404040] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
        >
          Cancel
        </button>
      </Link>  
        <button
          type="submit"
          className="rounded-md bg-[#961C1E] h-12 w-24 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#761C1D]"
        >
          Save
        </button>
      </div>
    </form>
  );
}
