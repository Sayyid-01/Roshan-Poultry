const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.createCustomer = async (req, res) => {

  try {
    const { name, email, phone, password, address } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }
    // Check if customer already exists
    const userExist = await User.findOne({
      $or: [{ email }, { phone }],
    });


    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role: "CUSTOMER",
    });


    // Response
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};