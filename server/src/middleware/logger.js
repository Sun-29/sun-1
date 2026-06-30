const db = require('../models');

const logger = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    console.log(`[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms`);

    if (['POST', 'PUT', 'DELETE'].includes(method) && status < 400) {
      const body = { ...req.body };
      delete body.password;
      delete body.password_hash;
      delete body.confirmPassword;
      db.SystemLog.create({
        user_id: req.userId || null,
        admin_id: req.isAdmin ? req.userId : null,
        action: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'delete',
        module: url.split('/')[2] || 'unknown',
        description: `${method} ${url}`,
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent') || '',
        method,
        url,
        request_body: JSON.stringify(body).slice(0, 1000),
        response_status: status,
        duration_ms: duration
      }).catch(() => {});
    }

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = logger;
