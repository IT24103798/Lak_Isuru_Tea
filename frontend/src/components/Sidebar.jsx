import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const languages = [
  { code: "en", label: "English" },
  { code: "si", label: "සිංහල" },
  { code: "ta", label: "தமிழ்" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
];

export default function Sidebar() {
  const { userInfo, logout } = useAuth();
  const [selectedLang, setSelectedLang] = useState("en");

  // Get initials from name (e.g. "Praween Sanjula" → "PS")
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="sidebar">

      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar">{getInitials(userInfo?.name)}</div>
        <div className="user-name">{userInfo?.name || "User"}</div>
        <div className="member-tag">{userInfo?.email || ""}</div>
      </div>

      {/* Manage My Account */}
      <div className="section-label">Manage My Account</div>
      <NavLink
        to="/profile"
        className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
      >
        <i className="ti ti-user"></i> My Profile
      </NavLink>
      
      <NavLink
        to="/payment-options"
        className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
      >
        <i className="ti ti-credit-card"></i> My Payment Options
      </NavLink>
      

      {/* My Orders */}
      <div className="section-label">My Orders</div>
      <NavLink
        to="/my-orders"
        className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
      >
        <i className="ti ti-package"></i> My Orders
      </NavLink>
      <NavLink
        to="/my-returns"
        className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
      >
        <i className="ti ti-arrow-back-up"></i> My Returns
      </NavLink>
      <NavLink
        to="/my-cancellations"
        className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
      >
        <i className="ti ti-circle-x"></i> My Cancellations
      </NavLink>

      

      {/* Language Switcher */}
      <div className="section-label">Language</div>
      <div className="language-switcher">
        <i className="ti ti-world"></i>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="lang-select"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      

    </div>
  );
}