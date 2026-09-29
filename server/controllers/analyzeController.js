 const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_mock_fallback",
});

/* =========================================================
   MOCK AI HELPERS
   These are fallback responses used when OpenAI is unavailable.
   ========================================================= */

const getMockAnalysis = (query) => {
  const text = query.toLowerCase();

  let category = "Other";
  let priority = "Medium";
  let sentiment = "Neutral";
  let intent = "Customer is requesting support regarding their issue.";
  let summary = "Customer has reported an issue and is requesting support.";

  // Category detection
  if (
    text.includes("delivery") ||
    text.includes("delivered") ||
    text.includes("delivery") ||
    text.includes("shipping") ||
    text.includes("charger") ||
    text.includes("order")
  ) {
    category = "Delivery";
    intent = "Customer is reporting an issue with the delivered product or order.";
    summary =
      "Customer received an incorrect product compared with what was ordered.";
  }

  if (
    text.includes("payment") ||
    text.includes("paid") ||
    text.includes("payment failed") ||
    text.includes("transaction")
  ) {
    category = "Payment";
    intent = "Customer is reporting an issue related to payment.";
    summary = "Customer is experiencing a payment-related issue.";
  }

  if (
    text.includes("refund") ||
    text.includes("money back") ||
    text.includes("reimburse")
  ) {
    category = "Refund";
    intent = "Customer is requesting or asking about a refund.";
    summary = "Customer is requesting assistance with a refund.";
  }

  if (
    text.includes("broken") ||
    text.includes("not working") ||
    text.includes("error") ||
    text.includes("crash") ||
    text.includes("bug")
  ) {
    category = "Technical";
    intent = "Customer is reporting a technical issue.";
    summary = "Customer is experiencing a technical problem.";
  }

  if (
    text.includes("account") ||
    text.includes("login") ||
    text.includes("password") ||
    text.includes("sign in")
  ) {
    category = "Account";
    intent = "Customer needs assistance with their account.";
    summary = "Customer needs help with an account-related issue.";
  }

  if (
    text.includes("product") ||
    text.includes("wrong item") ||
    text.includes("incorrect item") ||
    text.includes("different item")
  ) {
    category = "Product";
    intent = "Customer received or is experiencing an issue with a product.";
    summary = "Customer is reporting an issue with the product received.";
  }

  // Sentiment detection
  if (
    text.includes("angry") ||
    text.includes("furious") ||
    text.includes("terrible") ||
    text.includes("worst") ||
    text.includes("ridiculous")
  ) {
    sentiment = "Angry";
  } else if (
    text.includes("frustrated") ||
    text.includes("disappointed") ||
    text.includes("wrong") ||
    text.includes("problem") ||
    text.includes("issue")
  ) {
    sentiment = "Frustrated";
  } else if (
    text.includes("thank") ||
    text.includes("happy") ||
    text.includes("great") ||
    text.includes("good")
  ) {
    sentiment = "Positive";
  }

  // Priority detection
  if (
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("immediately") ||
    text.includes("critical")
  ) {
    priority = "Critical";
  } else if (
    text.includes("wrong") ||
    text.includes("incorrect") ||
    text.includes("not working") ||
    text.includes("failed") ||
    text.includes("problem")
  ) {
    priority = "High";
  } else if (
    text.includes("when") ||
    text.includes("status") ||
    text.includes("information")
  ) {
    priority = "Low";
  }

  return {
    summary,
    category,
    intent,
    priority,
    sentiment,
    status: "Pending",
    isFallback: true,
  };
};


/* =========================================================
   MOCK CUSTOMER RESPONSE
   ========================================================= */

const getMockCustomerResponse = ({
  query,
  category,
  priority,
  sentiment,
}) => {
  let response =
    "We’re sorry for the inconvenience. We understand your concern and will help you resolve this issue.";

  if (category === "Delivery") {
    response =
      "We’re sorry that you received an incorrect item. We understand how frustrating this can be. Please verify the order details so the support team can assist you with the next steps.";
  }

  if (category === "Payment") {
    response =
      "We’re sorry for the payment-related issue. We understand your concern. Please verify the transaction details so our support team can investigate and assist you further.";
  }

  if (category === "Refund") {
    response =
      "We understand that you are requesting a refund. We’re sorry for the inconvenience. Our support team can review the order details and assist you with the refund process.";
  }

  if (category === "Technical") {
    response =
      "We’re sorry that you’re experiencing this technical issue. Please provide any relevant error details so our support team can investigate and help resolve it.";
  }

  if (category === "Account") {
    response =
      "We’re sorry you’re having trouble with your account. Please verify your account details so our support team can help you resolve the issue securely.";
  }

  if (priority === "Critical") {
    response =
      "We understand that this issue requires urgent attention. We’re sorry for the inconvenience. Our support team should review the issue as soon as possible and assist you with the next steps.";
  }

  return response;
};


/* =========================================================
   MOCK RESPONSE IMPROVEMENT
   ========================================================= */

