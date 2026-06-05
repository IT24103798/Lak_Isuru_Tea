import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
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
