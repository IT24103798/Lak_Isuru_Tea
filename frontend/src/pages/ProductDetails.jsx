import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import {
  addProductReview,
  deleteProductReview,
  getProductById,
  getReviewEligibility,
  updateProductReview,
} from "../services/productService";
import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const user = useMemo(() => JSON.parse(localStorage.getItem("userInfo")), []);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [checkingReviewEligibility, setCheckingReviewEligibility] = useState(Boolean(user));
  const [editingReviewId, setEditingReviewId] = useState(null);

  const reviews = useMemo(() => product?.reviews || [], [product]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);

        setProduct(data.product);
        setQuantity(data.product.stock > 0 ? 1 : 0);
        setError("");
      } catch {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadReviewEligibility = async () => {
      if (!user || user.role === "admin") {
        setReviewEligibility(null);
        setCheckingReviewEligibility(false);
        return;
      }

      try {
        setCheckingReviewEligibility(true);
        const data = await getReviewEligibility(id);
        setReviewEligibility(data);
      } catch {
        setReviewEligibility(null);
      } finally {
        setCheckingReviewEligibility(false);
      }
    };

    loadReviewEligibility();
  }, [id, user]);

  const averageRatingValue = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const averageRating = averageRatingValue
    ? `${averageRatingValue.toFixed(1)} / 5`
    : "No ratings yet";

  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((review) => review.rating === star).length;
        const percentage = reviews.length ? (count / reviews.length) * 100 : 0;

        return { star, count, percentage };
      }),
    [reviews]
  );

  const decreaseQuantity = () => {
    if (!product) return;

    setQuantity((currentQuantity) =>
      Math.max(product.stock > 0 ? 1 : 0, currentQuantity - 1)
    );
  };

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(product.stock || 0, currentQuantity + 1)
    );
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (quantity < 1) {
      alert("Please select a valid quantity.");
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock.`);
      return;
    }

    if (!user) {
      alert("Please login first to add products to cart.");
      window.location.href = "/login";
      return;
    }

    try {
      await API.post("/cart", {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });

      setCartMessage(`✓ ${quantity} × ${product.name} added to cart!`);
      setQuantity(product.stock > 0 ? 1 : 0);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add to cart. Please try again."
      );
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Please login first to add a review.");
      window.location.href = "/login";
      return;
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      alert("Please enter your review.");
      return;
    }

    try {
      setSubmittingReview(true);

      const reviewPayload = {
        rating: Number(rating),
        comment: trimmedComment,
      };
      const data = editingReviewId
        ? await updateProductReview(product._id, editingReviewId, reviewPayload)
        : await addProductReview(product._id, reviewPayload);

      setProduct(data.product);
      setReviewEligibility({ canReview: false, hasPurchased: true, hasReviewed: true });
      setEditingReviewId(null);
      setRating(5);
      setComment("");
    } catch (error) {
      alert(error.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    document.querySelector(".reviews-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) {
      return;
    }

    try {
      const data = await deleteProductReview(product._id, reviewId);

      setProduct(data.product);
      setReviewEligibility({ canReview: true, hasPurchased: true, hasReviewed: false });

      if (editingReviewId === reviewId) {
        handleCancelEdit();
      }
    } catch (error) {
      alert(error.message || "Failed to delete review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="details-page">
        <main className="details-not-found">
          <h1>Loading product...</h1>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="details-page">
        <main className="details-not-found">
          <h1>{error || "Product not found"}</h1>
          <Link to="/">Back to products</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="details-page">
      <main className="details-wrap">
        <Link to="/products" className="back-link">
          Back to products
        </Link>

        <section className="details-main">
          <div className="details-image-panel">
            <img
              src={product.image}
              alt={product.name}
              className="details-image"
              onError={(event) => {
                event.currentTarget.src = "/images/lak-isuru-logo.png";
              }}
            />
          </div>

          <div className="details-info">
            <h1>{product.name}</h1>
            <p className="details-price">
              <span className="price-currency">Rs.</span>
              <span className="price-amount">
                {product.price}
              </span>
            </p>
            <p className="details-description">{product.description}</p>

            <div className="purchase-panel">
              <p className="stock-text">{product.stock ?? 0} in stock</p>

              <div className="purchase-row">
                <div className="quantity-control" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || product.stock <= 0}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock || product.stock <= 0}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="add-cart-button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? "Add To Cart" : "Out Of Stock"}
                </button>
              </div>

              {cartMessage && (
                <p
                  style={{
                    color: "#0f6e56",
                    fontWeight: 600,
                    marginTop: "0.8rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {cartMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Ratings & Reviews of {product.name}</h2>
          </div>

          <div className="ratings-overview">
            <div className="ratings-score">
              <div>
                <strong>{averageRatingValue ? averageRatingValue.toFixed(1) : "0.0"}</strong>
                <span>/5</span>
              </div>
              <p className="rating-stars-large" aria-label={`${averageRating} stars`}>
                {"★".repeat(Math.round(averageRatingValue || 0))}
                <span>{"★".repeat(5 - Math.round(averageRatingValue || 0))}</span>
              </p>
              <small>
                {reviews.length} {reviews.length === 1 ? "Rating" : "Ratings"}
              </small>
            </div>

            <div className="ratings-bars">
              {ratingBreakdown.map((ratingRow) => (
                <div className="rating-bar-row" key={ratingRow.star}>
                  <span className="rating-bar-stars">
                    {"★".repeat(ratingRow.star)}
                    <span>{"★".repeat(5 - ratingRow.star)}</span>
                  </span>
                  <div className="rating-bar-track">
                    <span style={{ width: `${ratingRow.percentage}%` }} />
                  </div>
                  <strong>{ratingRow.count}</strong>
                </div>
              ))}
            </div>
          </div>

          {checkingReviewEligibility && user && user.role !== "admin" && (
            <p className="review-status-note">Checking your review eligibility...</p>
          )}

          {user && !checkingReviewEligibility && (reviewEligibility?.canReview || editingReviewId) && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <div className="review-form-heading">
                <div>
                  <h3>{editingReviewId ? "Edit your review" : "Share your experience"}</h3>
                  <p>Your feedback helps other customers choose their tea.</p>
                </div>
                {editingReviewId && (
                  <button type="button" className="review-cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>

              <fieldset className="star-rating-field">
                <legend>Rating</legend>
                <div className="star-picker" aria-label={`${rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={star <= rating ? "selected" : ""}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      aria-pressed={star === rating}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>

              <label>
                Review
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience with this product"
                  maxLength="500"
                />
                <span className="review-character-count">{comment.length}/500</span>
              </label>

              <button type="submit" disabled={submittingReview}>
                {submittingReview
                  ? "Saving..."
                  : editingReviewId
                  ? "Save Changes"
                  : "Submit Review"}
              </button>
            </form>
          )}

          <div className="product-reviews-title">
            <h3>Product Reviews</h3>
          </div>

          <div className="review-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article
                  className={`review-item ${review.user === user?._id ? "own-review" : ""}`}
                  key={review._id}
                >
                  <div className="review-item-header">
                    <div className="review-customer">
                      <span className="review-avatar">{review.name.charAt(0).toUpperCase()}</span>
                      <div>
                        <h3 className="review-name-line">
                          <span>{review.name}</span>
                          {review.verifiedPurchase && (
                            <small className="verified-purchase">
                              Verified purchase
                            </small>
                          )}
                        </h3>
                      </div>
                    </div>
                    <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                      {"★".repeat(review.rating)}
                      <span>{"★".repeat(5 - review.rating)}</span>
                    </p>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.user === user?._id && (
                    <div className="review-actions">
                      <button
                        type="button"
                        className="edit-review-button"
                        onClick={() => handleEditReview(review)}
                      >
                        Edit review
                      </button>
                      <button
                        type="button"
                        className="delete-review-button"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        Delete review
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="empty-reviews">No reviews for this product yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;
