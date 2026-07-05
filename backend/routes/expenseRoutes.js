const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { expenseRules } = require('../middleware/validators');
const { uploadReceipt } = require('../middleware/upload');

router.use(protect);

router
  .route('/')
  .get(getExpenses)
  .post(uploadReceipt.single('receipt'), expenseRules, createExpense);

router
  .route('/:id')
  .get(getExpense)
  .put(uploadReceipt.single('receipt'), updateExpense)
  .delete(deleteExpense);

module.exports = router;
