import express from "express";
import emergencyContactController from "../controllers/emergencyContactController.js";
import {
  validateEmergencyContactCreate,
  validateEmergencyContactUpdate,
  validateEmergencyContactId
} from "../validations/emergencyContactValidation.js";
import { handleValidationErrors } from "../middlewares/emergencyContactMiddleware.js";

const router = express.Router();

router.get("/", emergencyContactController.getAllEmergencyContacts);

router.get("/:id", 
  validateEmergencyContactId,
  handleValidationErrors,
  emergencyContactController.getEmergencyContactById
);

router.post("/",
  validateEmergencyContactCreate,
  handleValidationErrors,
  emergencyContactController.createEmergencyContact
);

router.put("/:id",
  validateEmergencyContactUpdate,
  handleValidationErrors,
  emergencyContactController.updateEmergencyContact
);

router.delete("/:id",
  validateEmergencyContactId,
  handleValidationErrors,
  emergencyContactController.deleteEmergencyContact
);

export default router;