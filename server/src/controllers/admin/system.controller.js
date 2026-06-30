const db = require('../../models');
const { Op } = require('sequelize');
const { success, paginated, serverError } = require('../../utils/response');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, module, action, startDate, endDate } = req.query;
    const where = {};
    if (module) where.module = module;
    if (action) where.action = action;
    if (startDate && endDate) where.created_at = { [Op.between]: [startDate, endDate] };
    const { rows, count } = await db.SystemLog.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'nickname'] },
        { model: db.Admin, as: 'admin', attributes: ['id', 'username'] }
      ]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getConfig = async (req, res) => {
  try {
    return success(res, {
      siteName: 'AI面试模拟系统',
      maxInterviewDuration: 60,
      maxDailyInterviews: 10,
      aiModel: 'deepseek',
      enableRegistration: true
    });
  } catch (error) { return serverError(res, error); }
};

exports.updateConfig = async (req, res) => {
  try {
    return success(res, null, '配置更新成功（演示）');
  } catch (error) { return serverError(res, error); }
};
