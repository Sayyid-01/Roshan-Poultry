require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);


    const adminExist = await User.findOne({
      role: "ADMIN",
    });

    if (adminExist) {
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({
      name: "Sahil ",
      email: "sayyed5487s@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    });


    process.exit();
  } catch (error) {
    process.exit(1);
  }
}

seedAdmin();