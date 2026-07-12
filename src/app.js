const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const expenseRoutes = require("./routes/expense.routes");
const supplierRoutes = require("./routes/supplier.routes");


const app = express();
app.use(cors());
app.use(express.json());

//authentication and authorization routes
app.use( "/api/auth", require("./routes/auth.routes"));

//Admin and Accountant routes
app.use( "/api/admin", require("./routes/admin.routes"));
app.use( "/api/accountant", require("./routes/accountant.routes"));

// product and expense routes
app.use( "/api/products", productRoutes);
app.use("/api/expenses", expenseRoutes);

// supplier routes
app.use("/api/suppliers", supplierRoutes);
module.exports = app;