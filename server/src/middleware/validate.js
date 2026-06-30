const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
      return res.status(400).json({ code: 400, message: '参数验证失败', data: details });
    }
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
      return res.status(400).json({ code: 400, message: '参数验证失败', data: details });
    }
    req.query = value;
    next();
  };
};

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10)
});

const idSchema = Joi.object({
  id: Joi.number().integer().required()
});

module.exports = { validate, validateQuery, paginationSchema, idSchema };
