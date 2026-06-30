const db = require('../models');
const aiService = require('../services/ai.service');
const notificationService = require('../services/notification.service');
const rankingService = require('../services/ranking.service');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.create = async (req, res) => {
  try {
    const { position_id, difficulty = 'junior', duration = 30, question_count = 5 } = req.body;
    if (!position_id) return fail(res, '请选择面试岗位');
    const position = await db.Position.findByPk(position_id);
    if (!position) return fail(res, '岗位不存在');
    const questions = await aiService.generateQuestions(position.name, difficulty, question_count);
    const interview = await db.Interview.create({
      user_id: req.userId, position_id, difficulty, duration,
      question_count: questions.length,
      title: `${position.name} - ${difficulty === 'junior' ? '初级' : difficulty === 'mid' ? '中级' : '高级'}面试`
    });
    const details = questions.map((q, i) => ({
      interview_id: interview.id,
      question_content: q.content || q.question || '',
      question_type: q.type || 'basic',
      question_order: i + 1,
      answer_type: 'text'
    }));
    await db.InterviewDetail.bulkCreate(details);
    const created = await db.Interview.findByPk(interview.id, {
      include: [
        { model: db.Position, as: 'position', attributes: ['id', 'name', 'category'] },
        { model: db.InterviewDetail, as: 'details', order: [['question_order', 'ASC']] }
      ]
    });
    return success(res, { interview: created }, '面试创建成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const where = { user_id: req.userId };
    if (status) where.status = status;
    const { rows, count } = await db.Interview.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.Position, as: 'position', attributes: ['id', 'name', 'category'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id, {
      include: [
        { model: db.Position, as: 'position' },
        { model: db.InterviewDetail, as: 'details' },
        { model: db.ScoreReport, as: 'scoreReport' }
      ],
      order: [[{ model: db.InterviewDetail, as: 'details' }, 'question_order', 'ASC']]
    });
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    return success(res, { interview });
  } catch (error) { return serverError(res, error); }
};

exports.startInterview = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id);
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    if (interview.status !== 'pending') return fail(res, '面试状态不正确');
    await interview.update({ status: 'ongoing', started_at: new Date() });
    return success(res, { interview }, '面试已开始');
  } catch (error) { return serverError(res, error); }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { interview_id, detail_id, answer, voice_url } = req.body;
    const interview = await db.Interview.findByPk(interview_id);
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    const detail = await db.InterviewDetail.findByPk(detail_id);
    if (!detail || detail.interview_id !== interview.id) return fail(res, '题目不存在', 404);

    await detail.update({ user_answer: answer, voice_url: voice_url || null, answer_type: voice_url ? 'voice' : 'text' });

    // AI评分
    try {
      const scoreResult = await aiService.scoreAnswer(detail.question_content, answer, (await interview.getPosition()).name);
      await detail.update({
        ai_score: scoreResult.score,
        ai_comment: scoreResult.comment
      });
    } catch (e) {
      console.error('[Interview] Score answer failed:', e.message);
    }

    // 检查是否生成追问 (50%概率)
    const shouldFollowUp = Math.random() > 0.5 && !detail.is_follow_up && interview.current_question_index < interview.question_count;
    let followUpDetail = null;
    if (shouldFollowUp) {
      try {
        const position = await db.Position.findByPk(interview.position_id);
        const followUp = await aiService.generateFollowUp(detail.question_content, answer, position.name);
        followUpDetail = await db.InterviewDetail.create({
          interview_id: interview.id,
          question_content: followUp.question,
          question_type: followUp.type || 'open',
          question_order: interview.current_question_index + 1,
          is_follow_up: 1,
          parent_detail_id: detail.id
        });
      } catch (e) {
        console.error('[Interview] Follow-up generation failed:', e.message);
      }
    }

    // 推进题目索引
    if (!followUpDetail) {
      await interview.update({ current_question_index: interview.current_question_index + 1 });
      if (interview.current_question_index >= interview.question_count) {
        await interview.update({ status: 'completed', finished_at: new Date() });
      }
    }

    return success(res, { detail, followUp: followUpDetail, nextIndex: interview.current_question_index, isComplete: interview.status === 'completed' });
  } catch (error) { return serverError(res, error); }
};

