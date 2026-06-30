const notificationService = require('../../services/notification.service');
const { success, paginated, serverError } = require('../../utils/response');

exports.broadcast = async (req, res) => {
  try {
    const { title, content, user_ids } = req.body;
    if (!title || !content) return fail(res, '请填写标题和内容');
    const result = await notificationService.sendSystemAnnouncement(title, content, user_ids || null);
    return success(res, { count: result.length }, '发送成功');
  } catch (error) { return serverError(res, error); }
};

exports.getList = async (req, res) => {
  try {
    const db = require('../../models');
    const { page = 1, pageSize = 20 } = req.query;
    const { rows, count } = await db.Message.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};
