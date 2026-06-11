import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../api/api";
import "../../styles/AdminOrders.css";

const statusLabelMap = {
  processing: "To Ship",
  packed: "To Pack",
  shipped: "To Receive",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColorMap = {
  processing: "blue",
  packed: "orange",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "processing", label: "To Ship" },
  { value: "packed", label: "To Pack" },
  { value: "shipped", label: "To Receive" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getNextStatusOptions = (currentStatus) => {
  if (currentStatus === "processing") {
    return [
      { value: "processing", label: "To Ship" },
      { value: "packed", label: "To Pack" },
    ];
  }

  if (currentStatus === "packed") {
    return [
      { value: "packed", label: "To Pack" },
      { value: "shipped", label: "To Receive" },
    ];
  }

  if (currentStatus === "shipped") {
    return [
      { value: "shipped", label: "To Receive" },
      { value: "delivered", label: "Delivered" },
    ];
  }

  if (currentStatus === "delivered") {
    return [{ value: "delivered", label: "Delivered" }];
  }

  if (currentStatus === "cancelled") {
    return [{ value: "cancelled", label: "Cancelled" }];
  }

  return [
    {
      value: currentStatus,
      label: statusLabelMap[currentStatus] || currentStatus,
    },
  ];
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setRefreshing(true);

      const { data } = await API.get("/orders/admin/all");

      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        filterStatus === "all" ? true : order.status === filterStatus;

      const search = searchText.trim().toLowerCase();

      if (!search) return matchesStatus;

      const orderId = order._id?.toLowerCase() || "";
      const customerName =
        order.customer?.fullName?.toLowerCase() ||
        order.user?.name?.toLowerCase() ||
        "";
      const customerEmail =
        order.customer?.email?.toLowerCase() ||
        order.user?.email?.toLowerCase() ||
        "";
      const productNames =
        order.items?.map((item) => item.name?.toLowerCase()).join(" ") || "";

      return (
        matchesStatus &&
        (orderId.includes(search) ||
          customerName.includes(search) ||
          customerEmail.includes(search) ||
          productNames.includes(search))
      );
    });
  }, [orders, filterStatus, searchText]);

  const summary = useMemo(() => {
    return {
      total: orders.length,
      processing: orders.filter((order) => order.status === "processing").length,
      packed: orders.filter((order) => order.status === "packed").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    };
  }, [orders]);

  const updateStatus = async (orderId, currentStatus) => {
    const newStatus = selectedStatus[orderId] || currentStatus;

    if (!newStatus) {
      setError("Please select a status.");
      return;
    }

    if (newStatus === currentStatus) {
      setError(
        `This order is already marked as ${statusLabelMap[currentStatus]}.`
      );
      return;
    }

    try {
      setActionLoading(orderId);
      setError("");

      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      await loadOrders();

      if (newStatus === "packed") {
        showSuccess(
          "Order marked as To Pack. Customer cancellation is now disabled."
        );
      } else if (newStatus === "shipped") {
        showSuccess("Order marked as To Receive.");
      } else if (newStatus === "delivered") {
        showSuccess("Order marked as Delivered. Order completed.");
      } else {
        showSuccess("Order status updated successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setActionLoading("");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-hero">
        <div>
          <span className="admin-page-tag">
            <i className="ti ti-leaf"></i>
            Lak Isuru Tea Admin
          </span>

          <h1>Order Management</h1>

          <p>
            Manage tea orders, update delivery status, and control customer
            cancellation availability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="admin-refresh-btn"
          disabled={refreshing}
        >
          <i className={`ti ${refreshing ? "ti-loader-2" : "ti-refresh"}`}></i>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="admin-summary-grid">
        <div className="admin-summary-card total">
          <div className="summary-icon">
            <i className="ti ti-packages"></i>
          </div>
          <div>
            <span>Total Orders</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="admin-summary-card ship">
          <div className="summary-icon">
            <i className="ti ti-truck-delivery"></i>
          </div>
          <div>
            <span>To Ship</span>
            <strong>{summary.processing}</strong>
          </div>
        </div>

        <div className="admin-summary-card pack">
          <div className="summary-icon">
            <i className="ti ti-box"></i>
          </div>
          <div>
            <span>To Pack</span>
            <strong>{summary.packed}</strong>
          </div>
        </div>

        <div className="admin-summary-card receive">
          <div className="summary-icon">
            <i className="ti ti-box-seam"></i>
          </div>
          <div>
            <span>To Receive</span>
            <strong>{summary.shipped}</strong>
          </div>
        </div>

        <div className="admin-summary-card delivered">
          <div className="summary-icon">
            <i className="ti ti-circle-check"></i>
          </div>
          <div>
            <span>Delivered</span>
            <strong>{summary.delivered}</strong>
          </div>
        </div>
      </div>

      <div className="admin-orders-toolbar">
        <div className="admin-search-box">
          <i className="ti ti-search"></i>
          <input
            type="text"
            placeholder="Search by order ID, customer, email, or product..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {successMessage && (
        <div className="admin-success-box">
          <i className="ti ti-circle-check"></i>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="admin-error-box">
          <i className="ti ti-alert-circle"></i>
          {error}
        </div>
      )}

      {loading && <div className="admin-state-box">Loading orders...</div>}

      {!loading && filteredOrders.length === 0 && (
        <div className="admin-state-box">No matching orders found.</div>
      )}

      <div className="admin-orders-list">
        {filteredOrders.map((order) => {
          const mainProduct = getMainProduct(order.items);
          const extraCount = getExtraItemCount(order.items);
          const color = statusColorMap[order.status] || "gray";

          const isBusy = actionLoading === order._id;
          const isCancelled = order.status === "cancelled";
          const isDelivered = order.status === "delivered";
          const isPacked = order.status === "packed";
          const isShipped = order.status === "shipped";
          const isProcessing = order.status === "processing";

          const cancelDisabled =
            isPacked || isShipped || isDelivered || isCancelled;

          const currentSelectedStatus =
            selectedStatus[order._id] || order.status;

          const statusNotChanged = currentSelectedStatus === order.status;

          const disableUpdateButton =
            isBusy || isCancelled || isDelivered || statusNotChanged;

          const dropdownOptions = getNextStatusOptions(order.status);

          return (
            <div className="admin-order-card compact" key={order._id}>
              <div className="admin-order-card-header">
                <div className="admin-order-title-block">
                  <div className="admin-product-image">
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

                  <div>
                    <h3>{mainProduct?.name || "Tea Product"}</h3>
                    <p>Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p>Placed on {formatDate(order.createdAt)}</p>

                    {extraCount > 0 && (
                      <span className="admin-extra-items">
                        +{extraCount} more item{extraCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-order-status-block">
                  <div className="admin-top-status-row">
                    <span className={`admin-status-badge badge-${color}`}>
                      {statusLabelMap[order.status] || order.status}
                    </span>

                    <div className="top-cancel-access">
                      <span>Cancel Access</span>
                      <strong className={cancelDisabled ? "blocked" : "allowed"}>
                        {isCancelled
                          ? "Already Cancelled"
                          : isPacked
                          ? "Disabled after To Pack"
                          : isShipped || isDelivered
                          ? "Disabled"
                          : "Allowed"}
                      </strong>
                    </div>
                  </div>

                  <strong>Rs. {(order.totalPrice || 0).toLocaleString()}</strong>
                </div>
              </div>

              {isProcessing && (
                <div className="admin-info-message">
                  🧾 New order received. Prepare this order for packing.
                </div>
              )}

              {isPacked && (
                <div className="admin-info-message">
                  📦 Order is ready to pack/dispatch. Customer cancellation is
                  disabled.
                </div>
              )}

              {isShipped && (
                <div className="admin-warning-message">
                  🚚 Order shipped. Waiting for customer to receive.
                </div>
              )}

              {isDelivered && (
                <div className="admin-success-message">
                  ✅ Customer received this order. Order completed.
                </div>
              )}

              {isCancelled && (
                <div className="admin-cancel-box">
                  <h4>Cancellation Details</h4>

                  <p>
                    <span>Reason:</span> {order.cancelReason || "-"}
                  </p>

                  <p>
                    <span>Note:</span>{" "}
                    {order.cancelNote || "No additional note."}
                  </p>
                </div>
              )}

              <div className="admin-order-actions">
                <button
                  type="button"
                  className="details-btn"
                  onClick={() => openOrderModal(order)}
                >
                  View Details
                </button>

                <select
                  value={currentSelectedStatus}
                  disabled={isCancelled || isDelivered}
                  onChange={(event) =>
                    setSelectedStatus((prev) => ({
                      ...prev,
                      [order._id]: event.target.value,
                    }))
                  }
                >
                  {dropdownOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={disableUpdateButton}
                  onClick={() => updateStatus(order._id, order.status)}
                >
                  {isBusy
                    ? "Updating..."
                    : isDelivered
                    ? "Completed"
                    : statusNotChanged
                    ? "Already Selected"
                    : "Update Status"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="admin-order-modal-overlay" onClick={closeOrderModal}>
          <div
            className="admin-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Order Details</h2>
                <p>Order #{selectedOrder._id?.slice(-8).toUpperCase()}</p>
              </div>

              <button type="button" onClick={closeOrderModal}>
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div className="admin-modal-section">
              <h3>Customer Details</h3>

              <div className="admin-modal-grid">
                <p>
                  <span>Name</span>
                  {selectedOrder.customer?.fullName ||
                    selectedOrder.user?.name ||
                    "-"}
                </p>

                <p>
                  <span>Email</span>
                  {selectedOrder.customer?.email ||
                    selectedOrder.user?.email ||
                    "-"}
                </p>

                <p>
                  <span>Phone</span>
                  {selectedOrder.customer?.phone || "-"}
                </p>

                <p>
                  <span>City</span>
                  {selectedOrder.customer?.city || "-"}
                </p>

                <p className="full">
                  <span>Address</span>
                  {getDeliveryAddress(selectedOrder.customer)}
                </p>
              </div>
            </div>

            <div className="admin-modal-section">
              <h3>Products</h3>

              <div className="admin-modal-products">
                {selectedOrder.items?.map((item, index) => (
                  <div className="admin-modal-product-row" key={index}>
                    <div className="modal-product-left">
                      <div className="modal-product-image">
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
                        <p>Qty: {item.quantity}</p>
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

            <div className="admin-modal-section">
              <h3>Payment Summary</h3>

              <div className="admin-modal-total-box">
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

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {selectedOrder.paymentMethod || "Cash on Delivery"}
                  </strong>
                </div>

                <div>
                  <span>Current Status</span>
                  <strong>
                    {statusLabelMap[selectedOrder.status] ||
                      selectedOrder.status}
                  </strong>
                </div>

                <div>
                  <span>Cancel Access</span>
                  <strong>
                    {selectedOrder.status === "packed"
                      ? "Disabled after To Pack"
                      : selectedOrder.status === "shipped" ||
                        selectedOrder.status === "delivered"
                      ? "Disabled after shipping"
                      : selectedOrder.status === "cancelled"
                      ? "Already cancelled"
                      : "Customer can cancel"}
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

            {selectedOrder.status === "cancelled" && (
              <div className="admin-modal-section">
                <h3>Cancellation Details</h3>

                <div className="admin-cancel-box modal-cancel">
                  <p>
                    <span>Cancelled Date:</span>{" "}
                    {formatDateTime(
                      selectedOrder.cancelledAt || selectedOrder.updatedAt
                    )}
                  </p>

                  <p>
                    <span>Reason:</span> {selectedOrder.cancelReason || "-"}
                  </p>

                  <p>
                    <span>Note:</span>{" "}
                    {selectedOrder.cancelNote || "No additional note."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;