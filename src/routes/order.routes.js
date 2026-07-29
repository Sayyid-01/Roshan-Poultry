const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  getInvoice,
  getCustomerOrders,
  trackOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} = require(
  "../controllers/order.controller"
);

router.post("/", createOrder);
router.post("/shop", createOrder);
router.get("/customer/:customerId", getCustomerOrders);
router.get("/track/:orderNumber", trackOrder);

router.get("/", getOrders);

router.get("/:id", getOrderById);
router.get("/:id/invoice", getInvoice);

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
