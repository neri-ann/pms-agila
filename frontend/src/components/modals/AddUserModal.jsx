import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [employeeNumber, setEmpNo] = useState("");
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const roles = [
    "admin",
    "procurement Officer",
    "Finance officers",
    "department",
    "approver",
    "TECofficer",
  ];
  const departments = ["DEIE", "DCEE", "DMME ", "DCE", "DMNNE", "DIS", "NONE"];

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setRole("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setEmpNo("");
    setDepartment("");
    setUsername("");
    setPassword("");
    setValidationErrors({});
  };

  // Validate the form fields
  const validateFields = () => {
    let errors = {};
    let isValid = true;

    if (!role) {
      errors.role = "Role is required";
      isValid = false;
    }
    if (!department) {
      errors.department = "Department is required";
      isValid = false;
    }
    if (!firstname) {
      errors.firstname = "First name is required";
      isValid = false;
    }
    if (!lastname) {
      errors.lastname = "Last name is required";
      isValid = false;
    }
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid";
      isValid = false;
    }
    if (!employeeNumber) {
      errors.employeeNumber = "Employee number is required";
      isValid = false;
    }
    if (!username) {
      errors.username = "Username is required";
      isValid = false;
    }
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  function handleSaveCreateUsers(e) {
    e.preventDefault();

    // Validate fields before saving
    if (!validateFields()) {
      return;
    }

    const newUser = {
      role,
      email,
      firstname,
      lastname,
      employeeNumber,
      department,
      username,
      password,
    };

    setLoading(true);
    axios
      .post("http://localhost:8000/user/create", newUser)
      .then(() => {
        toast.success("User details successfully added!");
        setLoading(false);
        resetForm();
        onUserAdded(); // Callback to refresh user list
        onClose(); // Close modal
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to create user. Please try again.");
        setLoading(false);
      });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSaveCreateUsers}>
            <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.role ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your role</option>
                    {roles.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.role && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.role}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.department ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your department</option>
                    {departments.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.department && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.firstname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.firstname && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.firstname}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.lastname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.lastname && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastname}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Employee Number */}
                <div>
                  <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Number
                  </label>
                  <input
                    type="text"
                    id="employeeNumber"
                    value={employeeNumber}
                    onChange={(e) => setEmpNo(e.target.value)}
                    placeholder="Enter employee number"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.employeeNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.employeeNumber && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.employeeNumber}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.username ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#961C1E] border border-transparent rounded-md hover:bg-[#761C1D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
