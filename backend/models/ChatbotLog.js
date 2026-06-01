import mongoose from "mongoose";

const chatbotLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      required: true,
    },
    userMessage: {
      type: String,
      required: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", "angry"],
      default: "neutral",
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
    intent: {
      type: String,
      default: "general",
    },
  },
  { timestamps: true }
);

const ChatbotLog = mongoose.model("ChatbotLog", chatbotLogSchema);

export default ChatbotLog;
