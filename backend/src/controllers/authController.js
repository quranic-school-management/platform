const authService = require('../services/authService');
const { requireFields, validatePassword } = require('../helpers/validators');

async function login(req, res) {
  const { username, password } = requireFields(req.body, ['username', 'password']);
  const result = await authService.login(username, password);
  res.json({ data: result });
}

async function changePassword(req, res) {
  const { current_password, new_password } = requireFields(req.body, [
    'current_password',
    'new_password',
  ]);
  validatePassword(new_password);
  const result = await authService.changePassword(req.user.id, current_password, new_password);
  res.json({ data: { message: 'Password changed successfully', token: result.token } });
}

async function me(req, res) {
  const user = await authService.getProfile(req.user.id);
  res.json({ data: user });
}

module.exports = { login, changePassword, me };
