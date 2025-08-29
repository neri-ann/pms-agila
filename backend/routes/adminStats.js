const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminStats');

// GET /api/admin/stats
router.get('/stats', getAdminStats);

module.exports = router;