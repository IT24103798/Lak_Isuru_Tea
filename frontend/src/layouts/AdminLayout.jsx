import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-layout-main">
        <Navbar />

        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;