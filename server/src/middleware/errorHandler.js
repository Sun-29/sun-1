const config = require('../config');

class AppError extends Error {
  constructor(message, statusCode = 400, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ code: 400, message: '数据验证失败', data: details });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors.map(e => e.path).join(', ');
    return res.status(400).json({ code: 400, message: `${fields} 已存在` });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 401, message: '无效的token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'token已过期' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ code: 400, message: '文件大小超出限制' });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message });
  }

  res.status(500).json({
    code: 500,
    message: config.nodeEnv === 'development' ? err.message : '服务器内部错误',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.originalUrl}` });
};

module.exports = { AppError, errorHandler, notFound };
