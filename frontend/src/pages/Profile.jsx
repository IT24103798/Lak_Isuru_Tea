import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const Profile = () => {
  const { userInfo } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");

        setProfile({
          name: data.name || userInfo?.name || "",
          email: data.email || userInfo?.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });

        setError("");
      } catch (err) {
        setError("Failed to load profile. Please login again.");

        setProfile({
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          phone: "",
          address: "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userInfo]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      const { data } = await API.put("/users/profile", profile);

      setProfile({
        name: data.name || profile.name,
        email: data.email || profile.email,
        phone: data.phone || profile.phone,
        address: data.address || profile.address,
      });

      setSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="profile-info">
            <h2>{profile.name || "User"}</h2>
            <p>{profile.email}</p>
          </div>

          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {!editMode ? (
          <div className="profile-details">
            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <i className="ti ti-user"></i>
              </div>
              <div>
                <p className="profile-label">Full Name</p>
                <p className="profile-value">{profile.name || "Not added"}</p>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <i className="ti ti-mail"></i>
              </div>
              <div>
                <p className="profile-label">Email Address</p>
                <p className="profile-value">{profile.email || "Not added"}</p>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <i className="ti ti-phone"></i>
              </div>
              <div>
                <p className="profile-label">Phone Number</p>
                <p className="profile-value">{profile.phone || "Not added"}</p>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <i className="ti ti-map-pin"></i>
              </div>
              <div>
                <p className="profile-label">Address</p>
                <p className="profile-value">{profile.address || "Not added"}</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleUpdate}>
            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="profile-form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="4"
              ></textarea>
            </div>

            <div className="profile-actions">
              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;