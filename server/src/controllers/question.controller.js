const db = require('../models');
const { Op } = require('sequelize');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category_id, position_id, type, difficulty, keyword } = req.query;
    const where = { status: 1 };
    if (category_id) where.category_id = category_id;
    if (position_id) where.position_id = position_id;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };
    const { rows, count } = await db.Question.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [
        { model: db.QuestionCategory, as: 'category', attributes: ['id', 'name'] },
        { model: db.Position, as: 'position', attributes: ['id', 'name'] }
      ]
    });
    if (req.userId) {
      const favorites = await db.UserFavorite.findAll({ where: { user_id: req.userId, question_id: { [Op.in]: rows.map(r => r.id) } }, attributes: ['question_id'] });
      const favIds = new Set(favorites.map(f => f.question_id));
      rows.forEach(r => { r.dataValues.isFavorited = favIds.has(r.id); });
    }
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.detail = async (req, res) => {
  try {
    const question = await db.Question.findByPk(req.params.id, {
      include: [
        { model: db.QuestionCategory, as: 'category', attributes: ['id', 'name'] },
        { model: db.Position, as: 'position', attributes: ['id', 'name'] }
      ]
    });
    if (!question || question.status === 0) return fail(res, '题目不存在', 404);
    return success(res, { question });
  } catch (error) { return serverError(res, error); }
};

exports.random = async (req, res) => {
  try {
    const { count = 5, category_id, difficulty } = req.query;
    const where = { status: 1 };
    if (category_id) where.category_id = category_id;
    if (difficulty) where.difficulty = difficulty;
    const questions = await db.Question.findAll({
      where, order: db.Sequelize.literal('RAND()'), limit: parseInt(count)
    });
    return success(res, { list: questions });
  } catch (error) { return serverError(res, error); }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const question_id = req.params.id;
    const question = await db.Question.findByPk(question_id);
    if (!question) return fail(res, '题目不存在', 404);
    const [fav, created] = await db.UserFavorite.findOrCreate({ where: { user_id: req.userId, question_id } });
    if (!created) { await fav.destroy(); return success(res, { isFavorited: false }, '取消收藏'); }
    return success(res, { isFavorited: true }, '收藏成功');
  } catch (error) { return serverError(res, error); }
};

exports.getFavorites = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { rows, count } = await db.UserFavorite.findAndCountAll({
      where: { user_id: req.userId },
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']],
      include: [{ model: db.Question, as: 'question', where: { status: 1 } }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getWrongQuestions = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, mastered } = req.query;
    const where = { user_id: req.userId };
    if (mastered !== undefined) where.mastered = mastered === '1' ? 1 : 0;
    const { rows, count } = await db.WrongQuestion.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.Question, as: 'question', attributes: ['id', 'title', 'content', 'reference_answer', 'type', 'difficulty'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.reviewWrongQuestion = async (req, res) => {
  try {
    const wq = await db.WrongQuestion.findByPk(req.params.id);
    if (!wq || wq.user_id !== req.userId) return fail(res, '错题不存在', 404);
    await wq.update({ review_count: wq.review_count + 1, next_review_date: new Date(Date.now() + 7 * 86400000) });
    return success(res, null, '复习成功');
  } catch (error) { return serverError(res, error); }
};

exports.masterWrongQuestion = async (req, res) => {
  try {
    const wq = await db.WrongQuestion.findByPk(req.params.id);
    if (!wq || wq.user_id !== req.userId) return fail(res, '错题不存在', 404);
    await wq.update({ mastered: 1 });
    return success(res, null, '已标记为掌握');
  } catch (error) { return serverError(res, error); }
};
