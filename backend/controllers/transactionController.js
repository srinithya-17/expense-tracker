const asyncHandler = require('express-async-handler');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get unified transaction history (income + expense) with filters
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const {
    search,
    type, // 'income' | 'expense' | undefined (both)
    category,
    startDate,
    endDate,
    sortBy = 'date',
    order = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const baseQuery = { user: req.user._id };
  if (category) baseQuery.category = category;
  if (startDate || endDate) {
    baseQuery.date = {};
    if (startDate) baseQuery.date.$gte = new Date(startDate);
    if (endDate) baseQuery.date.$lte = new Date(endDate);
  }

  let incomes = [];
  let expenses = [];

  if (!type || type === 'income') {
    const q = { ...baseQuery };
    if (search) q.source = { $regex: search, $options: 'i' };
    incomes = await Income.find(q).populate('category', 'name icon color');
    incomes = incomes.map((i) => ({
      _id: i._id,
      type: 'income',
      title: i.source,
      amount: i.amount,
      category: i.category,
      date: i.date,
      notes: i.notes,
    }));
  }

  if (!type || type === 'expense') {
    const q = { ...baseQuery };
    if (search) q.title = { $regex: search, $options: 'i' };
    expenses = await Expense.find(q).populate('category', 'name icon color');
    expenses = expenses.map((e) => ({
      _id: e._id,
      type: 'expense',
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
      notes: e.notes,
      paymentMethod: e.paymentMethod,
      receipt: e.receipt,
    }));
  }

  let all = [...incomes, ...expenses];

  all.sort((a, b) => {
    const dir = order === 'asc' ? 1 : -1;
    if (sortBy === 'amount') return (a.amount - b.amount) * dir;
    return (new Date(a.date) - new Date(b.date)) * dir;
  });

  const total = all.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = all.slice(skip, skip + Number(limit));

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
});

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportCSV = asyncHandler(async (req, res) => {
  const incomes = await Income.find({ user: req.user._id }).populate('category', 'name');
  const expenses = await Expense.find({ user: req.user._id }).populate('category', 'name');

  const rows = [
    ['Type', 'Title/Source', 'Category', 'Amount', 'Date', 'Notes'],
    ...incomes.map((i) => [
      'Income',
      i.source,
      i.category?.name || '',
      i.amount,
      new Date(i.date).toISOString().split('T')[0],
      (i.notes || '').replace(/,/g, ';'),
    ]),
    ...expenses.map((e) => [
      'Expense',
      e.title,
      e.category?.name || '',
      e.amount,
      new Date(e.date).toISOString().split('T')[0],
      (e.notes || '').replace(/,/g, ';'),
    ]),
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  res.send(csv);
});

module.exports = { getTransactions, exportCSV };
