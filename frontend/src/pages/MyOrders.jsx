import { useEffect, useState } from "react";
import API from "../api/api";

const MyOrders = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");
        setProfile(data.user);
      } catch (error) {
        setError("Please login again");
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="page">
      <h1>My Orders</h1>

      {error && <p className="error-text">{error}</p>}

      {profile && (
        <div className="profile-box">
          <h3>Customer Details</h3>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
        </div>
      )}

      <p>Your orders will appear here after you place an order.</p>
    </div>
  );
};

export default MyOrders;