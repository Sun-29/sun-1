const success = (res, data = null, message = 'success', statusCode = 200) => {
  return res.status(statusCode).json({ code: statusCode, message, data });
};

const paginated = (res, { list, total, page, pageSize }) => {
  const totalPages = Math.ceil(total / pageSize);
  return res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      list,
      pagination: { total, page, pageSize, totalPages }
    }
  });
};

const fail = (res, message = '操作失败', statusCode = 400, code = null) => {
  return res.status(statusCode).json({ code: code || statusCode, message, data: null });
};

const serverError = (res, error) => {
  console.error('[ServerError]', error);
  return res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
};

module.exports = { success, paginated, fail, serverError };
