const db = require('../../models');
const { Op } = require('sequelize');
const { success, paginated, fail, serverError } = require('../../utils/response');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, category_id, type, difficulty, status } = req.query;
    const where = {};
    if (keyword) where[Op.or] = [{ title: { [Op.like]: `%${keyword}%` } }, { content: { [Op.like]: `%${keyword}%` } }];
    if (category_id) where.category_id = category_id;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (status !== undefined && status !== '') where.status = parseInt(status);
    const { rows, count } = await db.Question.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [
        { model: db.QuestionCategory, as: 'category', attributes: ['id', 'name'] },
        { model: db.Position, as: 'position', attributes: ['id', 'name'] }
      ]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const question = await db.Question.findByPk(req.params.id, {
      include: [{ model: db.QuestionCategory, as: 'category' }, { model: db.Position, as: 'position' }]
    });
    if (!question) return fail(res, '题目不存在', 404);
    return success(res, { question });
  } catch (error) { return serverError(res, error); }
};

exports.create = async (req, res) => {
  try {
    const question = await db.Question.create(req.body);
    return success(res, { question }, '创建成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.update = async (req, res) => {
  try {
    const question = await db.Question.findByPk(req.params.id);
    if (!question) return fail(res, '题目不存在', 404);
    await question.update(req.body);
    return success(res, { question }, '更新成功');
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    const question = await db.Question.findByPk(req.params.id);
    if (!question) return fail(res, '题目不存在', 404);
    await question.update({ status: 0 });
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};

exports.batchImport = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) return fail(res, '请提供题目数据');
    const created = await db.Question.bulkCreate(questions.map(q => ({ ...q, status: 1 })));
    return success(res, { count: created.length }, `成功导入${created.length}道题目`, 201);
  } catch (error) { return serverError(res, error); }
};

exports.exportQuestions = async (req, res) => {
  try {
    const { category_id, type } = req.query;
    const where = { status: 1 };
    if (category_id) where.category_id = category_id;
    if (type) where.type = type;
    const questions = await db.Question.findAll({ where, include: [{ model: db.QuestionCategory, as: 'category' }] });
    return success(res, { questions, total: questions.length });
  } catch (error) { return serverError(res, error); }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await db.QuestionCategory.findAll({ where: { parent_id: null }, include: [{ model: db.QuestionCategory, as: 'children' }], order: [['sort_order', 'ASC']] });
    return success(res, { categories });
  } catch (error) { return serverError(res, error); }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await db.QuestionCategory.create(req.body);
    return success(res, { category }, '创建成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await db.QuestionCategory.findByPk(req.params.id);
    if (!category) return fail(res, '分类不存在', 404);
    await category.update(req.body);
    return success(res, { category }, '更新成功');
  } catch (error) { return serverError(res, error); }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await db.QuestionCategory.findByPk(req.params.id);
    if (!category) return fail(res, '分类不存在', 404);
    const hasChildren = await db.QuestionCategory.count({ where: { parent_id: category.id } });
    if (hasChildren > 0) return fail(res, '该分类下有子分类，无法删除');
    await category.destroy();
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};
