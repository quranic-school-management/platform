const router = require('express').Router();
const asyncHandler = require('../helpers/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Public
router.post('/login', asyncHandler(authController.login));

// Authenticated (works even when must_change_password is true)
router.post('/change-password', authMiddleware, asyncHandler(authController.changePassword));
router.get('/me', authMiddleware, asyncHandler(authController.me));

module.exports = router;
