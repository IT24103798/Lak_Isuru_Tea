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
  const [billingAddress, setBillingAddress] = useState(null);

  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const navigate = useNavigate();

  const normalizeAddressType = (type) => {
    const value = String(type || "Home").toLowerCase();

    if (value === "office") return "Office";
    if (value === "home") return "Home";

    return "Home";
  };

  const normalizePhone = (phone) => {
    const cleaned = String(phone || "").replace(/[^\d]/g, "");
    return cleaned ? `+${cleaned}` : "";
  };

  const normalizeAddressPayload = (address = {}) => {
    const addressLine1 =
      address.addressLine1 || address.addressLine || address.address || "";
    const addressLine2 = address.addressLine2 || "";

    const fullAddress = [
      addressLine1,
      addressLine2,
      address.city,
      address.district,
      address.province,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      ...address,
      fullName: address.fullName || "",
      email: address.email || "",
      phone: normalizePhone(address.phone || address.phoneNumber1),
      phoneNumber1: normalizePhone(address.phoneNumber1 || address.phone),
      phoneNumber2: normalizePhone(address.phoneNumber2),
      addressType: normalizeAddressType(address.addressType),
      addressLine: addressLine1,
      addressLine1,
      addressLine2,
      city: address.city || "",
      district: address.district || "",
      province: address.province || "",
      postalCode: address.postalCode || "",
      address: address.address || fullAddress,
    };
  };
  useEffect(() => {
    const scriptId = "payhere-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadDefaultBillingAddress = async () => {
    try {
      const { data } = await API.get("/addresses/default-billing");

      if (data.address) {
        setBillingAddress(data.address);
      }
    } catch {
      console.log("No default billing address found.");
    }
  };

  useEffect(() => {
    const savedDraft = JSON.parse(localStorage.getItem("checkoutDraft"));

    if (!savedDraft) {
      navigate("/checkout");
      return;
    }

    setOrderDraft(savedDraft);

    if (savedDraft.paymentMethod === "Online Payment") {
      setSelectedPaymentMethod("PayHere");
    } else {
      setSelectedPaymentMethod(savedDraft.paymentMethod || "Cash on Delivery");
    }
    loadDefaultBillingAddress();
  }, [navigate]);

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;

    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }

    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setPaymentDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const validatePayment = () => {
    if (!orderDraft) return "Order details not found.";

    if (selectedPaymentMethod === "Online Payment") {
      if (!paymentDetails.cardName.trim()) {
        return "Card holder name is required.";
      }

      const cardNumberDigits = paymentDetails.cardNumber.replace(/\D/g, "");
      if (!cardNumberDigits || cardNumberDigits.length < 12) {
        return "Please enter a valid card number.";
      }

      if (!paymentDetails.expiryDate.trim()) {
        return "Expiry date is required.";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiryDate)) {
        return "Expiry date must be in MM/YY format.";
      }

      if (!paymentDetails.cvv.trim()) {
        return "CVV is required.";
      }

      if (paymentDetails.cvv.length < 3) {
        return "Please enter a valid CVV.";
      }
    }

    return "";
  };

  const clearCheckoutStorage = () => {
    localStorage.removeItem("checkoutDraft");
    localStorage.removeItem("checkoutItems");
  };

  const confirmOrder = async () => {
    const validationError = validatePayment();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const normalizedCustomer = normalizeAddressPayload(orderDraft.customer);
      const normalizedShippingAddress = normalizeAddressPayload(
        orderDraft.shippingAddress || orderDraft.customer
      );
      const normalizedBillingAddress = normalizeAddressPayload(
        orderDraft.billingAddress || orderDraft.customer
      );

      const finalOrderData = {
        ...orderDraft,

        customer: {
          ...normalizedCustomer,
          billingAddress: normalizedBillingAddress,
        },

        shippingAddress: normalizedShippingAddress,
        billingAddress: normalizedBillingAddress,

        items: (orderDraft.items || []).map((item) => ({
          productId: item.productId || item.product || item._id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image,
        })),

        paymentMethod: selectedPaymentMethod,
        paymentStatus: "Pending",
        orderStatus:
          selectedPaymentMethod === "Cash on Delivery" ? "To Ship" : "To Pay",
      };

      const { data } = await API.post("/orders", finalOrderData);
      const createdOrder = data.order;

      if (selectedPaymentMethod === "Cash on Delivery") {
        clearCheckoutStorage();

        setOrderSuccess({
          orderId: createdOrder?._id || "Confirmed",
          total: orderDraft.total,
          paymentMethod: selectedPaymentMethod,
          customerName: orderDraft.customer.fullName,
          orderStatus: "To Ship",
        });

        return;
      }

      const hashResponse = await API.post("/payments/payhere/hash", {
        orderId: createdOrder._id,
        amount: orderDraft.total,
      });

      const payhereData = hashResponse.data;

      if (!window.payhere) {
        setError("PayHere payment script is still loading. Please try again.");
        return;
      }

      window.payhere.onCompleted = async function (paymentId) {
        await API.put(`/orders/${createdOrder._id}/pay`, {
          paymentId,
        });

        clearCheckoutStorage();

        setOrderSuccess({
          orderId: createdOrder._id,
          total: orderDraft.total,
          paymentMethod: "PayHere",
          customerName: orderDraft.customer.fullName,
          orderStatus: "To Ship",
        });
      };

      window.payhere.onDismissed = function () {
        setError("Payment was cancelled before completion.");
      };

      window.payhere.onError = function () {
        setError("PayHere payment failed. Please try again.");
      };

      const payment = {
        sandbox: payhereData.sandbox,
        merchant_id: payhereData.merchantId,
        return_url: payhereData.returnUrl,
        cancel_url: payhereData.cancelUrl,
        notify_url: payhereData.notifyUrl,
        order_id: payhereData.orderId,
        items: "Lak Isuru Tea Order",
        amount: payhereData.amount,
        currency: payhereData.currency,
        hash: payhereData.hash,

        first_name: orderDraft.customer.fullName,
        last_name: "",
        email: orderDraft.customer.email,
        phone: orderDraft.customer.phone,
        address: `${orderDraft.customer.addressLine1}, ${orderDraft.customer.addressLine2}`,
        city: orderDraft.customer.city,
        country: "Sri Lanka",

        delivery_address: `${orderDraft.customer.addressLine1}, ${orderDraft.customer.addressLine2}`,
        delivery_city: orderDraft.customer.city,
        delivery_country: "Sri Lanka",
      };

      window.payhere.startPayment(payment);
    } catch (err) {
        console.log("ORDER ERROR FULL:", err);
        console.log("ORDER ERROR DATA:", JSON.stringify(err.response?.data, null, 2));

        setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Failed to confirm order. Please try again."
          );

        window.scrollTo({ top: 0, behavior: "smooth" });
      }finally {
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
                <strong>Rs. {Number(orderSuccess.total).toLocaleString()}</strong>
              </div>

              <div>
                <span>Order Status</span>
                <strong>{orderSuccess.orderStatus}</strong>
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

  const {
    customer = {},
    items = [],
    cartItemsTotal = 0,
    deliveryFee = 0,
    total = 0,
  } = orderDraft;

  const displayCustomer = normalizeAddressPayload(customer);

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
                  <span>Full Name</span>
                  <strong>{displayCustomer.fullName || "-"}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Email</span>
                  <strong>{displayCustomer.email || "-"}</strong>
                </div>

                <div className="customer-detail-item">
                  <span>Phone Number</span>
                  <strong>{displayCustomer.phone || "-"}</strong>
                </div>
              </div>
            </section>

            <section className="payment-card delivery-details-card">
              <div className="payment-section-title clean-title">
                <div>
                  <h2>Delivery Address</h2>
                  <p>Your tea order will be delivered to this address</p>
                </div>
              </div>

              <div className="payment-delivery-card">
                <div className="payment-delivery-type">
                  <i
                    className={
                      displayCustomer.addressType === "OFFICE"
                        ? "ti ti-building"
                        : "ti ti-home"
                    }
                  ></i>
                  {displayCustomer.addressType === "OFFICE" ? "Office" : "Home"}
                </div>

                <div className="payment-delivery-main">
                  <h3>
                    {displayCustomer.addressLine1 ||
                      displayCustomer.address ||
                      "-"}
                  </h3>

                  {displayCustomer.addressLine2 && (
                    <p>{displayCustomer.addressLine2}</p>
                  )}
                </div>

                <div className="payment-delivery-grid">
                  <div>
                    <span>City</span>
                    <strong>{displayCustomer.city || "-"}</strong>
                  </div>

                  <div>
                    <span>District</span>
                    <strong>{displayCustomer.district || "-"}</strong>
                  </div>

                  <div>
                    <span>Province</span>
                    <strong>{displayCustomer.province || "-"}</strong>
                  </div>

                  <div>
                    <span>Postal Code</span>
                    <strong>{displayCustomer.postalCode || "-"}</strong>
                  </div>
                </div>
              </div>

              {billingAddress && (
                <div className="billing-address-note">
                  <i className="ti ti-receipt"></i>
                  <span>
                    Billing address is saved as{" "}
                    <b>
                      {normalizeAddressType(billingAddress.addressType) ===
                      "OFFICE"
                        ? "Office"
                        : "Home"}
                    </b>
                    .
                  </span>
                </div>
              )}
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
                    selectedPaymentMethod === "PayHere"
                      ? "payment-view-card active online"
                      : "payment-view-card online"
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayHere"
                    checked={selectedPaymentMethod === "PayHere"}
                    onChange={(event) =>
                      setSelectedPaymentMethod(event.target.value)
                    }
                  />

                  <i className="ti ti-credit-card"></i>

                  <div>
                    <h3>PayHere Online Payment</h3>
                    <p>Pay securely using PayHere sandbox payment gateway.</p>
                  </div>
                </label>
              </div>

        
            </section>
          </main>

          <aside className="payment-summary">
            <h2>Order Summary</h2>

            <div className="payment-items">
              {items.map((item) => (
                <div
                  className="payment-item"
                  key={item.productId || item.product || item._id}
                >
                  <div className="payment-product">
                    <div className="payment-product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
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
                    Rs.{" "}
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            <div className="payment-line"></div>

            <div className="payment-price-row">
              <span>Items Total</span>
              <strong>Rs. {Number(cartItemsTotal).toLocaleString()}</strong>
            </div>

            <div className="payment-price-row">
              <span>Delivery Fee</span>
              <strong>
                {Number(deliveryFee) === 0
                  ? "Free"
                  : `Rs. ${Number(deliveryFee).toLocaleString()}`}
              </strong>
            </div>

            <div className="payment-price-row">
              <span>Payment</span>
              <strong>{selectedPaymentMethod}</strong>
            </div>

            <div className="payment-line"></div>

            <div className="payment-total-row">
              <span>Total</span>
              <strong>Rs. {Number(total).toLocaleString()}</strong>
            </div>

            <button
              type="button"
              className="confirm-order-btn"
              onClick={confirmOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Processing..."
                : selectedPaymentMethod === "PayHere"
                ? "Pay with PayHere"
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