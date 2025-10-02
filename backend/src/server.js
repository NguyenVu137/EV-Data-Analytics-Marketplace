const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require('bcryptjs');
const sequelize = require("./config/database");

const app = express();

app.use(cors());

// Log tất cả các requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("EV Data Analytics Marketplace Backend is running 🚀");
});

// Import routes
const seedRoutes = require('./routes/seedRoutes');
app.use('/api/seed', seedRoutes);

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected...");
  })
  .catch((err) => {
    console.error("❌ Error: " + err);
  });
const User = require("./models/User");

sequelize.sync({ alter: true })  // tạo bảng nếu chưa có
  .then(() => {
    console.log("✅ All models were synchronized successfully.");
  })
  .catch(err => console.error("❌ Sync error:", err));

  const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const datasetRoutes = require("./routes/datasetRoutes");
app.use("/api/datasets", datasetRoutes);
app.use("/api/datasets", datasetRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);
const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
