const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const incomeRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('source').trim().notEmpty().withMessage('Source is required'),
  body('category').notEmpty().withMessage('Category is required'),
  handleValidation,
];

const expenseRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  handleValidation,
];

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  handleValidation,
];

const budgetRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000 }).withMessage('Year is invalid'),
  handleValidation,
];

module.exports = {
  registerRules,
  loginRules,
  incomeRules,
  expenseRules,
  categoryRules,
  budgetRules,
  handleValidation,
};
