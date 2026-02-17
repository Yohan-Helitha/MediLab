// Lab validation using Joi
const Joi = require('joi');

// Schema for lab registration and update
const labSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(), //name validation for length and required

  location: Joi.string().min(3).max(100).required(), //location validation for length and required

  contactInfo: Joi.object({
    phone: Joi.string().pattern(/^\+?[0-9\-\s]{7,15}$/).required(), 
    address: Joi.string().min(5).max(200).required(),
  }).required(),

  operatingHours: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), // HH:MM
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),   // HH:MM
  }).required(),

  status: Joi.string().valid('active', 'inactive', 'closed', 'holiday').required(),
});

// Middleware for validating lab data
function validateLab(req, res, next) {
  const { error } = labSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  validateLab,
};
