import React from "react";
import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
        onError={(event) => {
          event.currentTarget.src = "/images/lak-isuru-logo.png";
        }}
      />

      <div className="product-content">
        <h3>{product.name}</h3>

        <p className="product-price">Rs. {product.price}</p>

        <p className="product-description">{product.description}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
