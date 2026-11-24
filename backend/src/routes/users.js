const router = require('express').Router();
const asyncHandler = require('../helpers/asyncHandler');
const userController = require('../controllers/userController');

// All routes in this file are already guarded by:
//   authMiddleware  →  requirePasswordChanged  →  authorize('mushrif')
// (applied in app.js)

router.post('/',                     asyncHandler(userController.create));
router.get('/',                      asyncHandler(userController.list));
router.get('/:id',                   asyncHandler(userController.getById));
router.put('/:id',                   asyncHandler(userController.update));
router.delete('/:id',                asyncHandler(userController.deactivate));
router.post('/:id/reset-password',   asyncHandler(userController.resetPassword));

module.exports = router;
