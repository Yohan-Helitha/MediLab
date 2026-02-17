import express from "express";
import familyRelationshipController from "../controllers/familyRelationshipController.js";
import {
  validateFamilyRelationshipCreate,
  validateFamilyRelationshipUpdate,
  validateFamilyRelationshipId
} from "../validations/familyRelationshipValidation.js";
import { param } from "express-validator";
import { handleValidationErrors } from "../middlewares/familyRelationshipMiddleware.js";

const router = express.Router();

router.get("/", familyRelationshipController.getAllFamilyRelationships);

router.get("/:id", 
  validateFamilyRelationshipId,
  handleValidationErrors,
  familyRelationshipController.getFamilyRelationshipById
);

router.post("/",
  validateFamilyRelationshipCreate,
  handleValidationErrors,
  familyRelationshipController.createFamilyRelationship
);

router.put("/:id",
  validateFamilyRelationshipUpdate,
  handleValidationErrors,
  familyRelationshipController.updateFamilyRelationship
);

router.delete("/:id",
  validateFamilyRelationshipId,
  handleValidationErrors,
  familyRelationshipController.deleteFamilyRelationship
);

// Family tree endpoint
router.get("/family-tree/:familyMemberId",
  [param("familyMemberId").matches(/^FAM-ANU-PADGNDIV-\d{5}$/).withMessage("Invalid family member ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN")],
  handleValidationErrors,
  familyRelationshipController.getFamilyTree
);

export default router;