const router = require("express").Router();

const {
  createAccountant,
} = require("../controllers/admin.controller");

const {
  protect,
  authorize,
} = require("../middlewares/auth.middleware");

router.post(
  "/accountants",
  protect,
  authorize("ADMIN"),
  createAccountant
);

module.exports = router;