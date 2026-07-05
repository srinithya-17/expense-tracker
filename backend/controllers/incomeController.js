const asyncHandler = require('express-async-handler');
const Income = require('../models/Income');

// @desc    Get all income entries for logged-in user (search, filter, sort, paginate)
// @route   GET /api/income
// @access  Private
const getIncomes = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    startDate,
    endDate,
    sortBy = 'date',
    order = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.source = { $regex: search, $options: 'i' };
  }
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Income.find(query)
      .populate('category', 'name icon color')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Income.countDocuments(query),
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

// @desc    Get single income
// @route   GET /api/income/:id
// @access  Private
const getIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'category',
    'name icon color'
  );
  if (!income) {
    res.status(404);
    throw new Error('Income entry not found');
  }
  res.json({ success: true, data: income });
});

// @desc    Create income
// @route   POST /api/income
// @access  Private
const createIncome = asyncHandler(async (req, res) => {
  const { amount, source, category, date, notes } = req.body;
  const income = await Income.create({
    user: req.user._id,
    amount,
    source,
    category,
    date,
    notes,
  });
  const populated = await income.populate('category', 'name icon color');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = asyncHandler(async (req, res) => {
  let income = await Income.findOne({ _id: req.params.id, user: req.user._id });
  if (!income) {
    res.status(404);
    throw new Error('Income entry not found');
  }
  income = await Income.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name icon color');
  res.json({ success: true, data: income });
});

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
  if (!income) {
    res.status(404);
    throw new Error('Income entry not found');
  }
  await income.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = { getIncomes, getIncome, createIncome, updateIncome, deleteIncome };
