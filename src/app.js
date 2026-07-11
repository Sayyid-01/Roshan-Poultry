const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/api/auth",
  require("./routes/auth.routes")
);

app.use(
  "/api/admin",
  require("./routes/admin.routes")
);

app.use(
  "/api/accountant",
  require("./routes/accountant.routes")
);

module.exports = app;