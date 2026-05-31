import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Auth.css";
import { validateResetPasswordOtp } from "../utils/validation";

const ResetPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromForgotPage = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: emailFromForgotPage,
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateOtp = (otp) => {
    return /^[0-9]{6}$/.test(otp);
  };

  const validatePassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  };

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!validateOtp(formData.otp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    if (!formData.password) {
      setError("Please enter a new password.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters and include letters and numbers.");
      return;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.put("/users/reset-password-otp", {
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setMessage(data.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-center">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Enter the OTP sent to your email and create a new password.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleResetPassword}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label>OTP Code</label>
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            value={formData.otp}
            onChange={handleChange}
          />

          <label>New Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
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

          <label>Confirm New Password</label>
          <div className="password-box">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
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

          <button className="auth-main-btn" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-link">
          Did not receive OTP? <Link to="/forgot-password">Send again</Link>
        </p>

        <p className="auth-link">
          Go back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordOtp;