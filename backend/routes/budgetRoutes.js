const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetHistory,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { budgetRules } = require('../middleware/validators');

router.use(protect);

router.get('/history', getBudgetHistory);
router.route('/').get(getBudgets).post(budgetRules, createBudget);
router.route('/:id').put(updateBudget).delete(deleteBudget);

module.exports = router;
