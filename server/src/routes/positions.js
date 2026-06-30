const router = require('express').Router();
const ctrl = require('../controllers/position.controller');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/categories', ctrl.categories);
router.get('/:id', ctrl.detail);
router.post('/', authenticateAdmin, ctrl.create);
router.put('/:id', authenticateAdmin, ctrl.update);
router.delete('/:id', authenticateAdmin, ctrl.delete);

module.exports = router;
