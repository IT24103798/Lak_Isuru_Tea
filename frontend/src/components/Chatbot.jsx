import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Chatbot.css";
import api from "../api/api";

const fallbackAnswer = `I'm sorry, I couldn't find the exact answer for that. 😊

For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;

const getSessionId = () => {
  let sessionId = localStorage.getItem("chatbotSessionId");

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

    localStorage.setItem("chatbotSessionId", sessionId);
  }

  return sessionId;
};

function Chatbot() {
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I am Lak Isuru Tea Assistant. You can ask me about tea products, gift packs, orders, delivery, payments, cancellations, contact details, or Sri Lankan tea history.",
    },
  ]);

  const isAdminPage = location.pathname.startsWith("/admin");

    const quickQuestions = [
    "What tea products do you have?",
    "Recommend a strong tea",
    "Best tea for gift",
    "How to place an order?",
    "Delivery information",
    "What payment methods do you accept?",
  
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (isAdminPage) {
    return null;
  }

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

  const sendMessage = async (customMessage) => {
    const userMessage = customMessage || message;

    if (!userMessage.trim() || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

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

      const serverResponse = error.response?.data?.response;

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: serverResponse || fallbackAnswer,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
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
                <p>Online • AI Customer Support</p>
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
                Lak Isuru Tea Assistant is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask about tea products, orders, or support..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <button type="submit" disabled={loading || !message.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;