const Order = require("../models/order.model");

const getOrderById = async (id) => {
  const order = await Order.findById(id);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

module.exports = {
  getOrderById,
};