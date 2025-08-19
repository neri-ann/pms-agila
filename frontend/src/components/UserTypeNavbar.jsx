import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import "../pages/Home";
import logo from "../assets/agilalogo2.png";

const UserTypeNavbar = ({ userType }) => {
  // NAVITEMS ARRAY
  const AdminOptions = [
    { link: "Manage Users", path: "/userList" },
    { link: "Manage Vendors", path: "/allvendors" },
    { link: "Items", path: "/AllItem" },
    { link: "Manage Guidance", path: "/ManageGuidance" },
    { link: "Manage Notices", path: "/ManageNotice" },
    { link: "Budget & Plan", path: "/ManageBudget" },
    { link: "Manage Year Plan", path: "/EventPlanner" },
  ];

  const DepartmentOptions = [
    { link: "Purchase Requisition", path: `/reqform` },
    { link: "Requisition Tracker", path: "/ProgressTrack" },
    { link: "Request List", path: "/ViewForRequest" },
  ];

  const procOfficerOptions = [
    { link: "Created Projects", path: "/projectList" },
    { link: "Create New Project", path: "/ProjectCreationForm" },
    {
      link: "Approved Purchase Requisition List ",
      path: "/ApprovedRequestList",
    },
    { link: "Bidding Documents", path: "/biddingDocuments" },
    { link: "Vendors List", path: "/VendorsList" },
    { link: "Invites Bids", path: "/InvitesBids" },
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

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#961C1E] shadow-lg z-40 flex flex-col items-center pt-6">
      <div className="flex justify-center items-center w-full mb-16">
        <img
          src={logo}
          alt="Logo"
          className="w-[140px] h-[80px] object-contain"
        />
      </div>

      <ul className="flex flex-col space-y-6 px-6 w-full">
        {options.map(({ link, path }) => (
          <li key={path}>
            <Link
              to={path}
              className="block no-underline text-white hover:font-bold py-2 px-3 rounded transition-all duration-150"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </aside>

  );
};

export default UserTypeNavbar;
