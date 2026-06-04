import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { validateRegister } from "../utils/validation";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+94",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData((previousData) => ({
      ...previousData,
      countryCode: `+${country.dialCode}`,
      phone: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateRegister(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const fullPhoneNumber = `+${formData.phone}`;

      const { data } = await API.post("/users/register", {
        name: formData.name,
        email: formData.email,
        phone: fullPhoneNumber,
        password: formData.password,
      });

      login({
        ...data.user,
        token: data.token,
      });

      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-center">
      <div className="auth-brand"></div>

      <div className="auth-form-section">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">
            Join us and start ordering premium tea.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleRegister}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Phone Number</label>

            <PhoneInput
              country="lk"
              value={formData.phone}
              onChange={handlePhoneChange}
              enableSearch={true}
              disableSearchIcon={true}
              countryCodeEditable={false}
              inputClass="custom-phone-input"
              buttonClass="custom-phone-button"
              dropdownClass="custom-phone-dropdown"
              placeholder="Enter phone number"
            />

            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small className="password-hint">
              Use at least 8 characters with letters and numbers.
            </small>

            <label>Confirm Password</label>
            <div className="password-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>

            <button className="auth-main-btn" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <SocialLoginButtons />
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;