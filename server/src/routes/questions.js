const router = require('express').Router();
const ctrl = require('../controllers/question.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.list);
router.get('/random', optionalAuth, ctrl.random);
router.get('/favorites', authenticate, ctrl.getFavorites);
router.get('/wrong', authenticate, ctrl.getWrongQuestions);
router.get('/:id', optionalAuth, ctrl.detail);
router.post('/:id/favorite', authenticate, ctrl.toggleFavorite);
router.post('/:id/review-wrong', authenticate, ctrl.reviewWrongQuestion);
router.put('/:id/master-wrong', authenticate, ctrl.masterWrongQuestion);

module.exports = router;
