import React, { useState, useRef, useEffect } from "react";
import "../styles/Chatbot.css";
import api from "../api/api";

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
    "Best tea for a gift",
    "How to place an order?",
    "Delivery information",
    "Recommend a strong tea",
  ];

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

    try {
      const response = await api.post("/chatbot/chat", {
        message: userMessage,
        sessionId: getSessionId(),
      });

      const botReply =
        response.data.response ||
        response.data.answer ||
        "Sorry, I could not understand that.";

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
                {msg.text}
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