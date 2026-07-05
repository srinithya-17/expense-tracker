const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get all categories for the user (their custom + defaults)
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { user: req.user._id };
  if (type) query.type = type;

  const categories = await Category.find(query).sort({ name: 1 });
  res.json({ success: true, data: categories });
});

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon, color } = req.body;
  const category = await Category.create({
    user: req.user._id,
    name,
    type,
    icon,
    color,
    isDefault: false,
  });
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: updated });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (category.isDefault) {
    res.status(400);
    throw new Error('Default categories cannot be deleted');
  }

  const [incomeCount, expenseCount] = await Promise.all([
    Income.countDocuments({ category: category._id }),
    Expense.countDocuments({ category: category._id }),
  ]);
  if (incomeCount > 0 || expenseCount > 0) {
    res.status(400);
    throw new Error('Cannot delete a category that has transactions. Reassign or delete them first.');
  }

  await category.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
