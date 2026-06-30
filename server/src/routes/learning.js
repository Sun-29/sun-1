const router = require('express').Router();
const ctrl = require('../controllers/learning.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/generate', ctrl.generate);
router.get('/current', ctrl.getCurrent);
router.get('/', ctrl.getList);
router.put('/:id/progress', ctrl.updateProgress);
router.put('/:id/complete', ctrl.complete);
router.get('/recommendations', ctrl.getRecommendation);

module.exports = router;
