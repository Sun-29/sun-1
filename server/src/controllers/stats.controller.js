const db = require('../models');
const { Op } = require('sequelize');
const { success, fail, serverError } = require('../utils/response');

exports.getOverview = async (req, res) => {
  try {
    const interviewCount = await db.Interview.count({ where: { user_id: req.userId, status: 'completed' } });
    const avgScore = await db.ScoreReport.findOne({
      attributes: [[db.Sequelize.fn('AVG', db.Sequelize.col('total_score')), 'avg']],
      where: { user_id: req.userId }
    });
    const totalPractice = await db.LearningRecord.sum('practice_count', { where: { user_id: req.userId } }) || 0;
    const totalDuration = await db.LearningRecord.sum('total_duration', { where: { user_id: req.userId } }) || 0;
    const ranking = await db.Ranking.findOne({ where: { user_id: req.userId } });
    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = await db.LearningRecord.findOne({ where: { user_id: req.userId, date: today } });
    return success(res, {
      totalInterviews: interviewCount, avgScore: avgScore ? parseFloat(avgScore.dataValues.avg || 0).toFixed(1) : '0.0',
      totalPractice, totalDuration: Math.round(totalDuration / 60),
      rank: ranking ? ranking.total_rank : null,
      todayPractice: todayRecord ? todayRecord.practice_count : 0,
      growthValue: ranking ? ranking.growth_value : 0
    });
  } catch (error) { return serverError(res, error); }
};

exports.getDailyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);
    const records = await db.LearningRecord.findAll({
      where: { user_id: req.userId, date: { [Op.between]: [start, end] } },
      order: [['date', 'ASC']]
    });
    return success(res, { list: records });
  } catch (error) { return serverError(res, error); }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await db.Interview.findAll({
      attributes: ['position_id', [db.Sequelize.fn('COUNT', '*'), 'count'], [db.Sequelize.fn('AVG', db.Sequelize.col('total_score')), 'avg']],
      where: { user_id: req.userId, status: 'completed' },
      group: ['position_id'],
      include: [{ model: db.Position, as: 'position', attributes: ['name'] }]
    });
    return success(res, { stats });
  } catch (error) { return serverError(res, error); }
};

exports.getGrowthData = async (req, res) => {
  try {
    const reports = await db.ScoreReport.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'ASC']],
      attributes: ['total_score', 'created_at'],
      limit: 30
    });
    return success(res, { data: reports });
  } catch (error) { return serverError(res, error); }
};

exports.getRadarData = async (req, res) => {
  try {
    const reports = await db.ScoreReport.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']], limit: 5,
      attributes: ['professional_score', 'expression_score', 'logic_score', 'understanding_score']
    });
    if (reports.length === 0) return success(res, { radar: { '专业知识': 0, '表达能力': 0, '逻辑思维': 0, '问题理解': 0 } });
    const sum = { professional: 0, expression: 0, logic: 0, understanding: 0 };
    reports.forEach(r => { sum.professional += parseFloat(r.professional_score); sum.expression += parseFloat(r.expression_score); sum.logic += parseFloat(r.logic_score); sum.understanding += parseFloat(r.understanding_score); });
    return success(res, { radar: { '专业知识': (sum.professional / reports.length).toFixed(1), '表达能力': (sum.expression / reports.length).toFixed(1), '逻辑思维': (sum.logic / reports.length).toFixed(1), '问题理解': (sum.understanding / reports.length).toFixed(1) } });
  } catch (error) { return serverError(res, error); }
};

exports.recordLearning = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { practice_count = 0, duration = 0, score = 0, question_count = 0 } = req.body;
    const [record] = await db.LearningRecord.findOrCreate({ where: { user_id: req.userId, date: today }, defaults: { practice_count, total_duration: duration, avg_score: score, question_count } });
    if (record) {
      await record.update({
        practice_count: record.practice_count + practice_count,
        total_duration: record.total_duration + duration,
        avg_score: record.avg_score > 0 ? ((parseFloat(record.avg_score) + score) / 2).toFixed(1) : score,
        question_count: record.question_count + question_count
      });
    }
    return success(res, null, '记录成功');
  } catch (error) { return serverError(res, error); }
};
