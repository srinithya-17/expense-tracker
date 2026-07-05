const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get budgets for a given month/year (with usage calculated)
// @route   GET /api/budgets?month=&year=
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const budgets = await Budget.find({ user: req.user._id, month, year }).populate(
    'category',
    'name icon color'
  );

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const budgetsWithUsage = await Promise.all(
    budgets.map(async (budget) => {
      const matchQuery = {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate },
      };
      if (budget.category) matchQuery.category = budget.category._id;

      const result = await Expense.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = result.length > 0 ? result[0].total : 0;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining: budget.amount - spent,
        percentage,
        isExceeded: spent > budget.amount,
        isNearLimit: percentage >= budget.alertThreshold && percentage < 100,
      };
    })
  );

  res.json({ success: true, data: budgetsWithUsage });
});

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = asyncHandler(async (req, res) => {
  const { category, amount, month, year, alertThreshold } = req.body;
  const budget = await Budget.create({
    user: req.user._id,
    category: category || null,
    amount,
    month,
    year,
    alertThreshold,
  });
  res.status(201).json({ success: true, data: budget });
});

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }
  const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: updated });
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }
  await budget.deleteOne();
  res.json({ success: true, data: {} });
});

// @desc    Get budget history (all months)
// @route   GET /api/budgets/history
// @access  Private
const getBudgetHistory = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id })
    .populate('category', 'name icon color')
    .sort({ year: -1, month: -1 });
  res.json({ success: true, data: budgets });
});

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetHistory };
