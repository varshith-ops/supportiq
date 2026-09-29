 const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

const analyzeRoutes = require("./routes/analyzeRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SupportIQ backend is running!",
  });
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`SupportIQ server running on port ${PORT}`);
});