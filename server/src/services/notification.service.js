const db = require('../models');

class NotificationService {
  async send(userId, title, content, type = 'system', relatedId = null) {
    return db.Message.create({ user_id: userId, title, content, type, related_id: relatedId });
  }

  async sendInterviewComplete(userId, interviewId) {
    return this.send(userId, '面试完成', '您的AI模拟面试已完成，点击查看详细报告和评分。', 'interview', interviewId);
  }

  async sendResumeAnalysisComplete(userId, analysisId) {
    return this.send(userId, '简历分析完成', '您的简历已分析完毕，点击查看优化建议和岗位匹配度。', 'resume', analysisId);
  }

  async sendLearningRecommendation(userId, pathId) {
    return this.send(userId, '学习路线已生成', '根据您的面试表现，已为您生成个性化学习路线。', 'task', pathId);
  }

  async sendSystemAnnouncement(title, content, userIds = null) {
    if (userIds && userIds.length > 0) {
      const messages = userIds.map(uid => ({ user_id: uid, title, content, type: 'system' }));
      return db.Message.bulkCreate(messages);
    }
    const users = await db.User.findAll({ where: { status: 1 }, attributes: ['id'] });
    const messages = users.map(u => ({ user_id: u.id, title, content, type: 'system' }));
    return db.Message.bulkCreate(messages);
  }

  async markAsRead(messageId, userId) {
    return db.Message.update({ is_read: 1 }, { where: { id: messageId, user_id: userId } });
  }

  async markAllAsRead(userId) {
    return db.Message.update({ is_read: 1 }, { where: { user_id: userId, is_read: 0 } });
  }

  async getUnreadCount(userId) {
    return db.Message.count({ where: { user_id: userId, is_read: 0 } });
  }

  async getMessages(userId, type = null, page = 1, pageSize = 20) {
    const where = { user_id: userId };
    if (type) where.type = type;
    const { rows, count } = await db.Message.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    return { list: rows, total: count, page, pageSize };
  }

  async deleteMessage(messageId, userId) {
    return db.Message.destroy({ where: { id: messageId, user_id: userId } });
  }
}

module.exports = new NotificationService();
