import express from "express";
import * as testController from "./test.controller.js";
import { authenticate, isStaff, handleValidationErrors } from "../auth/auth.middleware.js";
import {
	createTestTypeValidation,
	updateTestTypeValidation,
	idParamValidation,
} from "./test.validation.js";

const router = express.Router();

// CRUD Routes (protected for staff)
router.post(
	"/",
	authenticate,
	isStaff,
	createTestTypeValidation,
	handleValidationErrors,
	testController.createTestType
);
router.get("/", testController.getAllTestTypes);
router.get("/:id", testController.getTestTypeById);
router.put(
	"/:id",
	authenticate,
	isStaff,
	idParamValidation,
	updateTestTypeValidation,
	handleValidationErrors,
	testController.updateTestType
);
router.patch(
	"/:id/soft-delete",
	authenticate,
	isStaff,
	idParamValidation,
	handleValidationErrors,
	testController.softDeleteTestType
);
router.delete(
	"/:id",
	authenticate,
	isStaff,
	idParamValidation,
	handleValidationErrors,
	testController.hardDeleteTestType
);

// Filter Routes
router.get("/category/:category", testController.getTestTypesByCategory);
router.get("/method/form", testController.getFormBasedTests);
router.get("/method/upload", testController.getUploadBasedTests);
router.get("/monitoring/recommended", testController.getMonitoringTests);

export default router;
