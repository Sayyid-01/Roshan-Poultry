const router = require("express").Router();

const {
  createCustomer,
} = require("../controllers/accountant.controller");

const {
  protect,
  authorize,
} = require("../middlewares/auth.middleware");

router.post(
  "/customers",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  createCustomer
);

module.exports = router;