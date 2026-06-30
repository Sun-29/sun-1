const db = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/token');
const { success, fail, serverError } = require('../utils/response');
const Joi = require('joi');

const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({ 'string.pattern.base': '手机号格式不正确' }),
  email: Joi.string().email().messages({ 'string.email': '邮箱格式不正确' }),
  password: Joi.string().min(6).max(20).required().messages({ 'string.min': '密码至少6位' }),
  nickname: Joi.string().max(50).default('新用户')
}).or('phone', 'email').messages({ 'object.missing': '手机号或邮箱至少填写一个' });

exports.register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return fail(res, error.details[0].message);
    const { phone, email, password, nickname } = value;
    const where = {};
    if (phone) where.phone = phone;
    if (email) where.email = email;
    const existUser = await db.User.findOne({ where });
    if (existUser) return fail(res, '用户已存在');
    const user = await db.User.create({ phone: phone || null, email: email || null, password_hash: password, nickname: nickname || '新用户' });
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    return success(res, { user: user.toJSON(), token, refreshToken }, '注册成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;
    if (!account || !password) return fail(res, '请输入账号和密码');
    const user = await db.User.findOne({
      where: { [require('sequelize').Op.or]: [{ phone: account }, { email: account }] }
    });
    if (!user) return fail(res, '用户不存在');
    if (user.status === 0) return fail(res, '账号已被禁用');
    const valid = await user.validatePassword(password);
    if (!valid) return fail(res, '密码错误');
    await user.update({ last_login: new Date() });
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    return success(res, { user: user.toJSON(), token, refreshToken }, '登录成功');
  } catch (error) { return serverError(res, error); }
};

exports.wechatLogin = async (req, res) => {
  try {
    const { openid, nickname, avatarUrl } = req.body;
    if (!openid) return fail(res, '微信登录参数缺失');
    const [user, created] = await db.User.findOrCreate({
      where: { openid },
      defaults: { nickname: nickname || '微信用户', avatar_url: avatarUrl || null }
    });
    if (!created && nickname) await user.update({ nickname, avatar_url: avatarUrl || user.avatar_url });
    if (user.status === 0) return fail(res, '账号已被禁用');
    await user.update({ last_login: new Date() });
    const token = generateToken(user);
    return success(res, { user: user.toJSON(), token, isNewUser: created }, '登录成功');
  } catch (error) { return serverError(res, error); }
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return fail(res, '请输入用户名和密码');
    const admin = await db.Admin.findOne({ where: { username } });
    if (!admin) return fail(res, '管理员不存在');
    if (admin.status === 0) return fail(res, '账号已被禁用');
    const valid = await admin.validatePassword(password);
    if (!valid) return fail(res, '密码错误');
    await admin.update({ last_login: new Date() });
    const token = generateToken(admin, true);
    return success(res, { admin: admin.toJSON(), token }, '登录成功');
  } catch (error) { return serverError(res, error); }
};

exports.getProfile = async (req, res) => {
  try {
    return success(res, { user: req.user.toJSON() });
  } catch (error) { return serverError(res, error); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatar_url, school, major, grade, job_direction } = req.body;
    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (school !== undefined) updateData.school = school;
    if (major !== undefined) updateData.major = major;
    if (grade !== undefined) updateData.grade = grade;
    if (job_direction !== undefined) updateData.job_direction = job_direction;
    await req.user.update(updateData);
    return success(res, { user: req.user.toJSON() }, '更新成功');
  } catch (error) { return serverError(res, error); }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return fail(res, '请输入旧密码和新密码');
    const valid = await req.user.validatePassword(oldPassword);
    if (!valid) return fail(res, '旧密码错误');
    req.user.password_hash = newPassword;
    await req.user.save();
    return success(res, null, '密码修改成功');
  } catch (error) { return serverError(res, error); }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken: rt } = req.body;
    if (!rt) return fail(res, '请提供refreshToken');
    const { verifyToken } = require('../utils/token');
    const decoded = verifyToken(rt);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return fail(res, '用户不存在');
    const token = generateToken(user);
    return success(res, { token });
  } catch (error) { return fail(res, 'refreshToken无效或已过期'); }
};
