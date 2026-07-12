const mongoose = require("mongoose");
require("dotenv").config();

const Supplier = require("../models/supplier.model");

const suppliers = [
  {
    name: "Rajesh Kumar",
    companyName: "Raj Poultry Feed Ltd",
    email: "rajesh@gmail.com",
    phone: "9876543210",
    address: "Patna, Bihar",
    productsSupplied: ["Chicken Feed", "Medicine"],
  },
  {
    name: "Amit Singh",
    companyName: "Bihar Poultry Equipments",
    email: "amit@gmail.com",
    phone: "9876543211",
    address: "Gaya, Bihar",
    productsSupplied: ["Equipment"],
  },
  {
    name: "Suresh Kumar",
    companyName: "Fresh Chicks Suppliers",
    email: "suresh@gmail.com",
    phone: "9876543212",
    address: "Muzaffarpur, Bihar",
    productsSupplied: ["Chicks"],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Supplier.deleteMany();
  await Supplier.insertMany(suppliers);

  console.log("Suppliers Seeded");
  process.exit();
}

seed();