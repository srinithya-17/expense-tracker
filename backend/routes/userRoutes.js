const express = require('express');
const router = express.Router();
const { updateProfile, updateAvatar, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', uploadAvatar.single('avatar'), updateAvatar);
router.put('/change-password', changePassword);

module.exports = router;
