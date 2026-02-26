const Joi = require("joi");

const createTestTypeValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(200).required(),
      code: Joi.string().uppercase().max(20).required(),
      category: Joi.string().min(3).max(50).required(),
      entryMethod: Joi.string().valid("Form", "Upload").required(),
      discriminatorType: Joi.string().min(3).max(50).required(),
      description: Joi.string().min(10).max(500).required(),
      price: Joi.number().min(0).required(),
      resultTime: Joi.string()
        .pattern(/^\d+\s*hours$/)
        .required(),
      isMonitoringRecommended: Joi.boolean(),
      isActive: Joi.boolean(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  },
];

const updateTestTypeValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(200),
      code: Joi.string().uppercase().max(20),
      category: Joi.string().min(3).max(50),
      entryMethod: Joi.string().valid("Form", "Upload"),
      discriminatorType: Joi.string().min(3).max(50),
      description: Joi.string().min(10).max(500),
      price: Joi.number().min(0),
      resultTime: Joi.string().pattern(/^\d+\s*hours$/),
      isMonitoringRecommended: Joi.boolean(),
      isActive: Joi.boolean(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  },
];

const idParamValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      id: Joi.string().length(24).hex().required(),
    });
    const { error } = schema.validate({ id: req.params.id });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  },
];

module.exports = {
  createTestTypeValidation,
  updateTestTypeValidation,
  idParamValidation,
};
