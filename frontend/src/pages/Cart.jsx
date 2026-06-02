import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removePopup, setRemovePopup] = useState({
    open: false,
    productId: null,
    productName: "",
  });

  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    try {
      const { data } = await API.get("/cart");
      setCart(data.cart || []);
      setError("");
    } catch (err) {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) {
      const item = cart.find((cartItem) => cartItem.productId === productId);

      setRemovePopup({
        open: true,
        productId,
        productName: item?.name || "this item",
      });

      return;
    }

    try {
      await API.put("/cart", { productId, quantity });

      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      setError("Failed to update quantity.");
    }
  };

  const removeItem = async (productId) => {
    try {
      await API.delete(`/cart/${productId}`);

      setCart((prev) => prev.filter((item) => item.productId !== productId));

      setRemovePopup({
        open: false,
        productId: null,
        productName: "",
      });
    } catch (err) {
      setError("Failed to remove item.");
    }
  };

  const openRemovePopup = (item) => {
    setRemovePopup({
      open: true,
      productId: item.productId,
      productName: item.name,
    });
  };

  const closeRemovePopup = () => {
    setRemovePopup({
      open: false,
      productId: null,
      productName: "",
    });
  };

  const cartItemsTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryFee =
    cart.length === 0 ? 0 : cartItemsTotal >= 5000 ? 0 : 300;

  const total = cartItemsTotal + deliveryFee;

  const remainingForFreeDelivery =
    cartItemsTotal > 0 && cartItemsTotal < 5000 ? 5000 - cartItemsTotal : 0;

  const checkoutDisabled = loading || cart.length === 0 || total <= 0;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-left">
          <div className="cart-heading">
            <h1>Your Tea Cart</h1>

            {cart.length > 0 && (
              <span className="cart-count">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {error && <p className="error-text">{error}</p>}

          {loading && (
            <div className="cart-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          {!loading && cart.length === 0 && !error && (
            <div className="cart-empty">
              <div className="empty-icon">
                <i className="ti ti-shopping-cart-off"></i>
              </div>

              <h2>Your cart is empty</h2>
              <p>Looks like you have not added any tea products yet.</p>

              <button
                type="button"
                className="browse-btn"
                onClick={() => navigate("/")}
              >
                Browse Products
              </button>
            </div>
          )}

          <div className="cart-items">
            {cart.map((item, index) => (
              <div
                className="cart-item"
                key={item.productId}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className="item-image-box">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <i className="ti ti-leaf"></i>
                  )}
                </div>

                <div className="item-details">
                  <p className="item-name">{item.name}</p>

                  <p className="item-unit-price">
                    Rs. {item.price.toLocaleString()} each
                  </p>

                  <span className="stock-badge">In Stock</span>
                </div>

                <div className="item-right">
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(item.productId, item.quantity - 1)
                      }
                    >
                      <i className="ti ti-minus"></i>
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQty(item.productId, item.quantity + 1)
                      }
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>

                  <p className="item-total-price">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => openRemovePopup(item)}
                    title="Remove item"
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="cart-summary-box">
            <h2>Order Summary</h2>

            <div className="summary-lines">
              {cart.map((item) => (
                <div className="summary-line" key={item.productId}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="price-breakdown">
              <div>
                <span>Delivery Fee</span>

                <strong>
                  {deliveryFee === 0
                    ? "Free"
                    : `Rs. ${deliveryFee.toLocaleString()}`}
                </strong>
              </div>
            </div>

            {remainingForFreeDelivery > 0 && (
              <div className="free-delivery-note">
                Add Rs. {remainingForFreeDelivery.toLocaleString()} more to get
                free delivery.
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <span className="total-amount">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              className="checkout-btn"
              disabled={checkoutDisabled}
              onClick={() => navigate("/checkout")}
            >
              Secure Checkout
              <i className="ti ti-arrow-right"></i>
            </button>

            <button
              type="button"
              className="continue-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {removePopup.open && (
        <div className="remove-modal-overlay">
          <div className="remove-modal">
            <div className="remove-modal-icon">
              <i className="ti ti-trash"></i>
            </div>

            <h2>Remove Item?</h2>

            <p>
              Are you sure you want to remove{" "}
              <strong>{removePopup.productName}</strong> from your cart?
            </p>

            <div className="remove-modal-actions">
              <button
                type="button"
                className="cancel-remove"
                onClick={closeRemovePopup}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-remove"
                onClick={() => removeItem(removePopup.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;