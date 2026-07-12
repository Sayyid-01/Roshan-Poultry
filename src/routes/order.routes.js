const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} = require(
  "../controllers/order.controller"
);

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/:id", getOrderById);

router.patch(
  "/:id/status",
  updateOrderStatus
);

router.patch(
  "/:id/payment",
  updatePaymentStatus
);

router.patch(
  "/:id/cancel",
  cancelOrder
);

module.exports = router;