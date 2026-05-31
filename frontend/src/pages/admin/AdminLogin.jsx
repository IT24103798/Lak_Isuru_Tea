import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Auth.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      if (data.user.role !== "admin") {
        setError("Access denied. This account is not an admin account.");
        return;
      }

      login({
        ...data.user,
        token: data.token,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout admin-auth-layout">
      <div className="auth-brand admin-brand">
        <h1>Admin Panel</h1>
        <p>Manage products, orders, messages, and tea business operations.</p>
        <span>Authorized access only</span>
      </div>

      <div className="auth-form-section">
        <div className="auth-card">
          <h2>Admin Login</h2>
          <p className="auth-subtitle">Login with your admin credentials.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleAdminLogin}>
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@email.com"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter admin password"
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

            <button className="auth-main-btn" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Login as Admin"}
            </button>
          </form>

          <p className="auth-link">
            Customer login? <Link to="/login">Go to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;