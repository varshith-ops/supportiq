 const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    // User who created this ticket
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    intent: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    sentiment: {
      type: String,
      enum: [
        "Positive",
        "Neutral",
        "Frustrated",
        "Angry",
      ],
      default: "Neutral",
    },

    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;