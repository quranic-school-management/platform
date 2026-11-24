const AppError = require('../helpers/AppError');

/**
 * Factory: returns middleware that allows only the listed roles.
 * Usage:  authorize('mushrif')  or  authorize('mushrif', 'teacher')
 */
module.exports = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
};
