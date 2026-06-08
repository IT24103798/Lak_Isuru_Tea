import { Link } from "react-router-dom";
import "../styles/Footer.css";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 8.4V6.9c0-.7.2-1.1 1.2-1.1h1.6V3.2C16 3.1 15 3 13.9 3c-2.4 0-4 1.5-4 4.2v1.2H7.2v3h2.7V21h3.2v-9.6h2.7l.4-3H14Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14.8 3c.3 2.3 1.6 3.7 3.9 3.9v3.1c-1.3.1-2.6-.3-3.8-1v5.7c0 2.9-2 5.3-5.1 5.3-2.7 0-4.7-1.8-4.7-4.5 0-3.1 2.6-5 5.6-4.4v3.2c-1.3-.4-2.4.2-2.4 1.3 0 .9.7 1.5 1.6 1.5 1.1 0 1.8-.7 1.8-2.1V3h3.1Z" />
  </svg>
);

const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com", icon: <FacebookIcon />, className: "facebook" },
  { name: "Instagram", url: "https://www.instagram.com", icon: "", className: "instagram" },
  { name: "TikTok", url: "https://www.tiktok.com", icon: <TikTokIcon />, className: "tiktok" },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <h2>Contact us</h2>
          <p>
            Isuru Products,
            <br />
            46/E/2, Thoranawila Junction,
            <br />
            Kesbewa, Sri Lanka.
          </p><br/>
          <p>
            <a href="tel:+94776356412">+94 77 635 6412</a>
          </p><br/>
          <p>
            <a href="mailto:luckisuru@gmail.com">luckisuru@gmail.com</a>
          </p>
        </div>

        <div className="footer-policies">
          <h2>Policies</h2>
          <nav className="footer-nav" aria-label="Policies">
            <Link to="/terms-and-conditions">Terms and Conditions</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/return-policy">Return Policy</Link>
          </nav>
        </div>

        <div className="footer-right">
          <h2>Follow us on</h2>
          <div className="footer-social-links">
            {socialLinks.map((socialLink) => (
              <a
                key={socialLink.name}
                href={socialLink.url}
                className={`footer-social-link ${socialLink.className}`}
                target="_blank"
                rel="noreferrer"
                aria-label={socialLink.name}
              >
                {socialLink.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <hr />
      <p>&copy; 2026 Isuru Products. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
