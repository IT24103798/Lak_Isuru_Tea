import React, { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import api from "../api/api";
import { clarificationAnswer, fallbackAnswer, teaFaqData } from "../data/teaFaqData";

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

  const exactMatch = faqEntries.find(
    (entry) => normalizeText(entry.question) === normalizedMessage
  );

  if (exactMatch) {
    return exactMatch.answer;
  }

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

  const keywordMatch = faqEntries.find((entry) => {
    const normalizedQuestion = normalizeText(entry.question);
    const keywords = normalizedQuestion.split(" ").filter(Boolean);
    const hits = keywords.filter((keyword) => normalizedMessage.includes(keyword));
    return keywords.length >= 3 && hits.length >= Math.min(3, keywords.length);
  });

  return keywordMatch ? keywordMatch.answer : null;
};

const isLikelyGibberish = (message) => {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return true;
  }

  const words = normalizedMessage.split(" ").filter(Boolean);

  if (/^(.)\1+$/.test(normalizedMessage) && normalizedMessage.length <= 4) {
    return true;
  }

  if (words.length <= 2 && normalizedMessage.length <= 6) {
    return true;
  }

  const meaningfulWords = words.filter((word) => word.length >= 3);
  const shortWordRatio = words.length ? (words.length - meaningfulWords.length) / words.length : 0;

  return meaningfulWords.length === 0 || shortWordRatio > 0.7;
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am Lak Isuru Tea AI Assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What are your best sellers?",
    "Do you have any discounts?",   
    "Best tea for a gift",
    "How to place an order?",
    "Delivery information",
    "Recommend a strong tea",
  ];

  const renderMessageText = (text) => {
    const emailPattern = /([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g;
    const phonePattern = /(\+?\d[\d\s-]{7,}\d)/g;

    const linkifyLine = (line) => {
      const parts = [];
      let lastIndex = 0;
      const pattern = new RegExp(`${emailPattern.source}|${phonePattern.source}`, "g");

      line.replace(pattern, (match, email, phone, offset) => {
        if (offset > lastIndex) {
          parts.push(line.slice(lastIndex, offset));
        }

        if (email) {
          parts.push(
            <a key={`${offset}-email`} href={`mailto:${match}`} className="chatbot-link">
              {match}
            </a>
          );
        } else if (phone) {
          const telValue = match.replace(/[^\d+]/g, "");
          parts.push(
            <a key={`${offset}-phone`} href={`tel:${telValue}`} className="chatbot-link">
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

    return text.split("\n").map((line, lineIndex) => (
      <React.Fragment key={`${lineIndex}-${line}`}>
        {linkifyLine(line)}
        {lineIndex < text.split("\n").length - 1 ? <br /> : null}
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

    if (!userMessage.trim()) return;

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
        response.data.response ||
        response.data.answer ||
        fallbackAnswer;

      const botMessage = {
        sender: "bot",
        text: botReply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, the AI assistant is temporarily unavailable. Please try again later.",
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
                if (e.key === "Enter") sendMessage();
              }}
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