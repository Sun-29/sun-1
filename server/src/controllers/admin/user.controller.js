const db = require('../../models');
const { Op } = require('sequelize');
const { success, paginated, fail, serverError } = require('../../utils/response');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const where = {};
    if (keyword) where[Op.or] = [{ nickname: { [Op.like]: `%${keyword}%` } }, { phone: { [Op.like]: `%${keyword}%` } }, { email: { [Op.like]: `%${keyword}%` } }];
    if (status !== undefined && status !== '') where.status = parseInt(status);
    const { rows, count } = await db.User.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.Ranking, as: 'ranking', attributes: ['total_score', 'practice_count', 'total_rank'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      include: [{ model: db.Ranking, as: 'ranking' }]
    });
    if (!user) return fail(res, '用户不存在', 404);
    const interviewCount = await db.Interview.count({ where: { user_id: user.id } });
    const avgScoreResult = await db.ScoreReport.findOne({ attributes: [[db.Sequelize.fn('AVG', db.Sequelize.col('total_score')), 'avg']], where: { user_id: user.id } });
    return success(res, { user, stats: { interviewCount, avgScore: avgScoreResult ? parseFloat(avgScoreResult.dataValues.avg || 0).toFixed(1) : '0.0' } });
  } catch (error) { return serverError(res, error); }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return fail(res, '用户不存在', 404);
    await user.update({ status: req.body.status });
    return success(res, null, req.body.status === 1 ? '已启用' : '已禁用');
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return fail(res, '用户不存在', 404);
    await user.destroy();
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await db.User.count();
    const activeToday = await db.LearningRecord.count({ where: { date: new Date().toISOString().slice(0, 10) } });
    const newToday = await db.User.count({ where: { created_at: { [Op.gte]: new Date(new Date().toISOString().slice(0, 10)) } } });
    return success(res, { total, activeToday, newToday });
  } catch (error) { return serverError(res, error); }
};
