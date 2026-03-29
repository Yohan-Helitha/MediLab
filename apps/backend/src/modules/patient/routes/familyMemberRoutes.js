import express from "express";
import familyMemberController from "../controllers/familyMemberController.js";
import {
  validateFamilyMemberCreate,
  validateFamilyMemberUpdate,
  validateFamilyMemberId
} from "../validations/familyMemberValidation.js";
import { handleValidationErrors } from "../middlewares/familyMemberMiddleware.js";

import { authenticate } from "../../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", familyMemberController.getAllFamilyMembers);

router.get("/:id", 
  validateFamilyMemberId,
  handleValidationErrors,
  familyMemberController.getFamilyMemberById
);

router.post("/",
  validateFamilyMemberCreate,
  handleValidationErrors,
  familyMemberController.createFamilyMember
);

router.put("/:id",
  validateFamilyMemberUpdate,
  handleValidationErrors,
  familyMemberController.updateFamilyMember
);

router.delete("/:id",
  validateFamilyMemberId,
  handleValidationErrors,
  familyMemberController.deleteFamilyMember
);

export default router;