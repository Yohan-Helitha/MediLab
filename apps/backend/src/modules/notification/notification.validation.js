// Validation schemas for notification operations
// Using express-validator or Joi (to be implemented)

export const sendNotificationValidation = [
  // TODO: Add validation rules
  // - patientProfileId: required, valid MongoDB ObjectId
  // - testResultId: required for result_ready type
  // - channel: required, enum (sms/email)
  // - recipient: required, string
];

export const subscribeValidation = [
  // TODO: Add validation rules for subscription
  // - patientProfileId: required, valid MongoDB ObjectId
  // - testTypeId: required, valid MongoDB ObjectId
  // - lastTestDate: required, valid date
];

export const idParamValidation = [
  // TODO: Validate MongoDB ObjectId parameter
];
