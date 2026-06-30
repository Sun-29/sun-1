const dayjs = require('dayjs');

const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format);
};

const calculateScore = (scores) => {
  const { professional = 0, expression = 0, logic = 0, understanding = 0 } = scores;
  return (professional * 0.4 + expression * 0.2 + logic * 0.2 + understanding * 0.2).toFixed(1);
};

const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
};

const sanitizeOutput = (obj, fieldsToRemove = ['password', 'password_hash']) => {
  const result = { ...obj };
  fieldsToRemove.forEach(field => delete result[field]);
  return result;
};

module.exports = { generateRandomString, formatDate, calculateScore, paginate, sanitizeOutput };
