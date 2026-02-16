import express from "express";
import medicationController from "../controllers/medicationController.js";
import {
  validateMedicationCreate,
  validateMedicationUpdate,
  validateMedicationId
} from "../validations/medicationValidation.js";
import { handleValidationErrors } from "../middlewares/medicationMiddleware.js";

const router = express.Router();

router.get("/", medicationController.getAllMedications);

router.get("/:id", 
  validateMedicationId,
  handleValidationErrors,
  medicationController.getMedicationById
);

router.post("/",
  validateMedicationCreate,
  handleValidationErrors,
  medicationController.createMedication
);

router.put("/:id",
  validateMedicationUpdate,
  handleValidationErrors,
  medicationController.updateMedication
);

router.delete("/:id",
  validateMedicationId,
  handleValidationErrors,
  medicationController.deleteMedication
);

export default router;