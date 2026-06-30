const router = require('express').Router();
const ctrl = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getList);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/:id/read', ctrl.read);
router.put('/read-all', ctrl.readAll);
router.delete('/:id', ctrl.delete);

module.exports = router;
