import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Sidebar from "./components/Sidebar";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import MyReturns from "./pages/MyReturns";
import MyCancellations from "./pages/MyCancellations";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordOtp from "./pages/ResetPassword";
import ProductDetails from "./pages/ProductDetails";
import OrderSuccess from "./pages/OrderSuccess";

import AdminProducts from "./pages/admin/AdminProducts";
import AdminUsers from "./pages/admin/AdminUsers";

const sidebarRoutes = ["/profile", "/my-orders", "/my-returns", "/my-cancellations", "/payment-options"];

function App() {
  const location = useLocation();
  const showSidebar = sidebarRoutes.includes(location.pathname);

  return (
    <>
      <Navbar />

      {showSidebar ? (
        // ✅ Sidebar layout — only for /profile and /my-orders
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
            <Routes>
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/my-returns" element={<ProtectedRoute><MyReturns /></ProtectedRoute>} />
              <Route path="/my-cancellations" element={<ProtectedRoute><MyCancellations /></ProtectedRoute>} />
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
          

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/products/:id" element={<ProductDetails />} />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    )}

      <Chatbot />
      <Footer />
    </>
  );
}

export default App;
