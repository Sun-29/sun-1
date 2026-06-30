const router = require("express").Router();
const ctrl = require("../../controllers/admin/message.controller");
const { authenticateAdmin } = require("../../middleware/auth");
router.use(authenticateAdmin);
router.post("/broadcast", ctrl.broadcast);
router.get("/", ctrl.getList);
module.exports = router;
