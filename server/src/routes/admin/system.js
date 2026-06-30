const router = require("express").Router();
const ctrl = require("../../controllers/admin/system.controller");
const { authenticateAdmin } = require("../../middleware/auth");
router.use(authenticateAdmin);
router.get("/logs", ctrl.getLogs);
router.get("/config", ctrl.getConfig);
router.put("/config", ctrl.updateConfig);
module.exports = router;
