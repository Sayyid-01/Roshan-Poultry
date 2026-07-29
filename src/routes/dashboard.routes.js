const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const { protect } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

router.get(
  "/summary",
  protect,
  authorizeRoles("ADMIN", "ACCOUNTANT"),
  dashboardController.getDashboardSummary
);

router.get(
  "/monthly-sales",
  protect,
  authorizeRoles("ADMIN", "ACCOUNTANT"),
  dashboardController.getMonthlySales
);

router.get(
  "/top-products",
  protect,
  authorizeRoles("ADMIN", "ACCOUNTANT"),
  dashboardController.getTopProducts
);

router.get(
  "/low-stock",
  protect,
  authorizeRoles("ADMIN", "ACCOUNTANT"),
  dashboardController.getLowStockProducts
);

module.exports = router;