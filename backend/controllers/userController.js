const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// @desc    Update profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, currency, theme, language, monthlyBudget, notificationPreferences } = req.body;

  if (name) user.name = name;
  if (currency) user.currency = currency;
  if (theme) user.theme = theme;
  if (language) user.language = language;
  if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
  if (notificationPreferences) {
    user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
  }

  await user.save();
  res.json({ success: true, data: user });
});

// @desc    Upload / change avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }
  const user = await User.findById(req.user._id);

  if (user.avatar) {
    const oldPath = path.join(__dirname, '..', user.avatar);
    fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
  }

  user.avatar = `/uploads/avatars/${req.file.filename}`;
  await user.save();
  res.json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { updateProfile, updateAvatar, changePassword };
