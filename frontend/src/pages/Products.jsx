import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { productCatalog } from "../data/productCatalog";
import "../styles/Home.css";

const sortTopSellingFirst = (productList) => {
  return [...productList].sort((firstProduct, secondProduct) => {
    if (firstProduct.isTopSelling && !secondProduct.isTopSelling) {
      return -1;
    }

    if (!firstProduct.isTopSelling && secondProduct.isTopSelling) {
      return 1;
    }

    if (firstProduct.isTopSelling && secondProduct.isTopSelling) {
      return (secondProduct.soldQuantity || 0) - (firstProduct.soldQuantity || 0);
    }

    return 0;
  });
};

const teaTypeOptions = productCatalog
  .filter((group) => ["Black Tea", "Green Tea", "Flavoured Tea"].includes(group.category))
  .map((group) => group.category);

const flavorOptions =
  productCatalog.find((group) => group.category === "Flavoured Tea")?.subcategories || [];

const spiceOptions =
  productCatalog.find((group) => group.category === "Spices")?.subcategories || [];

const teaGiftOptions =
  productCatalog.find((group) => group.category === "Tea Gifts")?.subcategories || [];

const teaFormOptions = ["Tea Bags", "Loose Tea"];

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

function Products() {
  const { userInfo } = useAuth();
  const {
    products,
    productsLoaded,
    productsError,
    loadProducts,
  } = useAppData();
  const [searchParams] = useSearchParams();
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const isCustomerUser = userInfo && userInfo.role !== "admin";
  const customerId = userInfo?._id || userInfo?.id;
  const wishlistStorageKey = getCustomerStorageKey("lakIsuruWishlist", customerId);

  const searchTerm = searchParams.get("search") || "";
  const [selectedTeaType, setSelectedTeaType] = useState(
    searchParams.get("category") || ""
  );
  const [selectedFlavor, setSelectedFlavor] = useState(searchParams.get("subcategory") || "");
  const [selectedTeaForm, setSelectedTeaForm] = useState("");
  const [selectedSpice, setSelectedSpice] = useState("");
  const [selectedTeaGift, setSelectedTeaGift] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  useEffect(() => {
    if (!productsLoaded) {
      loadProducts().catch(() => {});
    }
  }, [loadProducts, productsLoaded]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setWishlistProductIds(
        isCustomerUser ? readStoredArray(wishlistStorageKey) : []
      );
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCustomerUser, wishlistStorageKey]);

  const toggleWishlistProduct = (productId) => {
    const nextWishlistIds = wishlistProductIds.includes(productId)
      ? wishlistProductIds.filter((savedProductId) => savedProductId !== productId)
      : [productId, ...wishlistProductIds].slice(0, 12);

    setWishlistProductIds(nextWishlistIds);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(nextWishlistIds));
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const normalizedTeaType = selectedTeaType.trim().toLowerCase();
  const normalizedFlavor = selectedFlavor.trim().toLowerCase();
  const normalizedTeaForm = selectedTeaForm.trim().toLowerCase();
  const normalizedSpice = selectedSpice.trim().toLowerCase();
  const normalizedTeaGift = selectedTeaGift.trim().toLowerCase();

  const emptyProductsMessage = (() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (trimmedSearchTerm) {
      return `No products found for "${trimmedSearchTerm}".`;
    }

    if (selectedTeaType) {
      return `No products found in "${selectedTeaType}".`;
    }

    return "No matching products found.";
  })();

  const visibleProducts = sortTopSellingFirst(products);
  const selectedFilters = [
    {
      label: "Tea type",
      value: selectedTeaType,
      onClear: () => setSelectedTeaType(""),
    },
    {
      label: "Tea form",
      value: selectedTeaForm,
      onClear: () => setSelectedTeaForm(""),
    },
    {
      label: "Flavor",
      value: selectedFlavor,
      onClear: () => setSelectedFlavor(""),
    },
    {
      label: "Spices",
      value: selectedSpice,
      onClear: () => setSelectedSpice(""),
    },
    {
      label: "Tea Gifts",
      value: selectedTeaGift,
      onClear: () => setSelectedTeaGift(""),
    },
  ].filter((filter) => filter.value);

  const filteredProducts = visibleProducts.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.subcategory,
      product.teaForm,
      product.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const productName = (product.name || "").trim().toLowerCase();
    const matchesSearch =
      !normalizedSearchTerm || productName.includes(normalizedSearchTerm);
    const matchesTeaType =
      !normalizedTeaType ||
      (product.category || "").trim().toLowerCase() === normalizedTeaType;
    const matchesFlavor =
      !normalizedFlavor ||
      (product.subcategory || "").trim().toLowerCase() === normalizedFlavor ||
      searchableText.includes(normalizedFlavor);
    const matchesTeaForm =
      !normalizedTeaForm ||
      (product.teaForm || "").trim().toLowerCase() === normalizedTeaForm ||
      searchableText.includes(normalizedTeaForm) ||
      (normalizedTeaForm === "loose tea" &&
        ["op", "bop", "bopf", "fp", "dust", "packets"].some((keyword) =>
          searchableText.includes(keyword)
        ));
    const matchesSpice =
      !normalizedSpice ||
      (product.subcategory || "").trim().toLowerCase() === normalizedSpice ||
      searchableText.includes(normalizedSpice);
    const matchesTeaGift =
      !normalizedTeaGift ||
      (product.subcategory || "").trim().toLowerCase() === normalizedTeaGift ||
      searchableText.includes(normalizedTeaGift);
    const matchesStock = !showInStockOnly || Number(product.stock || 0) > 0;

    return (
      matchesSearch &&
      matchesTeaType &&
      matchesFlavor &&
      matchesTeaForm &&
      matchesSpice &&
      matchesTeaGift &&
      matchesStock
    );
  });

  return (
    <div className="home-page">
      <section className="products-section" id="products">
        <div className="product-filter-bar" aria-label="Product filters">
          <select
            className="product-filter-select"
            value=""
            onChange={(event) => setSelectedTeaType(event.target.value)}
            aria-label="Tea type"
          >
            <option value="">Tea type</option>
            {teaTypeOptions.map((teaType) => (
              <option value={teaType} key={teaType}>
                {teaType}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value=""
            onChange={(event) => setSelectedTeaForm(event.target.value)}
            aria-label="Tea form"
          >
            <option value="">Tea form</option>
            {teaFormOptions.map((teaForm) => (
              <option value={teaForm} key={teaForm}>
                {teaForm}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value=""
            onChange={(event) => setSelectedFlavor(event.target.value)}
            aria-label="Flavor"
          >
            <option value="">Flavor</option>
            {flavorOptions.map((flavor) => (
              <option value={flavor} key={flavor}>
                {flavor}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value=""
            onChange={(event) => setSelectedSpice(event.target.value)}
            aria-label="Spices"
          >
            <option value="">Spices</option>
            {spiceOptions.map((spice) => (
              <option value={spice} key={spice}>
                {spice}
              </option>
            ))}
          </select>

          <select
            className="product-filter-select"
            value=""
            onChange={(event) => setSelectedTeaGift(event.target.value)}
            aria-label="Tea gifts"
          >
            <option value="">Tea Gifts</option>
            {teaGiftOptions.map((teaGift) => (
              <option value={teaGift} key={teaGift}>
                {teaGift}
              </option>
            ))}
          </select>

          <label className="product-stock-toggle">
            <span>In stock</span>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(event) => setShowInStockOnly(event.target.checked)}
            />
            <span className="product-stock-switch" aria-hidden="true" />
          </label>
        </div>

        {selectedFilters.length > 0 && (
          <div className="selected-filter-bar" aria-label="Selected filters">
            {selectedFilters.map((filter) => (
              <button
                type="button"
                className="selected-filter-chip"
                key={`${filter.label}-${filter.value}`}
                onClick={filter.onClear}
                aria-label={`Remove ${filter.label} ${filter.value} filter`}
              >
                <span>{filter.label}</span>
                <strong>{filter.value}</strong>
                <i aria-hidden="true">x</i>
              </button>
            ))}
          </div>
        )}

        {productsError && <p className="error-message">{productsError}</p>}

        {productsLoaded && !productsError && visibleProducts.length === 0 && (
          <p className="status-message">No products available yet.</p>
        )}

        {productsLoaded && !productsError && visibleProducts.length > 0 && filteredProducts.length === 0 && (
          <p className="status-message">{emptyProductsMessage}</p>
        )}

        {!productsError && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                product={product}
                key={product._id}
                showFavorite={Boolean(isCustomerUser)}
                isFavorite={wishlistProductIds.includes(product._id)}
                onToggleFavorite={toggleWishlistProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Products;
