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
    .isIn(['husband', 'wife', 'spouse', 'father', 'mother', 'parent', 'son', 'daughter', 'child', 'brother', 'sister', 'sibling', 'grandfather', 'grandmother', 'grandparent', 'grandson', 'granddaughter', 'grandchild', 'great-grandchild', 'mother-in-law', 'father-in-law', 'son-in-law', 'daughter-in-law', 'child-in-law', 'grandson-in-law', 'granddaughter-in-law', 'aunt', 'uncle', 'niece', 'nephew', 'guardian', 'other'])
    .withMessage("Invalid relationship type")
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
    .isIn(['husband', 'wife', 'spouse', 'father', 'mother', 'parent', 'son', 'daughter', 'child', 'brother', 'sister', 'sibling', 'grandfather', 'grandmother', 'grandparent', 'grandson', 'granddaughter', 'grandchild', 'great-grandchild', 'mother-in-law', 'father-in-law', 'son-in-law', 'daughter-in-law', 'child-in-law', 'grandson-in-law', 'granddaughter-in-law', 'aunt', 'uncle', 'niece', 'nephew', 'guardian', 'other'])
    .withMessage("Invalid relationship type")
];

export const validateFamilyRelationshipId = [
  param("id").isMongoId().withMessage("Invalid family relationship ID")
];