import express from "express";
import pastMedicalHistoryController from "../controllers/pastMedicalHistoryController.js";
import {
  validatePastMedicalHistoryCreate,
  validatePastMedicalHistoryUpdate,
  validatePastMedicalHistoryId
} from "../validations/pastMedicalHistoryValidation.js";
import { handleValidationErrors } from "../middlewares/pastMedicalHistoryMiddleware.js";

const router = express.Router();

router.get("/", pastMedicalHistoryController.getAllPastMedicalHistories);

router.get("/:id", 
  validatePastMedicalHistoryId,
  handleValidationErrors,
  pastMedicalHistoryController.getPastMedicalHistoryById
);

router.post("/",
  validatePastMedicalHistoryCreate,
  handleValidationErrors,
  pastMedicalHistoryController.createPastMedicalHistory
);

router.put("/:id",
  validatePastMedicalHistoryUpdate,
  handleValidationErrors,
  pastMedicalHistoryController.updatePastMedicalHistory
);

router.delete("/:id",
  validatePastMedicalHistoryId,
  handleValidationErrors,
  pastMedicalHistoryController.deletePastMedicalHistory
);

export default router;