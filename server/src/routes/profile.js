const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, ctrl.updateProfile);
router.put('/change-password', authenticate, ctrl.changePassword);
router.post('/avatar', authenticate, uploadAvatar, async (req, res) => {
  const { success, serverError } = require('../utils/response');
  try {
    if (!req.file) return require('../utils/response').fail(res, '请上传头像');
    const storageService = require('../services/storage.service');
    const url = await storageService.uploadAvatar(req.file);
    await req.user.update({ avatar_url: url });
    return success(res, { avatar_url: url }, '上传成功');
  } catch (error) { return serverError(res, error); }
});

module.exports = router;
