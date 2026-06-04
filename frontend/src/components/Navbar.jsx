import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productCatalog } from "../data/productCatalog";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [activeProductCategory, setActiveProductCategory] = useState(null);
  const [activeSection, setActiveSection] = useState("home");

  const accountMenuRef = useRef(null);
  const productMenuRef = useRef(null);

  const isAdmin = userInfo?.role === "admin";

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    const searchQuery = searchTerm
      ? `?search=${encodeURIComponent(searchTerm)}`
      : "";

    navigate(`/${searchQuery}#products`);
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setIsProductMenuOpen(false);
    navigate("/login");
  };

  const handleProductFilter = (category, subcategory = "") => {
    const queryParams = new URLSearchParams();
    queryParams.set("category", category);

    if (subcategory) {
      queryParams.set("subcategory", subcategory);
    }

    setIsProductMenuOpen(false);
    setActiveProductCategory(null);
    navigate(`/?${queryParams.toString()}#products`);
  };

  useEffect(() => {
    const closeMenus = (event) => {
      if (
        event.key === "Escape" ||
        (accountMenuRef.current && !accountMenuRef.current.contains(event.target))
      ) {
        setIsAccountMenuOpen(false);
      }

      if (
        event.key === "Escape" ||
        (productMenuRef.current && !productMenuRef.current.contains(event.target))
      ) {
        setIsProductMenuOpen(false);
        setActiveProductCategory(null);
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

  return (
    <nav className={`navbar ${isAdmin ? "admin-navbar" : ""}`}>
      <div className="nav-left">
        <Link to={isAdmin ? "/admin/orders" : "/"} className="logo-link">
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
            {!userInfo ? (
              <>
                <Link to="/" className={getNavLinkClass("home")}>
                  Home
                </Link>
                <Link to="/#products" className={getNavLinkClass("products")}>
                  Products
                </Link>
                <Link to="/#about" className={getNavLinkClass("about")}>
                  About Us
                </Link>
                <Link to="/#contact" className={getNavLinkClass("contact")}>
                  Contact Us
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={getNavLinkClass("home")}>
                  Home
                </Link>
                <div className="products-menu" ref={productMenuRef}>
                  <button
                    type="button"
                    className={getNavLinkClass("products")}
                    aria-expanded={isProductMenuOpen}
                    onClick={() => {
                      setActiveProductCategory(null);
                      setIsProductMenuOpen((isOpen) => !isOpen);
                    }}
                  >
                    Products
                  </button>

                  {isProductMenuOpen && (
                    <div
                      className="products-mega-menu"
                      onMouseLeave={() => setActiveProductCategory(null)}
                    >
                      <div className="products-menu-categories">
                        {productCatalog.map((group) => (
                          <div
                            className={
                              activeProductCategory?.category === group.category
                                ? "products-menu-group active"
                                : "products-menu-group"
                            }
                            key={group.category}
                            onMouseEnter={() => setActiveProductCategory(group)}
                            onFocus={() => setActiveProductCategory(group)}
                          >
                            <button
                              type="button"
                              className="products-menu-category"
                              onClick={() => handleProductFilter(group.category)}
                            >
                              {group.category}
                            </button>

                            {activeProductCategory?.category === group.category && (
                              <div className="products-submenu-panel">
                                {group.subcategories.map((subcategory) => (
                                  <button
                                    type="button"
                                    key={subcategory}
                                    onClick={() =>
                                      handleProductFilter(group.category, subcategory)
                                    }
                                  >
                                    {subcategory}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link to="/cart" className={getNavLinkClass("cart")}>
                  Cart
                </Link>
              </>
            )}
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

                {!isAdmin && (
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
