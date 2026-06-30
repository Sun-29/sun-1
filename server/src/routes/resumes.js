const router = require('express').Router();
const ctrl = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.use(authenticate);
router.post('/upload', uploadResume, ctrl.upload);
router.post('/upload-and-analyze', uploadResume, ctrl.uploadAndAnalyze);
router.post('/:id/analyze', ctrl.analyze);
router.get('/', ctrl.getList);
router.get('/:id', ctrl.getDetail);
router.delete('/:id', ctrl.delete);

module.exports = router;
