import { useEffect, useState } from "react";
import API from "../api/api";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const Profile = () => {
  const { userInfo, login } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");

        const loadedProfile = {
          name: data.name || data.user?.name || userInfo?.name || "",
          email: data.email || data.user?.email || userInfo?.email || "",
          phone:
            data.phone?.replace("+", "") ||
            data.user?.phone?.replace("+", "") ||
            "",
          address: data.address || data.user?.address || "",
        };

        setProfile(loadedProfile);
        setError("");
      } catch (err) {
        setError("Failed to load profile. Please login again.");

        setProfile({
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          phone: userInfo?.phone ? userInfo.phone.replace("+", "") : "",
          address: userInfo?.address || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userInfo]);

  const handleChange = (e) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (value) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      phone: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!profile.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!profile.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{7,15}$/.test(profile.phone)) {
      setError("Phone number must be valid.");
      return;
    }

    try {
      setUpdating(true);

      const updateData = {
        name: profile.name,
        phone: `+${profile.phone}`,
        address: profile.address,
      };

      const { data } = await API.put("/users/profile", updateData);

      const updatedUser = data.user || data;

      const updatedProfile = {
        name: updatedUser.name || profile.name,
        email: updatedUser.email || profile.email,
        phone: updatedUser.phone
          ? updatedUser.phone.replace("+", "")
          : profile.phone,
        address: updatedUser.address || profile.address,
      };

      setProfile(updatedProfile);

      if (data.token && login) {
        login({
          ...updatedUser,
          token: data.token,
        });
      }

      setSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
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
            onClick={() => {
              setError("");
              setSuccess("");
              setEditMode(!editMode);
            }}
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
                <p className="profile-value">
                  {profile.phone ? `+${profile.phone}` : "Not added"}
                </p>
              </div>
            </div>

            <div className="profile-detail-row">
              <div className="profile-detail-icon">
                <i className="ti ti-map-pin"></i>
              </div>
              <div>
                <p className="profile-label">Address</p>
                <p className="profile-value">
                  {profile.address || "Not added"}
                </p>
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
                placeholder="Enter your email"
                disabled
              />
              <small className="profile-help-text">
                Email address cannot be changed.
              </small>
            </div>

            <div className="profile-form-group">
              <label>Phone Number</label>
              <PhoneInput
                country="lk"
                value={profile.phone}
                onChange={handlePhoneChange}
                enableSearch={true}
                disableSearchIcon={true}
                countryCodeEditable={false}
                inputClass="custom-phone-input"
                buttonClass="custom-phone-button"
                dropdownClass="custom-phone-dropdown"
                placeholder="Enter phone number"
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
              <button
                type="submit"
                className="profile-save-btn"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditMode(false);
                }}
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