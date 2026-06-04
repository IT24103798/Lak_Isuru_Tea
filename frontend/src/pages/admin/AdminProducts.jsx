import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../../services/productService";
import { productCatalog } from "../../data/productCatalog";
import "../../styles/AdminProducts.css";

const emptyForm = {
  name: "",
  category: productCatalog[0].category,
  subcategory: productCatalog[0].subcategories[0],
  price: "",
  stock: "",
  image: "",
  description: "",
  featuredOnHome: false,
};

const findCatalogGroup = (category) => {
  const normalizedCategory = String(category || "").trim().toLowerCase();

  return productCatalog.find(
    (group) => group.category.trim().toLowerCase() === normalizedCategory
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedCategoryGroup = findCatalogGroup(formData.category) || productCatalog[0];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data.products || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timerId = setTimeout(loadProducts, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category"
        ? {
            subcategory:
              findCatalogGroup(value)?.subcategories[0] || "",
          }
        : {}),
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProductId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      setSaving(true);

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    const catalogGroup = findCatalogGroup(product.category) || productCatalog[0];
    const savedSubcategory = product.subcategory || "";

    setEditingProductId(product._id);
    setFormData({
      name: product.name || "",
      category: catalogGroup.category,
      subcategory: catalogGroup.subcategories.includes(savedSubcategory)
        ? savedSubcategory
        : "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      description: product.description || "",
      featuredOnHome: Boolean(product.featuredOnHome),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);
      setMessage("Product deleted successfully.");
      await loadProducts();

      if (editingProductId === productId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  };

  const topSellingProducts = products
    .filter((product) => product.isTopSelling)
    .sort((firstProduct, secondProduct) => {
      return (secondProduct.soldQuantity || 0) - (firstProduct.soldQuantity || 0);
    });

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <div>
          <h1>Product Management</h1>
          <p>Add, read, update, and delete Lak Isuru Tea products from MongoDB.</p>
        </div>
      </div>

      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}

      <section className="admin-top-selling-card">
        <div className="admin-section-heading">
          <div>
            <h2>Top Selling Products</h2>
            <p>Calculated automatically from non-cancelled and non-returned orders.</p>
          </div>
        </div>

        {loading ? (
          <p className="admin-muted-text">Loading sales data...</p>
        ) : topSellingProducts.length === 0 ? (
          <p className="admin-muted-text">No sales data available yet.</p>
        ) : (
          <div className="top-selling-admin-grid">
            {topSellingProducts.map((product, index) => (
              <article className="top-selling-admin-item" key={product._id}>
                <span className="top-selling-rank">#{index + 1}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = "/images/lak-isuru-logo.png";
                  }}
                />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.soldQuantity || 0} sold</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-product-form-card">
        <h2>{editingProductId ? "Update Product" : "Add New Product"}</h2>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Premium Ceylon Black Tea"
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {productCatalog.map((group) => (
                <option value={group.category} key={group.category}>
                  {group.category}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subcategory
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
            >
              <option value="">No subcategory</option>
              {selectedCategoryGroup.subcategories.map((subcategory) => (
                <option value={subcategory} key={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price / Rs.
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              placeholder="1200"
              required
            />
          </label>

          <label>
            Stock Quantity
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="50"
              required
            />
          </label>

          <label className="full-width">
            Image URL
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/tea-image.jpg"
              required
            />
          </label>

          <label className="full-width">
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product details"
              rows="4"
              required
            />
          </label>

          <label className="admin-checkbox full-width">
            <input
              type="checkbox"
              name="featuredOnHome"
              checked={formData.featuredOnHome}
              onChange={handleChange}
            />
            Show on public home page
          </label>

          <div className="form-actions full-width">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
            </button>

            {editingProductId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-product-list-card">
        <h2>All Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found. Add your first product above.</p>
        ) : (
          <div className="admin-product-table-wrap">
            <table className="admin-product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Public Home</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = "/images/lak-isuru-logo.png";
                        }}
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <span>{product.description}</span>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.subcategory || "-"}</td>
                    <td>Rs. {product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      {product.isTopSelling && <span className="product-flag">Top selling</span>}
                      {product.featuredOnHome && <span className="product-flag">Shown by admin</span>}
                      {!product.isTopSelling && !product.featuredOnHome && "No"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminProducts;
