import express from "express";
import * as testController from "./test.controller.js";
import * as testValidation from "./test.validation.js";

const router = express.Router();

// CRUD Routes
router.post(
  "/",
  testValidation.createTestTypeValidation,
  testController.createTestType,
);

router.get(
  "/",
  testValidation.queryFiltersValidation,
  testController.getAllTestTypes,
);

router.get(
  "/:id",
  testValidation.idParamValidation,
  testController.getTestTypeById,
);

router.put(
  "/:id",
  testValidation.updateTestTypeValidation,
  testController.updateTestType,
);

router.delete(
  "/:id",
  testValidation.idParamValidation,
  testController.deleteTestType,
);

// Filter Routes
router.get(
  "/category/:category",
  testValidation.categoryParamValidation,
  testController.getTestTypesByCategory,
);

router.get("/method/form", testController.getFormBasedTests);
router.get("/method/upload", testController.getUploadBasedTests);
router.get("/monitoring/recommended", testController.getMonitoringTests);

export default router;
