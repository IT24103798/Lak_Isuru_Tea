import Product from "../models/Product.js";
import ChatbotLog from "../models/ChatbotLog.js";
import Complaint from "../models/Complaint.js";
import { askGemini } from "../services/geminiService.js";
import { analyzeSentiment } from "../services/sentimentService.js";
import { detectIntent } from "../services/intentService.js";

export const chatWithBot = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?._id || null;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const sentimentData = analyzeSentiment(message);
    const intent = detectIntent(message);

      // If user asks for physical location / address, respond with preset address info

    if (intent === "location") {
      const locationResponse = `🏢 Lak Isuru Tea - Showroom & Head Office

📍 Address:
393/16, School Road,
Thanthirimulla, Panadura

🕒 Opening Hours:
Mon–Sat 08:00 - 18:00

📞 Phone:
0778646780
0776356412

📧 Email:
luckisuru@gmail.com

🌐 You can also order online via our website.`;
            
      await ChatbotLog.create({
        userId,
        sessionId: sessionId || "guest-session",
        userMessage: message,
        botResponse: locationResponse,
        sentiment: sentimentData.sentiment,
        sentimentScore: sentimentData.score,
        intent,
      });

      return res.status(200).json({
        success: true,
        response: locationResponse,
        sentiment: sentimentData.sentiment,
        sentimentScore: sentimentData.score,
        intent,
        isComplaint: false,
      });
    }

    const products = await Product.find({ isActive: true }).limit(20);

    const productContext = products
      .map(
        (product) => `
Product Name: ${product.name}
Category: ${product.category}
Price: Rs. ${product.price}
Flavor: ${product.flavor}
Best For: ${product.bestFor?.join(", ") || "General tea use"}
Description: ${product.description}
Stock: ${product.stock}
`
      )
      .join("\n");

    const prompt = `
You are Lak Isuru Tea's official AI assistant.

Business context:
Lak Isuru Tea is a Sri Lankan tea product ordering website.

Customer intent: ${intent}
Customer sentiment: ${sentimentData.sentiment}
Sentiment score: ${sentimentData.score}

Available product data:
${productContext || "No product data available yet."}

Response rules:
1. Use only the product information provided above.
2. Do not invent product names, prices, discounts, stock, or delivery promises.
3. If product data is empty, give general website help.
4. If customer asks about checkout, explain: Products → Cart → Checkout → Payment → My Orders.
5. If customer is angry or negative, apologize politely and ask for order ID if needed.
6. Keep the answer short, friendly, and helpful.
7. Brand name is Lak Isuru Tea.

Customer message:
${message}

Answer:
`;

    const aiResponse = await askGemini(prompt);

    if (intent === "complaint" || sentimentData.sentiment === "angry") {
      await Complaint.create({
        userId,
        sessionId: sessionId || "guest-session",
        message,
        priority: sentimentData.sentiment === "angry" ? "high" : "normal",
        status: "pending",
      });
    }

    await ChatbotLog.create({
      userId,
      sessionId: sessionId || "guest-session",
      userMessage: message,
      botResponse: aiResponse,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      intent,
    });

    return res.status(200).json({
      success: true,
      response: aiResponse,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      intent,
      isComplaint: intent === "complaint",
    });
  } catch (error) {
    console.error("Chatbot controller error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Chatbot error",
      error: error.message,
    });
  }
};

export const getChatbotLogs = async (req, res) => {
  try {
    const logs = await ChatbotLog.find().sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot logs",
      error: error.message,
    });
  }
};