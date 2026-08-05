const User = require("../models/user.model");
const PendingRegistration = require("../models/pendingRegistration.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { sendOtpEmail, sendWelcomeEmail } = require("../services/notification.service");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Generate OTP, hash it, return plain OTP + expiry
const createOtp = async () => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return { otp, hashedOtp, otpExpiry };
};

// Helper to check if a user exists (either in User or PendingRegistration)
const checkExistingUser = async (email, phone) => {
  const existingUser = await User.findOne({
    $or: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
  });
  if (existingUser) return { exists: true, inPending: false };

  const existingPending = await PendingRegistration.findOne({
    $or: [{ email: email.trim().toLowerCase() }, { phone: phone.trim() }],
  });
  if (existingPending) return { exists: true, inPending: true };

  return { exists: false };
};

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, phone, password",
      });
    }

    // Validate phone: only digits and exactly 10
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits (numbers only).",
      });
    }

    // Check if user already exists (in User collection)
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone number.",
      });
    }

    // Remove any existing pending registration for this email/phone
    await PendingRegistration.deleteMany({
      $or: [
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() },
      ],
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const { otp, hashedOtp, otpExpiry } = await createOtp();

    // Store in pending registration (NOT in User collection yet)
    const pendingRegistration = await PendingRegistration.create({
      name,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry,
    });

    // Always log OTP to console for development/testing

    // Send OTP via email (fire and forget, but log if fails)
    sendOtpEmail(pendingRegistration.email, otp, pendingRegistration.name)

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email: pendingRegistration.email,
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    let user = null;

    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    } else if (phone) {
      // Validate phone format
      if (!/^\d{10}$/.test(phone.trim())) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits (numbers only).",
        });
      }
      user = await User.findOne({ phone: phone.trim() });
    } else {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate and store OTP in the user document
    const { otp, hashedOtp, otpExpiry } = await createOtp();
    user.otp = hashedOtp;
    console.log(`Generated OTP for ${user.email}: ${otp}`); // Log OTP for development/testing
    user.otpExpiry = otpExpiry;
    await user.save();

    // Always log OTP to console for development/testing

    // Send OTP via email
    sendOtpEmail(user.email, otp, user.name)

    return res.json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== VERIFY OTP ====================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try to find in PendingRegistration first (for new registrations)
    const pendingReg = await PendingRegistration.findOne({ email: normalizedEmail });

    if (pendingReg) {
      // Verify OTP expiry
      if (new Date() > pendingReg.otpExpiry) {
        await PendingRegistration.deleteOne({ _id: pendingReg._id });
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please register again.",
        });
      }

      // Verify OTP
      const isValid = await bcrypt.compare(otp, pendingReg.otp);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }

      // OTP is valid — create the actual User now
      const user = await User.create({
        name: pendingReg.name,
        email: pendingReg.email,
        phone: pendingReg.phone,
        password: pendingReg.password,
        role: "CUSTOMER",
        isVerified: true,
      });

      // Delete the pending registration
      await PendingRegistration.deleteOne({ _id: pendingReg._id });

      // Send welcome email
      sendWelcomeEmail(user).catch((err) =>
        console.error("Error sending welcome email:", err)
      );

      // Generate JWT token
      const token = generateToken(user);

      return res.json({
        success: true,
        message: "OTP verified successfully. Registration complete!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // If not in pending registration, check existing user (for login OTP verification)
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested. Please request a new OTP.",
      });
    }

    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    if (!user.isVerified) {
      user.isVerified = true;
    }
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "OTP verified successfully.",
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

// ==================== RESEND OTP ====================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check pending registration first
    const pendingReg = await PendingRegistration.findOne({ email: normalizedEmail });

    if (pendingReg) {
      const { otp, hashedOtp, otpExpiry } = await createOtp();
      pendingReg.otp = hashedOtp;
      pendingReg.otpExpiry = otpExpiry;
      await pendingReg.save();

      // Always log OTP to console for development/testing

      sendOtpEmail(pendingReg.email, otp, pendingReg.name)

      return res.json({
        success: true,
        message: "A new OTP has been sent to your email.",
        email: pendingReg.email,
      });
    }

    // Check existing user
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    const { otp, hashedOtp, otpExpiry } = await createOtp();
    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Always log OTP to console for development/testing

    sendOtpEmail(user.email, otp, user.name)

    return res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};