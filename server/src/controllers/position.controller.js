const db = require('../models');
const cacheService = require('../services/cache.service');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, keyword } = req.query;
    const where = { status: 1 };
    if (category) where.category = category;
    if (keyword) where.name = { [require('sequelize').Op.like]: `%${keyword}%` };
    const { rows, count } = await db.Position.findAndCountAll({
      where, order: [['sort_order', 'ASC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize)
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.detail = async (req, res) => {
  try {
    const position = await db.Position.findByPk(req.params.id, {
      include: [{ model: db.Question, as: 'questions', attributes: ['id'], where: { status: 1 }, required: false }]
    });
    if (!position || position.status === 0) return fail(res, '岗位不存在', 404);
    return success(res, { position: { ...position.toJSON(), questionCount: position.questions ? position.questions.length : 0 } });
  } catch (error) { return serverError(res, error); }
};

exports.categories = async (req, res) => {
  try {
    const categories = await db.Position.findAll({
      attributes: ['category', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
      where: { status: 1 }, group: ['category']
    });
    return success(res, { categories });
  } catch (error) { return serverError(res, error); }
};

// Admin only below
exports.create = async (req, res) => {
  try {
    const position = await db.Position.create(req.body);
    await cacheService.del('positions:all');
    return success(res, { position }, '创建成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.update = async (req, res) => {
  try {
    const position = await db.Position.findByPk(req.params.id);
    if (!position) return fail(res, '岗位不存在', 404);
    await position.update(req.body);
    await cacheService.del('positions:all');
    return success(res, { position }, '更新成功');
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    const position = await db.Position.findByPk(req.params.id);
    if (!position) return fail(res, '岗位不存在', 404);
    await position.update({ status: 0 });
    await cacheService.del('positions:all');
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};
