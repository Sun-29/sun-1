const db = require('../../models');
const { Op } = require('sequelize');
const { success, paginated, fail, serverError } = require('../../utils/response');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const activeToday = await db.LearningRecord.count({ where: { date: new Date().toISOString().slice(0, 10) } });
    const totalInterviews = await db.Interview.count();
    const avgScoreResult = await db.ScoreReport.findOne({ attributes: [[db.Sequelize.fn('AVG', db.Sequelize.col('total_score')), 'avg']] });
    const newUsersWeek = await db.User.count({ where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 86400000) } } });
    return success(res, {
      totalUsers, activeToday, totalInterviews,
      avgScore: avgScoreResult ? parseFloat(avgScoreResult.dataValues.avg || 0).toFixed(1) : '0.0',
      newUsersWeek
    });
  } catch (error) { return serverError(res, error); }
};

exports.getUserTrend = async (req, res) => {
  try {
    const records = await db.User.findAll({
      attributes: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'], [db.Sequelize.fn('COUNT', '*'), 'count']],
      where: { created_at: { [Op.gte]: new Date(Date.now() - 30 * 86400000) } },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']]
    });
    return success(res, { trend: records });
  } catch (error) { return serverError(res, error); }
};

exports.getInterviewTrend = async (req, res) => {
  try {
    const records = await db.Interview.findAll({
      attributes: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'], [db.Sequelize.fn('COUNT', '*'), 'count']],
      where: { created_at: { [Op.gte]: new Date(Date.now() - 30 * 86400000) } },
      group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
      order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']]
    });
    return success(res, { trend: records });
  } catch (error) { return serverError(res, error); }
};

exports.getPositionPopularity = async (req, res) => {
  try {
    const data = await db.Interview.findAll({
      attributes: ['position_id', [db.Sequelize.fn('COUNT', '*'), 'count']],
      group: ['position_id'],
      include: [{ model: db.Position, as: 'position', attributes: ['name'] }]
    });
    return success(res, { data });
  } catch (error) { return serverError(res, error); }
};

exports.getScoreDistribution = async (req, res) => {
  try {
    const ranges = [{ label: '0-20', min: 0, max: 20 }, { label: '20-40', min: 20, max: 40 }, { label: '40-60', min: 40, max: 60 }, { label: '60-80', min: 60, max: 80 }, { label: '80-100', min: 80, max: 101 }];
    const result = [];
    for (const range of ranges) {
      const count = await db.ScoreReport.count({ where: { total_score: { [Op.gte]: range.min, [Op.lt]: range.max } } });
      result.push({ label: range.label, count });
    }
    return success(res, { distribution: result });
  } catch (error) { return serverError(res, error); }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const logs = await db.SystemLog.findAll({
      order: [['created_at', 'DESC']], limit: 20,
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'nickname'] },
        { model: db.Admin, as: 'admin', attributes: ['id', 'username'] }
      ]
    });
    return success(res, { activities: logs });
  } catch (error) { return serverError(res, error); }
};
