import React, { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import api from "../api/api";
import {
  clarificationAnswer,
  fallbackAnswer,
  teaFaqData,
} from "../data/teaFaqData";

const faqEntries = teaFaqData.flatMap((section) => section.questions);

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findFaqAnswer = (message) => {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return null;
  }

  // Stop random short letters like "mm", "aa", "qq", "h" from matching FAQ
  const allowedShortMessages = [
    "hi",
    "hey",
    "hello",
    "tea",
    "price",
    "order",
    "gift",
    "phone",
    "email",
  ];

  if (
    normalizedMessage.length < 3 &&
    !allowedShortMessages.includes(normalizedMessage)
  ) {
    return null;
  }

  if (
    normalizedMessage.length <= 3 &&
    /^(.)\1+$/.test(normalizedMessage) &&
    !allowedShortMessages.includes(normalizedMessage)
  ) {
    return null;
  }

  const exactMatch = faqEntries.find(
    (entry) => normalizeText(entry.question) === normalizedMessage
  );

  if (exactMatch) {
    return exactMatch.answer;
  }

  const keywordRules = [
    {
      keywords: ["price", "cost", "how much", "rate"],
      answer:
        "💰 Prices depend on the tea type, package size, and product availability. Please check the Products page for the latest price.",
    },
    {
      keywords: ["delivery", "deliver", "shipping", "ship"],
      answer:
        "🚚 Delivery details and delivery fee are shown during checkout. You can also check your order status in My Orders.",
    },
    {
      keywords: ["payment", "pay", "card", "cash", "cod"],
      answer:
        "💳 You can choose the available payment method on the Payment page, such as Online Payment or Cash on Delivery if enabled.",
    },
    {
      keywords: ["order", "place order", "buy", "purchase"],
      answer:
        "🛒 To place an order: go to Products → choose your tea → Add to Cart → Checkout → Payment. After placing the order, you can check the status in My Orders.",
    },
    {
      keywords: ["cancel", "cancellation"],
      answer:
        "❌ You can request cancellation before the order is shipped. Go to My Orders, open the order details, and use the Cancel Order option if available.",
    },
    {
      keywords: ["return", "refund", "damaged", "wrong product"],
      answer:
        "↩️ Sorry for the issue. Please contact Lak Isuru Tea support with your order ID and product details so our team can assist you.",
    },
    {
      keywords: ["phone", "call", "contact", "number"],
      answer:
        "📞 You can contact Lak Isuru Tea at 0778646780 or 0776356412.",
    },
    {
      keywords: ["email", "gmail", "mail"],
      answer: "📧 You can email Lak Isuru Tea at luckisuru@gmail.com.",
    },
    {
      keywords: ["address", "location", "where"],
      answer: `🏢 Lak Isuru Tea - Showroom & Head Office

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

🌐 You can also order online via our website.`,
    },
    {
      keywords: ["open", "opening", "hours", "time"],
      answer:
        "🕒 Our opening hours are Monday to Saturday, 08:00 - 18:00.",
    },
    {
      keywords: ["strong", "strongest"],
      answer:
        "💪 I recommend BOPF Black Tea if you like strong tea with rich color and bold flavor.",
    },
    {
      keywords: ["gift", "present", "corporate"],
      answer:
        "🎁 For gifts, you can choose our Tea Gift Collections, Pettagam Gift Boxes, Reed Elephant Gifts, or Wooden Cart Tea Gifts depending on availability.",
    },
    {
      keywords: ["green tea"],
      answer:
        "🍵 Yes. Green Tea is available depending on stock. It is a lighter and refreshing tea option.",
    },
    {
      keywords: ["black tea"],
      answer:
        "🫖 Yes. We offer Ceylon Black Tea varieties such as OP, BOP, BOPF, and FP depending on availability.",
    },
  ];

  const ruleMatch = keywordRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedMessage.includes(keyword))
  );

  if (ruleMatch) {
    return ruleMatch.answer;
  }

  // Safer partial match
  // Do not allow tiny text like "mm" to match words such as "recommend"
  if (normalizedMessage.length >= 5) {
    const partialMatch = faqEntries.find((entry) => {
      const normalizedQuestion = normalizeText(entry.question);

      return (
        normalizedMessage.includes(normalizedQuestion) ||
        normalizedQuestion.includes(normalizedMessage)
      );
    });

    if (partialMatch) {
      return partialMatch.answer;
    }
  }

  const keywordMatch = faqEntries.find((entry) => {
    const normalizedQuestion = normalizeText(entry.question);
    const keywords = normalizedQuestion
      .split(" ")
      .filter((word) => word.length >= 4);

    const hits = keywords.filter((keyword) =>
      normalizedMessage.includes(keyword)
    );

    return keywords.length >= 2 && hits.length >= 2;
  });

  return keywordMatch ? keywordMatch.answer : null;
};

