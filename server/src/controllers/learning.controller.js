const db = require('../models');
const aiService = require('../services/ai.service');
const notificationService = require('../services/notification.service');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.generate = async (req, res) => {
  try {
    const { position_id, interview_id } = req.body;
    const position = position_id ? await db.Position.findByPk(position_id) : null;
    const weaknesses = req.body.weaknesses || ['基础知识', '项目经验', '系统设计'];
    const pathData = await aiService.generateLearningPath(position ? position.name : '通用', weaknesses, req.body.currentLevel || 'junior');
    const learningPath = await db.LearningPath.create({
      user_id: req.userId, position_id: position_id || null, interview_id: interview_id || null,
      title: pathData.title, path_data: pathData,
      total_steps: (pathData.steps || []).length,
      started_at: new Date()
    });
    await notificationService.sendLearningRecommendation(req.userId, learningPath.id);
    return success(res, { learningPath }, '学习路线生成成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.getCurrent = async (req, res) => {
  try {
    const path = await db.LearningPath.findOne({ where: { user_id: req.userId, status: 'active' }, order: [['created_at', 'DESC']] });
    return success(res, { learningPath: path });
  } catch (error) { return serverError(res, error); }
};

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { rows, count } = await db.LearningPath.findAndCountAll({
      where: { user_id: req.userId }, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.Position, as: 'position', attributes: ['id', 'name'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.updateProgress = async (req, res) => {
  try {
    const path = await db.LearningPath.findByPk(req.params.id);
    if (!path || path.user_id !== req.userId) return fail(res, '学习路线不存在', 404);
    const { completed_steps } = req.body;
    const progress = path.total_steps > 0 ? Math.round((completed_steps / path.total_steps) * 100) : 0;
    await path.update({ completed_steps, progress });
    return success(res, { learningPath: path }, '进度已更新');
  } catch (error) { return serverError(res, error); }
};

exports.complete = async (req, res) => {
  try {
    const path = await db.LearningPath.findByPk(req.params.id);
    if (!path || path.user_id !== req.userId) return fail(res, '学习路线不存在', 404);
    await path.update({ status: 'completed', progress: 100, completed_at: new Date() });
    return success(res, { learningPath: path }, '学习路线已完成');
  } catch (error) { return serverError(res, error); }
};

exports.getRecommendation = async (req, res) => {
  try {
    const reports = await db.ScoreReport.findAll({ where: { user_id: req.userId }, order: [['created_at', 'DESC']], limit: 3 });
    const allWeaknesses = [];
    reports.forEach(r => { try { const w = JSON.parse(r.weaknesses || '[]'); allWeaknesses.push(...w); } catch (e) {} });
    const recommendations = [...new Set(allWeaknesses)].slice(0, 5);
    return success(res, { recommendations });
  } catch (error) { return serverError(res, error); }
};
