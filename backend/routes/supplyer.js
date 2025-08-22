const express = require('express');
const router = express.Router();
const supplyerController = require('../controllers/supplyer');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

// Allow both admin and procurement Officer to create, update, delete
router.post('/create', isAuthenticated, authorizeRoles('admin', 'procurement Officer'), supplyerController.createSupplyer);
router.put('/update/:id', isAuthenticated, authorizeRoles('admin', 'procurement Officer'), supplyerController.updateSupplyer);
router.delete('/delete/:id', isAuthenticated, authorizeRoles('admin', 'procurement Officer'), supplyerController.deleteSupplyer);
router.get('/preview-supplyer/:id', isAuthenticated, supplyerController.previewSupplyer);
// Viewing can remain as is
router.get('/view', isAuthenticated, supplyerController.viewSupplyers);

module.exports = router;