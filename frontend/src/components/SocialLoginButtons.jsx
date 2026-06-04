import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase/firebase";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/SocialLogin.css";

const SocialLoginButtons = () => {
  const [message, setMessage] = useState("");
  const [loadingProvider, setLoadingProvider] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const loginWithBackend = async (payload) => {
    const { data } = await API.post("/users/social-login", payload);

    const loggedUser = {
      ...data.user,
      token: data.token,
    };

    login(loggedUser);

    if (loggedUser.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      setLoadingProvider("google");

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const payload = {
        name: user.displayName || "Google User",
        email: user.email,
        provider: "google",
        providerId: user.uid,
        photoURL: user.photoURL || "",
      };

      await loginWithBackend(payload);
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR:", error);
      console.log("BACKEND ERROR:", error.response?.data);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Google sign in failed."
      );
    } finally {
      setLoadingProvider("");
    }
  };

  const handleFacebookLogin = async () => {
    setMessage("");

    try {
      setLoadingProvider("facebook");

      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      const payload = {
        name: user.displayName || "Facebook User",
        email: user.email || `${user.uid}@facebook.local`,
        provider: "facebook",
        providerId: user.uid,
        photoURL: user.photoURL || "",
      };

      await loginWithBackend(payload);
    } catch (error) {
      console.log("FACEBOOK LOGIN ERROR:", error);
      console.log("BACKEND ERROR:", error.response?.data);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Facebook login failed. Please try again."
      );
    } finally {
      setLoadingProvider("");
    }
  };

  
  return (
    <div className="social-login-box">
      <div className="divider">
        <span>or continue with</span>
      </div>

      {message && <p className="social-message">{message}</p>}

      <button
        type="button"
        className="social-btn google"
        onClick={handleGoogleLogin}
        disabled={loadingProvider !== ""}
      >
        <span className="social-icon">G</span>
        {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
      </button>

      <button
        type="button"
        className="social-btn facebook"
        onClick={handleFacebookLogin}
        disabled={loadingProvider !== ""}
      >
        <span className="social-icon">f</span>
        {loadingProvider === "facebook"
          ? "Connecting..."
          : "Continue with Facebook"}
      </button>

      
    </div>
  );
};

export default SocialLoginButtons;