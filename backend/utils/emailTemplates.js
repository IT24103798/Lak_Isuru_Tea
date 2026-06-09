const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getOrderTotal = (order) => {
  const itemsTotal = (order.items || []).reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);

  const deliveryFee = Number(order.deliveryFee || 0);

  return (
    Number(order.totalPrice) ||
    Number(order.totalAmount) ||
    Number(order.total) ||
    Number(order.orderTotal) ||
    itemsTotal + deliveryFee
  );
};

const getImageUrl = (image) => {
  if (!image) return "";

  let imagePath = "";

  if (typeof image === "string") {
    imagePath = image;
  } else if (typeof image === "object") {
    imagePath = image.url || image.path || image.secure_url || "";
  }

  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

const getCustomerName = (order) => {
  return order.customer?.fullName || order.customer?.name || "Customer";
};

const getCustomerPhone = (order) => {
  return order.customer?.phone || order.customer?.phoneNumber1 || "-";
};

const getCleanAddress = (customer = {}) => {
  const parts = [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.district,
    customer.province,
    customer.postalCode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "-";
};

const getProductRows = (order) => {
  if (!order.items || order.items.length === 0) {
    return `
      <tr>
        <td colspan="3" style="padding:14px;color:#666;text-align:center;">
          No products found.
        </td>
      </tr>
    `;
  }

  return order.items
    .map((item) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;width:80px;">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${item.name || "Tea Product"}" width="65" height="65" style="object-fit:cover;border-radius:10px;border:1px solid #eee;display:block;" />`
                : `<div style="width:65px;height:65px;border-radius:10px;background:#eef7ef;border:1px solid #ddd;text-align:center;line-height:65px;color:#1f3d2b;font-weight:bold;">Tea</div>`
            }
          </td>

          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong style="color:#222;font-size:14px;">${item.name || "Tea Product"}</strong><br/>
            <span style="color:#666;font-size:13px;">Quantity: ${item.quantity || 1}</span><br/>
            <span style="color:#666;font-size:13px;">Unit Price: Rs. ${formatCurrency(item.price)}</span>
          </td>

          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            <strong style="color:#1f3d2b;">Rs. ${formatCurrency(itemTotal)}</strong>
          </td>
        </tr>
      `;
    })
    .join("");
};

const emailLayout = ({ title, subtitle, headingColor = "#c46a18", body }) => {
  return `
    <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;color:#222;">
      <div style="max-width:720px;margin:auto;background:white;border-radius:14px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">
        
        <div style="background:#1f3d2b;padding:26px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;">Lak Isuru Tea</h1>
          <p style="color:#d7eadc;margin:8px 0 0;font-size:14px;">
            Fresh Ceylon tea delivered with care
          </p>
        </div>

        <div style="padding:30px;">
          <h2 style="color:${headingColor};text-align:center;margin-top:0;">
            ${title}
          </h2>

          ${
            subtitle
              ? `<p style="text-align:center;color:#555;margin-top:-6px;margin-bottom:24px;">${subtitle}</p>`
              : ""
          }

          ${body}
        </div>

        <div style="background:#f8faf8;padding:18px;text-align:center;color:#666;font-size:13px;border-top:1px solid #e5eee8;">
          <p style="margin:0;">© Lak Isuru Tea. Thank you for choosing us.</p>
        </div>

      </div>
    </div>
  `;
};

/* =========================================================
   1. CUSTOMER EMAIL - AFTER CUSTOMER PLACES ORDER
========================================================= */
export const orderPlacedCustomerTemplate = (order) => {
  const totalAmount = getOrderTotal(order);
  const customerName = getCustomerName(order);
  const deliveryFee = Number(order.deliveryFee || 0);
  const cartItemsTotal = Number(order.cartItemsTotal || 0);

  return emailLayout({
    title: "Your order has been confirmed",
    subtitle: "We received your order and our team will prepare it soon.",
    headingColor: "#c46a18",
    body: `
      <p>Hi <b>${customerName}</b>,</p>

      <p>
        Thank you for shopping with <b>Lak Isuru Tea</b>. 
        Your order <b>#${order._id}</b> has been placed successfully.
      </p>

      <div style="background:#f8faf8;border:1px solid #e5eee8;border-radius:10px;padding:15px;margin:20px 0;">
        <p style="margin:8px 0;"><b>Order ID:</b> #${order._id}</p>
        <p style="margin:8px 0;"><b>Payment Method:</b> ${order.paymentMethod || "-"}</p>
        <p style="margin:8px 0;"><b>Payment Status:</b> ${order.paymentStatus || "-"}</p>
        <p style="margin:8px 0;"><b>Shipping Option:</b> ${order.shippingOption || "Standard"}</p>
        <p style="margin:8px 0;"><b>Order Status:</b> ${order.orderStatus || "-"}</p>
      </div>

      <h3 style="color:#1f3d2b;margin-top:28px;">Delivery Details</h3>

      <div style="background:#f8faf8;border:1px solid #e5eee8;border-radius:10px;padding:15px;margin-bottom:20px;">
        <p style="margin:8px 0;"><b>Name:</b> ${customerName}</p>
        <p style="margin:8px 0;"><b>Email:</b> ${order.customer?.email || "-"}</p>
        <p style="margin:8px 0;"><b>Phone:</b> ${getCustomerPhone(order)}</p>
        <p style="margin:8px 0;"><b>Address:</b> ${getCleanAddress(order.customer)}</p>
      </div>

      <h3 style="color:#1f3d2b;margin-top:28px;">Products Ordered</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${getProductRows(order)}
      </table>

      <h3 style="color:#1f3d2b;margin-top:28px;">Order Summary</h3>

      <div style="background:#fffaf4;border:1px solid #f1dcc5;border-radius:10px;padding:15px;">
        <p style="margin:8px 0;"><b>Items Total:</b> Rs. ${formatCurrency(cartItemsTotal)}</p>
        <p style="margin:8px 0;"><b>Delivery Fee:</b> ${
          deliveryFee === 0 ? "Free" : `Rs. ${formatCurrency(deliveryFee)}`
        }</p>
        <p style="margin:8px 0;font-size:18px;color:#c46a18;">
          <b>Total:</b> Rs. ${formatCurrency(totalAmount)}
        </p>
      </div>

      <div style="text-align:center;margin-top:30px;">
        <a href="${CLIENT_URL}/my-orders"
          style="background:#c46a18;color:white;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          View My Order
        </a>
      </div>

      <p style="margin-top:30px;color:#555;">
        We will notify you again when your order is delivered.
      </p>

      <p>
        Warm regards,<br/>
        <b>Lak Isuru Tea Team</b>
      </p>
    `,
  });
};

/* =========================================================
   2. ADMIN EMAIL - AFTER CUSTOMER PLACES ORDER
========================================================= */
export const orderPlacedAdminTemplate = (order) => {
  const totalAmount = getOrderTotal(order);
  const customerName = getCustomerName(order);
  const deliveryFee = Number(order.deliveryFee || 0);
  const cartItemsTotal = Number(order.cartItemsTotal || 0);

  return emailLayout({
    title: "New order received",
    subtitle: "A customer has placed a new order on the website.",
    headingColor: "#1f3d2b",
    body: `
      <p>
        A new order has been placed. Please check the admin dashboard and prepare the order for shipping.
      </p>

      <h3 style="color:#1f3d2b;">Customer Details</h3>

      <div style="background:#f8faf8;border:1px solid #e5eee8;border-radius:10px;padding:15px;margin-bottom:20px;">
        <p style="margin:8px 0;"><b>Name:</b> ${customerName}</p>
        <p style="margin:8px 0;"><b>Email:</b> ${order.customer?.email || "-"}</p>
        <p style="margin:8px 0;"><b>Phone:</b> ${getCustomerPhone(order)}</p>
        <p style="margin:8px 0;"><b>Address:</b> ${getCleanAddress(order.customer)}</p>
      </div>

      <h3 style="color:#1f3d2b;">Order Details</h3>

      <div style="background:#fffaf4;border:1px solid #f1dcc5;border-radius:10px;padding:15px;">
        <p style="margin:8px 0;"><b>Order ID:</b> #${order._id}</p>
        <p style="margin:8px 0;"><b>Payment Method:</b> ${order.paymentMethod || "-"}</p>
        <p style="margin:8px 0;"><b>Payment Status:</b> ${order.paymentStatus || "-"}</p>
        <p style="margin:8px 0;"><b>Shipping Option:</b> ${order.shippingOption || "Standard"}</p>
        <p style="margin:8px 0;"><b>Order Status:</b> ${order.orderStatus || "-"}</p>
        <p style="margin:8px 0;"><b>Items Total:</b> Rs. ${formatCurrency(cartItemsTotal)}</p>
        <p style="margin:8px 0;"><b>Delivery Fee:</b> ${
          deliveryFee === 0 ? "Free" : `Rs. ${formatCurrency(deliveryFee)}`
        }</p>
        <p style="margin:8px 0;font-size:18px;color:#c46a18;">
          <b>Total:</b> Rs. ${formatCurrency(totalAmount)}
        </p>
      </div>

      <h3 style="color:#1f3d2b;margin-top:28px;">Products Ordered</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${getProductRows(order)}
      </table>

      <div style="text-align:center;margin-top:30px;">
        <a href="${CLIENT_URL}/admin/orders"
          style="background:#1f3d2b;color:white;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          View Admin Order
        </a>
      </div>
    `,
  });
};

/* =========================================================
   3. CUSTOMER EMAIL - AFTER ORDER IS DELIVERED
========================================================= */
export const orderDeliveredCustomerTemplate = (order) => {
  const totalAmount = getOrderTotal(order);
  const customerName = getCustomerName(order);

  return emailLayout({
    title: "Your order has been delivered",
    subtitle: "Thank you for shopping with Lak Isuru Tea.",
    headingColor: "#c46a18",
    body: `
      <p>Dear <b>${customerName}</b>,</p>

      <p>
        We are happy to inform you that your order 
        <b>#${order._id}</b> has been delivered successfully.
      </p>

      <p>
        We hope you enjoy the freshness and quality of our Ceylon tea.
      </p>

      <h3 style="color:#1f3d2b;margin-top:28px;">Delivered Products</h3>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${getProductRows(order)}
      </table>

      <h3 style="color:#1f3d2b;">Order Summary</h3>

      <div style="background:#fffaf4;border:1px solid #f1dcc5;border-radius:10px;padding:15px;">
        <p style="margin:8px 0;"><b>Order ID:</b> #${order._id}</p>
        <p style="margin:8px 0;"><b>Total Amount:</b> Rs. ${formatCurrency(totalAmount)}</p>
        <p style="margin:8px 0;"><b>Payment Method:</b> ${order.paymentMethod || "-"}</p>
        <p style="margin:8px 0;"><b>Payment Status:</b> ${order.paymentStatus || "-"}</p>
        <p style="margin:8px 0;"><b>Shipping Option:</b> ${order.shippingOption || "Standard"}</p>
        <p style="margin:8px 0;"><b>Order Status:</b> ${order.orderStatus || "Delivered"}</p>
      </div>

      <div style="text-align:center;margin-top:30px;">
        <a href="${CLIENT_URL}/my-orders"
          style="background:#c46a18;color:white;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          Write a Review
        </a>
      </div>

      <p style="margin-top:30px;color:#555;">
        Your feedback helps us improve our service and tea quality.
      </p>

      <p>
        Warm regards,<br/>
        <b>Lak Isuru Tea Team</b>
      </p>
    `,
  });
};