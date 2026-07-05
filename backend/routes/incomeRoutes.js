const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');
const { incomeRules } = require('../middleware/validators');

router.use(protect);

router.route('/').get(getIncomes).post(incomeRules, createIncome);
router.route('/:id').get(getIncome).put(updateIncome).delete(deleteIncome);

module.exports = router;
