import { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import "../styles/MyOrders.css";

const MyCancellations = () => {
  const [cancellations, setCancellations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadCancellations = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/cancellations");
      setCancellations(data.cancellations || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load cancellations. Please login again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCancellations();

    const interval = setInterval(loadCancellations, 30000);
    return () => clearInterval(interval);
  }, [loadCancellations]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderQty = (items = []) => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getMainProduct = (items = []) => {
    if (!items.length) return null;
    return items[0];
  };

  const getExtraItemCount = (items = []) => {
    if (!items.length) return 0;
    return items.length - 1;
  };

  const openCancelDetails = (order) => {
    openCancelDetails(order);
  };

  const closeCancelDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="myorders-page-only">
      <main className="myorders-main">
        <div className="orders-header-block">
          <div>
            <h1 className="orders-title">My Cancellations</h1>
            <p className="orders-subtitle">
              View your cancelled tea orders and cancellation details.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadCancellations}
          >
            <i className="ti ti-refresh"></i>
            Refresh
          </button>
        </div>

        <div className="orders-toolbar cancellations-toolbar">
          <div className="orders-summary-chip">
            <i className="ti ti-circle-x"></i>
            <span>
              {cancellations.length} Cancellation
              {cancellations.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {error && (
          <div className="state-card error-card">
            <i className="ti ti-alert-circle"></i>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="state-card loading-card">
            <i className="ti ti-loader-2"></i>
            <p>Loading your cancellations...</p>
          </div>
        )}

        {!loading && cancellations.length === 0 && !error && (
          <div className="state-card empty-card">
            <i className="ti ti-package-off"></i>
            <h3>No cancellations found</h3>
            <p>You do not have any cancelled orders yet.</p>
          </div>
        )}

        <div className="orders-list">
          {cancellations.map((order) => {
            const mainProduct = getMainProduct(order.items);
            const extraCount = getExtraItemCount(order.items);
            const totalQty = getOrderQty(order.items);

            return (
              <div className="order-card" key={order._id}>
                <div className="order-card-top">
                  <div className="order-product-block">
                    <div className="order-image">
                      {mainProduct?.image ? (
                        <img
                          src={mainProduct.image}
                          alt={mainProduct.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <i className="ti ti-leaf"></i>
                      )}
                    </div>

                    <div className="order-info">
                      <div className="order-title-row">
                        <h3>{mainProduct?.name || "Tea Product"}</h3>

                        {extraCount > 0 && (
                          <span className="more-items-tag">
                            +{extraCount} more item
                            {extraCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <p className="order-id">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </p>

                      <div className="order-meta-row">
                        <span>
                          <i className="ti ti-shopping-bag"></i>
                          Qty: {totalQty}
                        </span>

                        <span>
                          <i className="ti ti-calendar-event"></i>
                          Cancelled:{" "}
                          {formatDate(order.cancelledAt || order.updatedAt)}
                        </span>

                        <span>
                          <i className="ti ti-credit-card"></i>
                          {order.paymentMethod || "Cash on Delivery"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-right-block">
                    <span className="order-badge badge-gray">Cancelled</span>

                    <div className="order-total">
                      Rs. {(order.totalPrice || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="order-price-grid">
                  <div className="price-box">
                    <label>Items Total</label>
                    <strong>
                      Rs. {(order.cartItemsTotal || 0).toLocaleString()}
                    </strong>
                  </div>

                  <div className="price-box">
                    <label>Delivery Fee</label>
                    <strong>
                      {order.deliveryFee === 0
                        ? "Free"
                        : `Rs. ${(order.deliveryFee || 0).toLocaleString()}`}
                    </strong>
                  </div>

                  <div className="price-box total-box">
                    <label>Total</label>
                    <strong>
                      Rs. {(order.totalPrice || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    type="button"
                    className="cancel-details-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openCancelDetails(order);
                    }}
                  >
                    View Cancel Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedOrder && (
        <div className="cancel-popup-overlay" onClick={closeCancelDetails}>
          <div
            className="cancel-popup-form"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cancel-popup-header">
              <div>
                <h2>Cancellation Details</h2>
                <p>Order #{selectedOrder._id?.slice(-8).toUpperCase()}</p>
              </div>

              <button type="button" onClick={closeCancelDetails}>
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div className="cancel-popup-body">
              <div className="cancel-form-grid">
                <div className="cancel-form-field">
                  <label>Cancelled Date</label>
                  <p>
                    {formatDateTime(
                      selectedOrder.cancelledAt ||
                        selectedOrder.updatedAt
                    )}
                  </p>
                </div>

                <div className="cancel-form-field">
                  <label>Payment Method</label>
                  <p>
                    {selectedOrder.paymentMethod || "Cash on Delivery"}
                  </p>
                </div>

                <div className="cancel-form-field">
                  <label>Total Amount</label>
                  <p>
                    Rs. {(selectedOrder.totalPrice || 0).toLocaleString()}
                  </p>
                </div>

                <div className="cancel-form-field">
                  <label>Status</label>
                  <p>Cancelled</p>
                </div>

                <div className="cancel-form-field full">
                  <label>Reason</label>
                  <p>
                    {selectedOrder.cancelReason || "No reason saved."}
                  </p>
                </div>

                <div className="cancel-form-field full">
                  <label>Note</label>
                  <p>
                    {selectedOrder.cancelNote || "No additional note."}
                  </p>
                </div>
              </div>

              <div className="cancel-form-warning">
                <i className="ti ti-info-circle"></i>
                This order has been cancelled and will not continue to delivery.
              </div>
            </div>

            <div className="cancel-popup-actions">
              <button
                type="button"
                className="outline-btn"
                onClick={closeCancelDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCancellations;