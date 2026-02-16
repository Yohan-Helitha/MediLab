import { body, param } from "express-validator";

export const validateHealthDetailsCreate = [
  body("member_id")
    .notEmpty()
    .withMessage("Member ID is required")
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("height_cm")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("Height must be between 0 and 999.99"),
  
  body("weight_kg")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("Weight must be between 0 and 999.99"),
  
  body("blood_group")
    .optional()
    .isLength({ max: 5 })
    .withMessage("Blood group must be less than 5 characters"),
  
  body("bmi")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("BMI must be between 0 and 999.99"),
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be boolean"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be boolean"),
  
  body("smoking_status")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Smoking status must be less than 20 characters"),
  
  body("alcohol_usage")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Alcohol usage must be less than 20 characters"),
  
  body("occupation")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Occupation must be less than 100 characters"),
  
  body("chemical_exposure")
    .optional()
    .isBoolean()
    .withMessage("Chemical exposure must be boolean"),
  
  body("free_text")
    .optional(),
  
  body("voice_recording")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Voice recording path must be less than 255 characters")
];

export const validateHealthDetailsUpdate = [
  param("id").isMongoId().withMessage("Invalid health details ID"),
  
  body("member_id")
    .optional()
    .matches(/^MEM-ANU-PADGNDIV-\d{4}-\d{5}$/)
    .withMessage("Invalid member ID format"),
  
  body("height_cm")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("Height must be between 0 and 999.99"),
  
  body("weight_kg")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("Weight must be between 0 and 999.99"),
  
  body("blood_group")
    .optional()
    .isLength({ max: 5 })
    .withMessage("Blood group must be less than 5 characters"),
  
  body("bmi")
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage("BMI must be between 0 and 999.99"),
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be boolean"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be boolean"),
  
  body("smoking_status")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Smoking status must be less than 20 characters"),
  
  body("alcohol_usage")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Alcohol usage must be less than 20 characters"),
  
  body("occupation")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Occupation must be less than 100 characters"),
  
  body("chemical_exposure")
    .optional()
    .isBoolean()
    .withMessage("Chemical exposure must be boolean"),
  
  body("free_text")
    .optional(),
  
  body("voice_recording")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Voice recording path must be less than 255 characters")
];

export const validateHealthDetailsId = [
  param("id").isMongoId().withMessage("Invalid health details ID")
];