import express from 'express';

import { authenticate, checkRole } from '../auth/auth.middleware.js';
import { getAdminOverviewController } from './admin.controller.js';

const router = express.Router();

const protect = authenticate;
const adminOnly = checkRole(['Admin', 'ADMIN']);

router.get('/overview', protect, adminOnly, getAdminOverviewController);

export default router;
