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
import ProductDetails from "./pages/ProductDetails";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";

import MyOrders from "./pages/MyOrders";
import MyReturns from "./pages/MyReturns";
import MyCancellations from "./pages/MyCancellations";
import Profile from "./pages/Profile";

import AdminLayout from "./layouts/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";

const sidebarRoutes = [
  "/profile-settings",
  "/my-orders",
  "/my-returns",
  "/my-cancellations",
];

function App() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");
  const showSidebar = sidebarRoutes.includes(location.pathname);

  return (
    <>
      {!isAdminPage && <Navbar />}

      {showSidebar && !isAdminPage ? (
        <div style={{ display: "flex" }}>
          <Sidebar />

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
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-returns"
                element={
                  <ProtectedRoute>
                    <MyReturns />
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
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPasswordOtp />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Customer protected pages without sidebar */}
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

            {/* Admin pages */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOrders />} />
              <Route path="dashboard" element={<AdminOrders />} />
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
      <Chatbot />
    </>
  );
}

export default App;