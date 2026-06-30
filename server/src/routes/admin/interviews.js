const router = require("express").Router();
const ctrl = require("../../controllers/admin/interview.controller");
const { authenticateAdmin } = require("../../middleware/auth");
router.use(authenticateAdmin);
router.get("/stats", ctrl.getStats);
router.get("/export", ctrl.exportInterviews);
router.get("/", ctrl.getList);
router.get("/:id", ctrl.getDetail);
module.exports = router;
