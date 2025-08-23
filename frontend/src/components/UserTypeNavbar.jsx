import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiFileText,
  FiBell,
  FiDollarSign,
  FiCalendar,
  FiLogOut,
  FiFolderPlus,
  FiFolder,
  FiCheckSquare,
  FiClipboard,
  FiMail,
  FiEdit3,
  FiActivity,
  FiList,
} from "react-icons/fi";
import "../styles/Navbar.css";
import logo from "../assets/agilalogo2.png";

const UserTypeNavbar = ({ userType, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // NAVITEMS ARRAY
  const AdminOptions = [
    { link: "Dashboard", path: "/adminhome", icon: FiHome },
    { link: "Manage Users", path: "/userList", icon: FiUsers },
    { link: "Manage Vendors", path: "/allvendors", icon: FiShoppingBag },
    { link: "Items", path: "/AllItem", icon: FiPackage },
    { link: "Approver", path: "/ViewForApproval", icon: FiCheckSquare },
    { link: "Manage Guidance", path: "/ManageGuidance", icon: FiFileText },
    { link: "Manage Notices", path: "/ManageNotice", icon: FiBell },
    { link: "Budget & Plan", path: "/ManageBudget", icon: FiDollarSign },
    { link: "Manage Year Plan", path: "/EventPlanner", icon: FiCalendar },
  ];

  const DepartmentOptions = [
    { link: "Purchase Requisition", path: `/reqform`, icon: FiEdit3 },
    { link: "Requisition Tracker", path: "/ProgressTrack", icon: FiActivity },
    { link: "Request List", path: "/ViewForRequest", icon: FiList },
  ];

  const procOfficerOptions = [
    { link: "Dashboard", path: "/procurementhome", icon: FiHome },
    { link: "Created Projects", path: "/projectList", icon: FiFolder },
    {
      link: "Create New Project",
      path: "/ProjectCreationForm",
      icon: FiFolderPlus,
    },
    { link: "Purchase Requisition", path: `/reqform`, icon: FiEdit3 },
    { link: "Requisition Tracker", path: "/ProgressTrack", icon: FiActivity },
    { link: "Request List", path: "/ViewForRequest", icon: FiList },
    {
      link: "Approved Purchase Requisition List ",
      path: "/ApprovedRequestList",
      icon: FiCheckSquare,
    },
    // { link: "Bidding Documents", path: "/biddingDocuments", icon: FiFileText },
    { link: "Vendors List", path: "/VendorsList", icon: FiUsers },
    // { link: "Invites Bids", path: "/InvitesBids", icon: FiMail },
  ];

  const TECofficerOptions = [
    { link: "User Registration", path: "Home" },
    { link: "Vendor Registration", path: "guidelines" },
    { link: "Add Items", path: "notices" },
    { link: "Dashboard", path: "budget" },
    { link: "Manage Documents", path: "vendors" },
    { link: "Budget & Plan", path: "events" },
  ];

  const FinanceOfficersOptions = [
    { link: "User Registration", path: "Home" },
    { link: "Vendor Registration", path: "guidelines" },
    { link: "Add Items", path: "notices" },
    { link: "Dashboard", path: "budget" },
    { link: "Manage Documents", path: "vendors" },
    { link: "Budget & Plan", path: "events" },
  ];

  const ApproverOptions = [
    { link: "Pending Approval list", path: "/ViewForApproval" },
  ];

  // Choose options based on userType
  const options =
    userType === "admin"
      ? AdminOptions
      : userType === "department"
      ? DepartmentOptions
      : userType === "TECofficer"
      ? TECofficerOptions
      : userType === "procurement Officer"
      ? procOfficerOptions
      : userType === "Finance officers"
      ? FinanceOfficersOptions
      : userType === "approver"
      ? ApproverOptions
      : [];

  // Handle logout functionality
  const handleLogout = async () => {
    console.log("Logout button clicked");
    console.log("onLogout function:", onLogout);

    try {
      // Clear any stored authentication data
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('isAuthenticated');
      
      // Call the logout function from parent (App.js) if available
      if (onLogout) {
        console.log("Calling onLogout function");
        await onLogout();
      } else {
        console.log("onLogout function is not available, proceeding with manual logout");
      }
      
      // Force navigation to login page
      navigate("/loginpage");
      
      // Additional fallback - force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/loginpage";
      }, 100);
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback logout
      localStorage.clear();
      window.location.href = "/loginpage";
    }
  };

  return (
    <aside className="fixed top-4 left-4 h-[calc(100vh-2rem)] w-80 bg-[#961C1E] shadow-2xl z-40 flex flex-col items-center pt-6 rounded-2xl">
      <div className="flex justify-center items-center w-full mt-6 mb-12">
        <img
          src={logo}
          alt="Logo"
          className="w-[170px] h-[80px] object-contain"
        />
      </div>

      <ul className="flex flex-col space-y-3 px-6 w-full">
        {options.map(({ link, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center space-x-3 no-underline text-white hover:bg-white hover:bg-opacity-10 py-3 px-4 rounded-lg transition-all duration-200 group ${
                  isActive ? "border-l-4 border-white font-semibold" : ""
                }`}
              >
                {Icon && (
                  <Icon className="text-xl group-hover:scale-110 transition-transform duration-200" />
                )}
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {link}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className="mt-auto mb-6 px-6 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full text-white hover:bg-white hover:bg-opacity-10 py-3 px-4 rounded-lg transition-all duration-200 group"
        >
          <FiLogOut className="text-xl group-hover:scale-110 transition-transform duration-200" />
          <span className="group-hover:translate-x-1 transition-transform duration-200">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default UserTypeNavbar;
