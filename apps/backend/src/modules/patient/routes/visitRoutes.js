import express from "express";
import visitController from "../controllers/visitController.js";
import {
  validateVisitCreate,
  validateVisitUpdate,
  validateVisitId
} from "../validations/visitValidation.js";
import { handleValidationErrors } from "../middlewares/visitMiddleware.js";

import { authenticate } from "../../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", visitController.getAllVisits);

router.get("/:id", 
  validateVisitId,
  handleValidationErrors,
  visitController.getVisitById
);

router.post("/",
  validateVisitCreate,
  handleValidationErrors,
  visitController.createVisit
);

router.put("/:id",
  validateVisitUpdate,
  handleValidationErrors,
  visitController.updateVisit
);

router.delete("/:id",
  validateVisitId,
  handleValidationErrors,
  visitController.deleteVisit
);

export default router;