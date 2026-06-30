const router = require('express').Router();
const ctrl = require('../controllers/ranking.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', ctrl.getRankings);
router.get('/me', authenticate, ctrl.getMyRank);

module.exports = router;
