const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = default/global category
    },
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    icon: {
      type: String,
      default: 'FaTag',
    },
    color: {
      type: String,
      default: '#6C5CE7',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
