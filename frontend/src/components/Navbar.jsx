import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const accountMenuRef = useRef(null);

  const isAdmin = userInfo?.role === "admin";

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    const searchQuery = searchTerm
      ? `?search=${encodeURIComponent(searchTerm)}`
      : "";

    navigate(`/products${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    navigate("/login");
  };

  const handleHomeClick = () => {
    setIsAccountMenuOpen(false);

    if (location.pathname === "/" && !location.search && !location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const closeMenus = (event) => {
      if (
        event.key === "Escape" ||
        (accountMenuRef.current && !accountMenuRef.current.contains(event.target))
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeMenus);
    };
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      if (location.pathname.startsWith("/products")) {
        setActiveSection("products");
        return;
      }

      if (location.pathname !== "/") {
        setActiveSection(location.pathname.replace("/", "") || "home");
        return;
      }

      const queryParams = new URLSearchParams(location.search);

      if (
        location.hash === "#products" ||
        queryParams.has("category") ||
        queryParams.has("subcategory") ||
        queryParams.has("search")
      ) {
        setActiveSection("products");
        return;
      }

      if (location.hash === "#about") {
        setActiveSection("about");
        return;
      }

      if (location.hash === "#contact") {
        setActiveSection("contact");
        return;
      }

      const sectionIds = ["about", "contact"];
      const currentSection = sectionIds.reduce((current, sectionId) => {
        const section = document.getElementById(sectionId);
        const activationLine = window.innerHeight * 0.45;

        return section && section.getBoundingClientRect().top <= activationLine
          ? sectionId
          : current;
      }, null);

      setActiveSection(currentSection || "home");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [location.pathname, location.hash, location.search]);

  const displayName = userInfo?.name || (isAdmin ? "Admin" : "Customer");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const getNavLinkClass = (section) =>
    activeSection === section ? "nav-link active" : "nav-link";

  const getAdminNavLinkClass = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className={`navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <div className="nav-left">
        <Link
          to={isAdmin ? "/admin/dashboard" : "/"}
          className="logo-link"
          onClick={!isAdmin ? handleHomeClick : undefined}
        >
          <img
            src="/images/lak-isuru-logo.png"
            alt="Lak Isuru Tea Logo"
            className="nav-logo"
          />
        </Link>
      </div>

      {!isAdmin && (
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
        {!isAdmin && (
          <>
            <Link to="/" className={getNavLinkClass("home")} onClick={handleHomeClick}>
              Home
            </Link>

            <Link to="/products" className={getNavLinkClass("products")}>
              Products
            </Link>

            {!userInfo && (
              <>
                <Link to="/#about" className={getNavLinkClass("about")}>
                  About Us
                </Link>
              </>
            )}

            {userInfo && (
              <Link to="/cart" className={getNavLinkClass("cart")}>
                Cart
              </Link>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <Link
              to="/admin/dashboard"
              className={getAdminNavLinkClass("/admin/dashboard")}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className={getAdminNavLinkClass("/admin/users")}
            >
              Users
            </Link>
            <Link
              to="/admin/products"
              className={getAdminNavLinkClass("/admin/products")}
            >
              Products
            </Link>
            <Link
              to="/admin/orders"
              className={getAdminNavLinkClass("/admin/orders")}
            >
              Orders
            </Link>
            <Link
              to="/admin/reviews"
              className={getAdminNavLinkClass("/admin/reviews")}
            >
              Reviews
            </Link>
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
                  <span>{isAdmin ? "Admin" : "Customer"}</span>
                </div>

                {isAdmin ? (
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    Profile settings
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile-settings"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      Profile settings
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      My orders
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="register-link">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
