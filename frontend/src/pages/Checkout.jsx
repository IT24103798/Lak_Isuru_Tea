import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "Cash on Delivery",
    notes: "",
  });

  const navigate = useNavigate();

  const loadUserDetails = useCallback(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (savedUser) {
        setCheckoutData((prev) => ({
          ...prev,
          fullName:
            savedUser.name ||
            savedUser.fullName ||
            savedUser.username ||
            "",
          email: savedUser.email || "",
          phone:
            savedUser.phone ||
            savedUser.phoneNumber ||
            savedUser.mobile ||
            "",
        }));
      }
    } catch (err) {
      console.log("No saved user details found.");
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const { data } = await API.get("/cart");
      setCart(data.cart || []);
      setError("");
    } catch (err) {
      setError("Failed to load checkout details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserDetails();
    loadCart();
  }, [loadUserDetails, loadCart]);

  const cartItemsTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length === 0 ? 0 : cartItemsTotal >= 5000 ? 0 : 300;

  const total = cartItemsTotal + deliveryFee;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCheckoutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!checkoutData.fullName.trim()) {
      return "Full name is required.";
    }

    if (!checkoutData.email.trim()) {
      return "Email is required.";
    }

    if (!checkoutData.phone.trim()) {
      return "Phone number is required.";
    }

    if (!checkoutData.address.trim()) {
      return "Delivery address is required.";
    }

    if (!checkoutData.city.trim()) {
      return "City is required.";
    }

    if (cart.length === 0) {
      return "Your cart is empty.";
    }

    return "";
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const orderData = {
        customer: checkoutData,
        items: cart,
        cartItemsTotal,
        deliveryFee,
        total,
        status: "Pending",
        paymentStatus:
          checkoutData.paymentMethod === "Cash on Delivery"
            ? "Pending"
            : "Processing",
      };

      await API.post("/orders", orderData);

      navigate("/order-success");
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/cart")}
          >
            <i className="ti ti-arrow-left"></i>
            Back to Cart
          </button>

          <div>
            <h1>Checkout</h1>
            <p>Complete your delivery details and place your tea order.</p>
          </div>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <form className="checkout-layout" onSubmit={placeOrder}>
          <div className="checkout-form-box">
            <section className="checkout-section">
              <div className="section-title">
                <span>1</span>
                <div>
                  <h2>Customer Details</h2>
                  <p>Enter your contact information.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={checkoutData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={checkoutData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="07XXXXXXXX"
                    value={checkoutData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <div className="section-title">
                <span>2</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Enter the address where your order should be delivered.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    placeholder="House number, street name, area"
                    value={checkoutData.address}
                    onChange={handleChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Colombo"
                    value={checkoutData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Optional"
                    value={checkoutData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <div className="section-title">
                <span>3</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Select how you want to pay.</p>
                </div>
              </div>

              <div className="payment-options">
                <label
                  className={
                    checkoutData.paymentMethod === "Cash on Delivery"
                      ? "payment-card active"
                      : "payment-card"
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={checkoutData.paymentMethod === "Cash on Delivery"}
                    onChange={handleChange}
                  />
                  <i className="ti ti-truck-delivery"></i>
                  <div>
                    <h3>Cash on Delivery</h3>
                    <p>Pay when your tea order arrives.</p>
                  </div>
                </label>

                <label
                  className={
                    checkoutData.paymentMethod === "Online Payment"
                      ? "payment-card active"
                      : "payment-card"
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={checkoutData.paymentMethod === "Online Payment"}
                    onChange={handleChange}
                  />
                  <i className="ti ti-credit-card"></i>
                  <div>
                    <h3>Online Payment</h3>
                    <p>Pay securely using card payment.</p>
                  </div>
                </label>
              </div>

              <div className="form-group notes-box">
                <label>Order Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any special delivery instructions? Optional"
                  value={checkoutData.notes}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
            </section>
          </div>

          <aside className="checkout-summary-box">
            <h2>My Order Details</h2>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div className="checkout-summary-item" key={item.productId}>
                  <div className="checkout-product-info">
                    <div className="checkout-product-image">
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

            <div className="checkout-line"></div>

            <div className="checkout-price-row">
              <span>Delivery Fee</span>
              <strong>
                {deliveryFee === 0
                  ? "Free"
                  : `Rs. ${deliveryFee.toLocaleString()}`}
              </strong>
            </div>

            <div className="checkout-line"></div>

            <div className="checkout-total-row">
              <span>Total</span>
              <strong>Rs. {total.toLocaleString()}</strong>
            </div>

            <div className="checkout-delivery-box">
              <i className="ti ti-truck-delivery"></i>
              <span>
                Estimated delivery: <b>2 - 4 business days</b>
              </span>
            </div>

            <button
              type="submit"
              className="place-order-btn"
              disabled={placingOrder || cart.length === 0}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
              {!placingOrder && <i className="ti ti-check"></i>}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;