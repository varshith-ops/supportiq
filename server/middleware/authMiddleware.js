const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supportiq_super_secret_key_2026"
    );

    // Store user information in request
    req.user = decoded;

    // Continue to next function
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid authentication token",
    });
  }
};

module.exports = protect;