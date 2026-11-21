const fs = require('fs');
const Joi = require('joi');

// Builds a middleware that validates req.body against a Joi schema.
// If a file was already saved by multer and validation fails, the file is removed.
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    const message = error.details.map((d) => d.message.replace(/"/g, '')).join(', ');
    return res.status(400).json({ message });
  }

  req.body = value;
  next();
};

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(72).required(),
  location: Joi.string().trim().max(100).allow(''),
  description: Joi.string().trim().max(500).allow(''),
  occupation: Joi.string().trim().max(100).allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const photoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(1000).allow(''),
});

const commentSchema = Joi.object({
  comment: Joi.string().trim().min(1).max(500).required(),
});

module.exports = { validate, registerSchema, loginSchema, photoSchema, commentSchema };
