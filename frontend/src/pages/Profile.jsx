import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";
import { Link } from "react-router-dom";
import { validateProfile } from "../utils/validation"; 

const Profile = () => {
  const { userInfo, login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name || !formData.phone) {
      setError("Name and phone are required.");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await API.put("/users/profile", updateData);

      login({
        ...data.user,
        token: data.token,
      });

      setMessage("Profile updated successfully.");
      setFormData({
        ...formData,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>
        <p>Manage your Luck Isru Tea account details.</p>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleUpdateProfile}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <label>New Password</label>
          <input
            type="password"
            name="password"
            placeholder="Leave empty if you do not want to change"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        <div className="profile-actions">
  <Link to="/change-password" className="profile-link-btn">
    Change Password
  </Link>
</div>

        <div className="role-box">
          Account type: <strong>{userInfo?.role}</strong>
        </div>
      </div>
    </div>
  );
};

export default Profile;