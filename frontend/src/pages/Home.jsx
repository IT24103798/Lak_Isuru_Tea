import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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

const teaKnowledgeSections = [
  {
    title: "Sri Lankan Tea Heritage",
    kicker: "Ceylon tea since 1867",
    image: "/images/tea-heritage.png",
    imageAlt: "Tea hills in Sri Lanka at sunrise",
    text:
      "Sri Lanka's commercial tea story began at Loolecondera Estate, where James Taylor planted 19 acres of tea in 1867. From those highland beginnings, Ceylon tea became known for bright character, clean aroma, and careful estate craftsmanship.",
    details: [
      "The name Ceylon tea comes from Sri Lanka's former name, Ceylon, and it is still used around the world as a mark of origin.",
      "Sri Lankan tea grows across different elevations. High-grown teas are often lighter and aromatic, while lower-grown teas can be stronger and deeper in color.",
      "Tea is usually plucked by selecting the young bud and two tender leaves because that part gives the cleanest flavor and best quality.",
    ],
    highlights: ["Loolecondera Estate", "Hand-plucked leaves", "Seven growing regions"],
  },
  {
    title: "From Leaf to Cup",
    kicker: "How orthodox tea is made",
    image: "/images/leaf-to-cup.png",
    imageAlt: "Fresh tea leaves, processed tea, and a cup of tea",
    text:
      "Quality tea starts with tender shoots, traditionally the bud and two leaves. After plucking, the leaves are withered, rolled, oxidized, dried, sorted by grade, and packed so the final cup keeps its color, aroma, and strength.",
    details: [
      "Withering gently removes moisture from the fresh leaves, making them soft enough to roll without breaking badly.",
      "Rolling bruises the leaf surface so natural enzymes can react with oxygen. This step helps develop the color, body, and aroma of black tea.",
      "Drying stops oxidation at the right moment. After that, the tea is sorted by leaf size so each grade brews more consistently.",
    ],
    highlights: ["Pluck", "Wither", "Roll", "Oxidize", "Dry", "Sort"],
  },
  {
    title: "Tea Preparation Guide",
    kicker: "A better cup at home",
    image: "/images/tea-preparation-guide.png",
    imageAlt: "Ceylon tea being poured into a cup",
    text:
      "For black Ceylon tea, bring fresh water to a boil, remove it from heat, add tea leaves or a tea bag, and steep for about 3-5 minutes. Strain before serving, then enjoy plain or with milk, lemon, or sugar to taste.",
    details: [
      "Fresh water gives a cleaner taste because it has more natural oxygen than water that has been boiled many times.",
      "A short steep can taste light, while a very long steep can become bitter. Three to five minutes is a good range for most black Ceylon teas.",
      "Use less milk for delicate teas and more milk for strong breakfast-style teas. Lemon is best added after brewing, not during steeping.",
    ],
    highlights: ["Fresh water", "3-5 min steep", "Strain and serve"],
  },
];

