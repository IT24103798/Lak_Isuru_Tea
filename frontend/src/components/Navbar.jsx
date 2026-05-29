import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuth();

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Luck Isru Tea
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/my-orders">My Orders</Link>

        {userInfo ? (
          <>
            <span className="user-name">Hi, {userInfo.name}</span>
            <button className="logout-btn" onClick={logoutHandler}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;