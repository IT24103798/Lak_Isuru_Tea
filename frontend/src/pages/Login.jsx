import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { validateLogin } from "../utils/validation";
import "../styles/Auth.css";
import SocialLoginButtons from "../components/SocialLoginButtons";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    const validationError = validateLogin(formData);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const loggedUser = {
        ...data.user,
        token: data.token,
      };

      if (formData.rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        localStorage.setItem("userInfo", JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(loggedUser));
        sessionStorage.setItem("userInfo", JSON.stringify(loggedUser));
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      login(loggedUser);

      if (loggedUser.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        sessionStorage.setItem("showWelcomeBack", "true");
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-center">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your tea order.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="auth-options">
            <label className="checkbox-row small">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="auth-main-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <SocialLoginButtons />
        </form>

        <p className="auth-link">
          New customer? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
