import express from "express";
import referralController from "../controllers/referralController.js";
import {
  validateReferralCreate,
  validateReferralUpdate,
  validateReferralId,
  validateVisitId
} from "../validations/referralValidation.js";
import { handleValidationErrors } from "../middlewares/referralMiddleware.js";

const router = express.Router();

router.get("/", referralController.getAllReferrals);

router.get("/visit/:visitId",
  validateVisitId,
  handleValidationErrors,
  referralController.getReferralsByVisitId
);

router.get("/:id", 
  validateReferralId,
  handleValidationErrors,
  referralController.getReferralById
);

router.post("/",
  validateReferralCreate,
  handleValidationErrors,
  referralController.createReferral
);

router.put("/:id",
  validateReferralUpdate,
  handleValidationErrors,
  referralController.updateReferral
);

router.delete("/:id",
  validateReferralId,
  handleValidationErrors,
  referralController.deleteReferral
);

export default router;