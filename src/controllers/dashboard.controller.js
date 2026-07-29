const dashboardService = require("../services/dashboard.service");
const asyncHandler = require("../middlewares/async.middleware");
const { success } = require("../utils/apiResponse");

exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardSummary();

  return success(res, result.data, "Dashboard loaded");
});

exports.getMonthlySales = asyncHandler(async (req, res) => {
  const result = await dashboardService.getMonthlySales();

  return success(res, result.data, "Monthly sales fetched successfully");
});

exports.getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const result = await dashboardService.getTopProducts(limit);

  return success(res, result.data, "Top products fetched successfully");
});

exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const result = await dashboardService.getLowStockProducts();

  return success(res, result.data, "Low stock products fetched successfully");
});