
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Invoice = require("../models/Invoice");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

// Retry Gemini requests for temporary server errors
const generateWithRetry = async (prompt, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      const status = error.status || error.statusCode;

      const isTemporaryError = status === 503 || status === 429;

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.log(
        `Gemini API error (${status}). Retrying in ${delay / 1000} seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Helper to extract JSON from Gemini response
const extractJSON = (responseText) => {
  const cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

// 1. Parse invoice details from text
const parseInvoiceFromText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const prompt = `
You are an expert invoice data extraction AI.

Extract invoice information from the following text.
Return ONLY a valid JSON object with this structure:

{
  "clientName": "string",
  "email": "string",
  "address": "string",
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unitPrice": 0
    }
  ]
}

If information is unavailable, use an empty string or an appropriate default.

Text:
${text}
`;

    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const responseText = response.text();

    const parsedData = extractJSON(responseText);

    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error parsing invoice with AI:", error);

    const status = error.status || error.statusCode || 500;

    return res.status(status).json({
      message:
        status === 503
          ? "AI service is temporarily unavailable. Please try again."
          : status === 429
          ? "AI request limit reached. Please try again later."
          : "Failed to parse invoice data from text."
    });
  }
};

// 2. Generate payment reminder email
const generateReminderEmail = async (req, res) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice Id is required" });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice is not found" });
    }

    const prompt = `
You are a professional accounting assistant.

Write a friendly and concise payment reminder email.

Client Name: ${invoice.billTo.clientName}
Invoice Number: ${invoice.invoiceNumber}
Amount Due: ${invoice.total.toFixed(2)}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

Keep the tone polite and professional.
Start with "Subject:".
`;

    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const reminderText = response.text();

    return res.status(200).json({ reminderText });

  } catch (error) {
    console.error("Error generating reminder email:", error);

    const status = error.status || error.statusCode || 500;

    return res.status(status).json({
      message:
        status === 503
          ? "AI service is temporarily unavailable. Please try again."
          : status === 429
          ? "AI request limit reached. Please try again later."
          : "Failed to generate reminder email."
    });
  }
};

// 3. Generate dashboard insights
const getDashboardSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id });

    if (invoices.length === 0) {
      return res.status(200).json({
        insights: ["No invoice data available to generate insights."]
      });
    }

    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(
      (inv) => inv.status === "Paid"
    );

    const unpaidInvoices = invoices.filter(
      (inv) => inv.status !== "Paid"
    );

    const totalRevenue = paidInvoices.reduce(
      (acc, inv) => acc + inv.total,
      0
    );

    const totalOutstanding = unpaidInvoices.reduce(
      (acc, inv) => acc + inv.total,
      0
    );

    const dataSummary = `
Total invoices: ${totalInvoices}
Paid invoices: ${paidInvoices.length}
Unpaid invoices: ${unpaidInvoices.length}
Total revenue: ${totalRevenue.toFixed(2)}
Outstanding amount: ${totalOutstanding.toFixed(2)}

Recent invoices:
${invoices
  .slice(0, 5)
  .map(
    (inv) =>
      `Invoice #${inv.invoiceNumber}, Amount: ${inv.total.toFixed(2)}, Status: ${inv.status}`
  )
  .join("\n")}
`;

    const prompt = `
You are a financial analyst for a small business owner.

Analyze the following invoice data and provide 2-3
short, useful and actionable insights.

Return ONLY valid JSON in this format:

{
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ]
}

Data:
${dataSummary}
`;

    const result = await generateWithRetry(prompt);
    const response = await result.response;
    const responseText = response.text();

    const parsedData = extractJSON(responseText);

    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Error generating dashboard insights:", error);

    const status = error.status || error.statusCode || 500;

    return res.status(status).json({
      message:
        status === 503
          ? "AI service is temporarily unavailable. Please try again."
          : status === 429
          ? "AI request limit reached. Please try again later."
          : "Failed to generate dashboard summary."
    });
  }
};

module.exports = {
  parseInvoiceFromText,
  generateReminderEmail,
  getDashboardSummary
};
