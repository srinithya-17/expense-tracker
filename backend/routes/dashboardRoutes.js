const express = require('express');
const router = express.Router();
const { getDashboardSummary, getAnalysis } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/analysis', getAnalysis);

module.exports = router;
