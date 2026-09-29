 const Ticket = require("../models/Ticket");
const { ensureSeedTickets } = require("./ticketController");

const getAnalytics = async (req, res) => {
  try {
    await ensureSeedTickets(req.user.id);

    // 🔐 Get only tickets belonging to the logged-in user
    const tickets = await Ticket.find({
      userId: req.user.id,
    });

    // Total tickets
    const totalTickets = tickets.length;

    // Resolved tickets
    const resolvedTickets = tickets.filter(
      (ticket) => ticket.status === "Resolved"
    ).length;

    // Pending tickets
    const pendingTickets = tickets.filter(
      (ticket) => ticket.status === "Pending"
    ).length;

    // High priority tickets
    const highPriorityTickets = tickets.filter(
      (ticket) => ticket.priority === "High"
    ).length;

    // Critical priority tickets
    const criticalTickets = tickets.filter(
      (ticket) => ticket.priority === "Critical"
    ).length;

    // Category distribution
    const categoryDistribution = {};

    tickets.forEach((ticket) => {
      const category = ticket.category || "Other";

      categoryDistribution[category] =
        (categoryDistribution[category] || 0) + 1;
    });

    // Priority distribution
    const priorityDistribution = {};

    tickets.forEach((ticket) => {
      const priority = ticket.priority || "Unknown";

      priorityDistribution[priority] =
        (priorityDistribution[priority] || 0) + 1;
    });

    // Sentiment distribution
    const sentimentDistribution = {};

    tickets.forEach((ticket) => {
      const sentiment = ticket.sentiment || "Unknown";

      sentimentDistribution[sentiment] =
        (sentimentDistribution[sentiment] || 0) + 1;
    });

    // Resolution rate
    const resolutionRate =
      totalTickets > 0
        ? Math.round(
            (resolvedTickets / totalTickets) * 100
          )
        : 0;

    res.json({
      success: true,

      data: {
        totalTickets,
        resolvedTickets,
        pendingTickets,
        highPriorityTickets,
        criticalTickets,
        resolutionRate,

        categoryDistribution,
        priorityDistribution,
        sentimentDistribution,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

module.exports = {
  getAnalytics,
};