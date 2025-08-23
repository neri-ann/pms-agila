import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import VenderList from '../../components/VenderList';
import GuideDiv from "../../components/GuideDiv";
import NoticesDiv from "../../components/NoticesDiv";
import SuppliersDiv from "../../components/SuppliersDiv";
import BudgetGuideNotice from "../../components/Budget_Guide_Notice.jsx";
import UserTypeNavbar from "../../components/UserTypeNavbar.jsx";
import CalendarDiv from "../../components/CalendarDiv.jsx";

export default function DepartmentHome() {
    const { id } = useParams();

    const quickActions = [
      {
        title: "Create Requisition",
        description: "Submit a new purchase requisition request",
        icon: DocumentTextIcon,
        link: "/reqForm",
        color: "bg-blue-600 hover:bg-blue-700"
      },
      {
        title: "View Requests",
        description: "Check status of your submitted requests",
        icon: ClipboardDocumentListIcon,
        link: "/ViewForRequest",
        color: "bg-green-600 hover:bg-green-700"
      },
      {
        title: "Budget Planning",
        description: "Manage department budget allocations",
        icon: CurrencyDollarIcon,
        link: "/budget",
        color: "bg-purple-600 hover:bg-purple-700"
      },
      {
        title: "Vendor Directory",
        description: "Browse approved suppliers and vendors",
        icon: UserGroupIcon,
        link: "/vendors",
        color: "bg-orange-600 hover:bg-orange-700"
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <UserTypeNavbar userType="department" />
        
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Department Procurement Portal
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Streamline your procurement process with our comprehensive management system. 
                Submit requests, track progress, and manage budgets efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Get started with the most common tasks</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} transition-colors duration-200`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-semibold text-blue-900">Guidelines</h3>
              </div>
              <p className="text-blue-800 mb-4">
                Follow the comprehensive instructions for operating the procurement management system effectively.
              </p>
              <Link 
                to="/guidelines" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View Guidelines →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Notices</h3>
              </div>
              <p className="text-green-800 mb-4">
                Stay updated with the latest procurement notices and available opportunities for purchasing goods or services.
              </p>
              <Link 
                to="/notices" 
                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
              >
                View Notices →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-semibold text-purple-900">Budget Planning</h3>
              </div>
              <p className="text-purple-800 mb-4">
                Plan and manage procurement budgets to guarantee optimal resource allocation and cost-effective decisions.
              </p>
              <Link 
                to="/budget" 
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                Manage Budget →
              </Link>
            </div>
          </div>
        </div>

        {/* Legacy Components */}
        <VenderList />
        <GuideDiv />
        <NoticesDiv />
        <SuppliersDiv />
        <BudgetGuideNotice />
        <CalendarDiv />
      </div>
    );
}
