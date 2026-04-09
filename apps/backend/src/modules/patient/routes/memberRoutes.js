import express from "express";
import memberController from "../controllers/memberController.js";
import {
  validateMemberCreate,
  validateMemberUpdate,
  validateMemberId
} from "../validations/memberValidation.js";
import { handleValidationErrors } from "../middlewares/memberMiddleware.js";

import { authenticate } from "../../auth/auth.middleware.js";
import upload from "../../../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", memberController.getAllMembers);

router.get("/:id", 
  validateMemberId,
  handleValidationErrors,
  memberController.getMemberById
);

router.post("/",
  upload.single('photo'),
  validateMemberCreate,
  handleValidationErrors,
  memberController.createMember
);

router.put("/:id",
  upload.single('photo'),
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