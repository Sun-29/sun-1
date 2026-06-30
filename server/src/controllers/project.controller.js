const db = require('../models');
const aiService = require('../services/ai.service');
const { success, fail, serverError } = require('../utils/response');

exports.drill = async (req, res) => {
  try {
    const { project_name, project_description } = req.body;
    if (!project_name) return fail(res, '请输入项目名称');
    const questions = await aiService.generateProjectDrill(project_name, project_description || '');
    const interview = await db.Interview.create({
      user_id: req.userId, position_id: 1, difficulty: 'mid', duration: 30,
      question_count: questions.length, title: `项目深挖: ${project_name}`, status: 'pending'
    });
    const details = questions.map((q, i) => ({
      interview_id: interview.id, question_content: q.question, question_type: 'project', question_order: i + 1
    }));
    await db.InterviewDetail.bulkCreate(details);
    const created = await db.Interview.findByPk(interview.id, { include: [{ model: db.InterviewDetail, as: 'details' }] });
    return success(res, { interview: created }, '项目深挖面试创建成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.submitDrillAnswer = async (req, res) => {
  try {
    const { interview_id, detail_id, answer } = req.body;
    const detail = await db.InterviewDetail.findByPk(detail_id);
    if (!detail) return fail(res, '题目不存在', 404);
    await detail.update({ user_answer: answer });
    try {
      const scoreResult = await aiService.scoreAnswer(detail.question_content, answer, '通用技术');
      await detail.update({ ai_score: scoreResult.score, ai_comment: scoreResult.comment });
    } catch (e) { /* scoring failed */ }
    const interview = await db.Interview.findByPk(interview_id);
    await interview.update({ current_question_index: interview.current_question_index + 1 });
    return success(res, { detail, nextIndex: interview.current_question_index + 1 });
  } catch (error) { return serverError(res, error); }
};

exports.getDrillHistory = async (req, res) => {
  try {
    const interviews = await db.Interview.findAll({
      where: { user_id: req.userId, title: { [require('sequelize').Op.like]: '项目深挖:%' } },
      order: [['created_at', 'DESC']], limit: 20
    });
    return success(res, { list: interviews });
  } catch (error) { return serverError(res, error); }
};
