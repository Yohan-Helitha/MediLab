import express from "express";
import householdController from "../controllers/householdController.js";
import {
  validateHouseholdCreate,
  validateHouseholdUpdate,
  validateHouseholdId
} from "../validations/householdValidation.js";
import { handleValidationErrors } from "../middlewares/householdMiddleware.js";

const router = express.Router();

router.get("/", householdController.getAllHouseholds);

router.get("/:id", 
  validateHouseholdId,
  handleValidationErrors,
  householdController.getHouseholdById
);

router.post("/",
  validateHouseholdCreate,
  handleValidationErrors,
  householdController.createHousehold
);

router.put("/:id",
  validateHouseholdUpdate,
  handleValidationErrors,
  householdController.updateHousehold
);

router.delete("/:id",
  validateHouseholdId,
  handleValidationErrors,
  householdController.deleteHousehold
);

export default router;