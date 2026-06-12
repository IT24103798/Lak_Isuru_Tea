import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../api/api";
import "../styles/MyOrders.css";

const TABS = [
  { label: "All", filter: "all" },
  { label: "To Pay", filter: "toPay" },
  { label: "To Pack", filter: "toPack" },
  { label: "To Ship", filter: "toShip" },
  { label: "To Receive", filter: "toReceive" },
  { label: "To Review", filter: "toReview" },
];

const STEPS = ["To Pack", "Shipped", "On the Way", "To Review"];

const statusStepMap = {
  pending: 0,
  processing: 0,
  packed: 0,
  shipped: 1,
  on_the_way: 2,
  delivered: 3,
};

const statusLabelMap = {
  pending: "To Pay",
  processing: "Processing",
  packed: "To Pack",
  shipped: "To Ship",
  on_the_way: "To Receive",
  delivered: "To Review",
  cancelled: "Cancelled",
};

const statusColorMap = {
  pending: "amber",
  processing: "blue",
  packed: "blue",
  shipped: "purple",
  on_the_way: "purple",
  delivered: "teal",
  returned: "red",
  cancelled: "red",
};

const normalizeStatus = (status = "") => {
  if (status === "To Pay") return "pending";
  if (status === "Processing") return "processing";

  if (status === "To Pack") return "packed";
  if (status === "Packed") return "packed";

  if (status === "To Ship") return "shipped";
  if (status === "Shipped") return "shipped";

  if (status === "On the Way") return "on_the_way";
  if (status === "To Receive") return "on_the_way";

  if (status === "To Review") return "delivered";
  if (status === "Delivered") return "delivered";

  if (status === "Cancelled") return "cancelled";

  if (status === "pending") return "pending";
  if (status === "processing") return "processing";
  if (status === "packed") return "packed";
  if (status === "shipped") return "shipped";
  if (status === "on_the_way") return "on_the_way";
  if (status === "delivered") return "delivered";
  if (status === "cancelled") return "cancelled";

  return status.toString().toLowerCase();
};

