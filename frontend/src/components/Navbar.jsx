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

  useEffect(() => {
    const updateActiveSection = () => {
      if (location.pathname !== "/") {
        setActiveSection(location.pathname.replace("/", "") || "home");
        return;
      }

      const sectionIds = ["products", "about", "contact"];
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
  }, [location.pathname, location.hash]);

  const displayName = userInfo?.name || (userInfo?.role === "admin" ? "Admin" : "Customer");
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const getNavLinkClass = (section) =>
    activeSection === section ? "nav-link active" : "nav-link";

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
            <Link to="/admin/users" className={getNavLinkClass("admin/users")}>User Management</Link>
            <Link to="/admin/products" className={getNavLinkClass("admin/products")}>Products</Link>
            <Link to="/admin/dashboard" className={getNavLinkClass("admin/dashboard")}>Orders</Link>
            <Link to="/admin/reviews" className={getNavLinkClass("admin/reviews")}>Reviews</Link>
          </>
        ) : !userInfo ? (
          <>
            <Link to="/" className={getNavLinkClass("home")}>Home</Link>
            <Link to="/#products" className={getNavLinkClass("products")}>Products</Link>
            <Link to="/#about" className={getNavLinkClass("about")}>About Us</Link>
            <Link to="/#contact" className={getNavLinkClass("contact")}>Contact Us</Link>
          </>
        ) : (
          <>
            <Link to="/" className={getNavLinkClass("home")}>Home</Link>
            <Link to="/#products" className={getNavLinkClass("products")}>Products</Link>
            <Link to="/cart" className={getNavLinkClass("cart")}>Cart</Link>
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
