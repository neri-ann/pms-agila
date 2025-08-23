import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowLeftIcon,
  DocumentIcon 
} from "@heroicons/react/24/outline";
import UserTypeNavbar from "../../components/UserTypeNavbar";
import Breadcrumb from "../../components/Breadcrumb";

// Ensure pdfjs worker is correctly loaded
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ViewFormRequest = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState(null);
  const { requestId } = useParams();
  const navigate = useNavigate();

  // Function to fetch PDF URL based on requestId
  const fetchPdfUrl = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/viewPdf/${requestId}`,
        {
          responseType: "arraybuffer",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setError("Failed to load PDF document");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfUrl();
  }, [requestId]);

  const goBack = () => {
    navigate("/ViewForRequest");
  };

  const goToPreviousPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const goToNextPage = () => {
    setPageNumber(Math.min(numPages, pageNumber + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <UserTypeNavbar userType="department" />
      
      <div className="mb-6">
        <Breadcrumb
          crumbs={[
            { label: "Home", link: "/Home/:id" },
            { label: "Request List", link: "/ViewForRequest" },
            { label: `Request ${requestId}`, link: `/ViewFormRequest/${requestId}` },
          ]}
          selected={(crumb) => console.log(`Selected: ${crumb.label}`)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to List</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-2">
                <DocumentIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Request Document</h1>
                  <p className="text-sm text-gray-600">ID: {requestId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load document</h3>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={fetchPdfUrl}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  className="flex justify-center"
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-sm"
                  />
                </Document>
                
                {/* PDF Controls */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {pageNumber} of {numPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={pageNumber <= 1}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFormRequest;