const isLikelyGibberish = (message) => {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return true;
  }

  const faqAnswer = findFaqAnswer(message);

  if (faqAnswer) {
    return false;
  }

  const commonShortQuestions = [
    "hi",
    "hello",
    "price",
    "delivery",
    "payment",
    "order",
    "cancel",
    "return",
    "phone",
    "email",
    "address",
    "location",
    "gift",
    "tea",
    "black tea",
    "green tea",
    "strong tea",
  ];

  if (commonShortQuestions.includes(normalizedMessage)) {
    return false;
  }

  const words = normalizedMessage.split(" ").filter(Boolean);

  if (/^(.)\1+$/.test(normalizedMessage) && normalizedMessage.length <= 4) {
    return true;
  }

  if (words.length <= 2 && normalizedMessage.length <= 4) {
    return true;
  }

  const meaningfulWords = words.filter((word) => word.length >= 3);
  const shortWordRatio = words.length
    ? (words.length - meaningfulWords.length) / words.length
    : 0;

  return meaningfulWords.length === 0 || shortWordRatio > 0.7;
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am Lak Isuru Tea AI Assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What tea products do you have?",
    "Recommend a strong tea",
    "Best tea for gift",
    "How to place an order?",
    "Delivery information",
    "What payment methods do you accept?",
  ];

  const renderMessageText = (text) => {
    const emailPattern = /([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g;
    const phonePattern = /(\+?\d[\d\s-]{7,}\d)/g;

    const linkifyLine = (line) => {
      const parts = [];
      let lastIndex = 0;
      const pattern = new RegExp(
        `${emailPattern.source}|${phonePattern.source}`,
        "g"
      );

      line.replace(pattern, (match, email, phone, offset) => {
        if (offset > lastIndex) {
          parts.push(line.slice(lastIndex, offset));
        }

        if (email) {
          parts.push(
            <a
              key={`${offset}-email`}
              href={`mailto:${match}`}
              className="chatbot-link"
            >
              {match}
            </a>
          );
        } else if (phone) {
          const telValue = match.replace(/[^\d+]/g, "");

          parts.push(
            <a
              key={`${offset}-phone`}
              href={`tel:${telValue}`}
              className="chatbot-link"
            >
              {match}
            </a>
          );
        } else {
          parts.push(match);
        }

        lastIndex = offset + match.length;
        return match;
      });

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      return parts;
    };

    const lines = text.split("\n");

    return lines.map((line, lineIndex) => (
      <React.Fragment key={`${lineIndex}-${line}`}>
        {linkifyLine(line)}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getSessionId = () => {
    let sessionId = localStorage.getItem("chatSessionId");

    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      localStorage.setItem("chatSessionId", sessionId);
    }

    return sessionId;
  };

  const sendMessage = async (customMessage) => {
    const userMessage = customMessage || message;

    if (!userMessage.trim() || loading) {
      return;
    }

    const newUserMessage = {
      sender: "user",
      text: userMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setMessage("");
    setLoading(true);

    const faqAnswer = findFaqAnswer(userMessage);

    if (faqAnswer) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: faqAnswer,
        },
      ]);
      setLoading(false);
      return;
    }

    if (isLikelyGibberish(userMessage)) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: clarificationAnswer,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/chatbot/chat", {
        message: userMessage,
        sessionId: getSessionId(),
      });

      const botReply =
        response.data.response || response.data.answer || fallbackAnswer;

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (error) {
      console.error("Chatbot frontend error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            fallbackAnswer ||
            "Sorry, the AI assistant is temporarily unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Lak Isuru Tea AI Chatbot"
        >
          <span className="chatbot-icon">🍃</span>
          <span className="chatbot-badge">AI</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">🍃</div>

              <div>
                <h3>Lak Isuru Tea Assistant</h3>
                <p>Online • AI Support</p>
              </div>
            </div>

            <button
              className="chatbot-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {renderMessageText(msg.text)}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message bot chatbot-typing">
                AI is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => sendMessage(question)}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask about tea products..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              disabled={loading}
            />

            <button onClick={() => sendMessage()} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;