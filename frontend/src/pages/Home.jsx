import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { getAllProducts } from "../services/productService";
import "../styles/Home.css";

function Home() {
  const { userInfo } = useAuth();
  const [searchParams] = useSearchParams();
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

  const searchTerm = searchParams.get("search") || "";
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  return (
    <div className="home-page">
      {!userInfo && (
        <section className="hero-section">
          <div className="hero-content">
            <h1>Fresh Tea From Fresh Name</h1>
            <p>
              Welcome to Lak Isuru Tea. Discover premium quality tea products with
              natural freshness, rich aroma, and authentic Sri Lankan taste.
            </p>

            <a href="#products" className="hero-btn">
              Shop Now
            </a>
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
    </div>
  );
}

export default Home;
