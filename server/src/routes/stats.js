const router = require('express').Router();
const ctrl = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/overview', ctrl.getOverview);
router.get('/daily', ctrl.getDailyStats);
router.get('/categories', ctrl.getCategoryStats);
router.get('/growth', ctrl.getGrowthData);
router.get('/radar', ctrl.getRadarData);
router.post('/record', ctrl.recordLearning);

module.exports = router;
