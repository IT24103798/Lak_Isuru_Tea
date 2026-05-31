import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Auth.css";

const validateChangePassword = ({ currentPassword, newPassword, confirmNewPassword }) => {
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return "Please fill in all password fields.";
  }

  if (newPassword.length < 8) {
    return "New password must be at least 8 characters long.";
  }

  if (newPassword !== confirmNewPassword) {
    return "New passwords do not match.";
  }

  return "";
};

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const validationError = validateChangePassword(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.put("/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      setMessage(data.message || "Password changed successfully.");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-center">
      <div className="auth-card">
        <h2>Change Password</h2>
        <p className="auth-subtitle">
          Update your account password securely.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleChangePassword}>
          <label>Current Password</label>
          <div className="password-box">
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label>New Password</label>
          <div className="password-box">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>

          <small className="password-hint">
            Password must be at least 8 characters and include letters and numbers.
          </small>

          <label>Confirm New Password</label>
          <div className="password-box">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              name="confirmNewPassword"
              placeholder="Confirm new password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmNewPassword(!showConfirmNewPassword)
              }
            >
              {showConfirmNewPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="auth-main-btn" type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        <p className="auth-link">
          Back to <Link to="/profile">Profile</Link>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;