exports.completeInterview = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id, {
      include: [{ model: db.InterviewDetail, as: 'details' }]
    });
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    const details = interview.details.filter(d => !d.is_follow_up && d.user_answer);
    if (details.length === 0) return fail(res, '请至少回答一道题');

    // 根据实际作答题目计算基础分数
    const answeredDetails = details.filter(function(d) { return d.ai_score !== null; });
    var baseScore = 60;
    if (answeredDetails.length > 0) {
      var sum = answeredDetails.reduce(function(s, d) { return s + parseFloat(d.ai_score); }, 0);
      baseScore = Math.round(sum / answeredDetails.length);
    }
    // 根据答题率调整：答题率低时适当降低基础分
    var answerRate = details.length / (interview.question_count || 5);
    var adjustedScore = Math.round(baseScore * (0.5 + 0.5 * answerRate));

    const position = await db.Position.findByPk(interview.position_id);
    var report;
    try {
      report = await aiService.generateReport(details, position.name);
      // 兼容 AI 返回 snake_case 或 camelCase，并用实际答题分数修正
      report = {
        totalScore: Math.round(((report.totalScore || report.total_score || adjustedScore) + adjustedScore) / 2),
        professionalScore: report.professionalScore || report.professional_score || Math.round(adjustedScore * 0.9),
        expressionScore: report.expressionScore || report.expression_score || Math.round(adjustedScore * 0.85),
        logicScore: report.logicScore || report.logic_score || Math.round(adjustedScore * 0.85),
        understandingScore: report.understandingScore || report.understanding_score || Math.round(adjustedScore * 0.9),
        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        suggestions: report.suggestions || [],
        radarData: report.radarData || report.radar_data || {},
        detailedFeedback: report.detailedFeedback || report.detailed_feedback || ''
      };
    } catch (e) {
      console.error('[CompleteInterview] generateReport failed, using calculated scores:', e.message);
      report = {
        totalScore: adjustedScore,
        professionalScore: Math.round(adjustedScore * 0.9),
        expressionScore: Math.round(adjustedScore * 0.85),
        logicScore: Math.round(adjustedScore * 0.85),
        understandingScore: Math.round(adjustedScore * 0.9),
        strengths: ['完成面试'],
        weaknesses: ['需提升'],
        suggestions: ['多加练习'],
        radarData: { '专业知识': Math.round(adjustedScore * 0.9), '表达能力': Math.round(adjustedScore * 0.85), '逻辑思维': Math.round(adjustedScore * 0.85), '问题理解': Math.round(adjustedScore * 0.9) },
        detailedFeedback: '面试已完成。'
      };
    }

    const scoreReport = await db.ScoreReport.create({
      interview_id: interview.id, user_id: req.userId,
      total_score: report.totalScore, professional_score: report.professionalScore,
      expression_score: report.expressionScore, logic_score: report.logicScore,
      understanding_score: report.understandingScore,
      strengths: JSON.stringify(report.strengths || []),
      weaknesses: JSON.stringify(report.weaknesses || []),
      suggestions: JSON.stringify(report.suggestions || []),
      radar_data: report.radarData || {},
      detailed_feedback: report.detailedFeedback || ''
    });

    await interview.update({ status: 'completed', total_score: report.totalScore, finished_at: new Date() });
    await notificationService.sendInterviewComplete(req.userId, interview.id);
    await rankingService.updateRanking(req.userId, { score: report.totalScore, practiceCount: 1 });

    // 记录学习数据
    const today = new Date().toISOString().slice(0, 10);
    await db.LearningRecord.findOrCreate({ where: { user_id: req.userId, date: today }, defaults: { practice_count: 1, interview_count: 1, avg_score: report.totalScore, question_count: details.length } });
    await db.LearningRecord.update({ practice_count: db.sequelize.literal('practice_count + 1'), interview_count: db.sequelize.literal('interview_count + 1'), avg_score: report.totalScore, question_count: db.sequelize.literal(`question_count + ${details.length}`) }, { where: { user_id: req.userId, date: today } });

    // 保存错题（跳过AI生成的题目，它们没有question_id）
    const wrongAnswers = details.filter(d => d.ai_score !== null && parseFloat(d.ai_score) < 60 && d.question_id);
    for (const wa of wrongAnswers) {
      await db.WrongQuestion.create({ user_id: req.userId, question_id: wa.question_id, interview_detail_id: wa.id, user_answer: wa.user_answer, ai_analysis: wa.ai_comment, next_review_date: new Date(Date.now() + 3 * 86400000) });
    }

    return success(res, { interview, report: scoreReport }, '面试完成');
  } catch (error) { return serverError(res, error); }
};

exports.getReport = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id, { include: [{ model: db.ScoreReport, as: 'scoreReport' }] });
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    return success(res, { interview, report: interview.scoreReport });
  } catch (error) { return serverError(res, error); }
};

exports.getCurrentQuestion = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id, {
      include: [{ model: db.InterviewDetail, as: 'details', order: [['question_order', 'ASC']] }]
    });
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    const current = interview.details.find(d => d.question_order === interview.current_question_index + 1 && !d.user_answer);
    return success(res, { current, index: interview.current_question_index, total: interview.question_count });
  } catch (error) { return serverError(res, error); }
};

exports.skipQuestion = async (req, res) => {
  try {
    const interview = await db.Interview.findByPk(req.params.id);
    if (!interview || interview.user_id !== req.userId) return fail(res, '面试不存在', 404);
    await interview.update({ current_question_index: interview.current_question_index + 1 });
    if (interview.current_question_index >= interview.question_count) {
      await interview.update({ status: 'completed', finished_at: new Date() });
    }
    return success(res, { nextIndex: interview.current_question_index, isComplete: interview.status === 'completed' });
  } catch (error) { return serverError(res, error); }
};
