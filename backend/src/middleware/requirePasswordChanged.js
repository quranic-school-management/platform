const AppError = require('../helpers/AppError');

/**
 * Blocks access when the user still has the default password.
 * Place after authMiddleware on routes that must not be reachable
 * until the password has been changed.
 */
module.exports = (req, _res, next) => {
  if (req.user && req.user.must_change_password) {
    throw new AppError(
      'You must change your default password before accessing this resource',
      403,
    );
  }
  next();
};
