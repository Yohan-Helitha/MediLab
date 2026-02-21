import Joi from 'joi';

export const updateLabTestStatusValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      status: Joi.string().valid('AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_SUSPENDED').required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
];

export const labIdParamValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      labId: Joi.string().length(24).hex().required()
    });
    const { error } = schema.validate({ labId: req.params.labId });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
];

export const labTestIdParamValidation = [
  (req, res, next) => {
    const schema = Joi.object({
      id: Joi.string().length(24).hex().required()
    });
    const { error } = schema.validate({ id: req.params.id });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
];
