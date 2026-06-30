const notificationService = require('../services/notification.service');
const { success, paginated, fail, serverError } = require('../utils/response');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, type } = req.query;
    const result = await notificationService.getMessages(req.userId, type, parseInt(page), parseInt(pageSize));
    return paginated(res, result);
  } catch (error) { return serverError(res, error); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.userId);
    return success(res, { count });
  } catch (error) { return serverError(res, error); }
};

exports.read = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.userId);
    return success(res, null, '已读');
  } catch (error) { return serverError(res, error); }
};

exports.readAll = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.userId);
    return success(res, null, '全部已读');
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    await notificationService.deleteMessage(req.params.id, req.userId);
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};
