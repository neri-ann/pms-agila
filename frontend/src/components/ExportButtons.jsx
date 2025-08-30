import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useExport } from '../hooks/useExport';

// Reusable Export Buttons Component
const ExportButtons = ({ 
  endpoint, 
  queryParams = {},
  type = 'table', // 'table' or 'chart'
  chartType = null, // Required for chart exports
  className = '',
  buttonSize = 'sm', // 'xs', 'sm', 'md', 'lg'
  showLabels = true,
  onExportStart = null,
  onExportComplete = null,
  onExportError = null
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { 
    isExporting, 
    exportError, 
    exportTableToPDF, 
    exportTableToCSV,
    exportChartToPDF,
    exportChartToCSV,
    clearError 
  } = useExport();

  // Button size configurations
  const sizeConfigs = {
    xs: {
      button: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      dropdown: 'min-w-32'
    },
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4',
      dropdown: 'min-w-36'
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'h-5 w-5',
      dropdown: 'min-w-40'
    },
    lg: {
      button: 'px-6 py-3 text-base',
      icon: 'h-6 w-6',
      dropdown: 'min-w-48'
    }
  };

  const config = sizeConfigs[buttonSize];

  const handleExport = async (format) => {
    setShowDropdown(false);
    clearError();
    
    if (onExportStart) onExportStart(format);

    let result;
    try {
      if (type === 'table') {
        result = format === 'pdf' 
          ? await exportTableToPDF(endpoint, queryParams)
          : await exportTableToCSV(endpoint, queryParams);
      } else if (type === 'chart' && chartType) {
        result = format === 'pdf'
          ? await exportChartToPDF(endpoint, chartType, queryParams)
          : await exportChartToCSV(endpoint, chartType, queryParams);
      } else {
        throw new Error('Invalid export configuration');
      }

      if (result.success) {
        if (onExportComplete) {
          onExportComplete(format, result.filename);
        }
      } else {
        if (onExportError) {
          onExportError(result.error);
        }
      }
    } catch (error) {
      if (onExportError) {
        onExportError(error.message);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Single Export Button (when not showing dropdown) */}
      {!showDropdown && (
        <div className="flex space-x-1">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className={`${config.button} bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-md transition-colors duration-200 flex items-center space-x-1`}
            title="Export to PDF"
          >
            <DocumentArrowDownIcon className={config.icon} />
            {showLabels && <span>PDF</span>}
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className={`${config.button} bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors duration-200 flex items-center space-x-1`}
            title="Export to CSV"
          >
            <DocumentTextIcon className={config.icon} />
            {showLabels && <span>CSV</span>}
          </button>

          <button
            onClick={() => setShowDropdown(true)}
            className={`${config.button} bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center`}
            title="More export options"
          >
            <ChevronDownIcon className={config.icon} />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className={`absolute right-0 mt-1 ${config.dropdown} bg-white rounded-md shadow-lg border border-gray-200 z-20`}>
            <div className="py-1">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4 text-red-600" />
                <span>Export to PDF</span>
                {isExporting && <span className="ml-auto text-xs text-gray-400">...</span>}
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <DocumentTextIcon className="h-4 w-4 text-green-600" />
                <span>Export to CSV</span>
                {isExporting && <span className="ml-auto text-xs text-gray-400">...</span>}
              </button>

              <hr className="my-1 border-gray-200" />
              
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Export Error Toast */}
      {exportError && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-md z-20 min-w-64">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Export Failed</h4>
              <p className="text-sm text-red-600 mt-1">{exportError}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isExporting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-md flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span>Exporting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Export Buttons (icon only)
export const CompactExportButtons = (props) => (
  <ExportButtons 
    {...props} 
    showLabels={false} 
    buttonSize="xs"
    className={`${props.className || ''}`}
  />
);

// Large Export Buttons
export const LargeExportButtons = (props) => (
  <ExportButtons 
    {...props} 
    buttonSize="lg"
    className={`${props.className || ''}`}
  />
);

export default ExportButtons;
