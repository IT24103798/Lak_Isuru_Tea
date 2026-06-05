import { useEffect, useState } from "react";
import API from "../api/api";
import locationData from "../data/locationData";
import "../styles/AddressBook.css";

const emptyForm = {
  fullName: "",
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

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const provinces = Object.keys(locationData);

  const districts = form.province
    ? Object.keys(locationData[form.province])
    : [];

  const cities =
    form.province && form.district
      ? locationData[form.province][form.district]
      : [];

  const loadAddresses = async () => {
    try {
      const { data } = await API.get("/addresses");

      console.log("ADDRESS RESPONSE:", data);

      setAddresses(data.addresses || data || []);
    } catch (error) {
      console.log("ADDRESS LOAD ERROR:", error.response?.data || error.message);
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

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.addressLine1.trim()) return "Address line 1 is required.";
    if (!form.addressLine2.trim()) return "Address line 2 is required.";
    if (!form.province) return "Province is required.";
    if (!form.district) return "District is required.";
    if (!form.city) return "City is required.";
    if (!form.postalCode.trim()) return "Postcode is required.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const addressData = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      phoneNumber1: form.phone.trim(),
      phoneNumber2: form.phoneNumber2.trim(),

      addressType: form.addressType,
      addressLine: `${form.addressLine1.trim()}, ${form.addressLine2.trim()}`,
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      landmark: form.landmark.trim(),

      province: form.province,
      district: form.district,
      city: form.city,
      postalCode: form.postalCode.trim(),

      isDefault: form.isDefaultShipping,
      isDefaultShipping: form.isDefaultShipping,
      isDefaultBilling: form.isDefaultBilling,
    };

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
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setShowForm(true);

    setForm({
      fullName: address.fullName || "",
      phone: address.phone || address.phoneNumber1 || "",
      phoneNumber2: address.phoneNumber2 || "",

      addressType: address.addressType || "HOME",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",

      province: address.province || "",
      district: address.district || "",
      city: address.city || "",
      postalCode: address.postalCode || "",

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
    } catch (error) {
      setMessage("Failed to update default shipping address.");
    }
  };

  const handleSetDefaultBilling = async (id) => {
    try {
      await API.put(`/addresses/${id}/default-billing`);
      setMessage("Default billing address updated.");
      await loadAddresses();
    } catch (error) {
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
            + ADD NEW ADDRESS
          </button>
        </div>

        {message && <div className="address-message">{message}</div>}

        {!showForm && (
          <div className="address-table-box">
            <div className="address-table-header">
              <span>Full Name</span>
              <span>Address</span>
              <span>Postcode</span>
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
                          {address.addressType || "HOME"}
                        </span>
                        {address.addressLine1}
                        {address.addressLine2 &&
                          `, ${address.addressLine2}`}
                      </p>

                      {address.landmark && (
                        <p className="landmark-text">
                          Landmark: {address.landmark}
                        </p>
                      )}

                      <p className="location-text">
                        {address.province} - {address.district} -{" "}
                        {address.city}
                      </p>
                    </div>

                    <div className="address-postcode">
                      {address.postalCode}
                    </div>

                    <div className="address-phone">
                      {address.phone || address.phoneNumber1}
                    </div>

                    <div className="address-default-labels">
                      {(address.isDefaultShipping || address.isDefault) ? (
                        <p>Default Shipping Address</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDefaultShipping(address._id)
                          }
                        >
                          Make Shipping Default
                        </button>
                      )}

                      {address.isDefaultBilling ? (
                        <p>Default Billing Address</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDefaultBilling(address._id)
                          }
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
                        EDIT
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
                }}
              >
                Back to Address Book
              </button>
            </div>

            <div className="address-type-row">
              {["HOME", "OFFICE", "OTHER"].map((type) => (
                <label
                  key={type}
                  className={
                    form.addressType === type
                      ? "address-type-card active"
                      : "address-type-card"
                  }
                >
                  <input
                    type="radio"
                    name="addressType"
                    value={type}
                    checked={form.addressType === type}
                    onChange={handleChange}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="address-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="071XXXXXXX"
                />
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  placeholder="House no, building name"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Street name, area"
                />
              </div>

              <div className="form-group full-width">
                <label>Landmark</label>
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
                <label>Postcode</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Postcode"
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
              {editingId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressBook;