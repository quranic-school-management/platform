const userService = require('../services/userService');
const { requireFields, requireEnum, requireUUID, requireDate } = require('../helpers/validators');
const { ALL_ROLES } = require('../config/constants');

async function create(req, res) {
  const { full_name, role, date_of_birth } = requireFields(req.body, [
    'full_name',
    'role',
    'date_of_birth',
  ]);
  requireEnum(role, ALL_ROLES, 'role');
  requireDate(date_of_birth, 'date_of_birth');

  const username = req.body.username
    ? req.body.username.trim().toLowerCase()
    : undefined;

  const result = await userService.createUser({ full_name, role, username, date_of_birth });
  res.status(201).json({ data: result });
}

async function list(req, res) {
  const { role, is_active, search, page, limit } = req.query;
  const result = await userService.listUsers({
    role,
    is_active: is_active === undefined ? undefined : is_active === 'true',
    search,
    page: parseInt(page, 10) || 1,
    limit: Math.min(parseInt(limit, 10) || 50, 100),
  });
  res.json({ data: result });
}

async function getById(req, res) {
  requireUUID(req.params.id, 'id');
  const user = await userService.getUserById(req.params.id);
  res.json({ data: user });
}

async function update(req, res) {
  requireUUID(req.params.id, 'id');
  const { full_name, role, is_active, date_of_birth } = req.body;
  if (role !== undefined) requireEnum(role, ALL_ROLES, 'role');
  if (date_of_birth !== undefined && date_of_birth !== null) {
    requireDate(date_of_birth, 'date_of_birth');
  }

  const user = await userService.updateUser(req.params.id, {
    full_name,
    role,
    is_active,
    date_of_birth,
  });
  res.json({ data: user });
}

async function deactivate(req, res) {
  requireUUID(req.params.id, 'id');
  const result = await userService.deleteUser(req.params.id);
  res.json({ data: { message: 'User deleted', ...result } });
}

async function resetPassword(req, res) {
  requireUUID(req.params.id, 'id');
  const result = await userService.resetPassword(req.params.id);
  res.json({ data: result });
}

module.exports = { create, list, getById, update, deactivate, resetPassword };
