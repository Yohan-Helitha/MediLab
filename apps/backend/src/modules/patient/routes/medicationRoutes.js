import express from "express";
import medicationController from "../controllers/medicationController.js";
import {
  validateMedicationCreate,
  validateMedicationUpdate,
  validateMedicationId
} from "../validations/medicationValidation.js";
import { handleValidationErrors } from "../middlewares/medicationMiddleware.js";
import uploadPrescription from "../../../middlewares/prescriptionUploadMiddleware.js";

import { authenticate } from "../../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", medicationController.getAllMedications);

router.get("/:id", 
  validateMedicationId,
  handleValidationErrors,
  medicationController.getMedicationById
);

router.post("/",
  uploadPrescription.single('prescription_photo'),
  validateMedicationCreate,
  handleValidationErrors,
  medicationController.createMedication
);

router.put("/:id",
  uploadPrescription.single('prescription_photo'),
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