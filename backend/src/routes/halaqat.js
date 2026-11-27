const router = require('express').Router();
const asyncHandler = require('../helpers/asyncHandler');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');
const halaqaController = require('../controllers/halaqaController');
const enrollmentController = require('../controllers/enrollmentController');

// ── Halaqa CRUD ─────────────────────────────────────────────────
// GET /api/halaqat  — all roles can list (filtered by role in controller)
router.get('/', asyncHandler(halaqaController.list));

// GET /api/halaqat/:id  — all roles can view details
router.get('/:id', asyncHandler(halaqaController.getById));

// POST / PUT / DELETE — Mushrif only
router.post('/',    authorize(ROLES.MUSHRIF), asyncHandler(halaqaController.create));
router.put('/:id',  authorize(ROLES.MUSHRIF), asyncHandler(halaqaController.update));
router.delete('/:id', authorize(ROLES.MUSHRIF), asyncHandler(halaqaController.remove));

// ── Teacher assignments (Mushrif only) ──────────────────────────
router.get('/:halaqaId/teachers',              asyncHandler(enrollmentController.listTeachers));
router.post('/:halaqaId/teachers',             authorize(ROLES.MUSHRIF), asyncHandler(enrollmentController.assignTeacher));
router.delete('/:halaqaId/teachers/:teacherId', authorize(ROLES.MUSHRIF), asyncHandler(enrollmentController.removeTeacher));

// ── Student enrollments (Mushrif only) ──────────────────────────
router.get('/:halaqaId/students',              asyncHandler(enrollmentController.listStudents));
router.post('/:halaqaId/students',             authorize(ROLES.MUSHRIF), asyncHandler(enrollmentController.enrollStudent));
router.post('/:halaqaId/students/bulk',        authorize(ROLES.MUSHRIF), asyncHandler(enrollmentController.bulkEnroll));
router.delete('/:halaqaId/students/:studentId', authorize(ROLES.MUSHRIF), asyncHandler(enrollmentController.withdrawStudent));

module.exports = router;
