const db = require('../../models');
const { success, paginated, fail, serverError } = require('../../utils/response');

exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { rows, count } = await db.ResumeAnalysis.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize), offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [{ model: db.User, as: 'user', attributes: ['id', 'nickname', 'phone'] }]
    });
    return paginated(res, { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (error) { return serverError(res, error); }
};

exports.getDetail = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id, { include: [{ model: db.User, as: 'user' }] });
    if (!analysis) return fail(res, '记录不存在', 404);
    return success(res, { analysis });
  } catch (error) { return serverError(res, error); }
};

exports.delete = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id);
    if (!analysis) return fail(res, '记录不存在', 404);
    await analysis.destroy();
    return success(res, null, '删除成功');
  } catch (error) { return serverError(res, error); }
};

exports.download = async (req, res) => {
  try {
    const analysis = await db.ResumeAnalysis.findByPk(req.params.id);
    if (!analysis) return fail(res, '记录不存在', 404);
    const path = require('path');
    const filePath = path.join(__dirname, '../../../', analysis.file_url);
    const fs = require('fs');
    if (!fs.existsSync(filePath)) return fail(res, '文件不存在', 404);
    return res.download(filePath, analysis.file_name);
  } catch (error) { return serverError(res, error); }
};
