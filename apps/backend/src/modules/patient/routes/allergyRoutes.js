import express from "express";
import allergyController from "../controllers/allergyController.js";
import {
  validateAllergyCreate,
  validateAllergyUpdate,
  validateAllergyId
} from "../validations/allergyValidation.js";
import { handleValidationErrors } from "../middlewares/allergyMiddleware.js";

const router = express.Router();

router.get("/", allergyController.getAllAllergies);

router.get("/:id", 
  validateAllergyId,
  handleValidationErrors,
  allergyController.getAllergyById
);

router.post("/",
  validateAllergyCreate,
  handleValidationErrors,
  allergyController.createAllergy
);

router.put("/:id",
  validateAllergyUpdate,
  handleValidationErrors,
  allergyController.updateAllergy
);

router.delete("/:id",
  validateAllergyId,
  handleValidationErrors,
  allergyController.deleteAllergy
);

export default router;