import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PolicyPages.css";

const policyContent = {
  "terms-and-conditions": {
    title: "Terms and Conditions",
    intro:
      "These terms explain the basic rules for using Lak Isuru Tea, creating an account, and placing orders through our website.",
    sections: [
      ["Orders", "Customers are responsible for providing accurate account, delivery, and contact information when placing an order."],
      ["Payments", "Orders must be paid through the available payment methods shown during checkout. Payment confirmation may be required before dispatch."],
      ["Account Use", "Customers should keep login details private and notify us if they suspect unauthorized account activity."],
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro:
      "This policy describes how Lak Isuru Tea handles customer information used for accounts, orders, delivery, support, and service improvement.",
    sections: [
      ["Information We Collect", "We may collect your name, email address, phone number, delivery address, order details, and account activity needed to provide our services."],
      ["How We Use Information", "Customer information is used to process orders, deliver products, provide support, manage accounts, and improve the shopping experience."],
      ["Data Protection", "We use reasonable care to protect customer information and do not sell customer personal details."],
    ],
  },
  "return-policy": {
    title: "Return Policy",
    intro:
      "This policy explains the general conditions for returns, returned orders, and refund handling for Lak Isuru Tea purchases.",
    sections: [
      ["Return Eligibility", "Returns may be reviewed for delivered items that are damaged, incorrect, or otherwise eligible based on order status and product condition."],
      ["Return Review", "Return requests may require order details, product condition information, and confirmation from our team before being accepted."],
      ["Refunds", "If a return is approved and payment was already completed, refund handling will follow the payment method and order review outcome."],
    ],
  },
};

const PolicyPage = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const policy = policyContent[type] || policyContent["terms-and-conditions"];
  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="policy-page">
      <main className="policy-wrap">
        <button type="button" className="policy-back-link" onClick={goBack}>
          <span aria-hidden="true">←</span>
          <span className="sr-only">Go back</span>
        </button>

        <header className="policy-header">
          <h1>{policy.title}</h1>
          <p>{policy.intro}</p>
        </header>

        <div className="policy-content">
          {policy.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PolicyPage;
