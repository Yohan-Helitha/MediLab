import express from "express";
import healthDetailsController from "../controllers/healthDetailsController.js";
import {
  validateHealthDetailsCreate,
  validateHealthDetailsUpdate,
  validateHealthDetailsId
} from "../validations/healthDetailsValidation.js";
import { handleValidationErrors } from "../middlewares/healthDetailsMiddleware.js";

import { authenticate } from "../../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", healthDetailsController.getAllHealthDetails);

router.get("/:id", 
  validateHealthDetailsId,
  handleValidationErrors,
  healthDetailsController.getHealthDetailsById
);

router.post("/",
  validateHealthDetailsCreate,
  handleValidationErrors,
  healthDetailsController.createHealthDetails
);

router.put("/:id",
  validateHealthDetailsUpdate,
  handleValidationErrors,
  healthDetailsController.updateHealthDetails
);

router.delete("/:id",
  validateHealthDetailsId,
  handleValidationErrors,
  healthDetailsController.deleteHealthDetails
);

export default router;