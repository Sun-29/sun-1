const router = require('express').Router();
const ctrl = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/drill', ctrl.drill);
router.post('/:id/answer', ctrl.submitDrillAnswer);
router.get('/history', ctrl.getDrillHistory);

module.exports = router;
