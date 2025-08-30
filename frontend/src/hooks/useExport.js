import { useState } from 'react';
import axios from 'axios';

// Custom hook for handling exports
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Generic export function
  const exportData = async (endpoint, format, queryParams = {}) => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Build query string from params
      const searchParams = new URLSearchParams();
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== null && queryParams[key] !== undefined && queryParams[key] !== '') {
          searchParams.append(key, queryParams[key]);
        }
      });

      const queryString = searchParams.toString();
      const baseURL = 'http://localhost:8000';
      const url = `${baseURL}${endpoint}/${format}${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url, {
        responseType: 'blob', // Important for file downloads
        timeout: 60000 // 60 second timeout for large exports
      });

      // Extract filename from Content-Disposition header
      let filename = `export_${Date.now()}.${format}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], {
        type: response.headers['content-type']
      });

      // Create download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      }, 100);

      return { success: true, filename };

    } catch (error) {
      console.error('Export error:', error);
      let errorMessage = 'Export failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Export endpoint not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error during export. Please try again later.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Export timeout. The dataset may be too large.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setExportError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsExporting(false);
    }
  };

  // Specific export methods
  const exportTableToPDF = (endpoint, queryParams = {}) => {
    return exportData(endpoint, 'pdf', queryParams);
  };

  const exportTableToCSV = (endpoint, queryParams = {}) => {
    return exportData(endpoint, 'csv', queryParams);
  };

  const exportChartToPDF = (endpoint, chartType, queryParams = {}) => {
    return exportData(`${endpoint}/charts/${chartType}`, 'pdf', queryParams);
  };

  const exportChartToCSV = (endpoint, chartType, queryParams = {}) => {
    return exportData(`${endpoint}/charts/${chartType}`, 'csv', queryParams);
  };

  // Clear error
  const clearError = () => setExportError(null);

  return {
    isExporting,
    exportError,
    exportData,
    exportTableToPDF,
    exportTableToCSV,
    exportChartToPDF,
    exportChartToCSV,
    clearError
  };
};

export default useExport;
