const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authRateLimiter = require("../middleware/rateLimiter");

router.post("/register", authRateLimiter(15), registerUser);

router.post("/login", authRateLimiter(15), loginUser);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logoutUser);

router.put("/profile", protect, updateProfile);

module.exports = router;