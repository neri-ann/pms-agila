import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

export default function UpdateSupplier() {
  const [username, setUsername] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [contactOfficer, setContactOfficer] = useState("");
  const [contactNumbers1, setContactNumbers1] = useState("");
  const [emails1, setEmails1] = useState("");
  const [typeofBusiness, setTypesOFBusiness] = useState("");
  const [classOfAssets, setClassOfAssets] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const types = [
    { value: "SoleImporter", label: "Sole Importer" },
    { value: "SoleDistributor", label: "Sole Distributor" },
    { value: "LocalAgent", label: "Local Agent" },
    { value: "Contractors", label: "Contractors" },
  ];

  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/supplyer/preview-supplyer/${id}`)
      .then((response) => {
        const data = response.data;
        setUsername(data.username || "");
        setSupplierName(data.supplierName || "");

        // Address: split if needed
        if (data.address) {
          const [street = "", city = "", province = ""] = data.address.split(",").map(s => s.trim());
          setAddressStreet(street);
          setAddressCity(city);
          setAddressProvince(province);
        } else {
          setAddressStreet("");
          setAddressCity("");
          setAddressProvince("");
        }

        // Contact Number: use first if array
        if (Array.isArray(data.contactNumber)) {
          setContactNumbers1(data.contactNumber[0] || "");
        } else {
          setContactNumbers1(data.contactNumber || "");
        }

        // Email: use first if array
        if (Array.isArray(data.email)) {
          setEmails1(data.email[0] || "");
        } else {
          setEmails1(data.email || "");
        }

        setContactOfficer(data.contactOfficer || "");
        setTypesOFBusiness(data.typeofBusiness || "");
        setClassOfAssets(data.classOfAssets || "");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar("An error occurred. Please check the console.", {
          variant: "error",
        });
        console.error(error);
      });
  }, [id, enqueueSnackbar]);

  const validateFields = () => {
    let errors = {};
    let isValid = true;

    if (!username) {
      errors.username = "Username is required";
      isValid = false;
    }
    if (!supplierName) {
      errors.supplierName = "Supplier name is required";
      isValid = false;
    }
    if (!addressStreet || !addressCity || !addressProvince) {
      errors.address = "Full address is required";
      isValid = false;
    }
    if (!contactOfficer) {
      errors.contactOfficer = "Contact officer is required";
      isValid = false;
    }
    if (!contactNumbers1) {
      errors.contactNumbers = "Contact number is required";
      isValid = false;
    } else if (!/^[0-9]+$/.test(contactNumbers1)) {
      errors.contactNumbers = "Contact number must contain only digits";
      isValid = false;
    }
    if (!emails1) {
      errors.emails = "Email address is required";
      isValid = false;
    }
    if (!typeofBusiness) {
      errors.typeofBusiness = "Business type is required";
      isValid = false;
    }
    if (!classOfAssets) {
      errors.classOfAssets = "Class of assets is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleUpdateVendors = (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const UpdateSupplyer = {
      username,
      supplierName,
      addressStreet,
      addressCity,
      addressProvince,
      contactOfficer,
      contactNumbers1,
      emails1,
      typeofBusiness,
      classOfAssets,
    };

    setLoading(true);

    axios
      .put(`http://localhost:8000/supplyer/update/${id}`, UpdateSupplyer)
      .then(() => {
        enqueueSnackbar("Supplier is updated successfully", {
          variant: "success",
        });
        setLoading(false);
        navigate("/allvendors");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar(`Error updating supplier account: ${error.message}`, {
          variant: "error",
        });
        console.error(error);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-75">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Edit Supplier Details</h3>
          <button
            onClick={() => navigate("/allvendors")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form
          onSubmit={handleUpdateVendors}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">

              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.supplierName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                />
                {validationErrors.supplierName && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠ {validationErrors.supplierName}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] ${validationErrors.username
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                />
                {validationErrors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠ {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Address Row: Street, City, Province */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Street */}
                  <input
                    type="text"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Street"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.address
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                      }`}
                  />

                  {/* City */}
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="City"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.address
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                      }`}
                  />

                  {/* Province */}
                  <input
                    type="text"
                    value={addressProvince}
                    onChange={(e) => setAddressProvince(e.target.value)}
                    placeholder="Province"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.address
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                      }`}
                  />
                </div>
                {validationErrors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠ {validationErrors.address}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Contact Officer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Officer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactOfficer}
                      onChange={(e) => setContactOfficer(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.contactOfficer
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        }`}
                    />
                    {validationErrors.contactOfficer && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠ {validationErrors.contactOfficer}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contactNumbers1}
                      onChange={(e) => setContactNumbers1(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.contactNumbers
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        }`}
                    />
                    {validationErrors.contactNumbers && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠ {validationErrors.contactNumbers}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={emails1}
                      onChange={(e) => setEmails1(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.emails
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        }`}
                    />
                    {validationErrors.emails && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠ {validationErrors.emails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={typeofBusiness}
                  onChange={(e) => setTypesOFBusiness(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.typeofBusiness
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                >
                  <option value="">Select Business Type</option>
                  {types.map((t, index) => (
                    <option key={index} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {validationErrors.typeofBusiness && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠ {validationErrors.typeofBusiness}
                  </p>
                )}
              </div>

              {/* Class of Assets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-2 mb-2">
                  Class of Assets Supply <span className="text-red-500">*</span>
                </label>
                <select
                  value={classOfAssets}
                  onChange={(e) => setClassOfAssets(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm ${validationErrors.classOfAssets
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                    }`}
                >
                  <option value="">Select Assets Class</option>
                  {types.map((t, index) => (
                    <option key={index} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {validationErrors.classOfAssets && (
                  <p className="text-red-500 text-xs mt-1">
                    ⚠ {validationErrors.classOfAssets}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-x-4 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/allvendors")}
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
