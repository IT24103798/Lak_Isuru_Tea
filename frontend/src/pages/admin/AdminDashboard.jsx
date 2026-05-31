import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p>Welcome to Luck Isru Tea admin panel.</p>

      <div className="admin-cards">
        <Link to="/admin/products" className="admin-card">
          <h3>Products</h3>
          <p>Manage tea products</p>
        </Link>

        <div className="admin-card" id="orders">
          <h3>Orders</h3>
          <p>View and update customer orders</p>
        </div>

        <div className="admin-card" id="messages">
          <h3>Messages</h3>
          <p>View customer contact messages</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
