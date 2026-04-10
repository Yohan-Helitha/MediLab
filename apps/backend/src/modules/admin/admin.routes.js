import express from 'express';

import { authenticate, checkRole } from '../auth/auth.middleware.js';
import { getAdminOverviewController, listHealthOfficersController } from './admin.controller.js';

const router = express.Router();

const protect = authenticate;
const adminOnly = checkRole(['Admin', 'ADMIN']);

router.get('/overview', protect, adminOnly, getAdminOverviewController);

// List staff users (HealthOfficer model)
// GET /api/admin/users?role=Admin
router.get('/users', protect, adminOnly, listHealthOfficersController);

export default router;
