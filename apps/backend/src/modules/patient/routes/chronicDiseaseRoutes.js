import express from "express";
import chronicDiseaseController from "../controllers/chronicDiseaseController.js";
import {
  validateChronicDiseaseCreate,
  validateChronicDiseaseUpdate,
  validateChronicDiseaseId
} from "../validations/chronicDiseaseValidation.js";
import { handleValidationErrors } from "../middlewares/chronicDiseaseMiddleware.js";

const router = express.Router();

router.get("/", chronicDiseaseController.getAllChronicDiseases);

router.get("/:id", 
  validateChronicDiseaseId,
  handleValidationErrors,
  chronicDiseaseController.getChronicDiseaseById
);

router.post("/",
  validateChronicDiseaseCreate,
  handleValidationErrors,
  chronicDiseaseController.createChronicDisease
);

router.put("/:id",
  validateChronicDiseaseUpdate,
  handleValidationErrors,
  chronicDiseaseController.updateChronicDisease
);

router.delete("/:id",
  validateChronicDiseaseId,
  handleValidationErrors,
  chronicDiseaseController.deleteChronicDisease
);

export default router;