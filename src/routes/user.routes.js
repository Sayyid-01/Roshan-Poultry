const router = require("express").Router();

const {
  protect,
  authorize,
} = require("../middlewares/auth.middleware");

const {
  createAccountant,
  getAllUsers,
  deleteUser,
} = require("../controllers/user.controller");

router.post(
  "/accountant",
  protect,
  authorize("ADMIN"),
  createAccountant
);

router.get(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  getAllUsers
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteUser
);

module.exports = router;