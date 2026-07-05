const express = require('express');
const router = express.Router();
const { getTransactions, exportCSV } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTransactions);
router.get('/export/csv', exportCSV);

module.exports = router;
