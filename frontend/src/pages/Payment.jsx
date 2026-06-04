import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Payment.css";

const Payment = () => {
  const [orderDraft, setOrderDraft] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Cash on Delivery");
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedDraft = JSON.parse(localStorage.getItem("checkoutDraft"));

    if (!savedDraft) {
      navigate("/checkout");
      return;
    }

    setOrderDraft(savedDraft);
    setSelectedPaymentMethod(savedDraft.paymentMethod || "Cash on Delivery");
  }, [navigate]);

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;

    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePayment = () => {
    if (!orderDraft) return "Order details not found.";

    if (selectedPaymentMethod === "Online Payment") {
      if (!paymentDetails.cardName.trim()) {
        return "Card holder name is required.";
      }

      if (!paymentDetails.cardNumber.trim()) {
        return "Card number is required.";
      }

      if (!paymentDetails.expiryDate.trim()) {
        return "Expiry date is required.";
      }

      if (!paymentDetails.cvv.trim()) {
        return "CVV is required.";
      }
    }

    return "";
  };

  const confirmOrder = async () => {
    const validationError = validatePayment();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const finalOrderData = {
        ...orderDraft,
        paymentMethod: selectedPaymentMethod,
        paymentStatus:
          selectedPaymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
        orderStatus: "To Ship",
      };

      const { data } = await API.post("/orders", finalOrderData);

      localStorage.removeItem("checkoutDraft");
      localStorage.removeItem("checkoutItems");

      setOrderSuccess({
        orderId: data.order?._id || "Confirmed",
        total: orderDraft.total,
        paymentMethod: selectedPaymentMethod,
        customerName: orderDraft.customer.fullName,
      });
    } catch (err) {
      console.log("ORDER ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to confirm order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="payment-page">
        <div className="order-success-container">
          <div className="order-success-card">
            <div className="success-icon">
              <i className="ti ti-check"></i>
            </div>

            <h1>Thank you for choosing Lak Isuru Tea!</h1>

            <p className="success-message">
              Your order has been confirmed successfully. We appreciate your
              purchase and will prepare your tea order with care.
            </p>

            <div className="success-details">
              <div>
                <span>Customer</span>
                <strong>{orderSuccess.customerName}</strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{orderSuccess.paymentMethod}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>Rs. {orderSuccess.total.toLocaleString()}</strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>To Ship</strong>
              </div>
            </div>

            <div className="success-delivery-note">
              <i className="ti ti-truck-delivery"></i>
              <span>
                Estimated delivery: <b>2 - 4 business days</b>
              </span>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="view-orders-btn"
                onClick={() => navigate("/my-orders")}
              >
                View My Orders
              </button>

              <button
                type="button"
                className="continue-shopping-btn"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDraft) {
    return (
      <div className="payment-page">
        <div className="payment-loading">Loading payment details...</div>
      </div>
    );
  }

  const { customer, items, cartItemsTotal, deliveryFee, total } = orderDraft;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button
            type="button"
            className="payment-back-btn"
            onClick={() => navigate("/checkout")}
          >
            <i className="ti ti-arrow-left"></i>
            Back to Checkout
          </button>

          <div>
            <h1>Payment Details</h1>
            <p>
              Review your delivery details, choose your payment method, and
              confirm your order.
            </p>
          </div>
        </div>

        {error && <div className="payment-error">{error}</div>}

        <div className="payment-layout">
          <main className="payment-main">
            <section className="payment-card customer-details-card">
              <div className="payment-section-title clean-title">
                <div>
                  <h2>Customer Information</h2>
                  <p>Your contact information for this order</p>
                </div>
              </div>

              <div className="customer-details-row">
                <div className="customer-detail-item">
                  <span>Full Name :</span>
                  <strong>{customer.fullName}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Email :</span>
                  <strong>{customer.email}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Phone Number :</span>
                  <strong>{customer.phone}</strong>
                </div>
              </div>
            </section>

            <section className="payment-card">
              <div className="payment-section-title clean-title">
                <div>
                  <h2>Delivery Address</h2>
                  <p>Tea order will be delivered to this address</p>
                </div>
              </div>

              <div className="address-box">
                <span className="address-badge">{customer.addressType}</span>

                <p>
                  <strong>{customer.addressLine1}</strong>,{" "}
                  {customer.addressLine2}
                </p>

                {customer.landmark && (
                  <p>
                    <b>Landmark:</b> {customer.landmark}
                  </p>
                )}

                <p>
                  <b>Location:</b> {customer.city}, {customer.district},{" "}
                  {customer.province}
                </p>

                <p>
                  <b>Postal Code:</b> {customer.postalCode}
                </p>
              </div>
            </section>

            <section className="payment-card">
              <div className="payment-section-title clean-title">
                <div>
                  <h2>Payment Method</h2>
                  <p>Choose how you want to pay for this order</p>
                </div>
              </div>

              <div className="payment-method-options-view">
                <label
                  className={
                    selectedPaymentMethod === "Cash on Delivery"
                      ? "payment-view-card active"
                      : "payment-view-card"
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={selectedPaymentMethod === "Cash on Delivery"}
                    onChange={(event) =>
                      setSelectedPaymentMethod(event.target.value)
                    }
                  />

                  <i className="ti ti-truck-delivery"></i>

                  <div>
                    <h3>Cash on Delivery</h3>
                    <p>Pay when your tea order arrives.</p>
                  </div>
                </label>

                <label
                  className={
                    selectedPaymentMethod === "Online Payment"
                      ? "payment-view-card active online"
                      : "payment-view-card online"
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={selectedPaymentMethod === "Online Payment"}
                    onChange={(event) =>
                      setSelectedPaymentMethod(event.target.value)
                    }
                  />

                  <i className="ti ti-credit-card"></i>

                  <div>
                    <h3>Online Payment</h3>
                    <p>Pay securely using card payment.</p>
                  </div>
                </label>
              </div>

              {selectedPaymentMethod === "Online Payment" && (
                <div className="online-payment-form">
                  <div className="secure-payment-note">
                    <i className="ti ti-shield-lock"></i>
                    <span>Secure online payment details</span>
                  </div>

                  <div className="payment-form-grid">
                    <div className="payment-form-group full-width">
                      <label>Card Holder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Enter name on card"
                        value={paymentDetails.cardName}
                        onChange={handlePaymentChange}
                      />
                    </div>

                    <div className="payment-form-group full-width">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentChange}
                        maxLength="19"
                      />
                    </div>

                    <div className="payment-form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={handlePaymentChange}
                        maxLength="5"
                      />
                    </div>

                    <div className="payment-form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        placeholder="***"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentChange}
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>

          <aside className="payment-summary">
            <h2>Order Summary</h2>

            <div className="payment-items">
              {items.map((item) => (
                <div className="payment-item" key={item.productId}>
                  <div className="payment-product">
                    <div className="payment-product-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <i className="ti ti-leaf"></i>
                      )}
                    </div>

                    <div>
                      <h3>{item.name}</h3>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <strong>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            <div className="payment-line"></div>

            <div className="payment-price-row">
              <span>Items Total</span>
              <strong>Rs. {cartItemsTotal.toLocaleString()}</strong>
            </div>

            <div className="payment-price-row">
              <span>Delivery Fee</span>
              <strong>
                {deliveryFee === 0
                  ? "Free"
                  : `Rs. ${deliveryFee.toLocaleString()}`}
              </strong>
            </div>

            <div className="payment-price-row">
              <span>Payment</span>
              <strong>{selectedPaymentMethod}</strong>
            </div>

            <div className="payment-line"></div>

            <div className="payment-total-row">
              <span>Total</span>
              <strong>Rs. {total.toLocaleString()}</strong>
            </div>

            <button
              type="button"
              className="confirm-order-btn"
              onClick={confirmOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Confirming Order..."
                : selectedPaymentMethod === "Online Payment"
                ? "Pay & Confirm Order"
                : "Confirm Order"}

              {!placingOrder && <i className="ti ti-check"></i>}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Payment;