const improveMockResponse = (originalResponse) => {
  return (
    "We understand your concern and sincerely apologize for any inconvenience caused. " +
    originalResponse.trim()
  );
};


/* =========================================================
   ANALYZE CUSTOMER QUERY
   ========================================================= */

const analyzeQuery = async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer query is required",
      });
    }

    const prompt = `
You are an AI customer support analysis assistant.

Analyze the following customer support query.

Return ONLY valid JSON with exactly these fields:

{
  "summary": "short summary of the customer's issue",
  "category": "one of Delivery, Payment, Refund, Product, Account, Technical, Other",
  "intent": "specific reason for contacting support",
  "priority": "Low, Medium, High, or Critical",
  "sentiment": "Positive, Neutral, Frustrated, or Angry",
  "status": "Pending"
}

Rules:
- summary must be concise.
- category must be one of the allowed categories.
- priority should reflect urgency and impact.
- sentiment should reflect the customer's emotional tone.
- status should always be Pending for a new query.
- Do not add any extra fields.

Customer Query:
${query}
`;

    try {
      // Try REAL OpenAI first
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const aiText = response.choices[0]?.message?.content || "";

      let result;

      try {
        result = JSON.parse(aiText);
        result.isFallback = false;
      } catch (error) {
        console.error("AI returned invalid JSON:", aiText);

        // If OpenAI returns invalid JSON, use mock fallback
        result = getMockAnalysis(query);
      }

      return res.json({
        success: true,
        data: result,
      });

    } catch (openAIError) {
      // OpenAI unavailable / no credits / rate limit
      console.error(
        "OpenAI unavailable. Using mock AI fallback."
      );

      console.error(
        "OpenAI Error:",
        openAIError.message
      );

      const mockResult = getMockAnalysis(query);

      return res.json({
        success: true,
        data: mockResult,
      });
    }

  } catch (error) {
    console.error("AI Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze customer query.",
    });
  }
};


/* =========================================================
   GENERATE CUSTOMER RESPONSE
   ========================================================= */

const generateResponse = async (req, res) => {
  try {
    const {
      query,
      summary,
      category,
      intent,
      priority,
      sentiment,
    } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer query is required",
      });
    }

    const prompt = `
You are an AI customer support response assistant.

Generate a professional, polite and helpful response to the customer.

Customer Query:
${query}

Support Analysis:
Summary: ${summary || "Not available"}
Category: ${category || "Not available"}
Intent: ${intent || "Not available"}
Priority: ${priority || "Not available"}
Sentiment: ${sentiment || "Not available"}

Rules:
- Be polite and empathetic.
- Clearly address the customer's issue.
- Do not make up order numbers, refund amounts, dates, or company policies.
- Do not promise something that is not known.
- Keep the response concise.
- Write only the customer response.
`;

    try {
      // Try REAL OpenAI
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const generatedResponse = response.choices[0]?.message?.content || "";

      return res.json({
        success: true,
        data: {
          response: generatedResponse,
        },
      });

    } catch (openAIError) {
      // Fallback to mock response
      console.error(
        "OpenAI unavailable. Using mock response fallback."
      );

      console.error(
        "OpenAI Error:",
        openAIError.message
      );

      const mockResponse = getMockCustomerResponse({
        query,
        category,
        priority,
        sentiment,
      });

      return res.json({
        success: true,
        data: {
          response: mockResponse,
        },
      });
    }

  } catch (error) {
    console.error("Generate Response Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate customer response.",
    });
  }
};


/* =========================================================
   IMPROVE CUSTOMER RESPONSE
   ========================================================= */

const improveResponse = async (req, res) => {
  try {
    const { originalResponse } = req.body;

    if (!originalResponse || !originalResponse.trim()) {
      return res.status(400).json({
        success: false,
        message: "Original response is required",
      });
    }

    const prompt = `
You are an AI customer support response improvement assistant.

Improve the following customer support response.

Original Response:
${originalResponse}

Rules:
- Keep the original meaning.
- Make it professional and polite.
- Make it empathetic.
- Make it clear and easy to understand.
- Keep it concise.
- Do not invent order numbers, dates, refund amounts, policies, or other facts.
- Return ONLY the improved customer response.
`;

    try {
      // Try REAL OpenAI
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const improvedResponse = response.choices[0]?.message?.content || "";

      return res.json({
        success: true,
        data: {
          response: improvedResponse,
        },
      });

    } catch (openAIError) {
      // Fallback to mock improvement
      console.error(
        "OpenAI unavailable. Using mock improvement fallback."
      );

      console.error(
        "OpenAI Error:",
        openAIError.message
      );

      const improvedResponse =
        improveMockResponse(originalResponse);

      return res.json({
        success: true,
        data: {
          response: improvedResponse,
        },
      });
    }

  } catch (error) {
    console.error("Improve Response Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to improve customer response.",
    });
  }
};


/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  analyzeQuery,
  generateResponse,
  improveResponse,
};