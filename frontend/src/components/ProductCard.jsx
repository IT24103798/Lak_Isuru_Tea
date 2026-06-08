import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard({ product, showFavorite = false, isFavorite = false, onToggleFavorite }) {
  const reviews = product.reviews || [];
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const roundedRating = Math.round(averageRating);

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
          {isFavorite ? "\u2665" : "\u2661"}
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
            <span className="price-amount">{product.price}</span>
          </p>

          <div
            className="product-card-rating"
            aria-label={reviews.length ? `${averageRating.toFixed(1)} out of 5 stars` : "No ratings yet"}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <span className={index < roundedRating ? "filled" : ""} key={index}>
                {"\u2605"}
              </span>
            ))}
          </div>

          <p className="product-description">{product.description}</p>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
