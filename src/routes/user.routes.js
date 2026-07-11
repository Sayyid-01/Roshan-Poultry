const router = require("express").Router();

const protect = require(
  "../middlewares/auth.middleware"
);

const authorize = require(
  "../middlewares/role.middleware"
);

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
  authorize("ADMIN"),
  getAllUsers
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteUser
);

module.exports = router;