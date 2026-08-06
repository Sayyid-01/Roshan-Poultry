const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const expenseRoutes = require("./routes/expense.routes");
const supplierRoutes = require("./routes/supplier.routes");
const errorHandler = require("./middlewares/error.middleware");
const dashboardRoutes = require("./routes/dashboard.routes");
const orderRoutes = require("./routes/order.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const contentRoutes = require("./routes/content.routes");
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

// user routes
app.use("/api/users", require("./routes/user.routes"));

// order routes
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/content", contentRoutes);

///---------------------------------------------------------------------------------------------------------------------------------///
    //            DASHBORD ROUTES
//-----------------------------------------------------------------------------------------------------------------------------------//

app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
module.exports = app;
