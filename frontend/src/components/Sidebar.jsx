import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const getStoredUser = () => {
    try {
      const localUser = localStorage.getItem("user");
      const localUserInfo = localStorage.getItem("userInfo");

      if (localUser) return JSON.parse(localUser);
      if (localUserInfo) return JSON.parse(localUserInfo);

      return null;
    } catch {
      return null;
    }
  };

  const loadUserDetails = useCallback(async () => {
    const savedUser = getStoredUser();

    if (savedUser) {
      setUser(savedUser);
    }

    try {
      const { data } = await API.get("/users/profile");

      if (data.user) {
        const updatedUser = {
          ...savedUser,
          ...data.user,
          token: savedUser?.token,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }
    } catch {
      console.log("Using saved user details.");
    }
  }, []);

  useEffect(() => {
    loadUserDetails();
  }, [loadUserDetails]);

  const isActive = (path) => location.pathname === path;

  const userName = user?.name || user?.fullName || user?.username || "Customer";
  const userEmail = user?.email || "customer@email.com";
  const avatarLetter = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside className="orders-sidebar-pro">
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar">{avatarLetter}</div>

        <h3>{userName}</h3>
        <p>{userEmail}</p>
      </div>

      <div className="sidebar-menu-group">
        <span>Manage Account</span>

        <button
          type="button"
          className={isActive("/profile") ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          <i className="ti ti-user"></i>
          My Profile
        </button>

        <button type="button">
          <i className="ti ti-credit-card"></i>
          Payment Options
        </button>
      </div>

      <div className="sidebar-menu-group">
        <span>Orders</span>

        <button
          type="button"
          className={isActive("/my-orders") ? "active" : ""}
          onClick={() => navigate("/my-orders")}
        >
          <i className="ti ti-package"></i>
          My Orders
        </button>

        <button
          type="button"
          className={isActive("/my-returns") ? "active" : ""}
          onClick={() => navigate("/my-returns")}
        >
          <i className="ti ti-arrow-back-up"></i>
          My Returns
        </button>

        <button
          type="button"
          className={isActive("/my-cancellations") ? "active" : ""}
          onClick={() => navigate("/my-cancellations")}
        >
          <i className="ti ti-circle-x"></i>
          My Cancellations
        </button>
      </div>

      <button
        type="button"
        className="sidebar-shop-btn"
        onClick={() => navigate("/")}
      >
        <i className="ti ti-shopping-bag"></i>
        Continue Shopping
      </button>
    </aside>
  );
};

export default Sidebar;