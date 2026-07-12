const mongoose = require("mongoose");
require("dotenv").config();

const Expense = require("../models/expense.model");

const expenses = [
  {
    title: "Chicken Feed Purchase",
    category: "Chicken Feed",
    amount: 12000,
    description: "Purchased 20 bags of broiler feed",
    date: new Date("2026-07-01"),
  },
  {
    title: "Electricity Bill",
    category: "Electricity",
    amount: 4500,
    description: "Monthly farm electricity bill",
    date: new Date("2026-07-02"),
  },
  {
    title: "Staff Salary",
    category: "Salary",
    amount: 25000,
    description: "Monthly salaries for workers",
    date: new Date("2026-07-03"),
  },
  {
    title: "Medicine Purchase",
    category: "Medicine",
    amount: 3500,
    description: "Vaccines and medicines for chickens",
    date: new Date("2026-07-04"),
  },
  {
    title: "Transportation Charges",
    category: "Transport",
    amount: 2000,
    description: "Delivery and transport expenses",
    date: new Date("2026-07-05"),
  },
  {
    title: "Water Pump Repair",
    category: "Equipment",
    amount: 6000,
    description: "Repair of water supply pump",
    date: new Date("2026-07-06"),
  },
  {
    title: "Generator Diesel",
    category: "Other",
    amount: 3000,
    description: "Diesel for backup generator",
    date: new Date("2026-07-07"),
  },
  {
    title: "Cleaning Supplies",
    category: "Other",
    amount: 1800,
    description: "Farm cleaning materials",
    date: new Date("2026-07-08"),
  },
  {
    title: "Egg Tray Purchase",
    category: "Equipment",
    amount: 5000,
    description: "Purchased new egg trays",
    date: new Date("2026-07-09"),
  },
  {
    title: "Chicken Feed Purchase",
    category: "Chicken Feed",
    amount: 15000,
    description: "Purchased 25 bags of layer feed",
    date: new Date("2026-07-10"),
  }
];

const seedExpenses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Expense.deleteMany();
    console.log("Old expenses deleted");

    await Expense.insertMany(expenses);
    console.log("Expenses seeded successfully");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedExpenses();