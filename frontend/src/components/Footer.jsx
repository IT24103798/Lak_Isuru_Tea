import "../styles/Footer.css";

const footerLinks = [
  { label: "About Us", url: "/#about" },
  { label: "Contact Us", url: "/#contact" },
];

const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com", icon: "f", className: "facebook" },
  { name: "TikTok", url: "https://www.tiktok.com", icon: "\u266B", className: "tiktok" },
  { name: "LinkedIn", url: "https://www.linkedin.com", icon: "in", className: "linkedin" },
  { name: "Instagram", url: "https://www.instagram.com", icon: "", className: "instagram" },
  { name: "YouTube", url: "https://www.youtube.com", icon: "", className: "youtube" },
  { name: "X", url: "https://x.com", icon: "X", className: "x" },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div>
        <h2>Follow Us</h2>
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

      <div className="footer-right">
        <nav className="footer-nav" aria-label="Footer navigation">
          {footerLinks.map((footerLink) => (
            <a href={footerLink.url} key={footerLink.label}>
              {footerLink.label}
            </a>
          ))}
        </nav>
        <p>&copy; Lak Isuru Tea 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
