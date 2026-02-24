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
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage("Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-"),
  
  body("bmi")
    .optional()
    .custom((value, { req }) => {
      // BMI should be automatically calculated, not manually entered
      // If both height and weight are provided, BMI will be calculated server-side
      if (value && req.body.height_cm && req.body.weight_kg) {
        // Allow BMI to be provided but it will be recalculated
        return true;
      }
      return true;
    }),
    // Note: BMI is automatically calculated from height and weight in the service layer
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be either true (yes) or false (no)"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be either true (yes) or false (no)"),
  
  body("smoking_status")
    .optional()
    .isIn(['smoker', 'non-smoker', 'former smoker', 'Smoker', 'Non-smoker', 'Former smoker'])
    .withMessage("Smoking status must be one of: smoker, non-smoker, or former smoker")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
  body("alcohol_usage")
    .optional()
    .isIn(['yes', 'no', 'formerly', 'Yes', 'No', 'Formerly'])
    .withMessage("Alcohol usage must be one of: yes, no, or formerly")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
  body("occupation")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Occupation must be less than 100 characters"),
  
  body("chemical_exposure")
    .optional()
    .isIn(['yes', 'no', 'not sure', 'Yes', 'No', 'Not sure', 'Not Sure'])
    .withMessage("Chemical exposure must be one of: yes, no, or not sure")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
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
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage("Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-"),
  
  body("bmi")
    .optional()
    .custom((value, { req }) => {
      // BMI should be automatically calculated, not manually entered
      // If both height and weight are provided, BMI will be calculated server-side
      if (value && req.body.height_cm && req.body.weight_kg) {
        // Allow BMI to be provided but it will be recalculated
        return true;
      }
      return true;
    }),
    // Note: BMI is automatically calculated from height and weight in the service layer
  
  body("pregnancy_status")
    .optional()
    .isBoolean()
    .withMessage("Pregnancy status must be either true (yes) or false (no)"),
  
  body("disability_status")
    .optional()
    .isBoolean()
    .withMessage("Disability status must be either true (yes) or false (no)"),
  
  body("smoking_status")
    .optional()
    .isIn(['smoker', 'non-smoker', 'former smoker', 'Smoker', 'Non-smoker', 'Former smoker'])
    .withMessage("Smoking status must be one of: smoker, non-smoker, or former smoker")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
  body("alcohol_usage")
    .optional()
    .isIn(['yes', 'no', 'formerly', 'Yes', 'No', 'Formerly'])
    .withMessage("Alcohol usage must be one of: yes, no, or formerly")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
  body("occupation")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Occupation must be less than 100 characters"),
  
  body("chemical_exposure")
    .optional()
    .isIn(['yes', 'no', 'not sure', 'Yes', 'No', 'Not sure', 'Not Sure'])
    .withMessage("Chemical exposure must be one of: yes, no, or not sure")
    .customSanitizer(value => value ? value.toLowerCase() : value),
  
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