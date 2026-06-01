import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <div>
            <h1>Order Confirmed</h1>
            <p>Your order was placed successfully. Thank you for shopping with Lak Isuru Tea.</p>
          </div>
        </div>

        <div className="order-success-card">
          <p>We are preparing your order and will notify you once it is dispatched.</p>
          <button type="button" className="checkout-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <button type="button" className="checkout-btn" onClick={() => navigate("/my-orders")}> 
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
