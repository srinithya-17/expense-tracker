const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { categoryRules } = require('../middleware/validators');

router.use(protect);

router.route('/').get(getCategories).post(categoryRules, createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

module.exports = router;
