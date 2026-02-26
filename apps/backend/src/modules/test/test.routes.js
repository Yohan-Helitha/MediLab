import express from "express";
import * as testController from "./test.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", testController.createTestType);
router.get("/", testController.getAllTestTypes);
router.get("/:id", testController.getTestTypeById);
router.put("/:id", testController.updateTestType);
router.patch("/:id/soft-delete", testController.softDeleteTestType);
router.delete("/:id", testController.hardDeleteTestType);

// Filter Routes
router.get("/category/:category", testController.getTestTypesByCategory);
router.get("/method/form", testController.getFormBasedTests);
router.get("/method/upload", testController.getUploadBasedTests);
router.get("/monitoring/recommended", testController.getMonitoringTests);

export default router;
