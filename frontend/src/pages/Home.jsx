import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { getAllProducts } from "../services/productService";
import "../styles/Home.css";

const heroSlides = [
  {
    title: "Fresh Tea From Fresh Name",
    text: "Welcome to Lak Isuru Tea. Discover premium quality tea products with natural freshness, rich aroma, and authentic Sri Lankan taste.",
    image: "/images/hero-tea-plantation.png",
    position: "center",
  },
  {
    title: "Start Your Day With Rich Flavor",
    text: "Enjoy carefully selected tea blends made for refreshing mornings, relaxing evenings, and every cup in between.",
    image: "/images/hero-tea-cup.png",
    position: "right center",
  },
  {
    title: "Pure Taste In Every Cup",
    text: "Choose from fresh green, black, yellow, and breakfast teas with trusted quality and smooth Sri Lankan character.",
    image: "/images/hero-tea-leaves.png",
    position: "right center",
  },
];

const sortTopSellingFirst = (productList) => {
  return [...productList].sort((firstProduct, secondProduct) => {
    if (firstProduct.isTopSelling && !secondProduct.isTopSelling) {
      return -1;
    }

    if (!firstProduct.isTopSelling && secondProduct.isTopSelling) {
      return 1;
    }

    if (firstProduct.isTopSelling && secondProduct.isTopSelling) {
      return (secondProduct.soldQuantity || 0) - (firstProduct.soldQuantity || 0);
    }

    return 0;
  });
};

function Home() {
  const { userInfo } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getAllProducts();

      setProducts(data.products);
      setError("");
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timerId = setTimeout(loadProducts, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (userInfo) {
      return;
    }

    const slideInterval = setInterval(() => {
      setActiveHeroSlide((currentSlide) =>
        currentSlide === heroSlides.length - 1 ? 0 : currentSlide + 1
      );
    }, 4500);

    return () => {
      clearInterval(slideInterval);
    };
  }, [userInfo]);

  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedSubcategory = searchParams.get("subcategory") || "";

  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [searchTerm]);

  useEffect(() => {
    const shouldShowWelcome = sessionStorage.getItem("showWelcomeBack") === "true";

    if (!userInfo || userInfo.role === "admin" || !shouldShowWelcome) {
      setShowWelcomeMessage(false);
      return;
    }

    sessionStorage.removeItem("showWelcomeBack");
    setShowWelcomeMessage(true);

    const welcomeTimerId = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 6000);

    return () => {
      clearTimeout(welcomeTimerId);
    };
  }, [userInfo]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const normalizedCategory = selectedCategory.trim().toLowerCase();
  const normalizedSubcategory = selectedSubcategory.trim().toLowerCase();
  const emptyProductsMessage = (() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm) {
      return `No products found for "${trimmedSearchTerm}".`;
    }

    if (selectedCategory) {
      return `No products found in "${selectedCategory}${
        selectedSubcategory ? ` - ${selectedSubcategory}` : ""
      }"`;
    }

    return "No matching products found.";
  })();
  const activeHash = location.hash;
  const showAboutSection = !userInfo || activeHash === "#about";

  useEffect(() => {
    if (!activeHash) {
      return;
    }

    const animationFrameId = requestAnimationFrame(() => {
      document.getElementById(activeHash.slice(1))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeHash, showAboutSection]);

  const visibleProducts = userInfo
    ? sortTopSellingFirst(products)
    : sortTopSellingFirst(
        products.filter((product) => product.isTopSelling || product.featuredOnHome)
      );

  const filteredProducts = visibleProducts.filter((product) => {
    const searchableText = [product.name, product.category, product.subcategory]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(normalizedSearchTerm);
    const matchesCategory =
      !normalizedCategory || product.category?.toLowerCase() === normalizedCategory;
    const matchesSubcategory =
      !normalizedSubcategory || product.subcategory?.toLowerCase() === normalizedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  return (
    <div className="home-page">
      {!userInfo && (
        <section
          className="hero-section"
          style={{
            backgroundImage: `url(${heroSlides[activeHeroSlide].image})`,
            backgroundPosition: heroSlides[activeHeroSlide].position,
          }}
        >
          <div className="hero-content">
            <h1>{heroSlides[activeHeroSlide].title}</h1>
            <p>{heroSlides[activeHeroSlide].text}</p>

            <a href="#products" className="hero-btn">
              Shop Now
            </a>

            <div className="hero-dots" aria-label="Hero slides">
              {heroSlides.map((slide, index) => (
                <button
                  type="button"
                  className={index === activeHeroSlide ? "active" : ""}
                  key={slide.title}
                  aria-label={`Show ${slide.title}`}
                  aria-pressed={index === activeHeroSlide}
                  onClick={() => setActiveHeroSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {userInfo && userInfo.role !== "admin" && showWelcomeMessage && (
        <section className="customer-home-intro">
          <h1>Welcome back {userInfo.name || "Tea Lover"}!</h1>
        </section>
      )}

      <section className="products-section" id="products">
        {!userInfo && (
          <>
            <h2>Our Tea Products</h2>
            <p className="section-subtitle">
              {selectedCategory
                ? `${selectedCategory}${selectedSubcategory ? ` - ${selectedSubcategory}` : ""}`
                : "Select a tea product to view details, stock, cart options, and customer reviews."}
            </p>
          </>
        )}

        {loading && <p className="status-message">Loading products...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && visibleProducts.length === 0 && (
          <p className="status-message">No products available yet.</p>
        )}

        {!loading && !error && visibleProducts.length > 0 && filteredProducts.length === 0 && (
          <p className="status-message">{emptyProductsMessage}</p>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        )}
      </section>

      {showAboutSection && (
        <section className="about-section" id="about">
          <div className="about-content">
            <div className="about-copy">
              <span className="about-label">About Us</span>
              <h2>Rooted in Sri Lankan tea tradition</h2>
              <p>
                Lak Isuru Tea brings carefully selected tea products to customers
                who value freshness, flavor, and trusted quality. We focus on rich
                aroma, natural taste, and a dependable shopping experience from
                browsing to delivery.
              </p>
            </div>

            <div className="about-highlights">
              <div className="about-highlight">
                <strong>Premium Quality</strong>
                <span>Tea products chosen for freshness, color, and aroma.</span>
              </div>
              <div className="about-highlight">
                <strong>Local Taste</strong>
                <span>Authentic Sri Lankan blends for everyday tea lovers.</span>
              </div>
              <div className="about-highlight">
                <strong>Customer Care</strong>
                <span>Simple ordering with clear product details and reviews.</span>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default Home;
