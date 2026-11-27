const halaqaService = require('../services/halaqaService');
const { requireFields, requireUUID } = require('../helpers/validators');
const { ROLES } = require('../config/constants');
const { assertCanAccessHalaqa } = require('../helpers/accessControl');

async function create(req, res) {
  const { name } = requireFields(req.body, ['name']);
  const description = req.body.description ? req.body.description.trim() : null;

  const halaqa = await halaqaService.createHalaqa({
    name,
    description,
    created_by: req.user.id,
  });
  res.status(201).json({ data: halaqa });
}

async function list(req, res) {
  const { search, page, limit } = req.query;
  const role = req.user.role;

  let result;
  if (role === ROLES.MUSHRIF) {
    result = await halaqaService.listHalaqat({
      search,
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 50, 100),
    });
  } else if (role === ROLES.TEACHER) {
    result = await halaqaService.listHalaqatForTeacher(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 50, 100),
    });
  } else {
    // Student
    result = await halaqaService.listHalaqatForStudent(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 50, 100),
    });
  }

  res.json({ data: result });
}

async function getById(req, res) {
  requireUUID(req.params.id, 'id');
  await assertCanAccessHalaqa(req.user, req.params.id);
  const halaqa = await halaqaService.getHalaqaDetails(req.params.id);
  res.json({ data: halaqa });
}

async function update(req, res) {
  requireUUID(req.params.id, 'id');
  const { name, description } = req.body;
  const halaqa = await halaqaService.updateHalaqa(req.params.id, { name, description });
  res.json({ data: halaqa });
}

async function remove(req, res) {
  requireUUID(req.params.id, 'id');
  const result = await halaqaService.deleteHalaqa(req.params.id);
  res.json({ data: { message: 'Halaqa deleted', ...result } });
}

module.exports = { create, list, getById, update, remove };
