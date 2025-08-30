// Utility functions for export functionality

// Extract current filters from component state/props for export
export const extractTableFilters = (componentState) => {
  const filters = {};
  
  // Common filter extraction
  if (componentState.searchTerm && componentState.searchTerm.trim()) {
    filters.search = componentState.searchTerm.trim();
  }
  
  if (componentState.selectedYear && componentState.selectedYear !== 'all') {
    filters.year = componentState.selectedYear;
  }
  
  if (componentState.selectedMonth && componentState.selectedMonth !== 'all') {
    filters.month = componentState.selectedMonth;
  }
  
  if (componentState.selectedStatus && componentState.selectedStatus !== 'all') {
    filters.status = componentState.selectedStatus;
  }
  
  if (componentState.selectedDepartment && componentState.selectedDepartment !== 'all') {
    filters.department = componentState.selectedDepartment;
  }
  
  if (componentState.selectedRole && componentState.selectedRole !== 'all') {
    filters.role = componentState.selectedRole;
  }
  
  if (componentState.selectedType && componentState.selectedType !== 'all') {
    filters.type = componentState.selectedType;
  }
  
  if (componentState.selectedAssetClass && componentState.selectedAssetClass !== 'all') {
    filters.assetClass = componentState.selectedAssetClass;
  }
  
  if (componentState.selectedBiddingType && componentState.selectedBiddingType !== 'all') {
    filters.biddingType = componentState.selectedBiddingType;
  }
  
  // Date range filters
  if (componentState.dateRange && componentState.dateRange.startDate) {
    filters.startDate = componentState.dateRange.startDate;
  }
  
  if (componentState.dateRange && componentState.dateRange.endDate) {
    filters.endDate = componentState.dateRange.endDate;
  }
  
  // Boolean filters
  if (componentState.showLowStock !== undefined) {
    filters.lowStock = componentState.showLowStock;
  }
  
  if (componentState.showInactive !== undefined) {
    filters.showInactive = componentState.showInactive;
  }
  
  // Sorting
  if (componentState.sortBy) {
    filters.sort = componentState.sortBy;
  }
  
  if (componentState.sortOrder) {
    filters.sortOrder = componentState.sortOrder;
  }
  
  return filters;
};

// Extract chart-specific filters
export const extractChartFilters = (componentState, chartSpecificFilters = {}) => {
  const baseFilters = extractTableFilters(componentState);
  return { ...baseFilters, ...chartSpecificFilters };
};

// Generate export filename preview
export const generateExportPreview = (module, widgetName, format) => {
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, match => {
    return match === 'T' ? '-' : '';
  });
  const cleanWidgetName = widgetName.replace(/[^a-zA-Z0-9]/g, '');
  return `${module}_${cleanWidgetName}_${timestamp}.${format}`;
};

// Export progress tracking
export const createExportProgress = (onProgress) => {
  let progress = 0;
  const updateProgress = (newProgress) => {
    progress = Math.max(progress, newProgress);
    if (onProgress) onProgress(progress);
  };
  
  return {
    start: () => updateProgress(10),
    preparing: () => updateProgress(25),
    processing: () => updateProgress(50),
    generating: () => updateProgress(75),
    complete: () => updateProgress(100)
  };
};

// Validate export parameters
export const validateExportParams = (endpoint, type, chartType = null) => {
  const errors = [];
  
  if (!endpoint || typeof endpoint !== 'string') {
    errors.push('Invalid endpoint specified');
  }
  
  if (!['table', 'chart'].includes(type)) {
    errors.push('Export type must be either "table" or "chart"');
  }
  
  if (type === 'chart' && !chartType) {
    errors.push('Chart type is required for chart exports');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format filter values for display in export metadata
export const formatFilterValue = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return 'All';
  }
  
  // Format dates
  if (key.includes('Date') && value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  if (key.includes('Date') && typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date) ? value : date.toLocaleDateString();
  }
  
  // Format arrays
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  // Format boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
};

// Create export audit log entry
export const createExportAuditEntry = (module, widget, format, filters, rowCount) => {
  return {
    module,
    widget,
    format: format.toUpperCase(),
    filters,
    rowCount,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

// Handle export errors
export const handleExportError = (error, onError = null) => {
  let errorMessage = 'Export failed. Please try again.';
  
  if (error.response) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Invalid export parameters.';
        break;
      case 401:
        errorMessage = 'You are not authorized to perform this export.';
        break;
      case 403:
        errorMessage = 'You do not have permission to export this data.';
        break;
      case 404:
        errorMessage = 'Export service not found.';
        break;
      case 413:
        errorMessage = 'Dataset too large to export. Try applying filters to reduce the data size.';
        break;
      case 429:
        errorMessage = 'Too many export requests. Please wait before trying again.';
        break;
      case 500:
        errorMessage = 'Server error during export. Please try again later.';
        break;
      default:
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
    }
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Export timeout. The dataset may be too large or the server is busy.';
  } else if (error.name === 'NetworkError') {
    errorMessage = 'Network error. Please check your connection and try again.';
  }
  
  console.error('Export error:', error);
  
  if (onError) {
    onError(errorMessage);
  }
  
  return errorMessage;
};

// Estimate export time based on data size
export const estimateExportTime = (rowCount, format = 'csv') => {
  if (rowCount < 100) return 'Less than 5 seconds';
  if (rowCount < 1000) return '5-15 seconds';
  if (rowCount < 5000) return '15-30 seconds';
  if (rowCount < 10000) return '30-60 seconds';
  
  if (format === 'pdf') {
    return 'Up to 2 minutes'; // PDF takes longer
  }
  
  return 'Up to 1 minute';
};

export default {
  extractTableFilters,
  extractChartFilters,
  generateExportPreview,
  createExportProgress,
  validateExportParams,
  formatFilterValue,
  createExportAuditEntry,
  handleExportError,
  estimateExportTime
};
