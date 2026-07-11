const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.createCustomer = async (req, res) => {
  console.log("===== CREATE CUSTOMER API HIT =====");
  console.log("BODY:", req.body);
  console.log("LOGGED IN USER:", req.user);

  try {
    const { name, email, phone, password, address } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }
    console.log("REQUEST TIME:", new Date());
    // Check if customer already exists
    const userExist = await User.findOne({
      $or: [{ email }, { phone }],
    });

    console.log("USER EXIST:", userExist);

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

    console.log("CREATED CUSTOMER:", customer);

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
    console.error("CREATE CUSTOMER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};