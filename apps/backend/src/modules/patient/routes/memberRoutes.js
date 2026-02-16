import express from "express";
import memberController from "../controllers/memberController.js";
import {
  validateMemberCreate,
  validateMemberUpdate,
  validateMemberId
} from "../validations/memberValidation.js";
import { handleValidationErrors } from "../middlewares/memberMiddleware.js";

const router = express.Router();

router.get("/", memberController.getAllMembers);

router.get("/:id", 
  validateMemberId,
  handleValidationErrors,
  memberController.getMemberById
);

router.post("/",
  validateMemberCreate,
  handleValidationErrors,
  memberController.createMember
);

router.put("/:id",
  validateMemberUpdate,
  handleValidationErrors,
  memberController.updateMember
);

router.delete("/:id",
  validateMemberId,
  handleValidationErrors,
  memberController.deleteMember
);

export default router;