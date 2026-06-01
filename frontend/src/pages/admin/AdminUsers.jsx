import { useState, useEffect } from "react";
import API from "../../api/api";
import "../../styles/AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/users");
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        setSuccessMsg("User deleted successfully");
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${editingUser._id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive
      });
      setSuccessMsg("User updated successfully");
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="datetime-display">
        <span className="date-text">{datePart}</span>
        <span className="time-text">{timePart}</span>
      </div>
    );
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1>User Management</h1>
        
        <div className="user-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Users</span>
            <span className="stat-count">{users.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Admins</span>
            <span className="stat-count">
              {users.filter((u) => u.role === "admin").length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Customers</span>
            <span className="stat-count">
              {users.filter((u) => u.role === "customer").length}
            </span>
          </div>
        </div>
      </div>

      {successMsg && <div className="admin-success">{successMsg}</div>}
      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="status-indicator">
                      <span className={`status-dot ${user.isActive ? "active" : "inactive"}`}></span>
                      {user.isActive ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                    <div className="action-btns">
                      <button 
                        className="btn-icon edit" 
                        onClick={() => setEditingUser(user)}
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deleteHandler(user._id)}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div className="edit-user-modal">
          <div className="modal-content">
            <h2>Edit User</h2>
            <form onSubmit={saveEdit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editingUser.isActive} 
                  onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === "true"})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="admin-main-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;