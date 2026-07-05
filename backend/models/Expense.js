const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'wallet', 'other'],
      default: 'cash',
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
    receipt: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
