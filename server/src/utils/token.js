const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (user, isAdmin = false) => {
  const payload = { id: user.id, role: user.role || 'user', isAdmin };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

const generateRefreshToken = (user) => {
  const payload = { id: user.id, type: 'refresh' };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };
