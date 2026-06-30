const router = require("express").Router();
const ctrl = require("../../controllers/admin/resume.controller");
const { authenticateAdmin } = require("../../middleware/auth");
router.use(authenticateAdmin);
router.get("/", ctrl.getList);
router.get("/:id", ctrl.getDetail);
router.delete("/:id", ctrl.delete);
router.get("/:id/download", ctrl.download);
module.exports = router;