const formatSriLankanPhone = (phone = "") => {
  const digits = String(phone).replace(/[^\d]/g, "");

  if (!digits) return "-";

  if (digits.startsWith("94") && digits.length === 11) {
    const number = digits.slice(2);
    return `+94 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    const number = digits.slice(1);
    return `+94 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  }

  if (digits.length === 9) {
    return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  return phone;
};

const getCustomerTabStatus = (order) => {
  const status = normalizeStatus(order.status || order.orderStatus);

  if (status === "pending") return "toPay";
  if (status === "packed") return "toPack";
  if (status === "shipped") return "toShip";
  if (status === "on_the_way") return "toReceive";
  if (status === "delivered") return "toReview";
  if (status === "cancelled") return "cancelled";

  return "all";
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [agreeCancel, setAgreeCancel] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get("/orders");

      console.log("ORDERS RESPONSE:", data);

      setOrders(data.orders || []);
    } catch (err) {
      console.log("ORDERS LOAD ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Failed to load orders. Please login again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 1000);
  };

  const canCancelOrder = (status) => {
    const currentStatus = normalizeStatus(status);

    return (
      currentStatus === "pending" ||
      currentStatus === "processing" ||
      currentStatus === "packed"
    );
  };

  const handlePayNow = async (orderId) => {
    try {
      setActionLoading(orderId);
      setError("");

      await API.put(`/orders/${orderId}/pay`);
      await loadOrders();

      showSuccess("Payment completed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!cancelReason) {
      setCancelError("Please select a cancellation reason.");
      return;
    }

    if (!agreeCancel) {
      setCancelError(
        "Please agree to the cancellation warning before continuing."
      );
      return;
    }

    try {
      setActionLoading(orderId);
      setCancelError("");
      setError("");

      await API.put(`/orders/${orderId}/cancel`, {
        cancelReason,
        cancelNote,
      });

      await loadOrders();

      showSuccess("Order cancelled successfully.");
      closeModal();
    } catch (err) {
      setCancelError(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setActionLoading("");
    }
  };

  const handleOrderReceived = async (orderId) => {
    const hasArrived = window.confirm("Has this order arrived safely?");

    if (!hasArrived) return;

    try {
      setActionLoading(orderId);
      setError("");

      await API.put(`/orders/${orderId}/confirm-received`);
      await loadOrders();

      showSuccess("Thank you! Your order has been marked as received.");
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order.");
    } finally {
      setActionLoading("");
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowCancelForm(false);
    setCancelReason("");
    setCancelNote("");
    setAgreeCancel(false);
    setCancelError("");
    setError("");
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowCancelForm(false);
    setCancelReason("");
    setCancelNote("");
    setAgreeCancel(false);
    setCancelError("");
  };

  const filteredOrders = useMemo(() => {
    const currentFilter = TABS[activeTab].filter;

    return orders.filter((order) => {
      const tabStatus = getCustomerTabStatus(order);

      const matchesTab =
        currentFilter === "all" ? true : tabStatus === currentFilter;

      const search = searchText.trim().toLowerCase();

      if (!search) return matchesTab;

      const orderId = order._id?.toLowerCase() || "";

      const productNames =
        order.items?.map((item) => item.name?.toLowerCase()).join(" ") || "";

      return (
        matchesTab &&
        (orderId.includes(search) || productNames.includes(search))
      );
    });
  }, [orders, activeTab, searchText]);

  const getTabCount = (filter) => {
    if (filter === "all") return orders.length;

    return orders.filter((order) => getCustomerTabStatus(order) === filter)
      .length;
  };

  const getOrderQty = (items = []) => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMainProduct = (items = []) => {
    if (!items.length) return null;

    return items[0];
  };

  const getExtraItemCount = (items = []) => {
    if (!items.length) return 0;

    return items.length - 1;
  };

  const getDeliveryAddress = (customer = {}) => {
    if (customer.address) return customer.address;

    const parts = [
      customer.addressLine1,
      customer.addressLine2,
      customer.city,
      customer.district,
      customer.province,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "-";
  };

  const getStatusLabel = (status) => {
    const currentStatus = normalizeStatus(status);

    return statusLabelMap[currentStatus] || status || "Pending";
  };

  const getStatusColor = (status) => {
    const currentStatus = normalizeStatus(status);

    return statusColorMap[currentStatus] || "gray";
  };

  const getProgressStep = (status) => {
    const currentStatus = normalizeStatus(status);

    return statusStepMap[currentStatus] ?? -1;
  };

  const renderProgress = (status, className = "") => {
    const step = getProgressStep(status);

    if (step < 0) return null;

    return (
      <div className={`order-progress ${className}`}>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((label, index) => (
            <div
              key={label}
              className={`progress-dot ${index <= step ? "done" : ""}`}
              style={{ left: `${(index / (STEPS.length - 1)) * 100}%` }}
            ></div>
          ))}
        </div>

        <div className="progress-labels">
          {STEPS.map((label, index) => (
            <span key={label} className={index <= step ? "active" : ""}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="myorders-page-only">
      <main className="myorders-main">
        <div className="orders-hero">
          <div className="orders-header-block">
            <div>
              <span className="orders-eyebrow">Lak Isuru Tea Orders</span>
              <h1 className="orders-title">My Orders</h1>
              <p className="orders-subtitle">
                Track your tea orders, payment progress, and delivery updates in
                one clean dashboard.
              </p>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={loadOrders}
              disabled={loading}
            >
              <i className={`ti ${loading ? "ti-loader-2" : "ti-refresh"}`}></i>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {successMessage && (
            <div className="success-alert">
              <i className="ti ti-circle-check"></i>
              {successMessage}
            </div>
          )}

          <div className="orders-toolbar">
            <div className="search-box">
              <i className="ti ti-search"></i>

              <input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="orders-summary-chip">
              <i className="ti ti-package"></i>

              <span>
                {orders.length} Order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="orders-tabs">
          {TABS.map((tab, index) => {
            const count = getTabCount(tab.filter);

            return (
              <button
                type="button"
                key={tab.label}
                className={`orders-tab ${activeTab === index ? "active" : ""}`}
                onClick={() => setActiveTab(index)}
              >
                {tab.label}
                <span>{count}</span>
              </button>
            );
          })}
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
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && orders.length > 0 && filteredOrders.length === 0 && !error && (
          <div className="state-card empty-card">
            <i className="ti ti-package-off"></i>
            <h3>No matching orders found</h3>
            <p>You do not have any matching orders right now.</p>
          </div>
        )}

        <div className="orders-list">
          {!loading &&
            filteredOrders.map((order) => {
              const currentStatus = normalizeStatus(
                order.status || order.orderStatus
              );

              const color = getStatusColor(currentStatus);
              const mainProduct = getMainProduct(order.items);
              const extraCount = getExtraItemCount(order.items);
              const totalQty = getOrderQty(order.items);
              const isBusy = actionLoading === order._id;

              return (
                <div
                  className={`order-card ${
                    currentStatus === "cancelled" ? "cancelled-order-card" : ""
                  }`}
                  key={order._id}
                  onClick={() => openDetailsModal(order)}
                >
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
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>

                        <div className="order-meta-row">
                          <span>
                            <i className="ti ti-shopping-bag"></i>
                            Qty: {totalQty}
                          </span>

                          <span>
                            <i className="ti ti-calendar-event"></i>
                            {formatDate(order.createdAt)}
                          </span>

                          <span>
                            <i className="ti ti-credit-card"></i>
                            {order.paymentMethod ||
                              order.customer?.paymentMethod ||
                              "Cash on Delivery"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-right-block">
                      <span className={`order-badge badge-${color}`}>
                        {getStatusLabel(currentStatus)}
                      </span>
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

                  {renderProgress(currentStatus)}

                  <div className="order-actions">
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetailsModal(order);
                      }}
                    >
                      View Details
                    </button>

                    {currentStatus === "pending" && (
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={isBusy}
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePayNow(order._id);
                        }}
                      >
                        {isBusy ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {selectedOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div
            className="order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-hero">
              <div>
                <span className="modal-eyebrow">Order Details</span>
                <h2>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                <p>Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div className="modal-hero-actions">
                <span
                  className={`order-badge badge-${getStatusColor(
                    selectedOrder.status || selectedOrder.orderStatus
                  )}`}
                >
                  {getStatusLabel(
                    selectedOrder.status || selectedOrder.orderStatus
                  )}
                </span>

                <button type="button" onClick={closeModal}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>

            {renderProgress(
              selectedOrder.status || selectedOrder.orderStatus,
              "modal-progress"
            )}

            <div className="modal-quick-summary">
              <div>
                <span>Total Amount</span>
                <strong>
                  Rs. {(selectedOrder.totalPrice || 0).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {selectedOrder.paymentMethod ||
                    selectedOrder.customer?.paymentMethod ||
                    "Cash on Delivery"}
                </strong>
              </div>

              <div>
                <span>Total Quantity</span>
                <strong>{getOrderQty(selectedOrder.items)}</strong>
              </div>
            </div>

            <div className="modal-section">
              <div className="section-title-row">
                <h3>Products</h3>
                <span>{selectedOrder.items?.length || 0} item(s)</span>
              </div>

              <div className="modal-products">
                {selectedOrder.items?.map((item, index) => (
                  <div className="modal-product-row" key={index}>
                    <div className="modal-product-left">
                      <div className="modal-product-img">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <i className="ti ti-leaf"></i>
                        )}
                      </div>

                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          Qty: {item.quantity} × Rs.{" "}
                          {(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span>
                      Rs.{" "}
                      {(
                        (item.price || 0) * (item.quantity || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="section-title-row">
                <h3>Delivery Details</h3>
                <span>Customer information</span>
              </div>

              <div className="modal-info-grid">
                <p>
                  <span>Name</span>
                  {selectedOrder.customer?.fullName || "-"}
                </p>

                <p>
                  <span>Phone</span>
                  {formatSriLankanPhone(selectedOrder.customer?.phone)}
                </p>

                <p>
                  <span>Email</span>
                  {selectedOrder.customer?.email || "-"}
                </p>

                <p className="full">
                  <span>Delivery Address</span>
                  {getDeliveryAddress(selectedOrder.customer)}
                </p>
              </div>
            </div>

            <div className="modal-section">
              <div className="section-title-row">
                <h3>Payment Summary</h3>
                <span>Bill details</span>
              </div>

              <div className="modal-total-box">
                <div>
                  <span>Items Total</span>
                  <strong>
                    Rs. {(selectedOrder.cartItemsTotal || 0).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Delivery Fee</span>
                  <strong>
                    {selectedOrder.deliveryFee === 0
                      ? "Free"
                      : `Rs. ${(
                          selectedOrder.deliveryFee || 0
                        ).toLocaleString()}`}
                  </strong>
                </div>

                <div className="grand-total">
                  <span>Total</span>
                  <strong>
                    Rs. {(selectedOrder.totalPrice || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {normalizeStatus(selectedOrder.status || selectedOrder.orderStatus) ===
              "cancelled" && (
              <div className="modal-section cancelled-details">
                <div className="section-title-row">
                  <h3>Cancellation Details</h3>
                  <span>{formatDate(selectedOrder.cancelledAt)}</span>
                </div>

                <div className="modal-info-grid">
                  <p>
                    <span>Cancel Reason</span>
                    {selectedOrder.cancelReason || "-"}
                  </p>

                  {selectedOrder.cancelNote && (
                    <p className="full">
                      <span>Cancel Note</span>
                      {selectedOrder.cancelNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="modal-action-panel">
              {normalizeStatus(selectedOrder.status || selectedOrder.orderStatus) ===
                "pending" && (
                <button
                  type="button"
                  className="primary-btn"
                  disabled={actionLoading === selectedOrder._id}
                  onClick={() => handlePayNow(selectedOrder._id)}
                >
                  {actionLoading === selectedOrder._id
                    ? "Processing..."
                    : "Pay Now"}
                </button>
              )}

              {normalizeStatus(selectedOrder.status || selectedOrder.orderStatus) ===
                "on_the_way" && (
                <button
                  type="button"
                  className="receive-btn"
                  disabled={actionLoading === selectedOrder._id}
                  onClick={() => handleOrderReceived(selectedOrder._id)}
                >
                  {actionLoading === selectedOrder._id
                    ? "Updating..."
                    : "Order Received"}
                </button>
              )}
            </div>

            {canCancelOrder(selectedOrder.status || selectedOrder.orderStatus) && (
              <div className="modal-section cancel-section">
                {!showCancelForm ? (
                  <div className="cancel-button-row">
                    <button
                      type="button"
                      className="danger-modal-btn"
                      onClick={() => setShowCancelForm(true)}
                    >
                      Cancel This Order
                    </button>
                  </div>
                ) : (
                  <div className="cancel-form-box">
                    <h3>Cancel Order</h3>

                    <div className="cancel-warning">
                      <i className="ti ti-alert-triangle"></i>

                      <div>
                        <strong>Please read before cancelling</strong>
                        <p>
                          After cancelling this order, it cannot continue to
                          delivery. If payment was already completed, refund
                          processing may take time.
                        </p>
                      </div>
                    </div>

                    {cancelError && (
                      <div className="cancel-error-box">{cancelError}</div>
                    )}

                    <label className="cancel-label">
                      Why are you cancelling this order?
                    </label>

                    <select
                      className="cancel-select"
                      value={cancelReason}
                      onChange={(event) => {
                        setCancelReason(event.target.value);
                        setCancelError("");
                      }}
                    >
                      <option value="">Select a reason</option>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Ordered by mistake">
                        Ordered by mistake
                      </option>
                      <option value="Wrong delivery details">
                        Wrong delivery details
                      </option>
                      <option value="Payment issue">Payment issue</option>
                      <option value="Found another product">
                        Found another product
                      </option>
                      <option value="Other">Other</option>
                    </select>

                    <textarea
                      className="cancel-textarea"
                      placeholder="Add more details, optional..."
                      value={cancelNote}
                      onChange={(event) => setCancelNote(event.target.value)}
                    />

                    <label className="cancel-agree">
                      <input
                        type="checkbox"
                        checked={agreeCancel}
                        onChange={(event) => {
                          setAgreeCancel(event.target.checked);
                          setCancelError("");
                        }}
                      />
                      I understand that this order will be cancelled and cannot
                      continue to delivery.
                    </label>

                    <div className="cancel-form-actions">
                      <button
                        type="button"
                        className="outline-btn"
                        onClick={() => {
                          setShowCancelForm(false);
                          setCancelReason("");
                          setCancelNote("");
                          setAgreeCancel(false);
                          setCancelError("");
                        }}
                      >
                        Keep Order
                      </button>

                      <button
                        type="button"
                        className="danger-modal-btn"
                        disabled={actionLoading === selectedOrder._id}
                        onClick={() => handleCancelOrder(selectedOrder._id)}
                      >
                        {actionLoading === selectedOrder._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;