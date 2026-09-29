 const Ticket = require("../models/Ticket");

const SAMPLE_TICKETS = [
  {
    query: "My order #10492 says delivered on the tracking page but it was left at a completely different street address! Please help track or reship.",
    summary: "Order delivered to incorrect address",
    category: "Delivery",
    intent: "Report wrong delivery address",
    priority: "High",
    sentiment: "Frustrated",
    status: "Pending",
  },
  {
    query: "I was billed twice on my credit card for the monthly subscription on Sept 28th ($49.99 x 2). Please refund the duplicate transaction ASAP!",
    summary: "Duplicate credit card charge on subscription",
    category: "Payment",
    intent: "Request billing correction",
    priority: "Critical",
    sentiment: "Angry",
    status: "Pending",
  },
  {
    query: "When opening the analytics section on Safari MacOS Version 17.4, the canvas area remains blank until refreshed.",
    summary: "Analytics dashboard blank in Safari browser",
    category: "Technical",
    intent: "Report software bug",
    priority: "Medium",
    sentiment: "Neutral",
    status: "Resolved",
  },
  {
    query: "I returned the item 5 days ago via FedEx tracking #99482. Can you confirm when the $120 credit will reflect in my bank account?",
    summary: "Inquiry on refund timeline for returned product",
    category: "Refund",
    intent: "Check refund timeline",
    priority: "Low",
    sentiment: "Neutral",
    status: "Resolved",
  },
  {
    query: "I replaced my phone and lost access to the authenticator app. Need help resetting 2FA for my agent account.",
    summary: "Unable to reset two-factor authentication",
    category: "Account",
    intent: "Account recovery",
    priority: "High",
    sentiment: "Frustrated",
    status: "Pending",
  },
  {
    query: "The outer box arrived damaged and the glass display cover inside has a visible crack across the screen.",
    summary: "Received product with cracked glass screen",
    category: "Product",
    intent: "Report defective item",
    priority: "High",
    sentiment: "Angry",
    status: "Pending",
  },
];

const ensureSeedTickets = async (userId) => {
  try {
    const count = await Ticket.countDocuments({ userId });
    if (count === 0) {
      const now = new Date();
      const seedData = SAMPLE_TICKETS.map((t, index) => {
        const daysAgo = (index * 2.5) % 13;
        const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return {
          ...t,
          userId,
          createdAt: createdDate,
          updatedAt: createdDate,
        };
      });
      await Ticket.insertMany(seedData);
    }
  } catch (err) {
    console.error("Error seeding sample tickets:", err);
  }
};

// ===============================
// Get only logged-in user's tickets
// ===============================
const getTickets = async (req, res) => {
  try {
    await ensureSeedTickets(req.user.id);

    const tickets = await Ticket.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error(
      "Error fetching tickets:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};


// ===============================
// Update only logged-in user's ticket
// ===============================
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: id,

        // 🔐 Important:
        // ticket must belong to logged-in user
        userId: req.user.id,
      },
      {
        status: status,
        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });

  } catch (error) {
    console.error(
      "Update Ticket Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
    });
  }
};


// ===============================
// Create a new ticket
// ===============================
const createTicket = async (req, res) => {
  try {
    const {
      query,
      summary,
      category,
      intent,
      priority,
      sentiment,
      status,
    } = req.body;

    // Validate required fields
    if (
      !query ||
      !summary ||
      !category ||
      !intent ||
      !priority ||
      !sentiment
    ) {
      return res.status(400).json({
        success: false,
        message: "All ticket fields are required",
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      // 🔐 Store logged-in user's ID
      userId: req.user.id,

      query,
      summary,
      category,
      intent,
      priority,
      sentiment,
      status: status || "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Ticket saved successfully",
      data: ticket,
    });

  } catch (error) {
    console.error(
      "Error creating ticket:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to save ticket",
    });
  }
};


module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  ensureSeedTickets,
};