const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customerId,
      items,
      notes,
    } = req.body;

    if (!customerId || !items || !items.length) {
      throw new Error(
        "Customer and items are required"
      );
    }

    const customer = await User.findById(
      customerId
    ).session(session);

    if (!customer) {
      throw new Error("Customer not found");
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(
        item.productId
      ).session(session);

      if (!product) {
        throw new Error(
          `Product not found: ${item.productId}`
        );
      }

      if (!product.isActive) {
        throw new Error(
          `${product.name} is inactive`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `${product.name} has insufficient stock`
        );
      }

      const itemTotal =
        product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      totalAmount += itemTotal;

      product.stock -= item.quantity;

      await product.save({ session });
    }

    const orderNumber =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1000);

    const order = await Order.create(
      [
        {
          orderNumber,
          customer: customerId,
          items: orderItems,
          totalAmount,
          notes,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "customer",
        "name email phone"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getOrderById = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email phone address"
      )
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const { paymentStatus } =
      req.body;

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true }
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message:
        "Payment status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelOrder = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const order =
      await Order.findById(
        req.params.id
      ).session(session);

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    if (
      order.status ===
      "CANCELLED"
    ) {
      throw new Error(
        "Order already cancelled"
      );
    }

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        ).session(session);

      if (product) {
        product.stock +=
          item.quantity;

        await product.save({
          session,
        });
      }
    }

    order.status = "CANCELLED";

    await order.save({
      session,
    });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message:
        "Order cancelled and stock restored",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};