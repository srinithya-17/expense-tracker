const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null = overall monthly budget
    },
    amount: {
      type: Number,
      required: [true, 'Please add a budget amount'],
      min: 0,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    alertThreshold: {
      type: Number, // percentage e.g. 80
      default: 80,
    },
  },
  { timestamps: true }
);

BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
