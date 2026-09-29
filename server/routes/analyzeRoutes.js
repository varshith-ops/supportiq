 const express = require("express");

const router = express.Router();

const {
  analyzeQuery,
  generateResponse,
  improveResponse,
} = require("../controllers/analyzeController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, analyzeQuery);

router.post("/response", protect, generateResponse);

router.post("/improve-response", protect, improveResponse);

module.exports = router;