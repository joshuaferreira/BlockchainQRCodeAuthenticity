const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// POST /api/scans - Log a new scan
router.post('/', scanController.logScan);

// GET /api/scans - Get all scans (with filters)
router.get('/', scanController.getAllScans);

// GET /api/scans/analytics - Get fraud analytics
router.get('/analytics', scanController.getFraudAnalytics);

// GET /api/scans/nearby - Get scans near location
router.get('/nearby', scanController.getScansNearLocation);

// GET /api/scans/suspicious - Get suspicious products
router.get('/suspicious', scanController.getSuspiciousProducts);

module.exports = router;