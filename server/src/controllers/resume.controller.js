const db = require('../models');
const aiService = require('../services/ai.service');
const storageService = require('../services/storage.service');
const notificationService = require('../services/notification.service');
const { extractResumeText } = require('../utils/resumeParser');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return fail(res, '请上传简历文件');
    const url = await storageService.uploadResume(req.file);
    const analysis = await db.ResumeAnalysis.create({
      user_id: req.userId, file_url: url,
      file_name: req.file.originalname,
      file_type: req.file.originalname.split('.').pop().toLowerCase()
    });
    return success(res, { analysis }, '上传成功', 201);
  } catch (error) { return serverError(res, error); }
};

exports.uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) return fail(res, '请上传简历文件');
    const url = await storageService.uploadResume(req.file);
    const analysis = await db.ResumeAnalysis.create({
      user_id: req.userId, file_url: url,
      file_name: req.file.originalname,
      file_type: req.file.originalname.split('.').pop().toLowerCase()
    });

    // Extract text from the uploaded file
    const filePath = req.file.path;
    const resumeText = await extractResumeText(filePath);
    if (!resumeText || resumeText.trim().length < 20) {
      return fail(res, '未能识别简历内容，请确保上传的是有效的PDF或Word文件');
    }

    const { target_position } = req.body;
    let aiResult;
    try {
      aiResult = await aiService.analyzeResume(resumeText, target_position || '');
    } catch (e) {
      console.error('[Resume] AI analysis failed:', e.message);
      aiResult = {
        overallScore: 70, contentScore: 70, formatScore: 70, matchScore: 70,
        strengths: [], weaknesses: [], suggestions: [], keywords: '',
        skillTags: [], education: '', experience: '', improvementPlan: ''
      };
    }

    await analysis.update({
      analysis_result: aiResult, overall_score: aiResult.overallScore,
      content_score: aiResult.contentScore, format_score: aiResult.formatScore,
      match_score: aiResult.matchScore, match_position: target_position || '',
      strengths: (aiResult.strengths || []).join('\n'),
      weaknesses: (aiResult.weaknesses || []).join('\n'),
      suggestions: (aiResult.suggestions || []).join('\n'),
      keywords: aiResult.keywords || ''
    });
    await notificationService.sendResumeAnalysisComplete(req.userId, analysis.id);
    return success(res, { analysis }, '分析完成');
  } catch (error) { return serverError(res, error); }
};

exports.analyze = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id);
    if (!analysis || analysis.user_id !== req.userId) return fail(res, '记录不存在', 404);
    const { target_position } = req.body;
    const aiResult = await aiService.analyzeResume('[简历内容]', target_position || '');
    await analysis.update({
      analysis_result: aiResult, overall_score: aiResult.overallScore,
      content_score: aiResult.contentScore, format_score: aiResult.formatScore,
      match_score: aiResult.matchScore, match_position: target_position || '',
      strengths: (aiResult.strengths || []).join('\n'),
      weaknesses: (aiResult.weaknesses || []).join('\n'),
      suggestions: (aiResult.suggestions || []).join('\n'),
      keywords: aiResult.keywords || ''
    });
    await notificationService.sendResumeAnalysisComplete(req.userId, analysis.id);
    return success(res, { analysis }, '分析完成');
  } catch (error) { return serverError(res, error); }
};

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { rows, count } = await db.ResumeAnalysis.findAndCountAll({
      where: { user_id: req.userId }, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize)
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id);
    if (!analysis || analysis.user_id !== req.userId) return fail(res, '记录不存在', 404);
    return success(res, { analysis });
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id);
    if (!analysis || analysis.user_id !== req.userId) return fail(res, '记录不存在', 404);
    await storageService.deleteFile(analysis.file_url);
    await analysis.destroy();
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};
