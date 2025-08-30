const express = require('express');
const { getPOStats } = require('../controllers/poStats');
const router = express.Router();

// GET /api/po/stats - Get Procurement Officer dashboard statistics
router.get('/stats', getPOStats);

module.exports = router;
