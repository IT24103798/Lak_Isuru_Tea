/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import API from "../api/api";
import { useAuth } from "./AuthContext";
import { getAllProducts, getProductById, getRelatedProducts } from "../services/productService";

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { userInfo } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartError, setCartError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [cancellations, setCancellations] = useState([]);
  const [cancellationsLoaded, setCancellationsLoaded] = useState(false);
  const [cancellationsError, setCancellationsError] = useState("");
  const [productDetailsById, setProductDetailsById] = useState({});
  const [relatedProductsById, setRelatedProductsById] = useState({});
  const productsRequestRef = useRef(null);
  const cartRequestRef = useRef(null);
  const profileRequestRef = useRef(null);
  const addressesRequestRef = useRef(null);
  const ordersRequestRef = useRef(null);
  const cancellationsRequestRef = useRef(null);
  const productRequestRefs = useRef({});
  const activeCustomerRef = useRef("");

  const loadProducts = useCallback(async ({ force = false } = {}) => {
    if (!force && productsRequestRef.current) {
      return productsRequestRef.current;
    }

    const request = getAllProducts()
      .then((data) => {
        const nextProducts = data.products || [];

        setProducts(nextProducts);
        setProductsLoaded(true);
        setProductsError("");

        return nextProducts;
      })
      .catch((error) => {
        setProductsLoaded(true);
        setProductsError("Failed to load products. Please try again.");
        throw error;
      })
      .finally(() => {
        productsRequestRef.current = null;
      });

    productsRequestRef.current = request;
    return request;
  }, []);

  const loadCart = useCallback(async ({ force = false } = {}) => {
    if (!force && cartRequestRef.current) {
      return cartRequestRef.current;
    }

    const request = API.get("/cart")
      .then(({ data }) => {
        const nextCart = data.cart || [];

        setCart(nextCart);
        setCartLoaded(true);
        setCartError("");

        return nextCart;
      })
      .catch((error) => {
        setCartLoaded(true);
        setCartError("Failed to load cart.");
        throw error;
      })
      .finally(() => {
        cartRequestRef.current = null;
      });

    cartRequestRef.current = request;
    return request;
  }, []);

  const loadProductDetails = useCallback(async (productId, { force = false } = {}) => {
    if (!force && productDetailsById[productId]) {
      return productDetailsById[productId];
    }

    if (!force && productRequestRefs.current[productId]) {
      return productRequestRefs.current[productId];
    }

    const request = getProductById(productId)
      .then(async (data) => {
        const nextProduct = data.product;

        setProductDetailsById((currentProducts) => ({
          ...currentProducts,
          [productId]: nextProduct,
        }));

        try {
          const relatedData = await getRelatedProducts(productId);

          setRelatedProductsById((currentProducts) => ({
            ...currentProducts,
            [productId]: relatedData.products || [],
          }));
        } catch {
          setRelatedProductsById((currentProducts) => ({
            ...currentProducts,
            [productId]: [],
          }));
        }

        return nextProduct;
      })
      .finally(() => {
        delete productRequestRefs.current[productId];
      });

    productRequestRefs.current[productId] = request;
    return request;
  }, [productDetailsById]);

  const updateCart = useCallback((updater) => {
    setCart((currentCart) =>
      typeof updater === "function" ? updater(currentCart) : updater
    );
    setCartLoaded(true);
  }, []);

  const loadProfile = useCallback(async ({ force = false } = {}) => {
    if (!force && profileRequestRef.current) {
      return profileRequestRef.current;
    }

    const request = API.get("/users/profile")
      .then(({ data }) => {
        setProfile(data.user);
        setProfileLoaded(true);
        setProfileError("");

        return data.user;
      })
      .catch((error) => {
        setProfileLoaded(true);
        setProfileError("Failed to load profile. Please login again.");
        throw error;
      })
      .finally(() => {
        profileRequestRef.current = null;
      });

    profileRequestRef.current = request;
    return request;
  }, []);

  const updateProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
    setProfileLoaded(true);
    setProfileError("");
  }, []);

  const loadAddresses = useCallback(async ({ force = false } = {}) => {
    if (!force && addressesRequestRef.current) {
      return addressesRequestRef.current;
    }

    const request = API.get("/addresses")
      .then(({ data }) => {
        const nextAddresses = data.addresses || data || [];

        setAddresses(nextAddresses);
        setAddressesLoaded(true);
        setAddressesError("");

        return nextAddresses;
      })
      .catch((error) => {
        setAddressesLoaded(true);
        setAddressesError("Failed to load addresses.");
        throw error;
      })
      .finally(() => {
        addressesRequestRef.current = null;
      });

    addressesRequestRef.current = request;
    return request;
  }, []);

  const loadOrders = useCallback(async ({ force = false, forceFresh = false } = {}) => {
    if (!force && !forceFresh && ordersRequestRef.current) {
      return ordersRequestRef.current;
    }

    const request = API.get("/orders", {
      headers: forceFresh
        ? {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          }
        : undefined,
      params: forceFresh ? { refresh: Date.now() } : undefined,
    })
      .then(({ data }) => {
        const nextOrders = data.orders || [];

        setOrders(nextOrders);
        setOrdersLoaded(true);
        setOrdersError("");

        return nextOrders;
      })
      .catch((error) => {
        setOrdersLoaded(true);
        setOrdersError("Failed to load orders. Please login again.");
        throw error;
      })
      .finally(() => {
        ordersRequestRef.current = null;
      });

    ordersRequestRef.current = request;
    return request;
  }, []);

  const loadCancellations = useCallback(async ({ force = false, forceFresh = false } = {}) => {
    if (!force && !forceFresh && cancellationsRequestRef.current) {
      return cancellationsRequestRef.current;
    }

    const request = API.get("/orders/cancellations", {
      headers: forceFresh
        ? {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          }
        : undefined,
      params: forceFresh ? { refresh: Date.now() } : undefined,
    })
      .then(({ data }) => {
        const nextCancellations = data.cancellations || [];

        setCancellations(nextCancellations);
        setCancellationsLoaded(true);
        setCancellationsError("");

        return nextCancellations;
      })
      .catch((error) => {
        setCancellationsLoaded(true);
        setCancellationsError("Failed to load cancellations. Please login again.");
        throw error;
      })
      .finally(() => {
        cancellationsRequestRef.current = null;
      });

    cancellationsRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    loadProducts().catch(() => {});
  }, [loadProducts]);

  useEffect(() => {
    const currentCustomerId =
      userInfo && userInfo.role !== "admin" ? userInfo._id || userInfo.id || "" : "";

    if (activeCustomerRef.current !== currentCustomerId) {
      activeCustomerRef.current = currentCustomerId;

      Promise.resolve().then(() => {
        setCart([]);
        setCartLoaded(false);
        setCartError("");
        setProfile(null);
        setProfileLoaded(false);
        setProfileError("");
        setAddresses([]);
        setAddressesLoaded(false);
        setAddressesError("");
        setOrders([]);
        setOrdersLoaded(false);
        setOrdersError("");
        setCancellations([]);
        setCancellationsLoaded(false);
        setCancellationsError("");
      });
    }

    if (!userInfo || userInfo.role === "admin") {
      return;
    }

    loadCart({ force: true }).catch(() => {});
    loadProfile({ force: true }).catch(() => {});
    loadAddresses({ force: true }).catch(() => {});
    loadOrders({ force: true }).catch(() => {});
    loadCancellations({ force: true }).catch(() => {});
  }, [loadAddresses, loadCancellations, loadCart, loadOrders, loadProfile, userInfo]);

  const value = useMemo(
    () => ({
      products,
      productsLoaded,
      productsError,
      loadProducts,
      cart,
      cartLoaded,
      cartError,
      loadCart,
      updateCart,
      profile,
      profileLoaded,
      profileError,
      loadProfile,
      updateProfile,
      addresses,
      addressesLoaded,
      addressesError,
      loadAddresses,
      orders,
      ordersLoaded,
      ordersError,
      loadOrders,
      cancellations,
      cancellationsLoaded,
      cancellationsError,
      loadCancellations,
      productDetailsById,
      relatedProductsById,
      loadProductDetails,
    }),
    [
      products,
      productsLoaded,
      productsError,
      loadProducts,
      cart,
      cartLoaded,
      cartError,
      loadCart,
      updateCart,
      profile,
      profileLoaded,
      profileError,
      loadProfile,
      updateProfile,
      addresses,
      addressesLoaded,
      addressesError,
      loadAddresses,
      orders,
      ordersLoaded,
      ordersError,
      loadOrders,
      cancellations,
      cancellationsLoaded,
      cancellationsError,
      loadCancellations,
      productDetailsById,
      relatedProductsById,
      loadProductDetails,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
