import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import "../styles/SocialLogin.css";
import { auth, googleProvider, facebookProvider } from "../firebase/firebase";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";


const SocialLoginButtons = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const payload = {
        name: user.displayName || "",
        email: user.email || "",
        provider: "google",
        providerId: user.uid,
        photoURL: user.photoURL || "",
      };

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
    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage(err?.response?.data?.message || "Google sign in failed.");
    }
  };

  const handleFacebookLogin = async () => {
  setMessage("");

  try {
    setLoading(true);

    const result = await signInWithPopup(auth, facebookProvider);
    const firebaseUser = result.user;

    const { data } = await API.post("/users/social-login", {
      name: firebaseUser.displayName || "Facebook User",
      email: firebaseUser.email,
      provider: "facebook",
      providerId: firebaseUser.uid,
      photoURL: firebaseUser.photoURL,
    });

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
  } catch (error) {
    console.log("FACEBOOK LOGIN ERROR:", error);
    console.log("BACKEND ERROR:", error.response?.data);

    setMessage(
      error.response?.data?.message ||
        error.message ||
        "Facebook login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  const handleAppleLogin = () => {
    setMessage("Apple sign in is not connected yet.");
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
      >
        <span className="social-icon">G</span>
        Continue with Google
      </button>

      <button
        type="button"
        className="social-btn facebook"
        onClick={handleFacebookLogin}
      >
        <span className="social-icon">f</span>
        Continue with Facebook
      </button>

      <button
        type="button"
        className="social-btn apple"
        onClick={handleAppleLogin}
      >
        <span className="social-icon">Apple</span>
        Continue with Apple
      </button>
    </div>
  );
};

export default SocialLoginButtons;