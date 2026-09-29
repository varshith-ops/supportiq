 const express = require("express");

const router = express.Router();

const {
  getTickets,
  createTicket,
  updateTicketStatus,
} = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");

// ===============================
// PROTECTED TICKET ROUTES
// ===============================

// Get all tickets
router.get("/", protect, getTickets);

// Create new ticket
router.post("/", protect, createTicket);

// Update ticket status
router.put("/:id/status", protect, updateTicketStatus);

module.exports = router;