const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0, 'Amount cannot be negative'],
    },
    source: {
      type: String,
      required: [true, 'Please add an income source'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

IncomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', IncomeSchema);
