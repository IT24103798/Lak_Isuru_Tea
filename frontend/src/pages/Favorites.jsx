import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Favorites.css";

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

function Favorites() {
  const { userInfo } = useAuth();
  const {
    products,
    productsLoaded,
    productsError,
    loadProducts,
  } = useAppData();
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const customerId = userInfo?._id || userInfo?.id;
  const wishlistStorageKey = getCustomerStorageKey("lakIsuruWishlist", customerId);

  useEffect(() => {
    Promise.resolve().then(() => {
      setWishlistProductIds(readStoredArray(wishlistStorageKey));
    });

    if (!productsLoaded) {
      loadProducts().catch(() => {});
    }
  }, [loadProducts, productsLoaded, wishlistStorageKey]);

  const favoriteProducts = wishlistProductIds
    .map((productId) => products.find((product) => product._id === productId))
    .filter(Boolean);

  const toggleWishlistProduct = (productId) => {
    const nextWishlistIds = wishlistProductIds.includes(productId)
      ? wishlistProductIds.filter((savedProductId) => savedProductId !== productId)
      : [productId, ...wishlistProductIds].slice(0, 12);

    setWishlistProductIds(nextWishlistIds);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(nextWishlistIds));
  };

  return (
    <div className="favorites-page">
      <section className="favorites-hero">
        <div>
          <h1>Your favorites</h1>
          <p>Your heart-marked products are saved here for quick shopping.</p>
        </div>

        <Link to="/products" className="favorites-shop-link">
          Browse products
        </Link>
      </section>

      {!productsLoaded && <p className="favorites-status">Loading saved favorites...</p>}
      {productsError && <p className="favorites-error">{productsError}</p>}

      {productsLoaded && !productsError && favoriteProducts.length === 0 && (
        <section className="favorites-empty">
          <h2>No saved favorites yet</h2>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/products">Find tea products</Link>
        </section>
      )}

      {productsLoaded && !productsError && favoriteProducts.length > 0 && (
        <div className="favorites-grid">
          {favoriteProducts.map((product) => (
            <ProductCard
              product={product}
              key={product._id}
              showFavorite
              isFavorite={wishlistProductIds.includes(product._id)}
              onToggleFavorite={toggleWishlistProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
