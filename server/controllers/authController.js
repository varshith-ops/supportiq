const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Secret keys
const getAccessTokenSecret = () => process.env.JWT_SECRET || "supportiq_super_secret_key_2026";
const getRefreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || (getAccessTokenSecret() + "_refresh");

// Generate Access Token (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    getAccessTokenSecret(),
    {
      expiresIn: "15m",
    }
  );
};

// Generate Refresh Token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    getRefreshTokenSecret(),
    {
      expiresIn: "7d",
    }
  );
};

// Cookie options helper
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ===============================
// REGISTER USER
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "Agent",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

// ===============================
// LOGIN USER
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist refresh token in MongoDB
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

// ===============================
// REFRESH ACCESS TOKEN
// ===============================
const refreshAccessToken = async (req, res) => {
  try {
    // Extract refresh token from HTTP-only cookie or request body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing. Please login again.",
      });
    }

    // Verify token signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    } catch (err) {
      res.clearCookie("refreshToken", getCookieOptions());
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Your session has expired. Please login again.",
      });
    }

    // Verify user exists and token matches DB record
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("refreshToken", getCookieOptions());
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Session is invalid or has been revoked. Please login again.",
      });
    }

    // Issue new 15-min Access Token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};

// ===============================
// LOGOUT USER
// ===============================
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    // Invalidate refresh token in DB if provided or if user is attached
    const userId = req.user?.id;

    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    } else if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } catch (err) {
        // Token was invalid/expired, ignore DB update
      }
    }

    // Clear HTTP-Only Cookie
    res.clearCookie("refreshToken", getCookieOptions());

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

// ===============================
// UPDATE PROFILE
// ===============================
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({
        success: false,
        message: "Name and email cannot be empty",
      });
    }

    // Check whether another user already has this email
    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already being used",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: trimmedName,
        email: trimmedEmail,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentToken = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : generateAccessToken(user);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: currentToken,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateProfile,
};