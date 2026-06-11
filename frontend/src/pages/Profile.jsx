import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../context/AuthContext";
import {
  getProfilePhotoStorageKey,
  getStoredProfilePhoto,
  notifyProfilePhotoChange,
} from "../utils/profilePhotoStorage";
import "../styles/Profile.css";

const PhoneInput = PhoneInputModule.default || PhoneInputModule;

const formatPhoneForInput = (phone) => {
  if (!phone) return "";

  let cleaned = String(phone).replace(/\D/g, "");

  // Convert old Sri Lankan local format: 0721446073 → 94721446073
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = `94${cleaned.substring(1)}`;
  }

  return cleaned;
};

const formatPhoneForSave = (phone) => {
  const cleaned = String(phone).replace(/\D/g, "");
  return cleaned ? `+${cleaned}` : "";
};

const Profile = () => {
  const { userInfo, login } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(
    () => getStoredProfilePhoto(userInfo)
  );
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const profilePhotoInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");

        const userData = data.user || data;

        const loadedProfile = {
          name: userData.name || userInfo?.name || "",
          email: userData.email || userInfo?.email || "",
          phone: formatPhoneForInput(userData.phone || userInfo?.phone || ""),
          address: userData.address || userInfo?.address || "",
        };

        setProfile(loadedProfile);
        const loadedProfilePhoto = userData.profileImage || getStoredProfilePhoto(userData);

        setProfilePhoto(loadedProfilePhoto);
        if (loadedProfilePhoto) {
          localStorage.setItem(getProfilePhotoStorageKey(userData), loadedProfilePhoto);
        }
        setError("");
      } catch {
        setError("Failed to load profile. Please login again.");

        setProfile({
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          phone: formatPhoneForInput(userInfo?.phone || ""),
          address: userInfo?.address || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      phone: value,
    }));
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const imageData = reader.result;

      setProfilePhoto(imageData);
      localStorage.setItem(getProfilePhotoStorageKey(userInfo), imageData);
      notifyProfilePhotoChange();

      try {
        const { data } = await API.put("/users/profile", {
          name: profile.name.trim() || userInfo?.name || "User",
          phone: formatPhoneForSave(profile.phone || userInfo?.phone || ""),
          address: profile.address,
          profileImage: imageData,
        });
        const updatedUser = data.user || data;

        if (data.token && login) {
          login({
            ...updatedUser,
            token: data.token,
          });
        }

        setSuccess("Profile photo updated successfully.");
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update profile photo.");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePhoto = async () => {
    setProfilePhoto("");
    setIsPhotoViewerOpen(false);
    localStorage.removeItem(getProfilePhotoStorageKey(userInfo));
    notifyProfilePhotoChange();

    try {
      const { data } = await API.put("/users/profile", {
        name: profile.name.trim() || userInfo?.name || "User",
        phone: formatPhoneForSave(profile.phone || userInfo?.phone || ""),
        address: profile.address,
        profileImage: "",
      });
      const updatedUser = data.user || data;

      if (data.token && login) {
        login({
          ...updatedUser,
          token: data.token,
        });
      }

      setSuccess("Profile photo removed successfully.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove profile photo.");
    }

    if (profilePhotoInputRef.current) {
      profilePhotoInputRef.current.value = "";
    }
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

    const cleanedPhone = String(profile.phone).replace(/\D/g, "");

    if (!/^[0-9]{7,15}$/.test(cleanedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setUpdating(true);

      const updateData = {
        name: profile.name.trim(),
        phone: formatPhoneForSave(profile.phone),
        address: profile.address,
        profileImage: profilePhoto,
      };

      const { data } = await API.put("/users/profile", updateData);

      const updatedUser = data.user || data;

      const updatedProfile = {
        name: updatedUser.name || profile.name,
        email: updatedUser.email || profile.email,
        phone: formatPhoneForInput(updatedUser.phone || updateData.phone),
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
          <div className="profile-photo-wrap">
            <button
              type="button"
              className="profile-avatar profile-photo-button"
              onClick={() => profilePhoto && setIsPhotoViewerOpen(true)}
              aria-label={profilePhoto ? "View profile photo" : "Profile photo placeholder"}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <span>{profile.name ? profile.name.charAt(0).toUpperCase() : "U"}</span>
              )}
            </button>
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/*"
              className="profile-photo-input"
              onChange={handleProfilePhotoChange}
              aria-label="Choose profile photo"
            />
            <div className="profile-photo-actions">
              <button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                {profilePhoto ? "Change" : "Add photo"}
              </button>
              {profilePhoto && (
                <button type="button" onClick={handleDeleteProfilePhoto}>
                  Delete
                </button>
              )}
            </div>
          </div>

          {isPhotoViewerOpen && profilePhoto && (
            <div
              className="profile-photo-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Profile photo preview"
              onClick={() => setIsPhotoViewerOpen(false)}
            >
              <div className="profile-photo-modal-card" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="profile-photo-modal-close"
                  onClick={() => setIsPhotoViewerOpen(false)}
                  aria-label="Close profile photo preview"
                >
                  x
                </button>
                <img src={profilePhoto} alt="Profile preview" />
              </div>
            </div>
          )}

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
                  {profile.phone
                    ? `+${String(profile.phone).replace(/\D/g, "")}`
                    : "Not added"}
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
                countryCodeEditable={true}
                inputClass="custom-phone-input"
                buttonClass="custom-phone-button"
                dropdownClass="custom-phone-dropdown"
                placeholder="Enter phone number"
              />
              <small className="profile-help-text">
                Select country code and enter your phone number.
              </small>
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
