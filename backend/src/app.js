const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

const productRoutes = require("./routes/product.routes");
app.use("/api/products", productRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);


module.exports = app;
