import { useEffect, useState } from "react";
import API from "../api/api";
import locationData from "../data/locationData";
import "../styles/AddressBook.css";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  phoneNumber2: "",
  addressType: "HOME",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  province: "",
  district: "",
  city: "",
  postalCode: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

const cleanPhone = (value) => {
  return String(value || "").replace(/[^\d]/g, "");
};

const formatPhoneForApi = (value) => {
  const cleaned = cleanPhone(value);
  return cleaned ? `+${cleaned}` : "";
};

const cleanAddressParts = (address) => {
  const locationTokens = [
    address.city,
    address.district,
    address.province,
  ].filter(Boolean);

  const streetParts = [address.addressLine1, address.addressLine2]
    .filter(Boolean)
    .map((part) =>
      locationTokens.reduce((str, loc) => {
        return str
          .replace(new RegExp(`,?\\s*${loc}`, "gi"), "")
          .trim()
          .replace(/,\s*$/, "");
      }, part)
    )
    .filter(Boolean);

  return [
    ...streetParts,
    address.city,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const provinces = Object.keys(locationData);

  const districts = form.province
    ? Object.keys(locationData[form.province] || {})
    : [];

  const cities =
    form.province && form.district
      ? locationData[form.province]?.[form.district] || []
      : [];

  const loadAddresses = async () => {
    try {
      const { data } = await API.get("/addresses");
      setAddresses(data.addresses || data || []);
    } catch {
      setMessage("Failed to load addresses.");
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
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

      if (name === "postalCode") {
        return {
          ...prev,
          postalCode: value.replace(/\D/g, ""),
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handlePhoneChange = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: cleanPhone(value),
    }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email address is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.addressLine1.trim()) return "Address line 1 is required.";
    if (!form.addressLine2.trim()) return "Address line 2 is required.";
    if (!form.province) return "Province is required.";
    if (!form.district) return "District is required.";
    if (!form.city) return "City is required.";

    return "";
  };

  const buildAddressPayload = () => {
    const addressLine1 = form.addressLine1.trim();
    const addressLine2 = form.addressLine2.trim();

    return {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: formatPhoneForApi(form.phone),
      phoneNumber1: formatPhoneForApi(form.phone),
      phoneNumber2: formatPhoneForApi(form.phoneNumber2),
      addressType: form.addressType === "OFFICE" ? "OFFICE" : "HOME",
      addressLine: `${addressLine1}, ${addressLine2}`,
      addressLine1,
      addressLine2,
      landmark: form.landmark.trim(),
      province: form.province,
      district: form.district,
      city: form.city,
      postalCode: form.postalCode.trim(),
      isDefault: form.isDefaultShipping,
      isDefaultShipping: form.isDefaultShipping,
      isDefaultBilling: form.isDefaultBilling,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const addressData = buildAddressPayload();

    try {
      if (editingId) {
        await API.put(`/addresses/${editingId}`, addressData);
        setMessage("Address updated successfully.");
      } else {
        await API.post("/addresses", addressData);
        setMessage("Address added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadAddresses();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setShowForm(true);
    setMessage("");

    setForm({
      fullName: address.fullName || "",
      email: address.email || "",
      phone: cleanPhone(address.phone || address.phoneNumber1 || ""),
      phoneNumber2: cleanPhone(address.phoneNumber2 || ""),
      addressType: address.addressType === "OFFICE" ? "OFFICE" : "HOME",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      province: address.province || "",
      district: address.district || "",
      city: address.city || "",
      postalCode: String(address.postalCode || "").replace(/\D/g, ""),
      isDefaultShipping:
        address.isDefaultShipping !== undefined
          ? address.isDefaultShipping
          : address.isDefault || false,
      isDefaultBilling: address.isDefaultBilling || false,
    });
  };

  const handleSetDefaultShipping = async (id) => {
    try {
      await API.put(`/addresses/${id}/default-shipping`);
      setMessage("Default shipping address updated.");
      await loadAddresses();
    } catch {
      setMessage("Failed to update default shipping address.");
    }
  };

  const handleSetDefaultBilling = async (id) => {
    try {
      await API.put(`/addresses/${id}/default-billing`);
      setMessage("Default billing address updated.");
      await loadAddresses();
    } catch {
      setMessage("Failed to update default billing address.");
    }
  };

  return (
    <div className="address-book-page">
      <div className="address-book-wrapper">
        <div className="address-book-top">
          <h1>Address Book</h1>

          <button
            type="button"
            className="add-address-btn"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(emptyForm);
              setMessage("");
            }}
          >
            + Add New Address
          </button>
        </div>

        {message && <div className="address-message">{message}</div>}

        {!showForm && (
          <div className="address-table-box">
            <div className="address-table-header">
              <span>Full Name</span>
              <span>Address</span>
              <span>Phone Number</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {addresses.length === 0 ? (
              <div className="no-address-box">
                <p>No saved address found.</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div className="address-row-card" key={address._id}>
                  <div className="address-row-main">
                    <div className="address-name">
                      <h3>{address.fullName}</h3>
                    </div>

                    <div className="address-detail">
                      <p>
                        <span className="address-type-pill">
                          {address.addressType === "OFFICE" ? "OFFICE" : "HOME"}
                        </span>
                        {cleanAddressParts(address)}
                      </p>

                      {address.landmark && (
                        <p className="landmark-text">
                          Landmark: {address.landmark}
                        </p>
                      )}
                    </div>

                    <div className="address-phone">
                      {address.phone || address.phoneNumber1 || "-"}
                    </div>

                    <div className="address-default-labels">
                      {address.isDefaultShipping || address.isDefault ? (
                        <p>Default Shipping Address</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultShipping(address._id)}
                        >
                          Make Shipping Default
                        </button>
                      )}

                      {address.isDefaultBilling ? (
                        <p>Default Billing Address</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultBilling(address._id)}
                        >
                          Make Billing Default
                        </button>
                      )}
                    </div>

                    <div className="address-actions">
                      <button
                        type="button"
                        className="edit-address-btn"
                        onClick={() => handleEdit(address)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showForm && (
          <form className="address-form-card" onSubmit={handleSubmit}>
            <div className="form-title-row">
              <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>

              <button
                type="button"
                className="close-form-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                  setMessage("");
                }}
              >
                Back to Address Book
              </button>
            </div>

            <div className="form-group full-width">
              <label>Address Type</label>

              <div className="address-type-row">
                {[
                  { value: "HOME", label: "🏠 Home" },
                  { value: "OFFICE", label: "🏢 Office" },
                ].map((at) => (
                  <label
                    key={at.value}
                    className={
                      form.addressType === at.value
                        ? "address-type-card active"
                        : "address-type-card"
                    }
                  >
                    <input
                      type="radio"
                      name="addressType"
                      value={at.value}
                      checked={form.addressType === at.value}
                      onChange={handleChange}
                    />
                    {at.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="address-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Please enter your email address"
                />
              </div>

              <div className="form-group">
                <label>Phone Number 1</label>

                <PhoneInput
                  country="lk"
                  enableSearch={true}
                  value={form.phone}
                  onChange={(value) => handlePhoneChange("phone", value)}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number 2{" "}
                  <span className="optional-tag">Optional</span>
                </label>

                <PhoneInput
                  country="lk"
                  enableSearch={true}
                  value={form.phoneNumber2}
                  onChange={(value) => handlePhoneChange("phoneNumber2", value)}
                  inputProps={{
                    name: "phoneNumber2",
                    required: false,
                  }}
                />
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="House / Building no., Street / Road name"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Area / Locality / Landmark"
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Landmark <span className="optional-tag">Optional</span>
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="Near school, temple, shop, junction etc."
                />
              </div>

              <div className="form-group">
                <label>Province</label>
                <select
                  name="province"
                  value={form.province}
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
                <label>District</label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  disabled={!form.province}
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
                <label>City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={!form.district}
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
                <label>
                  Postal Code <span className="optional-tag">Optional</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 10345"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="default-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="isDefaultShipping"
                  checked={form.isDefaultShipping}
                  onChange={handleChange}
                />
                Make default shipping address
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isDefaultBilling"
                  checked={form.isDefaultBilling}
                  onChange={handleChange}
                />
                Make default billing address
              </label>
            </div>

            <button type="submit" className="save-address-main-btn">
              {editingId ? "Update Address" : "Save Address"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressBook;