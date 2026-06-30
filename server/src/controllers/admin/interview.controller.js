const db = require('../../models');
const { Op } = require('sequelize');
const { success, paginated, fail, serverError } = require('../../utils/response');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, position_id, difficulty } = req.query;
    const where = {};
    if (status) where.status = status;
    if (position_id) where.position_id = position_id;
    if (difficulty) where.difficulty = difficulty;
    const include = [
      { model: db.User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'], where: {} },
      { model: db.Position, as: 'position', attributes: ['id', 'name'] }
    ];
    if (keyword) include[0].where[Op.or] = [{ nickname: { [Op.like]: `%${keyword}%` } }, { phone: { [Op.like]: `%${keyword}%` } }];
    const { rows, count } = await db.Interview.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include, distinct: true
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'nickname', 'phone', 'school', 'avatar_url'] },
        { model: db.Position, as: 'position' },
        { model: db.InterviewDetail, as: 'details' },
        { model: db.ScoreReport, as: 'scoreReport' }
      ]
    });
    if (!interview) return fail(res, '面试记录不存在', 404);
    return success(res, { interview });
  } catch (error) { return serverError(res, error); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await db.Interview.count();
    const completed = await db.Interview.count({ where: { status: 'completed' } });
    const ongoing = await db.Interview.count({ where: { status: 'ongoing' } });
    const avgScoreResult = await db.ScoreReport.findOne({ attributes: [[db.Sequelize.fn('AVG', db.Sequelize.col('total_score')), 'avg']] });
    return success(res, {
      total, completed, ongoing,
      avgScore: avgScoreResult ? parseFloat(avgScoreResult.dataValues.avg || 0).toFixed(1) : '0.0'
    });
  } catch (error) { return serverError(res, error); }
};

exports.exportInterviews = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) where.created_at = { [Op.between]: [startDate, endDate] };
    const interviews = await db.Interview.findAll({
      where,
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'nickname', 'phone'] },
        { model: db.Position, as: 'position', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    return success(res, { interviews, total: interviews.length });
  } catch (error) { return serverError(res, error); }
};
