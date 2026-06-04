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
  },
  {
    title: "Start Your Day With Rich Flavor",
    text: "Enjoy carefully selected tea blends made for refreshing mornings, relaxing evenings, and every cup in between.",
    image: "/images/hero-tea-cup.png",
  },
  {
    title: "Pure Taste In Every Cup",
    text: "Choose from fresh green, black, yellow, and breakfast teas with trusted quality and smooth Sri Lankan character.",
    image: "/images/hero-tea-leaves.png",
  },
];

function Home() {
  const { userInfo } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getAllProducts();

      setProducts(data.products);
      setError("");
    } catch (error) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
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

  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [searchTerm]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const activeHash = location.hash;
  const showAboutSection = !userInfo || activeHash === "#about";
  const showContactSection = !userInfo || activeHash === "#contact";

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
  }, [activeHash, showAboutSection, showContactSection]);

  const filteredProducts = products.filter((product) => {
    const searchableText = [product.name, product.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  return (
    <div className="home-page">
      {!userInfo && (
        <section
          className="hero-section"
          style={{ backgroundImage: `url(${heroSlides[activeHeroSlide].image})` }}
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

      <section className="products-section" id="products">
        <h2>Our Tea Products</h2>
        <p className="section-subtitle">
          Select a tea product to view details, stock, cart options, and
          customer reviews.
        </p>

        {loading && <p className="status-message">Loading products...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="status-message">No products available yet.</p>
        )}

        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <p className="status-message">
            No products found for "{searchTerm.trim()}".
          </p>
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

      {showContactSection && (
        <section className="contact-section" id="contact">
          <div className="contact-content">
            <span className="contact-label">Contact Us</span>
            <h2>Need help choosing your tea?</h2>
            <p>
              Reach out to Lak Isuru Tea for product details, orders, or support.
              We are happy to help you find the right tea for your taste.
            </p>

            <div className="contact-details">
              <a href="tel:+94771234567">+94 77 123 4567</a>
              <a href="mailto:info@lakisurutea.com">info@lakisurutea.com</a>
            </div>
          </div>
        </section>
      )}
      
    </div>
  );
}

export default Home;
