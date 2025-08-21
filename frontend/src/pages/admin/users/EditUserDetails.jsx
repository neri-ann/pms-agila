import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";
 
export default function EditUserModal({ isOpen, onClose, onUserUpdated, userId }) {


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
    const departments = ["DCEE", "DEIE", "MENA", "MME", "IS", "NONE"];

    useEffect(() => {
        if (isOpen && userId) {
            fetchUser();
        }
    }, [isOpen, userId]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/user/preview-user/${userId}`);
            const userData = response.data;
            
            setRole(userData.role);
            setEmail(userData.email);
            setFirstName(userData.firstname);
            setLastName(userData.lastname);
            setPassword(userData.password);
            setUsername(userData.username);
            setDepartment(userData.department);
            setEmpNo(userData.employeeNumber);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('An error occurred while fetching user data');
            console.error(error);
        }
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

    function handleUpdateUsers(e) {
        e.preventDefault();
        
        // Validate fields before updating
        if (!validateFields()) {
            return;
        }

        const newUser = {
            role,
            email,
            firstname,
            lastname,
            password,
            username,
            department,
            employeeNumber,
        };

        setLoading(true);
        axios
            .put(`http://localhost:8000/user/update/${userId}`, newUser)
            .then(() => {
                toast.success('User account is updated successfully');
                setLoading(false);
                onUserUpdated(); // Callback to refresh user list
                onClose(); // Close modal
            })
            .catch((error) => {
                setLoading(false);
                toast.error('Error updating user account');
                console.error(error);
            });
    };

    if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleUpdateUsers} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">Update your role</option>
                  {roles.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.role && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.role}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.department ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">Update your department</option>
                  {departments.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.department && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.department}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.firstname ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.firstname && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.firstname}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.lastname ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.lastname && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.lastname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Employee Number */}
              <div className="space-y-2">
                <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700">
                  Employee Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="employeeNumber"
                  value={employeeNumber}
                  onChange={(e) => setEmpNo(e.target.value)}
                  placeholder="Enter employee number"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.employeeNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.employeeNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.employeeNumber}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.username ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.username && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#961C1E] focus:border-[#961C1E] transition-colors ${
                    validationErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {validationErrors.password}
                  </p>
                )}
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
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}