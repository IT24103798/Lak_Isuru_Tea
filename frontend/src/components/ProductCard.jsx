import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard({ product, showFavorite = false, isFavorite = false, onToggleFavorite }) {
  return (
    <article className="product-card">
      {showFavorite && (
        <button
          type="button"
          className={`product-favorite-button ${isFavorite ? "saved" : ""}`}
          aria-label={
            isFavorite
              ? `Remove ${product.name} from favorites`
              : `Save ${product.name} to favorites`
          }
          onClick={(event) => {
            event.preventDefault();
            onToggleFavorite?.(product._id);
          }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      )}

      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={(event) => {
              event.currentTarget.src = "/images/lak-isuru-logo.png";
            }}
          />
          {product.isTopSelling && <span className="top-selling-badge">Top selling</span>}
        </div>

        <div className="product-content">
          <h3>{product.name}</h3>

          <p className="product-price">
            <span className="price-currency">Rs.</span>
            <span className="price-amount">
              {product.price}
            </span>
          </p>

          <p className="product-description">{product.description}</p>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
