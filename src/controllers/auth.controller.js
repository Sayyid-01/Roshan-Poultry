const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/notification.service");

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let user = null;

    if (email) {
      user = await User.findOne({
        email: email.trim().toLowerCase(),
      });
    } else if (phone) {
      user = await User.findOne({
        phone: phone.trim(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    

    if (email) {
      user = await User.findOne({
        email: email.trim().toLowerCase(),
      });
    }

    const match = await bcrypt.compare(password, user.password);


    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExist = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    sendWelcomeEmail(user).catch((error) => console.error("Welcome email failed:", error.message));

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
