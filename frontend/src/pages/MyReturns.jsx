import { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import "../styles/MyOrders.css";

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReturns = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/returns");
      setReturns(data.returns || []);
      setError("");
    } catch (err) {
      setError("Failed to load returns. Please login again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReturns();
    const interval = setInterval(loadReturns, 30000);
    return () => clearInterval(interval);
  }, [loadReturns]);

  return (
    <div className="orders-page">
      <h1 className="orders-title">My Returns</h1>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="loading-text">Loading...</p>}

      {!loading && returns.length === 0 && !error && (
        <div className="empty-state">
          <i className="ti ti-arrow-back-up"></i>
          <p>No returns found.</p>
        </div>
      )}

      <div className="orders-list">
        {returns.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <div className="order-icon">
                <i className="ti ti-arrow-back-up"></i>
              </div>
              <div className="order-info">
                {order.items.map((item, i) => (
                  <p key={i} className="order-item-name">{item.name}</p>
                ))}
                <p className="order-meta">
                  Order #{order._id.slice(-8).toUpperCase()} · Qty:{" "}
                  {order.items.reduce((a, b) => a + b.quantity, 0)}
                </p>
                <p className="order-price color-red">
                  Rs. {order.totalPrice.toLocaleString()}
                </p>
              </div>
              <span className="order-badge badge-red">Returned</span>
            </div>
            <div className="order-card-footer-date">
              <i className="ti ti-calendar" style={{ marginRight: 4 }}></i>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReturns;