import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../../services/productService";
import "../../styles/AdminReviews.css";

const AdminReviews = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getAllProducts({ includeHidden: true });
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const reviewedProducts = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          reviews: (product.reviews || []).filter((review) => review.comment?.trim()),
        }))
        .filter((product) => product.reviews.length),
    [products]
  );
  const totalReviews = reviewedProducts.reduce(
    (total, product) => total + product.reviews.length,
    0
  );

  return (
    <div className="admin-reviews-page">
      <header className="admin-reviews-header">
        <div>
          <h1>Customer Reviews</h1>
          <p>Read verified customer feedback grouped by product.</p>
        </div>
        <strong>{totalReviews} reviews</strong>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviewedProducts.length === 0 ? (
        <section className="admin-reviews-empty">No customer reviews found.</section>
      ) : (
        <div className="admin-review-groups">
          {reviewedProducts.map((product) => (
            <section className="admin-review-group" key={product._id}>
              <div className="admin-review-product">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = "/images/lak-isuru-logo.png";
                  }}
                />
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.reviews.length} review{product.reviews.length === 1 ? "" : "s"}</p>
                </div>
              </div>

              <div className="admin-review-list">
                {product.reviews.map((review) => (
                  <article className="admin-review-card" key={review._id}>
                    <div>
                      <h3>{review.name}</h3>
                      <p className="admin-review-stars" aria-label={`${review.rating} out of 5 stars`}>
                        {"★".repeat(review.rating)}
                        <span>{"★".repeat(5 - review.rating)}</span>
                      </p>
                    </div>
                    {review.verifiedPurchase && <small>Verified purchase</small>}
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
