import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";
import locationData from "../data/locationData.js";

const cleanAddressText = (line1 = "", line2 = "") => {
  const first = line1.trim();
  const second = line2.trim();

  let combined = "";

  if (first && second) {
    const firstLower = first.toLowerCase();
    const secondLower = second.toLowerCase();

    if (firstLower === secondLower) {
      combined = first;
    } else if (firstLower.includes(secondLower)) {
      combined = first;
    } else if (secondLower.includes(firstLower)) {
      combined = second;
    } else {
      combined = `${first}, ${second}`;
    }
  } else {
    combined = first || second || "";
  }

  const parts = combined
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const uniqueParts = [];
  const seenParts = new Set();

  parts.forEach((part) => {
    const key = part.toLowerCase();

    if (!seenParts.has(key)) {
      seenParts.add(key);
      uniqueParts.push(part);
    }
  });

  return uniqueParts.join(", ");
};

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);

  const [checkoutData, setCheckoutData] = useState({
    fullName: "",
    email: "",
    phoneNumber1: "",
    phoneNumber2: "",

    addressType: "Home",
    addressLine1: "",
    landmark: "",
    province: "",
    district: "",
    city: "",
    postalCode: "",

    paymentMethod: "Cash on Delivery",
    notes: "",
  });

  const navigate = useNavigate();

  const loadUserDetails = useCallback(() => {
    try {
      const savedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("userInfo"));

      if (savedUser) {
        setCheckoutData((prev) => ({
          ...prev,
          fullName:
            savedUser.name ||
            savedUser.fullName ||
            savedUser.username ||
            "",
          email: savedUser.email || "",
          phoneNumber1:
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

  const loadDefaultAddress = useCallback(async () => {
    try {
      const { data } = await API.get("/addresses/default");

      if (data.address) {
        const cleanSavedAddress = cleanAddressText(
          data.address.addressLine1 || data.address.addressLine || "",
          data.address.addressLine2 || ""
        );

        setCheckoutData((prev) => ({
          ...prev,

          fullName: data.address.fullName || prev.fullName,
          phoneNumber1:
            data.address.phone ||
            data.address.phoneNumber1 ||
            prev.phoneNumber1,

          addressType: data.address.addressType || "Home",
          addressLine1: cleanSavedAddress || prev.addressLine1,

          landmark: data.address.landmark || prev.landmark,
          province: data.address.province || prev.province,
          district: data.address.district || prev.district,
          city: data.address.city || prev.city,
          postalCode: data.address.postalCode || prev.postalCode,
        }));
      }
    } catch (error) {
      console.log("No saved default address found.");
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const selectedCheckoutItems = JSON.parse(
        localStorage.getItem("checkoutItems")
      );

      if (selectedCheckoutItems && selectedCheckoutItems.length > 0) {
        setCart(selectedCheckoutItems);
        setError("");
        return;
      }

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
    loadDefaultAddress();
    loadCart();
  }, [loadUserDetails, loadDefaultAddress, loadCart]);

  const cartItemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = cart.length === 0 ? 0 : cartItemsTotal >= 5000 ? 0 : 300;
  const total = cartItemsTotal + deliveryFee;

  const provinces = Object.keys(locationData);

  const districts = checkoutData.province
    ? Object.keys(locationData[checkoutData.province])
    : [];

  const cities =
    checkoutData.province && checkoutData.district
      ? locationData[checkoutData.province][checkoutData.district]
      : [];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCheckoutData((prev) => {
      if (name === "addressLine1") {
        return {
          ...prev,
          addressLine1: cleanAddressText(value),
        };
      }

      if (name === "province") {
        return {
          ...prev,
          province: value,
          district: "",
          city: "",
        };
      }

      if (name === "district") {
        return {
          ...prev,
          district: value,
          city: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const validateForm = () => {
    if (!checkoutData.fullName.trim()) return "Full name is required.";
    if (!checkoutData.email.trim()) return "Email is required.";
    if (!checkoutData.phoneNumber1.trim()) return "Phone number 1 is required.";
    if (!checkoutData.addressLine1.trim()) return "Address is required.";
    if (!checkoutData.province) return "Province is required.";
    if (!checkoutData.district) return "District is required.";
    if (!checkoutData.city) return "City is required.";
    if (!checkoutData.postalCode.trim()) return "Postal code is required.";
    if (cart.length === 0) return "Your cart is empty.";

    return "";
  };

  const getGeneratedAddressLine2 = () => {
    return `${checkoutData.city}, ${checkoutData.district}, ${checkoutData.province}`;
  };

  const getCleanMainAddress = () => {
    return cleanAddressText(checkoutData.addressLine1);
  };

  const getFullDeliveryAddress = () => {
    return cleanAddressText(
      getCleanMainAddress(),
      `${checkoutData.city}, ${checkoutData.district}, ${checkoutData.province}, ${checkoutData.postalCode.trim()}`
    );
  };

  const saveDeliveryDetails = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanMainAddress = getCleanMainAddress();
    const generatedAddressLine2 = getGeneratedAddressLine2();

    const checkoutDraft = {
      customer: {
        fullName: checkoutData.fullName.trim(),
        email: checkoutData.email.trim(),

        phone: checkoutData.phoneNumber1.trim(),
        phoneNumber1: checkoutData.phoneNumber1.trim(),
        phoneNumber2: checkoutData.phoneNumber2.trim(),

        addressType: checkoutData.addressType,
        addressLine1: cleanMainAddress,
        addressLine2: generatedAddressLine2,
        landmark: checkoutData.landmark || "",
        province: checkoutData.province,
        district: checkoutData.district,
        city: checkoutData.city,
        postalCode: checkoutData.postalCode.trim(),

        address: getFullDeliveryAddress(),
        notes: checkoutData.notes.trim(),
      },

      items: cart.map((item) => ({
        productId: item.productId || item.product || item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
      })),

      cartItemsTotal,
      deliveryFee,
      total,

      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "To Ship",
    };

    if (saveAddress) {
      try {
        await API.post("/addresses", {
          fullName: checkoutData.fullName.trim(),
          phone: checkoutData.phoneNumber1.trim(),
          phoneNumber1: checkoutData.phoneNumber1.trim(),
          phoneNumber2: checkoutData.phoneNumber2.trim(),

          addressType: checkoutData.addressType,
          addressLine: cleanMainAddress,
          addressLine1: cleanMainAddress,
          addressLine2: generatedAddressLine2,
          landmark: checkoutData.landmark || "",

          province: checkoutData.province,
          district: checkoutData.district,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode.trim(),

          isDefault: true,
          isDefaultShipping: true,
          isDefaultBilling: true,
        });
      } catch (error) {
        console.log(
          "Address save skipped:",
          error.response?.data || error.message
        );
      }
    }

    localStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));
    navigate("/payment");
  };

  const getDeliveryPreviewAvailable = () => {
    return (
      checkoutData.addressLine1 ||
      checkoutData.city ||
      checkoutData.district ||
      checkoutData.province ||
      checkoutData.postalCode
    );
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

        <form
          className="checkout-layout"
          onSubmit={(event) => {
            event.preventDefault();
            saveDeliveryDetails();
          }}
        >
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

                <div className="form-group">
                  <label>Phone Number 1</label>
                  <input
                    type="tel"
                    name="phoneNumber1"
                    placeholder="07XXXXXXXX"
                    value={checkoutData.phoneNumber1}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number 2</label>
                  <input
                    type="tel"
                    name="phoneNumber2"
                    placeholder="Optional"
                    value={checkoutData.phoneNumber2}
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
                  <p>Choose your address type and delivery location.</p>
                </div>
              </div>

              <div className="address-type-row">
                {[
                  { value: "Home", icon: "ti ti-home", label: "Home" },
                  { value: "Office", icon: "ti ti-building", label: "Office" },
                  { value: "Other", icon: "ti ti-map-pin", label: "Other" },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={
                      checkoutData.addressType === type.value
                        ? "address-type-card active"
                        : "address-type-card"
                    }
                  >
                    <input
                      type="radio"
                      name="addressType"
                      value={type.value}
                      checked={checkoutData.addressType === type.value}
                      onChange={handleChange}
                    />
                    <i className={type.icon}></i>
                    {type.label}
                  </label>
                ))}
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Example: 552/5/L, Thaldiyawala road, Athurugiriya"
                    value={checkoutData.addressLine1}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Province *</label>
                  <select
                    name="province"
                    value={checkoutData.province}
                    onChange={handleChange}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>District *</label>
                  <select
                    name="district"
                    value={checkoutData.district}
                    onChange={handleChange}
                    disabled={!checkoutData.province}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <select
                    name="city"
                    value={checkoutData.city}
                    onChange={handleChange}
                    disabled={!checkoutData.district}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal code"
                    value={checkoutData.postalCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="save-address-check">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(event) => setSaveAddress(event.target.checked)}
                    />

                    <span className="custom-check-box">
                      <i className="ti ti-check"></i>
                    </span>

                    <span className="save-address-text">
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <aside className="checkout-summary-box">
            <h2>My Order Details</h2>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item.productId || item.product || item._id}
                >
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
                    Rs.{" "}
                    {(
                      Number(item.price) * Number(item.quantity)
                    ).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-line"></div>

            <div className="checkout-price-row">
              <span>Items Total</span>
              <strong>Rs. {cartItemsTotal.toLocaleString()}</strong>
            </div>

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
                Continue to Payment
              <i className="ti ti-arrow-right"></i>
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;