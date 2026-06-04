import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../api/api";
import "../../styles/AdminOrders.css";

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
  delivered: "green",
  returned: "red",
  cancelled: "gray",
};

const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "To Pay" },
  { value: "processing", label: "To Ship" },
  { value: "shipped", label: "To Receive" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

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

  const getDeliveryAddress = (customer = {}) => {
    if (customer.address) return customer.address;

    const parts = [
      customer.addressLine1,
      customer.addressLine2,
      customer.city,
      customer.district,
      customer.province,
      customer.postalCode,
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
      pending: orders.filter((order) => order.status === "pending").length,
      processing: orders.filter((order) => order.status === "processing")
        .length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    };
  }, [orders]);

  const updateStatus = async (orderId, status) => {
    if (!status) {
      setError("Please select a status.");
      return;
    }

    try {
      setActionLoading(orderId);
      setError("");

      await API.put(`/orders/${orderId}/status`, {
        status,
      });

      await loadOrders();

      if (status === "shipped") {
        showSuccess(
          "Order marked as shipped. Customer cancellation is now disabled."
        );
      } else {
        showSuccess("Order status updated successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setActionLoading("");
    }
  };

  const quickShipOrder = async (orderId) => {
    try {
      setActionLoading(orderId);
      setError("");

      await API.put(`/orders/${orderId}/status`, {
        status: "shipped",
      });

      await loadOrders();
      showSuccess(
        "Order marked as shipped. Customer cancellation is now disabled."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to ship order.");
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

        <div className="admin-summary-card pay">
          <div className="summary-icon">
            <i className="ti ti-credit-card"></i>
          </div>
          <div>
            <span>To Pay</span>
            <strong>{summary.pending}</strong>
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

        <div className="admin-summary-card receive">
          <div className="summary-icon">
            <i className="ti ti-box-seam"></i>
          </div>
          <div>
            <span>To Receive</span>
            <strong>{summary.shipped}</strong>
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
          const totalQty = getOrderQty(order.items);
          const color = statusColorMap[order.status] || "gray";
          const isBusy = actionLoading === order._id;
          const isCancelled = order.status === "cancelled";
          const isDelivered = order.status === "delivered";
          const isShipped = order.status === "shipped";

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
                  <span className={`admin-status-badge badge-${color}`}>
                    {statusLabelMap[order.status] || order.status}
                  </span>

                  <strong>Rs. {(order.totalPrice || 0).toLocaleString()}</strong>
                </div>
              </div>

              <div className="admin-compact-meta">
                <div>
                  <span>Customer</span>
                  <strong>
                    {order.customer?.fullName || order.user?.name || "-"}
                  </strong>
                </div>

                <div>
                  <span>Qty</span>
                  <strong>{totalQty}</strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>{order.paymentMethod || "Cash on Delivery"}</strong>
                </div>

                <div>
                  <span>Cancel Access</span>
                  <strong className={isShipped || isDelivered ? "blocked" : "allowed"}>
                    {isCancelled
                      ? "Already Cancelled"
                      : isShipped || isDelivered
                      ? "Disabled"
                      : "Allowed"}
                  </strong>
                </div>
              </div>

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
                  value={selectedStatus[order._id] || order.status}
                  disabled={isCancelled}
                  onChange={(event) =>
                    setSelectedStatus((prev) => ({
                      ...prev,
                      [order._id]: event.target.value,
                    }))
                  }
                >
                  <option value="pending">To Pay</option>
                  <option value="processing">To Ship</option>
                  <option value="shipped">To Receive</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>

                <button
                  type="button"
                  disabled={isBusy || isCancelled}
                  onClick={() =>
                    updateStatus(
                      order._id,
                      selectedStatus[order._id] || order.status
                    )
                  }
                >
                  {isBusy ? "Updating..." : "Update Status"}
                </button>

                {!isCancelled && !isDelivered && !isShipped && (
                  <button
                    type="button"
                    className="ship-btn"
                    disabled={isBusy}
                    onClick={() => quickShipOrder(order._id)}
                  >
                    {isBusy ? "Shipping..." : "Ship & Disable Cancel"}
                  </button>
                )}
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
                  <span>Cancel Access</span>
                  <strong>
                    {selectedOrder.status === "shipped" ||
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