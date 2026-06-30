const rankingService = require('../services/ranking.service');
const { success, paginated, serverError } = require('../utils/response');

exports.getRankings = async (req, res) => {
  try {
    const { type = 'total', page = 1, pageSize = 20 } = req.query;
    const result = await rankingService.getRankings(type, parseInt(page), parseInt(pageSize));
    return paginated(res, result);
  } catch (error) { return serverError(res, error); }
};

exports.getMyRank = async (req, res) => {
  try {
    const rank = await rankingService.getUserRank(req.userId);
    return success(res, { rank });
  } catch (error) { return serverError(res, error); }
};
