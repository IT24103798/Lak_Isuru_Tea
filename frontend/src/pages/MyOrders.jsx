import { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import "../styles/MyOrders.css";

const TABS = [
  { label: "All", filter: null },
  { label: "To Pay", filter: "pending" },
  { label: "To Ship", filter: "processing" },
  { label: "To Receive", filter: "shipped" },
  { label: "To Review", filter: "delivered" },
];

const STEPS = ["placed", "packed", "shipped", "delivered"];

const statusStepMap = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

const statusLabelMap = {
  pending: "To Pay",
  processing: "To Ship",
  shipped: "To Receive",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

const statusColorMap = {
  pending: "amber",
  processing: "blue",
  shipped: "purple",
  delivered: "teal",
  returned: "red",
  cancelled: "gray",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders");
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError("Failed to load orders. Please login again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // ✅ Real-time polling every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const filteredOrders = TABS[activeTab].filter
    ? orders.filter((o) => o.status === TABS[activeTab].filter)
    : orders;

  return (
    <div className="orders-page">
      <h1 className="orders-title">My Orders</h1>

      {/* Tabs */}
      <div className="orders-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            className={`orders-tab ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="loading-text">Loading...</p>}

      {!loading && filteredOrders.length === 0 && !error && (
        <div className="empty-state">
          <i className="ti ti-package-off"></i>
          <p>No orders found.</p>
        </div>
      )}

      <div className="orders-list">
        {filteredOrders.map((order) => {
          const step = statusStepMap[order.status] ?? -1;
          const color = statusColorMap[order.status] || "gray";

          return (
            <div className="order-card" key={order._id}>

              {/* Card Header */}
              <div className="order-card-header">
                <div className="order-icon">
                  <i className="ti ti-package"></i>
                </div>
                <div className="order-info">
                  {order.items.map((item, i) => (
                    <p key={i} className="order-item-name">{item.name}</p>
                  ))}
                  <p className="order-meta">
                    Order #{order._id.slice(-8).toUpperCase()} · Qty: {order.items.reduce((a, b) => a + b.quantity, 0)}
                  </p>
                  <p className={`order-price color-${color}`}>
                    Rs. {order.totalPrice.toLocaleString()}
                  </p>
                </div>
                <span className={`order-badge badge-${color}`}>
                  {statusLabelMap[order.status] || order.status}
                </span>
              </div>

              {/* Progress Tracker — only for active orders */}
              {step >= 0 && (
                <div className="order-progress">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((s, i) => (
                      <div
                        key={s}
                        className={`progress-dot ${i <= step ? "done" : ""}`}
                        style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="progress-labels">
                    {STEPS.map((s) => (
                      <span key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;