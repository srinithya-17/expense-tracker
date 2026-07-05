const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Expense = require('../models/Expense');

// @desc    Get all expenses for logged-in user (search, filter, sort, paginate)
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'date',
    order = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { user: req.user._id };

  if (search) query.title = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Expense.find(query)
      .populate('category', 'name icon color')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Expense.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'category',
    'name icon color'
  );
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json({ success: true, data: expense });
});

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const { amount, title, category, paymentMethod, date, notes } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    amount,
    title,
    category,
    paymentMethod,
    date,
    notes,
    receipt: req.file ? `/uploads/receipts/${req.file.filename}` : '',
  });

  const populated = await expense.populate('category', 'name icon color');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  let expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  const updates = { ...req.body };
  if (req.file) {
    // remove old receipt file if present
    if (expense.receipt) {
      const oldPath = path.join(__dirname, '..', expense.receipt);
      fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
    }
    updates.receipt = `/uploads/receipts/${req.file.filename}`;
  }

  expense = await Expense.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('category', 'name icon color');

  res.json({ success: true, data: expense });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.receipt) {
    const filePath = path.join(__dirname, '..', expense.receipt);
    fs.existsSync(filePath) && fs.unlink(filePath, () => {});
  }
  await expense.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };
