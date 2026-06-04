import { NavLink } from "react-router-dom";
import "../styles/AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src="/images/lak-isuru-logo.png" alt="Lak Isuru Tea" />
        <h3>Admin Panel</h3>
        <p>Lak Isuru Tea</p>
      </div>

      <nav className="admin-sidebar-menu">
         <NavLink to="/admin/profile" className="admin-sidebar-link">
          <span>⚙️</span>
          Profile Settings
        </NavLink>

        
        <NavLink to="/admin/users" className="admin-sidebar-link">
          <span>👥</span>
          User Management
        </NavLink>

        <NavLink to="/admin/products" className="admin-sidebar-link">
          <span>🍃</span>
          Products
        </NavLink>

        <NavLink to="/admin/orders" className="admin-sidebar-link">
          <span>📦</span>
          Orders
        </NavLink>

        <NavLink to="/admin/reviews" className="admin-sidebar-link">
          <span>⭐</span>
          Reviews
        </NavLink>

       
      </nav>
    </aside>
  );
}

export default AdminSidebar;