import { useEffect, useLayoutEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordOtp from "./pages/ResetPassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import PolicyPage from "./pages/PolicyPage";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";

import MyOrders from "./pages/MyOrders";
import MyCancellations from "./pages/MyCancellations";
import Profile from "./pages/Profile";
import AddressBook from "./pages/AddressBook";
import Favorites from "./pages/Favorites";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";

const sidebarRoutes = [
  "/profile-settings",
  "/address-book",
  "/my-orders",
  "/my-cancellations",
];

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash]);

  return null;
};

function App() {
  const location = useLocation();
  const [sidebarOpenPath, setSidebarOpenPath] = useState(null);

  const isAdminPage = location.pathname.startsWith("/admin");
  const showSidebar = sidebarRoutes.includes(location.pathname);
  const isSidebarOpen = sidebarOpenPath === location.pathname;

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && <Navbar />}

      {showSidebar && !isAdminPage ? (
        <div className="account-shell">
          <button
            type="button"
            className={`mobile-sidebar-toggle ${isSidebarOpen ? "is-hidden" : ""}`}
            onClick={() =>
              setSidebarOpenPath(isSidebarOpen ? null : location.pathname)
            }
            aria-expanded={isSidebarOpen}
          >
            <i className={`ti ${isSidebarOpen ? "ti-x" : "ti-menu-2"}`}></i>
            Menu
          </button>

          {isSidebarOpen && (
            <button
              type="button"
              className="sidebar-drawer-backdrop"
              aria-label="Close account menu"
              onClick={() => setSidebarOpenPath(null)}
            />
          )}

          <div className={`sidebar-drawer ${isSidebarOpen ? "open" : ""}`}>
            <button
              type="button"
              className="sidebar-drawer-close"
              aria-label="Close account menu"
              onClick={() => setSidebarOpenPath(null)}
            >
              <i className="ti ti-x"></i>
            </button>
            <Sidebar />
          </div>

          <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
            <Routes>
              <Route
                path="/profile-settings"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/address-book"
                element={
                  <ProtectedRoute>
                    <AddressBook />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-cancellations"
                element={
                  <ProtectedRoute>
                    <MyCancellations />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="main-content" style={{ width: "100%" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPasswordOtp />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/terms-and-conditions"
              element={<PolicyPage type="terms-and-conditions" />}
            />
            <Route path="/privacy-policy" element={<PolicyPage type="privacy-policy" />} />
            <Route path="/return-policy" element={<PolicyPage type="return-policy" />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Routes>
        </main>
      )}

      {!isAdminPage && <Footer />}
      {!isAdminPage && <Chatbot />}
    </>
  );
}

export default App;
