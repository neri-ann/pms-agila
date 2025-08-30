const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');

// Models
const User = require('../Models/user');
const Vendor = require('../Models/supplyer');
const Budget = require('../Models/budget');
const ProcRequest = require('../Models/procReqest');
const Item = require('../Models/item');
const ProcProject = require('../Models/ProcProject');

// === ADMIN MODULE EXPORTS ===

// Export Users Table
router.get('/admin/users/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, department, role } = req.query;

    // Build query based on filters
    let query = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { employeeNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    const columns = [
      { key: 'employeeNumber', title: 'Employee Number' },
      { key: 'firstname', title: 'First Name' },
      { key: 'lastname', title: 'Last Name' },
      { key: 'email', title: 'Email' },
      { key: 'role', title: 'Role' },
      { key: 'department', title: 'Department' },
      { key: 'username', title: 'Username' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    const metadata = ExportController.generateMetadata(req, 'Users Table', 'User Management System');
    const filename = ExportController.generateFilename('admin', 'usersTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(users, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(users, columns, metadata, filename, 'Users Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    // Log the export action
    await ExportController.logExportAction(req, 'admin', 'users_table', format, users.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Users export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Export Vendors Table
router.get('/admin/vendors/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, status, type } = req.query;

    // Build query based on filters
    let query = {};
    if (search) {
      query.$or = [
        { supplierId: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') {
      query.isDeleted = false;
    } else if (status === 'inactive') {
      query.isDeleted = true;
    }
    if (type && type !== 'all') {
      query.supplierType = type;
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });
    
    const columns = [
      { key: 'supplierId', title: 'Supplier ID' },
      { key: 'companyName', title: 'Company Name' },
      { key: 'supplierType', title: 'Type' },
      { key: 'contactPerson', title: 'Contact Person' },
      { key: 'email', title: 'Email' },
      { key: 'phoneNumber', title: 'Phone' },
      { key: 'address', title: 'Address' },
      { key: 'isDeleted', title: 'Status' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    // Transform data for export
    const transformedVendors = vendors.map(vendor => ({
      ...vendor.toObject(),
      isDeleted: vendor.isDeleted ? 'Inactive' : 'Active'
    }));

    const metadata = ExportController.generateMetadata(req, 'Vendors Table', 'Vendor Management System');
    const filename = ExportController.generateFilename('admin', 'vendorsTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(transformedVendors, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(transformedVendors, columns, metadata, filename, 'Vendors Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'admin', 'vendors_table', format, vendors.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Vendors export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Export Budget Allocations Table
router.get('/admin/budget-allocations/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, year, month, department } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { budgetId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } }
      ];
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    // Date filtering
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        if (month && month !== 'all') {
          const monthInt = parseInt(month) - 1;
          query.createdAt = {
            $gte: new Date(yearInt, monthInt, 1),
            $lt: new Date(yearInt, monthInt + 1, 1)
          };
        } else {
          query.createdAt = {
            $gte: new Date(yearInt, 0, 1),
            $lt: new Date(yearInt + 1, 0, 1)
          };
        }
      }
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    
    const columns = [
      { key: 'budgetId', title: 'Budget ID' },
      { key: 'department', title: 'Department' },
      { key: 'purpose', title: 'Purpose' },
      { key: 'allocatedAmount', title: 'Allocated Amount' },
      { key: 'usedAmount', title: 'Used Amount' },
      { key: 'remainingAmount', title: 'Remaining Amount' },
      { key: 'status', title: 'Status' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    const metadata = ExportController.generateMetadata(req, 'Budget Allocations Table', 'Budget Management System');
    const filename = ExportController.generateFilename('admin', 'budgetAllocationsTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(budgets, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(budgets, columns, metadata, filename, 'Budget Allocations Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'admin', 'budget_allocations_table', format, budgets.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Budget allocations export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// === PROCUREMENT OFFICER MODULE EXPORTS ===

// Export Purchase Requisitions Table
router.get('/po/purchase-requisitions/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, status, department, year, month } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    // Date filtering
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        if (month && month !== 'all') {
          const monthInt = parseInt(month) - 1;
          query.createdAt = {
            $gte: new Date(yearInt, monthInt, 1),
            $lt: new Date(yearInt, monthInt + 1, 1)
          };
        } else {
          query.createdAt = {
            $gte: new Date(yearInt, 0, 1),
            $lt: new Date(yearInt + 1, 0, 1)
          };
        }
      }
    }

    const requests = await ProcRequest.find(query).sort({ createdAt: -1 });
    
    const columns = [
      { key: 'requestId', title: 'Request ID' },
      { key: 'contactPerson', title: 'Requestor' },
      { key: 'department', title: 'Department' },
      { key: 'faculty', title: 'Faculty' },
      { key: 'purpose', title: 'Purpose' },
      { key: 'status', title: 'Status' },
      { key: 'totalAmount', title: 'Total Amount' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    const metadata = ExportController.generateMetadata(req, 'Purchase Requisitions Table', 'Procurement Management System');
    const filename = ExportController.generateFilename('po', 'purchaseRequisitionsTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(requests, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(requests, columns, metadata, filename, 'Purchase Requisitions Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'po', 'purchase_requisitions_table', format, requests.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Purchase requisitions export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Export Items Table
router.get('/po/items/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, assetClass, lowStock, year, month } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { AssetsClass: { $regex: search, $options: 'i' } },
        { AssetsSubClass: { $regex: search, $options: 'i' } }
      ];
    }
    if (assetClass && assetClass !== 'all') {
      query.AssetsClass = assetClass;
    }
    if (lowStock === 'true') {
      query.stockLevel = { $lt: 10 }; // Assuming low stock threshold is 10
    }

    // Date filtering
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        if (month && month !== 'all') {
          const monthInt = parseInt(month) - 1;
          query.createdAt = {
            $gte: new Date(yearInt, monthInt, 1),
            $lt: new Date(yearInt, monthInt + 1, 1)
          };
        } else {
          query.createdAt = {
            $gte: new Date(yearInt, 0, 1),
            $lt: new Date(yearInt + 1, 0, 1)
          };
        }
      }
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    
    const columns = [
      { key: 'itemName', title: 'Item Name' },
      { key: 'AssetsClass', title: 'Asset Class' },
      { key: 'AssetsSubClass', title: 'Asset Sub Class' },
      { key: 'description', title: 'Description' },
      { key: 'stockLevel', title: 'Stock Level' },
      { key: 'unitPrice', title: 'Unit Price' },
      { key: 'supplier', title: 'Supplier' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    const metadata = ExportController.generateMetadata(req, 'Items Table', 'Item Management System');
    const filename = ExportController.generateFilename('po', 'itemsTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(items, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(items, columns, metadata, filename, 'Items Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'po', 'items_table', format, items.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Items export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// Export Projects Table
router.get('/po/projects/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { search, biddingType, status, year, month } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { projectId: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (biddingType && biddingType !== 'all') {
      query.biddingType = biddingType;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date filtering
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        if (month && month !== 'all') {
          const monthInt = parseInt(month) - 1;
          query.createdAt = {
            $gte: new Date(yearInt, monthInt, 1),
            $lt: new Date(yearInt, monthInt + 1, 1)
          };
        } else {
          query.createdAt = {
            $gte: new Date(yearInt, 0, 1),
            $lt: new Date(yearInt + 1, 0, 1)
          };
        }
      }
    }

    const projects = await ProcProject.find(query).sort({ createdAt: -1 });
    
    const columns = [
      { key: 'projectId', title: 'Project ID' },
      { key: 'projectName', title: 'Project Name' },
      { key: 'biddingType', title: 'Bidding Type' },
      { key: 'description', title: 'Description' },
      { key: 'estimatedValue', title: 'Estimated Value' },
      { key: 'status', title: 'Status' },
      { key: 'startDate', title: 'Start Date' },
      { key: 'endDate', title: 'End Date' },
      { key: 'createdAt', title: 'Created Date' }
    ];

    const metadata = ExportController.generateMetadata(req, 'Projects Table', 'Project Management System');
    const filename = ExportController.generateFilename('po', 'projectsTable', format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportTableToCSV(projects, columns, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportTableToPDF(projects, columns, metadata, filename, 'Projects Report');
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'po', 'projects_table', format, projects.length);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Projects export error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// === CHART EXPORTS ===

// Export Admin Dashboard Charts
router.get('/admin/charts/:chartType/:format', async (req, res) => {
  try {
    const { chartType, format } = req.params;
    
    // Get chart data based on chartType
    let chartData, title;
    const metadata = ExportController.generateMetadata(req, `${chartType} Chart`, 'Admin Dashboard');
    
    switch (chartType) {
      case 'vendor-status':
        const activeVendors = await Vendor.countDocuments({ isDeleted: false });
        const inactiveVendors = await Vendor.countDocuments({ isDeleted: true });
        chartData = [
          { name: 'Active', value: activeVendors, percentage: Math.round((activeVendors / (activeVendors + inactiveVendors)) * 100) },
          { name: 'Inactive', value: inactiveVendors, percentage: Math.round((inactiveVendors / (activeVendors + inactiveVendors)) * 100) }
        ];
        title = 'Vendor Status Distribution';
        break;

      case 'budget-spending':
        // Build date filter for budget data
        let budgetDateFilter = {};
        if (req.query.year && req.query.year !== 'all') {
          const year = parseInt(req.query.year);
          if (!isNaN(year)) {
            if (req.query.month && req.query.month !== 'all') {
              const months = req.query.month.split(',').map(m => parseInt(m)).filter(m => !isNaN(m));
              budgetDateFilter = {
                $expr: {
                  $and: [
                    { $eq: [{ $year: "$createdAt" }, year] },
                    { $in: [{ $month: "$createdAt" }, months] }
                  ]
                }
              };
            } else {
              budgetDateFilter = {
                createdAt: {
                  $gte: new Date(year, 0, 1),
                  $lt: new Date(year + 1, 0, 1)
                }
              };
            }
          }
        }

        const budgetData = await Budget.aggregate([
          { $match: budgetDateFilter },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
              },
              allocation: { $sum: "$allocatedAmount" },
              used: { $sum: "$usedAmount" },
              available: { $sum: "$remainingAmount" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        chartData = budgetData.map(item => ({
          month: monthNames[item._id.month - 1] + ' ' + item._id.year,
          allocation: item.allocation || 0,
          used: item.used || 0,
          available: item.available || 0,
          usedPercentage: item.allocation > 0 ? Math.round((item.used / item.allocation) * 100) : 0,
          availablePercentage: item.allocation > 0 ? Math.round((item.available / item.allocation) * 100) : 0
        }));
        title = 'Budget vs Spending Analysis';
        break;
        
      case 'monthly-requests':
        const monthlyData = await ProcRequest.aggregate([
          {
            $group: {
              _id: { 
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        chartData = monthlyData.map(item => ({
          month: item._id.month,
          year: item._id.year,
          count: item.count,
          monthYear: `${item._id.month}/${item._id.year}`
        }));
        title = 'Monthly Purchase Requests Trend';
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }

    const filename = ExportController.generateFilename('admin', `${chartType}Chart`, format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportChartToCSV(chartData, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportChartToPDF(chartData, metadata, filename, title, chartType);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'admin', `${chartType}_chart`, format, Array.isArray(chartData) ? chartData.length : 1);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('Chart export error:', error);
    res.status(500).json({ error: 'Chart export failed', details: error.message });
  }
});

// Export PO Dashboard Charts
router.get('/po/charts/:chartType/:format', async (req, res) => {
  try {
    const { chartType, format } = req.params;
    const { year, month } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        if (month && month !== 'all') {
          const monthInt = parseInt(month) - 1;
          dateFilter.createdAt = {
            $gte: new Date(yearInt, monthInt, 1),
            $lt: new Date(yearInt, monthInt + 1, 1)
          };
        } else {
          dateFilter.createdAt = {
            $gte: new Date(yearInt, 0, 1),
            $lt: new Date(yearInt + 1, 0, 1)
          };
        }
      }
    }
    
    let chartData, title;
    const metadata = ExportController.generateMetadata(req, `${chartType} Chart`, 'Procurement Officer Dashboard');
    
    switch (chartType) {
      case 'request-status':
        chartData = await ProcRequest.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        title = 'Request Status Distribution';
        break;
        
      case 'items-by-class':
        chartData = await Item.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$AssetsClass", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        title = 'Items by Asset Class';
        break;
        
      case 'suppliers-by-type':
        chartData = await Vendor.aggregate([
          { $match: { isDeleted: false, ...dateFilter } },
          { $group: { _id: "$supplierType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        title = 'Suppliers by Type';
        break;

      case 'monthly-requests':
        const monthlyRequestsData = await ProcRequest.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: { 
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        chartData = monthlyRequestsData.map(item => ({
          month: monthNames[item._id.month - 1],
          year: item._id.year,
          count: item.count,
          monthYear: `${monthNames[item._id.month - 1]} ${item._id.year}`
        }));
        title = 'Monthly Purchase Requests Trend';
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }

    const filename = ExportController.generateFilename('po', `${chartType}Chart`, format);

    let result;
    if (format === 'csv') {
      result = await ExportController.exportChartToCSV(chartData, metadata, filename);
    } else if (format === 'pdf') {
      result = await ExportController.exportChartToPDF(chartData, metadata, filename, title, chartType);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    await ExportController.logExportAction(req, 'po', `${chartType}_chart`, format, Array.isArray(chartData) ? chartData.length : 1);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`
    });
    
    res.send(result.content);

  } catch (error) {
    console.error('PO chart export error:', error);
    res.status(500).json({ error: 'Chart export failed', details: error.message });
  }
});

module.exports = router;
