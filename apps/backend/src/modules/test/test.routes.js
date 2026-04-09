import express from "express";
import * as testController from "./test.controller.js";
import { handleValidationErrors } from "../auth/auth.middleware.js";
import {
	createTestTypeValidation,
	updateTestTypeValidation,
	idParamValidation,
} from "./test.validation.js";

const router = express.Router();

// CRUD Routes (temporarily unprotected for integration testing)
router.post(
	"/",
	createTestTypeValidation,
	handleValidationErrors,
	testController.createTestType
);
router.get("/", testController.getAllTestTypes);
router.get("/:id", testController.getTestTypeById);
router.put(
	"/:id",
	idParamValidation,
	updateTestTypeValidation,
	handleValidationErrors,
	testController.updateTestType
);
router.patch(
	"/:id/soft-delete",
	idParamValidation,
	handleValidationErrors,
	testController.softDeleteTestType
);
router.delete(
	"/:id",
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
