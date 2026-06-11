import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";
import locationData from "../data/locationData.js";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const emptyAddress = {
  fullName: "",
  email: "",
  phoneNumber1: "",
  phoneNumber2: "",
  addressType: "HOME",
  addressLine1: "",
  addressLine2: "",
  province: "",
  district: "",
  city: "",
};

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [shippingData, setShippingData] = useState(emptyAddress);
  const [billingData, setBillingData] = useState(emptyAddress);

  const [saveShippingAddress, setSaveShippingAddress] = useState(true);
  const [saveBillingAddress, setSaveBillingAddress] = useState(true);

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const [hasSavedShipping, setHasSavedShipping] = useState(false);
  const [hasSavedBilling, setHasSavedBilling] = useState(false);

  const [showShippingForm, setShowShippingForm] = useState(true);
  const [showBillingForm, setShowBillingForm] = useState(true);

  const navigate = useNavigate();

  const cleanPhone = (value) => {
    return String(value || "").replace(/[^\d]/g, "");
  };

  const formatPhoneForApi = (value) => {
    const cleaned = cleanPhone(value);
    return cleaned ? `+${cleaned}` : "";
  };

  const handlePhoneChange = (section, fieldName, value) => {
    const setter = section === "shipping" ? setShippingData : setBillingData;

    setter((prev) => ({
      ...prev,
      [fieldName]: cleanPhone(value),
    }));
  };

  const loadUserDetails = useCallback(() => {
    try {
      const savedUser =
        JSON.parse(localStorage.getItem("userInfo")) ||
        JSON.parse(localStorage.getItem("user"));

      if (savedUser) {
        const userDetails = {
          fullName:
            savedUser.name ||
            savedUser.fullName ||
            savedUser.username ||
            "",
          email: savedUser.email || "",
          phoneNumber1: cleanPhone(
            savedUser.phone ||
              savedUser.phoneNumber ||
              savedUser.mobile ||
              ""
          ),
        };

        setShippingData((prev) => ({ ...prev, ...userDetails }));
        setBillingData((prev) => ({ ...prev, ...userDetails }));
      }
    } catch {
      console.log("No saved user details found.");
    }
  }, []);

  const mapAddressToForm = (address, previousData = emptyAddress) => {
    return {
      ...previousData,
      fullName: address.fullName || previousData.fullName,
      email: address.email || previousData.email,

      phoneNumber1: cleanPhone(
        address.phone || address.phoneNumber1 || previousData.phoneNumber1
      ),

      phoneNumber2: cleanPhone(
        address.phoneNumber2 || previousData.phoneNumber2
      ),

      addressType:
        address.addressType === "Office" || address.addressType === "OFFICE"
          ? "OFFICE"
          : "HOME",

      addressLine1:
        address.addressLine1 ||
        address.addressLine ||
        previousData.addressLine1,

      addressLine2: address.addressLine2 || previousData.addressLine2,

      province: address.province || previousData.province,
      district: address.district || previousData.district,
      city: address.city || previousData.city,
    };
  };

  const loadDefaultShippingAddress = useCallback(async () => {
    try {
      const { data } = await API.get("/addresses/default");

      if (data.address) {
        setShippingData((prev) => mapAddressToForm(data.address, prev));
        setHasSavedShipping(true);
        setShowShippingForm(false);
      } else {
        setHasSavedShipping(false);
        setShowShippingForm(true);
      }
    } catch {
      setHasSavedShipping(false);
      setShowShippingForm(true);
    }
  }, []);

  const loadDefaultBillingAddress = useCallback(async () => {
    try {
      const { data } = await API.get("/addresses/default-billing");

      if (data.address) {
        setBillingData((prev) => mapAddressToForm(data.address, prev));
        setHasSavedBilling(true);
        setShowBillingForm(false);
      } else {
        setHasSavedBilling(false);
        setShowBillingForm(true);
      }
    } catch {
      setHasSavedBilling(false);
      setShowBillingForm(true);
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
    } catch {
      setError("Failed to load checkout details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserDetails();
    loadDefaultShippingAddress();
    loadDefaultBillingAddress();
    loadCart();
  }, [
    loadUserDetails,
    loadDefaultShippingAddress,
    loadDefaultBillingAddress,
    loadCart,
  ]);

  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingData(shippingData);
    }
  }, [billingSameAsShipping, shippingData]);

  const cartItemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = cart.length === 0 ? 0 : cartItemsTotal >= 5000 ? 0 : 300;
  const total = cartItemsTotal + deliveryFee;

  const getDistricts = (province) =>
    province ? Object.keys(locationData[province] || {}) : [];

  const getCities = (province, district) =>
    province && district ? locationData[province]?.[district] || [] : [];

 const handleAddressChange = (section, event) => {
  const { name, value } = event.target;
  const setter = section === "shipping" ? setShippingData : setBillingData;

  setter((prev) => {
    if (name === "province") {
      return { ...prev, province: value, district: "", city: "" };
    }

    if (name === "district") {
      return { ...prev, district: value, city: "" };
    }
    return { ...prev, [name]: value };
  });
};

  const validateAddress = (data, type) => {
    if (!data.fullName.trim()) return `${type} full name is required.`;
    if (!data.email.trim()) return `${type} email is required.`;
    if (!data.phoneNumber1.trim()) return `${type} phone number is required.`;
    if (!data.addressLine1.trim()) return `${type} address line 1 is required.`;
    if (!data.addressLine2.trim()) return `${type} address line 2 is required.`;
    if (!data.province) return `${type} province is required.`;
    if (!data.district) return `${type} district is required.`;
    if (!data.city) return `${type} city is required.`;
    return "";
  };

  const validateForm = () => {
    const shippingError = validateAddress(shippingData, "Shipping");
    if (shippingError) return shippingError;

    if (!billingSameAsShipping) {
      const billingError = validateAddress(billingData, "Billing");
      if (billingError) return billingError;
    }

    if (cart.length === 0) return "Your cart is empty.";

    return "";
  };

  const buildAddressPayload = (data) => {
    const line1 = data.addressLine1.trim();
    const line2 = data.addressLine2.trim();
    const city = data.city.trim();
    const district = data.district.trim();
    const province = data.province.trim();

    const addressParts = [
      line1,
      line2,
      city,
      district,
      province,
    ].filter(Boolean);

    const fullAddress = addressParts.join(", ");

    return {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: formatPhoneForApi(data.phoneNumber1),
      phoneNumber1: formatPhoneForApi(data.phoneNumber1),
      phoneNumber2: formatPhoneForApi(data.phoneNumber2),
      addressType: data.addressType === "OFFICE" ? "OFFICE" : "HOME",
      addressLine: line1,
      addressLine1: line1,
      addressLine2: line2,
      province,
      district,
      city,
      address: fullAddress,
    };
  };

  const handleSaveAddressView = (type, data) => {
    const validationError = validateAddress(
      data,
      type === "shipping" ? "Shipping" : "Billing"
    );

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError("");

    if (type === "shipping") {
      setHasSavedShipping(true);
      setShowShippingForm(false);
    } else {
      setHasSavedBilling(true);
      setShowBillingForm(false);
    }
  };

  const saveDeliveryDetails = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPlacingOrder(true);

    try {
      const shippingPayload = buildAddressPayload(shippingData);

      const billingPayload = billingSameAsShipping
        ? buildAddressPayload(shippingData)
        : buildAddressPayload(billingData);

      const checkoutDraft = {
        customer: {
          ...shippingPayload,
          billingAddress: billingPayload,
          notes: "",
        },
        shippingAddress: shippingPayload,
        billingAddress: billingPayload,
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

      if (saveShippingAddress) {
        await API.post("/addresses", {
          ...shippingPayload,
          isDefault: true,
          isDefaultShipping: true,
          isDefaultBilling: billingSameAsShipping,
        });

        setHasSavedShipping(true);
      }

      if (!billingSameAsShipping && saveBillingAddress) {
        await API.post("/addresses", {
          ...billingPayload,
          isDefault: false,
          isDefaultShipping: false,
          isDefaultBilling: true,
        });

        setHasSavedBilling(true);
      }

      localStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));
      navigate("/payment");
    } catch (error) {
      console.error("Checkout error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to continue to payment. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderSavedAddress = (data, title = "Saved Address") => {
    const streetParts = [data.addressLine1, data.addressLine2].filter(Boolean);

    const cleanStreetParts = streetParts
      .map((part) =>
        [data.city, data.district, data.province].reduce((str, loc) => {
          if (!loc) return str;

          return str
            .replace(new RegExp(`,?\\s*${loc}`, "gi"), "")
            .trim()
            .replace(/,\s*$/, "");
        }, part)
      )
      .filter(Boolean);

    const finalAddress = [
      ...cleanStreetParts,
      data.city,
      data.district,
      data.province,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="saved-shipping-row">
        <div className="saved-address-title">
          <span>{title}</span>
        </div>

        <div className="saved-address-grid">
          <div className="saved-address-field">
            <span className="saved-field-label">Name</span>
            <strong className="saved-field-value">{data.fullName}</strong>
          </div>

          <div className="saved-address-field">
            <span className="saved-field-label">Phone Number 1</span>
            <strong className="saved-field-value">
              {formatPhoneForApi(data.phoneNumber1)}
            </strong>
          </div>

          {data.phoneNumber2 && (
            <div className="saved-address-field">
              <span className="saved-field-label">Phone Number 2</span>
              <strong className="saved-field-value">
                {formatPhoneForApi(data.phoneNumber2)}
              </strong>
            </div>
          )}

          <div className="saved-address-field full-width">
            <span className="saved-field-label">Address</span>
            <div className="saved-address-detail">
              <span className="orange-address-badge">{data.addressType}</span>
              <span className="saved-field-value">{finalAddress}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddressForm = (type, data) => {
    const provinces = Object.keys(locationData);
    const districts = getDistricts(data.province);
    const cities = getCities(data.province, data.district);
    const isShipping = type === "shipping";

    return (
      <div className="checkout-form-area">
        <div className="form-section-title address-section-title full-width">
          <h3>{isShipping ? "Customer Details" : "Customer Billing Details"}</h3>
          <p>
            <i>
              {isShipping
                ? "Enter the customer contact information."
                : "Enter the billing contact information."}
            </i>
          </p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Please enter your full name"
              value={data.fullName}
              onChange={(e) => handleAddressChange(type, e)}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Please enter your email address"
              value={data.email}
              onChange={(e) => handleAddressChange(type, e)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number 1</label>
            <PhoneInput
              country="lk"
              enableSearch={true}
              value={data.phoneNumber1}
              onChange={(value) =>
                handlePhoneChange(type, "phoneNumber1", value)
              }
              inputProps={{
                name: "phoneNumber1",
                required: true,
              }}
            />
          </div>

          <div className="form-group">
            <label>
              Phone Number 2 <span className="optional-tag">Optional</span>
            </label>
            <PhoneInput
              country="lk"
              enableSearch={true}
              value={data.phoneNumber2}
              onChange={(value) =>
                handlePhoneChange(type, "phoneNumber2", value)
              }
              inputProps={{
                name: "phoneNumber2",
                required: false,
              }}
            />
          </div>

          <div className="form-group full-width">
            <div className="form-section-title address-section-title">
              <h3>{isShipping ? "Shipping Address" : "Billing Address"}</h3>
              <p>
                <i>
                  {isShipping
                    ? "Enter the delivery address for this order."
                    : "Enter the billing address for this order."}
                </i>
              </p>
            </div>

            <label>Address Type</label>

            <div className="address-type-row">
              {[
                { value: "HOME", label: "🏠 Home" },
                { value: "OFFICE", label: "🏢 Office" },
              ].map((at) => (
                <label
                  key={at.value}
                  className={
                    data.addressType === at.value
                      ? "address-type-card active"
                      : "address-type-card"
                  }
                >
                  <input
                    type="radio"
                    name="addressType"
                    value={at.value}
                    checked={data.addressType === at.value}
                    onChange={(e) => handleAddressChange(type, e)}
                  />
                  {at.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              placeholder="House / Building no. / Street / Road name"
              value={data.addressLine1}
              onChange={(e) => handleAddressChange(type, e)}
            />
          </div>

          <div className="form-group full-width">
            <label>Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              placeholder="Area / Locality / Landmark"
              value={data.addressLine2}
              onChange={(e) => handleAddressChange(type, e)}
            />
          </div>

          <div className="form-group">
            <label>Province</label>
            <select
              name="province"
              value={data.province}
              onChange={(e) => handleAddressChange(type, e)}
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>District</label>
            <select
              name="district"
              value={data.district}
              onChange={(e) => handleAddressChange(type, e)}
              disabled={!data.province}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City</label>
            <select
              name="city"
              value={data.city}
              onChange={(e) => handleAddressChange(type, e)}
              disabled={!data.district}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>


          <div className="form-group full-width">
            <div className="address-save-action">
              <button
                type="button"
                className="save-address-btn"
                onClick={() => handleSaveAddressView(type, data)}
              >
                {isShipping ? "Save Shipping Details" : "Save Billing Details"}
              </button>
            </div>
          </div>
        </div>
      </div>
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
            <i className="ti ti-arrow-left"></i> Back to Cart
          </button>

          <div>
            <h1>Checkout</h1>
            <p>Complete your delivery details and continue to payment.</p>
          </div>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <form
          className="checkout-layout"
          onSubmit={(e) => {
            e.preventDefault();
            saveDeliveryDetails();
          }}
        >
          <main className="checkout-left">
            <section className="checkout-card shipping-card">
              <div className="checkout-card-header">
                <div>
                  <h2>Shipping Address</h2>
                  <p className="section-subtitle">
                    Delivery contact and location details
                  </p>
                </div>

                {hasSavedShipping && (
                  <button
                    type="button"
                    className="checkout-edit-btn"
                    onClick={() => setShowShippingForm((prev) => !prev)}
                  >
                    {showShippingForm ? "Cancel Edit" : "Edit Details"}
                  </button>
                )}
              </div>

              {!showShippingForm && hasSavedShipping
                ? renderSavedAddress(shippingData, "Saved Shipping Details")
                : renderAddressForm("shipping", shippingData)}
            </section>

            <section className="checkout-card billing-card">
              <div className="checkout-card-header">
                <div>
                  <h2>Billing Address</h2>
                  <p className="section-subtitle">
                    Invoice and payment address details
                  </p>
                </div>

                {!billingSameAsShipping && hasSavedBilling && (
                  <button
                    type="button"
                    className="checkout-edit-btn"
                    onClick={() => setShowBillingForm((prev) => !prev)}
                  >
                    {showBillingForm ? "Cancel Edit" : "Edit Details"}
                  </button>
                )}
              </div>

              <label className="save-address-check billing-same-check">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBillingSameAsShipping(checked);

                    if (checked) {
                      setBillingData(shippingData);
                      setShowBillingForm(false);
                    } else {
                      setShowBillingForm(!hasSavedBilling);
                    }
                  }}
                />
                <span>Billing address is same as shipping address</span>
              </label>

              {!billingSameAsShipping && (
                <div className="billing-address-content">
                  {!showBillingForm && hasSavedBilling
                    ? renderSavedAddress(billingData, "Saved Billing Details")
                    : renderAddressForm("billing", billingData)}
                </div>
              )}
            </section>
          </main>

          <aside className="checkout-right">
            <section className="checkout-summary-box">
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
                        <span className="stock-text">In stock</span>
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

              <div className="delivery-summary-row">
                <div className="delivery-summary-icon">
                  <i className="ti ti-truck-delivery"></i>
                </div>

                <div className="delivery-summary-text">
                  <strong>Standard Delivery</strong>
                  <span>2 – 4 business days</span>
                </div>
              </div>

              <div className="checkout-line"></div>

              <div className="checkout-total-row">
                <span>Total</span>
                <strong>Rs. {total.toLocaleString()}</strong>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={placingOrder || cart.length === 0}
              >
                {placingOrder ? "Processing..." : "Continue to Payment"}
                <i className="ti ti-arrow-right"></i>
              </button>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;