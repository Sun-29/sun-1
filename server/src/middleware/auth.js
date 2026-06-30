const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未登录或token已过期' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await db.User.findByPk(decoded.id);
    if (!user || user.status === 0) {
      return res.status(401).json({ code: 401, message: '用户不存在或已被禁用' });
    }
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'token已过期，请重新登录' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: '无效的token' });
    }
    next(error);
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未登录或token已过期' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    if (!decoded.isAdmin) {
      return res.status(403).json({ code: 403, message: '无管理员权限' });
    }
    const admin = await db.Admin.findByPk(decoded.id);
    if (!admin || admin.status === 0) {
      return res.status(401).json({ code: 401, message: '管理员不存在或已被禁用' });
    }
    req.user = admin;
    req.userId = admin.id;
    req.isAdmin = true;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: 'token已过期，请重新登录' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: '无效的token' });
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await db.User.findByPk(decoded.id);
      req.user = user || null;
      req.userId = user ? user.id : null;
    } else {
      req.user = null;
      req.userId = null;
    }
  } catch (error) {
    req.user = null;
    req.userId = null;
  }
  next();
};

module.exports = { authenticate, authenticateAdmin, optionalAuth };
