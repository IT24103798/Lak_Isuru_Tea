# Lak Isuru Tea - MERN E-Commerce Website

Lak Isuru Tea is a full-stack tea product e-commerce website built using the MERN stack. The system allows customers to browse tea products, register and log in, manage their profile and addresses, add products to cart, place orders, choose payment methods, track orders, cancel orders, and get help from a tea product chatbot. It also includes an admin panel for managing products, users, reviews, and customer orders.

---
> **Privacy note:** This README uses placeholders only. Do not add real `.env` values, passwords, API keys, database URLs, or personal account details to GitHub.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Main Objectives](#main-objectives)
- [Technology Stack](#technology-stack)
- [User Roles](#user-roles)
- [Main Features](#main-features)
- [Customer Features](#customer-features)
- [Admin Features](#admin-features)
- [Chatbot Features](#chatbot-features)
- [Payment and Order Flow](#payment-and-order-flow)
- [Address Book System](#address-book-system)
- [Email Notification System](#email-notification-system)
- [Project Folder Structure](#project-folder-structure)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [API Route Summary](#api-route-summary)
- [Order Status Meaning](#order-status-meaning)
- [Team Member Responsibilities](#team-member-responsibilities)
- [Future Improvements](#future-improvements)
- [Troubleshooting Notes](#troubleshooting-notes)
- [License](#license)

---

## Project Overview

This project was developed as a real-world tea product website for Lak Isuru Tea. The goal is to create a professional, attractive, and user-friendly online platform where customers can explore Sri Lankan tea products and place orders easily.

The website includes both customer-side and admin-side features. Customers can shop online, save delivery and billing details, track their orders, and communicate with a chatbot. Admin users can manage the business side, including products, orders, users, and reviews.

---

## Main Objectives

- Build a professional tea product e-commerce website.
- Allow customers to browse and purchase tea products online.
- Provide a smooth cart, checkout, payment, and order tracking experience.
- Add an address book system for repeated customer orders.
- Add chatbot support for tea product questions.
- Provide an admin dashboard for order and product management.
- Support email notifications for order updates.
- Prepare the project for deployment and real-world use.

---

## Technology Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- CSS
- Context API
- Local Storage / Session Storage

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- dotenv
- Nodemailer

### Authentication

- Email and password login
- JWT-based protected routes
- Admin role-based access
- Google login support using Firebase Authentication
- Facebook login planned / partially configured
- Apple login considered but not used because it requires paid setup

### Payment

- Cash on Delivery
- Online Payment flow
- PayPal integration planned / supported conceptually

### Chatbot

- Static tea FAQ chatbot
- Gemini API support planned / tested
- Fallback answers for quota or API issues

### Database

- MongoDB Atlas or local MongoDB

---

## User Roles

### Customer

Customers can register, log in, browse products, add products to cart, save addresses, place orders, cancel eligible orders, and view order status.

### Admin

Admins can log in from the normal login page. If the logged-in user has the admin role, they are redirected to the admin dashboard.

Admin users can manage products, users, reviews, and orders.

---

## Main Features

- Responsive home page
- Product browsing
- Product details page
- Shopping cart
- Checkout page
- Payment page
- Order success / confirmation section
- My Orders page
- My Cancellations page
- My Returns page
- User profile page
- Address book management
- Admin dashboard
- Admin order management
- Admin product management
- Admin user management
- Admin review management
- Tea product chatbot
- Customer order email notifications
- Admin order email notifications

---

## Customer Features

### 1. Home Page

The home page is designed to attract customers by showing tea products and informative content about tea.

Suggested sections include:

- Hero banner
- Featured products
- Explore Our Range
- Sri Lankan Tea Heritage
- From Leaf to Cup
- Tea Preparation Guide
- Customer trust sections
- Contact information

### 2. Product Page

Customers can view tea products with product details such as:

- Product name
- Product image
- Price
- Category
- Stock availability
- Description

### 3. Product Details Page

Customers can view detailed product information and add the product to the cart.

### 4. Cart Page

The cart page includes:

- Selected products
- Product quantity
- Product price
- Subtotal
- Delivery fee
- Total amount
- Stock availability check
- Remove product option
- Checkout button

The checkout button should be disabled if cart items are invalid or out of stock.

### 5. Checkout Page

The checkout page collects customer and shipping details. It includes:

- Customer details
- Shipping address
- Billing address option
- Province, district, and city dropdowns
- Postal code
- Address type
- Save address option
- Order summary
- Back to Cart button

### 6. Payment Page

The payment page includes:

- Online Payment option
- Cash on Delivery option
- Billing details
- Order summary
- Place Order button

The Place Order button should be disabled until the user selects a valid payment method.

### 7. My Orders Page

Customers can view their orders using tabs such as:

- All
- To Ship
- To Receive
- To Review

The cancelled orders can be shown in the All section or inside the cancellation page.

### 8. My Cancellations Page

Customers can view cancelled order details. A refresh button can be used to reload updated cancellation status.

### 9. Order Details Page

The order details page shows:

- Customer details
- Product details
- Payment method
- Payment status
- Order status
- Shipping address
- Billing address
- Cancel order button if eligible
- View cancel details button if cancelled

### 10. User Profile Page

Customers can view and manage their profile details.

---

## Admin Features

### 1. Admin Dashboard

The admin dashboard gives a summary of the website activity. It can include:

- Total orders
- Total users
- Total products
- Pending orders
- Shipped orders
- Delivered orders
- Cancelled orders
- Recent orders

### 2. Admin Order Management

Admins can:

- View all customer orders
- View order details
- Update order status
- Mark orders as shipped
- Mark orders as delivered
- Cancel orders if needed
- Refresh order list

### 3. Admin Product Management

Admins can:

- Add products
- Edit products
- Delete products
- Update stock
- Upload or manage product images

### 4. Admin User Management

Admins can view registered users and manage user information where required.

### 5. Admin Review Management

Admins can view and manage product reviews.

---

## Chatbot Features

The chatbot is displayed in the bottom corner of every page so customers can access help easily.

### Chatbot Purpose

The chatbot helps customers ask questions about:

- Tea products
- Tea prices
- Delivery
- Payment methods
- Orders
- Gift packs
- Contact details
- Product recommendations
- Tea preparation

### Current Chatbot Logic

The chatbot uses a static FAQ dataset for reliable answers. It includes:

- Tea product questions
- Delivery questions
- Payment questions
- Order questions
- Contact questions
- Product recommendation answers
- Fallback answer for unclear messages

### Example Fallback Message

```text
👋 Hello! Welcome to Lak Isuru Tea.

I'm not quite sure what you mean. You can ask me about tea products, prices, delivery, payment, orders, gift packs, or contact details.
```

### Gemini API Plan

Gemini API integration was tested, but the free quota issue caused API limit errors. Because of that, the static FAQ chatbot is used as a stable fallback.

---

## Payment and Order Flow

### Cash on Delivery

When the customer selects Cash on Delivery:

- `paymentMethod = Cash on Delivery`
- `paymentStatus = Pending`
- `orderStatus = To Ship`

### Online Payment

When the customer selects Online Payment:

- `paymentMethod = Online Payment`
- `paymentStatus = Paid`
- `orderStatus = To Ship`

### Stock Handling

Stock should be reduced only after the order is successfully placed. Stock should not be reduced when the product is only added to the cart.

---

## Address Book System

The address book allows customers to save addresses and reuse them during checkout and payment.

### Address Fields

- Full name
- Phone number
- Address line 1
- Address line 2
- Landmark
- Province
- District
- City
- Postal code
- Address type
- Default shipping address
- Default billing address

### Address Type Values

Use uppercase enum values in the backend:

```js
addressType: "HOME" | "OFFICE"
```

This is important because using values like `Home`, `home`, or `HOME ` can cause MongoDB enum validation errors.

### Address API Endpoints

```text
GET    /api/addresses
POST   /api/addresses
GET    /api/addresses/default
GET    /api/addresses/default-billing
PUT    /api/addresses/:id
DELETE /api/addresses/:id
```

---

## Email Notification System

The system can send emails to customers and admins.

### Customer Email

A customer should receive an email when:

- Order is placed successfully
- Order status is updated
- Order is shipped
- Order is delivered

### Admin Email

Admin should receive an email when:

- A new order is placed
- A customer cancels an order

### Recommended Tool

Use Nodemailer in the backend for sending emails.

---

## Project Folder Structure

A recommended folder structure for this MERN project:

```text
Lak_Isuru_Tea/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   └── chatbotController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Address.js
│   │   ├── Review.js
│   │   ├── Complaint.js
│   │   └── ChatbotLog.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── addressRoutes.js
│   │   └── chatbotRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   │
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── data/
│   │   │   └── teaFaqData.js
│   │   │
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── MyReturns.jsx
│   │   │   ├── MyCancellations.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminReviews.jsx
│   │   │
│   │   ├── styles/
│   │   │   ├── Chatbot.css
│   │   │   ├── Checkout.css
│   │   │   ├── Payment.css
│   │   │   ├── MyOrders.css
│   │   │   └── AdminDashboard.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## Environment Variables and Privacy

For security, real `.env` files are **not included** in this README and should **never be uploaded to GitHub**. Keep private values such as database URLs, JWT secrets, email app passwords, Firebase keys, Gemini API keys, and payment keys only on your local computer or hosting provider dashboard.

Add `.env` files to `.gitignore`:

```gitignore
backend/.env
frontend/.env
.env
```

You can create safe example files for GitHub instead:

```text
backend/.env.example
frontend/.env.example
```

### Backend `.env.example`

```env
PORT=5000
MONGO_URI=PASTE_YOUR_DATABASE_URL_HERE
JWT_SECRET=PASTE_YOUR_SECRET_KEY_HERE

EMAIL_HOST=PASTE_EMAIL_HOST_HERE
EMAIL_PORT=587
EMAIL_USER=PASTE_EMAIL_USERNAME_HERE
EMAIL_PASS=PASTE_EMAIL_APP_PASSWORD_HERE

GEMINI_API_KEY=PASTE_GEMINI_API_KEY_HERE
CLIENT_URL=http://localhost:5173
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=PASTE_FIREBASE_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=PASTE_FIREBASE_AUTH_DOMAIN_HERE
VITE_FIREBASE_PROJECT_ID=PASTE_FIREBASE_PROJECT_ID_HERE
VITE_FIREBASE_APP_ID=PASTE_FIREBASE_APP_ID_HERE
```

Before running the project, copy each `.env.example` file, rename the copy to `.env`, and fill the values locally.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Lak_Isuru_Tea.git
cd Lak_Isuru_Tea
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Run Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 5. Run Frontend Server

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Route Summary

### User Routes

```text
POST /api/users/register
POST /api/users/login
POST /api/users/social-login
POST /api/users/forgot-password
POST /api/users/reset-password
GET  /api/users/profile
PUT  /api/users/profile
```

### Product Routes

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Address Routes

```text
GET    /api/addresses
POST   /api/addresses
GET    /api/addresses/default
GET    /api/addresses/default-billing
PUT    /api/addresses/:id
DELETE /api/addresses/:id
```

### Order Routes

```text
POST /api/orders
GET  /api/orders/my-orders
GET  /api/orders/:id
PUT  /api/orders/:id/cancel
GET  /api/orders/admin/all
PUT  /api/orders/:id/status
```

### Chatbot Routes

```text
POST /api/chatbot/message
GET  /api/chatbot/logs
```

---

## Order Status Meaning

### To Pay

The customer has created an order but payment is not completed yet. This status is optional and can be removed if the system does not support pending online payment.

### To Ship

The order is confirmed and waiting for admin to prepare and ship the product.

### To Receive

The order has been shipped and the customer is waiting to receive it.

### To Review

The order has been delivered and the customer can review the product.

### Cancelled

The order was cancelled by the customer or admin.

---

## Team Member Responsibilities

### Member 1 - Customer Website, Product Browsing, User Accounts, and Ordering System

Responsible for:

- Home page
- Product page
- Product details
- User account pages
- Cart
- Checkout
- Order pages
- Address book

### Member 2 - Payment and Deployment

Responsible for:

- Payment page
- Online payment integration
- Cash on Delivery flow
- Deployment setup
- Hosting support

### Member 3 - AI Chatbot

Responsible for:

- Chatbot UI
- Chatbot FAQ data
- Chatbot frontend logic
- Chatbot API connection
- Chatbot logs

### Member 4 - AI Chatbot / Support for Order System

Responsible for:

- Chatbot backend support
- Gemini API testing
- Static FAQ fallback
- Helping order system if chatbot work is completed early

---

## Future Improvements

- Complete PayPal live payment integration.
- Add multi-currency support based on customer preference.
- Add real-time admin order notifications.
- Add product image upload using cloud storage.
- Add product search and filters.
- Add review and rating system.
- Add invoice PDF generation.
- Add delivery tracking.
- Improve chatbot with Gemini API after quota issue is solved.
- Add Sinhala and English language switching.
- Add SEO improvements for product pages.
- Deploy frontend and backend to production.
- Connect custom domain name.

---

## Troubleshooting Notes

### 1. Address Type Enum Error

Error example:

```text
Order validation failed: customer.addressType: `HOME ` is not a valid enum value
```

Fix:

Make sure the frontend sends exactly:

```js
"HOME"
```

or

```js
"OFFICE"
```

Do not send lowercase values or values with spaces.

### 2. Axios 400 Bad Request on Address Save

Possible reasons:

- Required field missing
- Postal code missing
- Invalid address type
- Invalid phone number
- User token missing
- Backend validation mismatch

Check browser console and backend terminal error message.

### 3. Axios 500 Error on Order Place

Possible reasons:

- Order model validation failed
- Customer data missing
- Product ID missing
- Invalid payment status
- Invalid order status
- Invalid address type enum

### 4. Google Login Works but Signup Does Not

Possible reasons:

- Firebase provider configuration issue
- Backend social login route issue
- Email already exists in database
- Missing token handling
- Incorrect redirect URL

### 5. Chatbot Gives Recommendation for Random Text

Fix:

Improve chatbot matching logic so random letters like `mm` return the fallback answer instead of product recommendation.

### 6. GitHub Pull Request Not Showing

Possible reasons:

- Code was pushed to the same branch as master/main
- Pull request already closed
- No difference between branches
- Branch upstream not set correctly

Fix:

Create or push to a separate feature branch and compare it with `master` or `main`.

---

## License

This project is developed for academic and educational purposes.

---

## Project Status

Current status: In development.

The main customer shopping flow, address handling, order process, admin order management, and chatbot are actively being improved.
