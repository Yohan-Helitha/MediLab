import { body, param } from "express-validator";

export const validateFamilyRelationshipCreate = [
  body("family_member1_id")
    .notEmpty()
    .withMessage("Family member 1 ID is required")
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member 1 ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN"),
  
  body("family_member2_id")
    .notEmpty()
    .withMessage("Family member 2 ID is required")
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member 2 ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN"),
  
  body("relationship_type")
    .notEmpty()
    .withMessage("Relationship type is required")
    .isIn(['husband', 'wife', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter'])
    .withMessage("Invalid relationship type. Must be one of: husband, wife, father, mother, son, daughter, brother, sister, grandfather, grandmother, grandson, granddaughter")
];

export const validateFamilyRelationshipUpdate = [
  param("id").isMongoId().withMessage("Invalid family relationship ID"),
  
  body("family_member1_id")
    .optional()
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member 1 ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN"),
  
  body("family_member2_id")
    .optional()
    .matches(/^FAM-ANU-PADGNDIV-\d{5}$/)
    .withMessage("Invalid family member 2 ID format. Expected format: FAM-ANU-PADGNDIV-NNNNN"),
  
  body("relationship_type")
    .optional()
    .isIn(['husband', 'wife', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter'])
    .withMessage("Invalid relationship type. Must be one of: husband, wife, father, mother, son, daughter, brother, sister, grandfather, grandmother, grandson, granddaughter")
];

export const validateFamilyRelationshipId = [
  param("id").isMongoId().withMessage("Invalid family relationship ID")
];