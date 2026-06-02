import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addProductReview, getProductById } from "../services/productService";
import API from "../api/api";
import "../styles/ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cartMessage, setCartMessage] = useState("")
  
  const reviews = product?.reviews || [];

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        const data = await getProductById(id);

        setProduct(data.product);
        setQuantity(data.product.stock > 0 ? 1 : 0);
        setError("");
      } catch (error) {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "No ratings yet";
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return `${(total / reviews.length).toFixed(1)} / 5`;
  }, [reviews]);

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

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(product.stock > 0 ? 1 : 0, currentQuantity - 1));
  };

  const increaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.min(product.stock || 0, currentQuantity + 1)
    );
  };

  const handleAddToCart = async () => {
    if (!product.stock) {
      alert("This product is currently out of stock.");
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
        quantity: quantity,
        image: product.image,
      });

      setCartMessage(`✓ ${quantity} × ${product.name} added to cart!`);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      alert("Failed to add to cart. Please try again.");
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

      const data = await addProductReview(product._id, {
        name: user.name || "Customer",
        rating: Number(rating),
        comment: trimmedComment,
      });

      setProduct(data.product);
      setRating(5);
      setComment("");
    } catch (error) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="details-page">
      <main className="details-wrap">
        <Link to="/#products" className="back-link">
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
            <p className="details-rating">{averageRating}</p>
            <h1>{product.name}</h1>
            <p className="details-price">Rs. {product.price}</p>
            <p className="details-description">{product.description}</p>

            <div className="purchase-panel">
              <p className="stock-text">{product.stock || 0} in stock</p>

              <div className="purchase-row">
                <div className="quantity-control" aria-label="Quantity">
                  <button type="button" onClick={decreaseQuantity}>
                    -
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={increaseQuantity}>
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="add-cart-button"
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                >
                  Add To Cart
                </button>
              </div>
              {cartMessage && (
                <p style={{
                  color: "#0f6e56",
                  fontWeight: 600,
                  marginTop: "0.8rem",
                  fontSize: "0.9rem"
                }}>
                  {cartMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            <p>{reviews.length} reviews</p>
          </div>

          {user ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <label>
                Rating
                <select
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </label>

              <label>
                Review
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience with this product"
                />
              </label>

              <button type="submit" disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <p className="login-review-note">
              Please <Link to="/login">login</Link> to give a rating and review.
            </p>
          )}

          <div className="review-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article className="review-item" key={review._id}>
                  <div>
                    <h3>{review.name}</h3>
                    <p>{"*".repeat(review.rating)}</p>
                  </div>
                  <p>{review.comment}</p>
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
