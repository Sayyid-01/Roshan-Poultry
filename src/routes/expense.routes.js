const router = require("express").Router();

const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expense.controller");

const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);

module.exports = router;