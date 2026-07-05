const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get dashboard summary (totals, budget progress, recent transactions)
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [totalIncomeAgg, totalExpenseAgg, monthIncomeAgg, monthExpenseAgg] = await Promise.all([
    Income.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalIncome = totalIncomeAgg[0]?.total || 0;
  const totalExpenses = totalExpenseAgg[0]?.total || 0;
  const monthIncome = monthIncomeAgg[0]?.total || 0;
  const monthExpenses = monthExpenseAgg[0]?.total || 0;

  const overallBudget = await Budget.findOne({ user: userId, category: null, month, year });
  const monthlyBudgetAmount = overallBudget ? overallBudget.amount : req.user.monthlyBudget || 0;
  const remainingBudget = monthlyBudgetAmount - monthExpenses;
  const budgetProgress = monthlyBudgetAmount > 0 ? Math.round((monthExpenses / monthlyBudgetAmount) * 100) : 0;

  const [recentIncomes, recentExpenses] = await Promise.all([
    Income.find({ user: userId }).populate('category', 'name icon color').sort({ date: -1 }).limit(5),
    Expense.find({ user: userId }).populate('category', 'name icon color').sort({ date: -1 }).limit(5),
  ]);

  const recentTransactions = [
    ...recentIncomes.map((i) => ({
      _id: i._id,
      type: 'income',
      title: i.source,
      amount: i.amount,
      category: i.category,
      date: i.date,
    })),
    ...recentExpenses.map((e) => ({
      _id: e._id,
      type: 'expense',
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  res.json({
    success: true,
    data: {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      monthIncome,
      monthExpenses,
      monthlyBudget: monthlyBudgetAmount,
      remainingBudget,
      budgetProgress,
      recentTransactions,
    },
  });
});

// @desc    Get analysis / chart data
// @route   GET /api/dashboard/analysis?range=6m
// @access  Private
const getAnalysis = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const monthsBack = Number(req.query.months) || 6;

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  // Monthly trends (income vs expense per month)
  const [incomeByMonth, expenseByMonth] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: rangeStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Category-wise spending (expense)
  const categorySpending = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: rangeStart } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', color: '$category.color', icon: '$category.icon', total: 1 } },
    { $sort: { total: -1 } },
  ]);

  // Weekly trend (last 8 weeks) for expenses
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const weeklyExpenses = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: { week: { $week: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  // Build a unified monthly array with month labels
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthMap = {};
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthMap[key] = { month: monthNames[d.getMonth()], year: d.getFullYear(), income: 0, expense: 0 };
  }
  incomeByMonth.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthMap[key]) monthMap[key].income = item.total;
  });
  expenseByMonth.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthMap[key]) monthMap[key].expense = item.total;
  });

  const monthlyTrends = Object.values(monthMap).map((m) => ({
    ...m,
    savings: m.income - m.expense,
  }));

  const totalIncomeInRange = monthlyTrends.reduce((s, m) => s + m.income, 0);
  const totalExpenseInRange = monthlyTrends.reduce((s, m) => s + m.expense, 0);

  res.json({
    success: true,
    data: {
      monthlyTrends,
      categorySpending,
      weeklyExpenses: weeklyExpenses.map((w, idx) => ({
        week: `W${idx + 1}`,
        total: w.total,
      })),
      savingsAnalysis: {
        totalIncome: totalIncomeInRange,
        totalExpense: totalExpenseInRange,
        totalSavings: totalIncomeInRange - totalExpenseInRange,
        savingsRate:
          totalIncomeInRange > 0
            ? Math.round(((totalIncomeInRange - totalExpenseInRange) / totalIncomeInRange) * 100)
            : 0,
      },
    },
  });
});

module.exports = { getDashboardSummary, getAnalysis };
