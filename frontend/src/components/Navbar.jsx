import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    const searchQuery = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";

    navigate(`/${searchQuery}#products`);
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (
        event.key === "Escape" ||
        (accountMenuRef.current &&
          !accountMenuRef.current.contains(event.target))
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAccountMenu);
    document.addEventListener("keydown", closeAccountMenu);

    return () => {
      document.removeEventListener("mousedown", closeAccountMenu);
      document.removeEventListener("keydown", closeAccountMenu);
    };
  }, []);

  const displayName = userInfo?.name || (userInfo?.role === "admin" ? "Admin" : "Customer");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img
            src="/images/lak-isuru-logo.png"
            alt="Lak Isuru Tea Logo"
            className="nav-logo"
          />
        </Link>

      </div>

      {userInfo?.role !== "admin" && (
        <input
          type="search"
          className="navbar-search"
          value={new URLSearchParams(location.search).get("search") || ""}
          onChange={handleSearchChange}
          placeholder="Search products..."
          aria-label="Search products"
        />
      )}

      <div className="nav-links">
        {userInfo?.role === "admin" ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/dashboard#orders">Orders</Link>
            <Link to="/admin/dashboard#messages">Messages</Link>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/#products">Products</Link>
            <Link to="/cart">Cart</Link>
          </>
        )}

        {userInfo ? (
          <div className="account-menu" ref={accountMenuRef}>
            <button
              type="button"
              className="account-menu-button"
              aria-expanded={isAccountMenuOpen}
              aria-label={`Open account menu for ${displayName}`}
              onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            >
              <span className="account-avatar">{avatarLetter}</span>
              <span className="account-name">{displayName}</span>
              
            </button>

            {isAccountMenuOpen && (
              <div className="account-dropdown">
                <div className="account-summary">
                  <strong>{displayName}</strong>
                  <span>{userInfo.role || "customer"}</span>
                </div>

                <Link to="/profile" onClick={() => setIsAccountMenuOpen(false)}>
                  Profile settings
                </Link>

                {userInfo.role !== "admin" && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    My orders
                  </Link>
                )}

                <button type="button" className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/my-orders">My Orders</Link>
            <Link to="/login" className="register-link">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
