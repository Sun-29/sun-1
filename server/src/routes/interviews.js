const router = require('express').Router();
const ctrl = require('../controllers/interview.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', ctrl.create);
router.get('/', ctrl.getList);
router.get('/:id', ctrl.getDetail);
router.put('/:id/start', ctrl.startInterview);
router.post('/answer', ctrl.submitAnswer);
router.post('/:id/complete', ctrl.completeInterview);
router.get('/:id/report', ctrl.getReport);
router.get('/:id/current-question', ctrl.getCurrentQuestion);
router.post('/:id/skip', ctrl.skipQuestion);

module.exports = router;
