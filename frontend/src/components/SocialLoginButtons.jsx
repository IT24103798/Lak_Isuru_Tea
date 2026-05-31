import { useState } from "react";
import "../styles/SocialLogin.css";

const SocialLoginButtons = () => {
  const [message, setMessage] = useState("");

  const handleGoogleLogin = () => {
    setMessage("Google sign in is not connected yet.");
  };

  const handleFacebookLogin = () => {
    setMessage("Facebook sign in is not connected yet.");
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