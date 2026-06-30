const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/wechat-login', ctrl.wechatLogin);
router.post('/admin/login', ctrl.adminLogin);
router.post('/refresh-token', ctrl.refreshToken);

module.exports = router;
