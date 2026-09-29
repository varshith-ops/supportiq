 const Ticket = require("../models/Ticket");
const { ensureSeedTickets } = require("./ticketController");

const getDashboardStats = async (req, res) => {
  try {
    await ensureSeedTickets(req.user.id);

    // 🔐 Only tickets belonging to logged-in user
    const userFilter = {
      userId: req.user.id,
    };

    // Total number of user's tickets
    const totalTickets =
      await Ticket.countDocuments(userFilter);

    // Pending user's tickets
    const pendingTickets =
      await Ticket.countDocuments({
        ...userFilter,
        status: "Pending",
      });

    // Resolved user's tickets
    const resolvedTickets =
      await Ticket.countDocuments({
        ...userFilter,
        status: "Resolved",
      });

    // High priority user's tickets
    const highPriorityTickets =
      await Ticket.countDocuments({
        ...userFilter,
        priority: "High",
      });

    // Critical priority user's tickets
    const criticalTickets =
      await Ticket.countDocuments({
        ...userFilter,
        priority: "Critical",
      });

    // Get latest 5 tickets belonging to logged-in user
    const recentTickets = await Ticket.find(
      userFilter
    )
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalTickets,
        pendingTickets,
        resolvedTickets,
        highPriorityTickets,
        criticalTickets,
        recentTickets,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};