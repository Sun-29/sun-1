const { Op } = require('sequelize');
const db = require('../models');

class RankingService {
  async updateRanking(userId, data) {
    const { score = 0, practiceCount = 1, duration = 0 } = data;
    const [ranking] = await db.Ranking.findOrCreate({
      where: { user_id: userId },
      defaults: { total_score: 0, practice_count: 0, growth_value: 0, week_score: 0, month_score: 0 }
    });
    await ranking.update({
      total_score: parseFloat(ranking.total_score) + score * 0.3,
      practice_count: ranking.practice_count + practiceCount,
      growth_value: ranking.growth_value + Math.round(score * 10) + duration,
      week_score: parseFloat(ranking.week_score) + score * 0.5,
      month_score: parseFloat(ranking.month_score) + score * 0.4
    });
    return ranking;
  }

  async calculateRankings(type = 'total') {
    const scoreField = type === 'week' ? 'week_score' : type === 'month' ? 'month_score' : 'total_score';
    const rankField = type === 'week' ? 'week_rank' : type === 'month' ? 'month_rank' : 'total_rank';
    const rankings = await db.Ranking.findAll({
      order: [[scoreField, 'DESC']],
      where: { [scoreField]: { [Op.gt]: 0 } }
    });
    for (let i = 0; i < rankings.length; i++) {
      await rankings[i].update({ [rankField]: i + 1 });
    }
  }

  async getRankings(type = 'total', page = 1, pageSize = 20) {
    const scoreField = type === 'week' ? 'week_score' : type === 'month' ? 'month_score' : 'total_score';
    const rankField = type === 'week' ? 'week_rank' : type === 'month' ? 'month_rank' : 'total_rank';
    const { rows, count } = await db.Ranking.findAndCountAll({
      where: { [scoreField]: { [Op.gt]: 0 } },
      order: [[rankField, 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname', 'avatar_url', 'school', 'job_direction'] }]
    });
    return { list: rows, total: count, page, pageSize };
  }

  async getUserRank(userId) {
    return db.Ranking.findOne({
      where: { user_id: userId },
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname', 'avatar_url', 'school'] }]
    });
  }
}

module.exports = new RankingService();