const teaCategoryShowcase = [
  {
    title: "Black Tea",
    text: "Bold Ceylon character with deep color and brisk strength.",
    image: "/images/category-black-tea.png",
    accent: "Classic",
  },
  {
    title: "Green Tea",
    text: "Light, clean cups with a fresh and gentle finish.",
    image: "/images/category-green-tea.png",
    accent: "Fresh",
  },
  {
    title: "Flavoured Tea",
    text: "Fruit, spice, and herbal notes blended for everyday variety.",
    image: "/images/category-flavoured-tea.png",
    accent: "Aromatic",
  },
  {
    title: "Spices",
    text: "Cinnamon, cardamom, and warming pantry favorites.",
    image: "/images/category-spices.png",
    accent: "Ceylon",
  },
  {
    title: "Tea Gifts",
    text: "Thoughtful tea packs and keepsakes for special moments.",
    image: "/images/category-tea-gifts.png",
    accent: "Giftable",
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

const getCustomerStorageKey = (baseKey, userId) => `${baseKey}:${userId || "guest"}`;

const readStoredArray = (key) => {
  try {
    const storedValue = localStorage.getItem(key);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

function Home() {
  const { userInfo } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const isAdminUser = userInfo?.role === "admin";
  const isCustomerUser = userInfo && userInfo.role !== "admin";
  const customerId = userInfo?._id || userInfo?.id;
  const wishlistStorageKey = getCustomerStorageKey("lakIsuruWishlist", customerId);

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
    if (!isCustomerUser) {
      setWishlistProductIds([]);
      return;
    }

    setWishlistProductIds(readStoredArray(wishlistStorageKey));
  }, [isCustomerUser, wishlistStorageKey]);

  useEffect(() => {
    if (isAdminUser) {
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
  }, [isAdminUser]);

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
  const showAboutSection = !userInfo;

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

  const visibleProducts = sortTopSellingFirst(
    products.filter((product) => product.isTopSelling || product.featuredOnHome)
  );
  const topPickProducts = (
    visibleProducts.some((product) => product.isTopSelling)
      ? visibleProducts.filter((product) => product.isTopSelling)
      : visibleProducts
  ).slice(0, 3);
  const topPickProductIds = new Set(topPickProducts.map((product) => product._id));
  const shouldShowTopPicks =
    !isAdminUser &&
    topPickProducts.length > 0 &&
    !normalizedSearchTerm &&
    !normalizedCategory &&
    !normalizedSubcategory;

  const toggleWishlistProduct = (productId) => {
    const nextWishlistIds = wishlistProductIds.includes(productId)
      ? wishlistProductIds.filter((savedProductId) => savedProductId !== productId)
      : [productId, ...wishlistProductIds].slice(0, 12);

    setWishlistProductIds(nextWishlistIds);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(nextWishlistIds));
  };

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
  const gridProducts = shouldShowTopPicks
    ? filteredProducts.filter((product) => !topPickProductIds.has(product._id))
    : filteredProducts;

  return (
    <div className="home-page">
      {!isAdminUser && (
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

      {isCustomerUser && (
        <section className="customer-dashboard" aria-label="Customer home shortcuts">
          <div className="customer-dashboard-hero">
            <div>
              {showWelcomeMessage && <span>Welcome Back</span>}
              <h1>Hello {userInfo.name?.split(" ")[0] || "Tea Lover"}!</h1>
              <p>
                It's a great day for a perfect cup of tea. Explore our latest collections 
                or revisit your favorite blends.
              </p>
            </div>

            <Link to="/favorites" className="favorites-shortcut-button">
              View Saved Favorites
            </Link>
          </div>
        </section>
      )}

      {!isAdminUser && (
        <section className="category-showcase-section" aria-label="Tea category showcase">
          <div className="category-showcase-heading">
            <span>Explore Our Range</span>
            <h2>Shop by tea category</h2>
          </div>

          <div className="category-showcase-grid">
            {teaCategoryShowcase.map((category) => (
              <Link
                to={`/products?category=${encodeURIComponent(category.title)}`}
                className="category-showcase-card"
                key={category.title}
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="category-showcase-content">
                  <small>{category.accent}</small>
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                  <span>View products</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="products-section" id="products">
        {!isAdminUser && (
          <>
            <h2>Our Tea Products</h2>
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

        {!loading && !error && shouldShowTopPicks && (
          <div className="top-picks-preview" aria-label="Best selling tea products">
            <div className="top-picks-header">
              <span>Best Sellers</span>
              <h3>Top picks for tea lovers</h3>
            </div>

            <div className="top-picks-strip">
              {topPickProducts.map((product, index) => (
                <article className="top-pick-card" key={product._id}>
                  <Link to={`/products/${product._id}`} className="top-pick-main">
                    <span className="top-pick-rank">#{index + 1}</span>

                    <div className="top-pick-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = "/images/lak-isuru-logo.png";
                        }}
                      />
                    </div>

                    <div className="top-pick-copy">
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <strong>Rs. {product.price}</strong>
                    </div>
                  </Link>

                  {isCustomerUser && (
                    <button
                      type="button"
                      className={`top-pick-save ${
                        wishlistProductIds.includes(product._id) ? "saved" : ""
                      }`}
                      aria-label={
                        wishlistProductIds.includes(product._id)
                          ? `Remove ${product.name} from favorites`
                          : `Save ${product.name} to favorites`
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        toggleWishlistProduct(product._id);
                      }}
                    >
                      {wishlistProductIds.includes(product._id) ? "♥" : "♡"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && gridProducts.length > 0 && (
          <div className="product-grid">
            {gridProducts.map((product) => (
              <ProductCard
                product={product}
                key={product._id}
                showFavorite={Boolean(isCustomerUser)}
                isFavorite={wishlistProductIds.includes(product._id)}
                onToggleFavorite={toggleWishlistProduct}
              />
            ))}
          </div>
        )}
      </section>

      {showAboutSection && (
        <section className="tea-knowledge-section" aria-label="Sri Lankan tea learning guide">
          <div className="tea-knowledge-heading">
            <span>Tea Knowledge</span>
            <h2>Discover the story behind every cup</h2>
          </div>

          <div className="tea-knowledge-grid">
            {teaKnowledgeSections.map((section, index) => (
              <article
                className={index % 2 === 1 ? "tea-knowledge-card reverse" : "tea-knowledge-card"}
                key={section.title}
              >
                <div className="tea-knowledge-image-wrap">
                  <img src={section.image} alt={section.imageAlt} className="tea-knowledge-image" />
                </div>

                <div className="tea-knowledge-copy">
                  <span>{section.kicker}</span>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>

                  <ul className="tea-knowledge-details">
                    {section.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  <div className="tea-knowledge-points" aria-label={`${section.title} key points`}>
                    {section.highlights.map((highlight) => (
                      <small key={highlight}>{highlight}</small>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showAboutSection && (
        <section className="about-section" id="about">
          <div className="about-content">
            <div className="about-copy">
              <span className="about-label">About Us</span>
              <h2>Established in 2012</h2>
              <p>
                Lak Isuru Tea is a Sri Lankan tea supplier dedicated to delivering
                high-quality Ceylon tea to customers worldwide. We work closely
                with carefully selected tea estate partners across Sri Lanka to
                ensure consistent quality, rich flavor, and natural freshness in
                every pack.
              </p>
              <p>
                We offer black tea, green tea, and blended varieties, all carefully
                processed and packaged to preserve the authentic taste and aroma of
                Sri Lankan tea.
              </p>
              <p>
                At Lak Isuru Tea, we believe every cup should reflect the true
                essence of Sri Lankan tea—rich, refreshing, and authentic.
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
