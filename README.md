# 🛒 Multi-Seller E-commerce Server

A production-ready, professional Multi-Seller E-commerce Backend built with Node.js, Express, TypeScript and MongoDB + Mongoose. Designed for scalability, security, and real-world operations — includes multi-seller shops, notifications, audit logging, shopping cart, order management, and seller shop management.

## 📌 Table of Contents

* [🧩 About](#-about)
* [🚀 Key Features](#-key-features)
* [🛠️ Tech Stack](#️-tech-stack)
* [Architecture and Folder Structure](#-architecture-folder-structure)
* [⚙️ Getting Started (Step-by-step)](#getting-started-step-by-step)

  * [📋 Prerequisites](#-prerequisites)
  * [📦 Clone & Install](#-clone--install)
  * [🔧 Environment Variables](#-environment-variables)
  * [🗄️ Database Setup & Seeding](#-database-setup--seeding)
  * [🖥️ Run Locally](#-run-locally)
* [📡 API Overview](#-api-overview)

  * [🔑 Authentication](#-authentication-apis)
  * [📊 Audit Logs](#-audit-logs-api)
  * [🛒 Cart](#-cart-api)
  * [🗂 Category](#-category-api)
  * [🎟️ Coupon](#-coupon-api)
  * [🎯 Product Discount](#-product-discount-api)
  * [🔔 Notifications](#-notification-api)
  * [📦 Orders](#-order-api)
  * [🛍️ Products](#-product-api)
* [🛡️ Security & Production Checklist](#-security--production-checklist)
* [⚡ Performance & Scaling Tips](#-performance--scaling-tips)
* [🧪 Testing](#-testing)
* [🚢 CI / CD & Deployment (Docker)](#-ci--cd--deployment-docker)
* [🤝 Contributing](#-contributing)
* [🎯 Project Showcase — How to present this to recruiters](#-project-showcase--how-to-present-this-to-recruiters)
* [❓ Troubleshooting & FAQ](#-troubleshooting--faq)
* [📜 License](#-license)





## 🧩 About

This repository contains the backend server for a multi-seller e-commerce platform. It is built with pragmatic production practices in mind: proper authentication, role-based access control, audit logging, notification system, seller shops, product inventory, cart/order flows, and extensible modular code structure.

This project is tailored to be a hire-worthy portfolio piece for backend developers and showcases real-world concerns like security, observability, and multi-tenant-ish seller isolation.

## 🚀 Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** — secure access & refresh token mechanism for seamless session management.  
- **Role-based Access Control (RBAC)** — predefined roles: `admin`, `seller`, and `user` with tiered permissions and route protection.  

### 🏬 Multi-Seller & Shop Management
- **Multi-seller architecture** — each seller owns and manages their own shop and inventory independently.  
- **Seller inventory control** — create, update, and track products under individual shops.  
- **Seller onboarding flow** — user can apply to become a seller, reviewed and approved by admin.  

### 🛍️ Product & Category Management
- **Full Product CRUD** — add, edit, delete, and view products with category & tag association.  
- **Advanced Search & Filters** — keyword search, category filtering, sorting, and pagination (MongoDB text index powered).  
- **Slug-based unique identifiers** — SEO-friendly product and category URLs.  

### 🛒 Cart & Order Lifecycle
- **Persistent Shopping Cart** — items remain synced with user sessions.  
- **Order Workflow Management** — full lifecycle support:  
  `Pending → Processing → Shipped → Delivered → Cancelled`  
- **Payment-ready model design** — structured to easily integrate payment gateways (Stripe).  

### 🔔 Notifications & Audit Logging
- **Smart Notification System** — persistent and event-driven (order updates, admin alerts, seller approvals).  
- **Audit Logs** — track critical system events: user actions, order updates, role changes, and login attempts.  

### 🖼️ Media & Uploads
- **Image Upload Pipeline** — integrated with Cloudinary (optional) or local storage via multer.  
- **Optimized file handling** — secure file validation, MIME checks, and error handling.  

### 🧰 Data Integrity & Validation
- **Input Validation** — powered by Zod schemas for runtime safety.  
- **Sanitized DB interactions** — prevents injection and XSS vulnerabilities.  
- **Soft delete & data consistency** — smart deletion logic to maintain referential integrity.  

### ⚡ Performance & Developer Experience
- **Pagination & Search Optimization** — query performance tuned for large datasets.  
- **Centralized Error Handling** — unified API response format.  
- **Environment-based Configuration** — dev, staging, and production config isolation. 

### 🧪 Quality & Testing
- **Unit & Integration Tests** — Jest + Supertest setup for API testing.  
- **CI/CD Ready** — easy integration with GitHub Actions for automated lint, build, and test pipelines.  

---

## 🛠️ Tech Stack

This backend server is built using a modern, scalable, and industry-ready technology stack, ensuring performance, security, and maintainability.

### **Language**

* **TypeScript** — strongly-typed JavaScript for safer, more reliable, and maintainable codebases.

### **Runtime & Framework**

* **Node.js** — event-driven, non-blocking runtime optimized for high-performance APIs.
* **Express.js** — minimal and flexible web framework for building RESTful APIs.

### **Database & ORM**

* **MongoDB** — NoSQL database optimized for scalability and flexibility.
* **Mongoose** — ODM for schema validation, relationships, and query optimization.

### **Authentication & Security**

* **JWT (JSON Web Tokens)** — secure access and refresh token strategy.
* **bcrypt** — robust password hashing for secure credential storage.
* **Role-based Access Control (RBAC)** — fine-grained authorization system.

### **Validation & Data Integrity**

* **Zod** (preferred) — runtime schema validation for request payloads.
* Enforces type-safety and prevents invalid data persistence.

### **Caching & Performance**

* **Redis (optional)** — in-memory caching for sessions, rate limiting, and performance optimization.

### **File Storage & Media Handling**

* **Cloudinary (optional)** — cloud-based image hosting & optimization pipeline.
* **Multer** — secure file uploads with MIME-type validation.

### **Logging & Monitoring**

* **Winston** — structured, configurable logging system.
* **Morgan** — HTTP request logging middleware for Express.
* Easily integratable with centralized log management tools (e.g., ELK / Datadog).

### **Testing & Quality Assurance**

* **Jest** — unit and integration test framework.
* **Supertest** — HTTP assertions for end-to-end API testing.

### **CI/CD & Automation**

* **GitHub Actions** — automated pipelines for linting, testing, building, and deployment.
* Supports multi-environment workflows (dev, staging, production).


---

## Architecture and Folder Structure

A **clean, layered, and modular architecture** is followed to ensure scalability, maintainability, and developer productivity. Each responsibility is clearly separated, making the codebase easier to extend, debug, and collaborate on in team environments.

### 🔑 Key Principles

* **Separation of Concerns** — each layer (controller, service, model, etc.) has a single responsibility.
* **Scalability in Mind** — features are modular, allowing independent extension without breaking existing flows.
* **Consistency** — naming conventions, folder hierarchy, and coding patterns follow industry best practices.
* **Testability** — architecture supports unit and integration testing at every layer.

### 📂 Folder Structure

```
src/
├── app/                        
│   ├── builder/                # Query builders (searching, filtering, sorting, pagination, etc.)
│   ├── config/                 # Environment & third-party configs (DB, JWT, Redis, Cloudinary, etc.)
│   ├── constants/              # Centralized constants, enums & static values
│   ├── db/                     # Database connection, migrations, seeders
│   ├── errors/                 # Custom error classes & centralized error handling
│   ├── interfaces/             # Global TypeScript interfaces & types
│   ├── middlewares/            # Global middlewares (auth, validation, logging, rate-limiting, etc.)
│   ├── modules/                # Domain-driven, feature-based modules
│   │   ├── auditLog/           
│   │   │   ├── auditLog.controller.ts   # Handles request/response mapping
│   │   │   ├── auditLog.interface.ts    # TypeScript interfaces/types for this module
│   │   │   ├── auditLog.model.ts        # Mongoose schema & model
│   │   │   ├── auditLog.route.ts        # Express routes
│   │   │   ├── auditLog.service.ts      # Business logic & DB interaction
│   │   │   └── auditLog.validation.ts   # Module-specific validation (Zod/Joi)
│   │   ├── auth/              
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.interface.ts
│   │   │   ├── auth.model.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.utils.ts            # Auth-specific helpers (token, hashing, etc.)
│   │   │   ├── auth.validation.ts
│   │   │   ├── verification.controller.ts
│   │   │   ├── verification.service.ts
│   │   │   └── verification.validation.ts
│   │   ├── cart/
│   │   │   ├── cart.constant.ts         # Module-specific constants
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.interface.ts
│   │   │   ├── cart.model.ts
│   │   │   ├── cart.route.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.validation.ts
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.interface.ts
│   │   │   ├── category.model.ts
│   │   │   ├── category.route.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.validation.ts
│   │   ├── coupon/
│   │   │   ├── coupon.constant.ts
│   │   │   ├── coupon.controller.ts
│   │   │   ├── coupon.interface.ts
│   │   │   ├── coupon.model.ts
│   │   │   ├── coupon.route.ts
│   │   │   ├── coupon.service.ts
│   │   │   ├── coupon.utils.ts
│   │   │   └── coupon.validation.ts
│   │   ├── discount/
│   │   │   ├── discount.constant.ts
│   │   │   ├── discount.controller.ts
│   │   │   ├── discount.interface.ts
│   │   │   ├── discount.model.ts
│   │   │   ├── discount.route.ts
│   │   │   ├── discount.service.ts
│   │   │   ├── discount.utils.ts
│   │   │   └── discount.validation.ts
│   │   ├── notification/
│   │   │   ├── notification.constant.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.interface.ts
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.route.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.utils.ts
│   │   │   └── notification.validation.ts
│   │   ├── order/
│   │   │   ├── order.constant.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.interface.ts
│   │   │   ├── order.model.ts
│   │   │   ├── order.route.ts
│   │   │   ├── order.service.ts
│   │   │   ├── order.utils.ts
│   │   │   └── order.validation.ts
│   │   ├── product/
│   │   │   ├── product.constant.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.interface.ts
│   │   │   ├── product.model.ts
│   │   │   ├── product.route.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.validation.ts
│   │   ├── review/
│   │   │   ├── review.constant.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── review.interface.ts
│   │   │   ├── review.model.ts
│   │   │   ├── review.route.ts
│   │   │   ├── review.service.ts
│   │   │   └── review.validation.ts
│   │   ├── seller/
│   │   │   ├── seller.constant.ts
│   │   │   ├── seller.controller.ts
│   │   │   ├── seller.interface.ts
│   │   │   ├── seller.model.ts
│   │   │   ├── seller.route.ts
│   │   │   ├── seller.service.ts
│   │   │   └── seller.validation.ts
│   │   ├── shop/
│   │   │   ├── shop.constant.ts
│   │   │   ├── shop.controller.ts
│   │   │   ├── shop.interface.ts
│   │   │   ├── shop.model.ts
│   │   │   ├── shop.route.ts
│   │   │   ├── shop.service.ts
│   │   │   └── shop.validation.ts
│   │   ├── user/
│   │   │   ├── user.constant.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.interface.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.route.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.utils.ts
│   │   │   └── user.validation.ts
│   │   └── ...                 
│   │
│   ├── routes/                  # Global routes aggregator (import & combine all module routes)
│   ├── shared/                  # Shared utilities (email sender, storage, cache, common helpers)
│   └── utils/                   # Core utilities (formatters, token generator, DB transactions, etc.)
│
├── uploads/                     # File uploads (if using local storage)
├── app.ts                       # Express app config
└── server.ts                    # Server bootstrap (listen, clustering, graceful shutdown)


```

### ⚙️ Flow of Responsibility

1. **Route Layer** — Defines REST endpoints, applies validation (Zod), and delegates requests to the appropriate controller.
2. **Controller Layer** — Accepts validated requests, orchestrates the flow by calling services, and formats consistent API responses.
3. **Service Layer** — Encapsulates the **business logic**; reusable, testable, and independent of HTTP or database concerns.
4. **Model Layer (Mongoose)** — Manages data persistence: schema definitions, relationships, queries, and transactions.
5. **Middleware Layer** — Handles cross-cutting concerns such as authentication, authorization, logging, error handling, and rate-limiting.
6. **Utility & Shared Layer** — Provides helper functions, adapters (e.g., cache, email, storage), and shared services across modules.

---

This layered architecture is **production-ready** and follows industry best practices for **scalability, maintainability, and testability**.
It ensures that each responsibility is clearly separated, making the project **extensible, secure, and easy to maintain** in long-term enterprise development cycles.


## 🚀 Getting Started
Follow these steps to set up and run the E-commerce Server locally or in production, following industry standards.

### ✅ Prerequisites

- Before you start, ensure you have the following installed:
- Node.js v18+ (LTS recommended)
- npm or yarn (package manager)
- MongoDB (local instance or MongoDB Atlas)

### 📦 Clone & Install

```
# 1. Clone repository
https://github.com/mahedy766584/shop_sphere_api.git
cd ecommerce-server

# 2. Install dependencies
npm install
# or
yarn install

```

### 🔧 Environment Variables

Create a .env file at the root directory.
You can copy .env.example as a starting point.

```

# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecommerce

# Security
JWT_ACCESS_SECRET=super_strong_secret
JWT_REFRESH_SECRET=another_strong_secret
JWT_EMAIL_SECRET=email_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EMAIL_VERIFICATION_EXPIRES_IN=24h
PASSWORD_SALT_ROUNDS=10

# Frontend & API
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api/v1

# SMTP (Mail)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_HOST_MAIL=noreply@ecommerce.com
SMTP_PASS=secure_password

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_xxxxx


```

### 🛠️ Config File (src/config/index.ts)

All env variables are centralized for type-safety & maintainability:

```

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  password_salt_rounds: process.env.PASSWORD_SALT_ROUNDS,

  // JWT
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_email_secret: process.env.JWT_EMAIL_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  email_verification_expires_in: process.env.EMAIL_VERIFICATION_EXPIRES_IN,

  // Links
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  frontend_url: process.env.FRONTEND_URL,
  api_base_url: process.env.API_BASE_URL,

  // SMTP
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_host_mail: process.env.SMTP_HOST_MAIL,
  smtp_pass: process.env.SMTP_PASS,

  // Cloudinary
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  // Redis
  redis_url: process.env.REDIS_URL,
  cache_ttl: process.env.CACHE_TTL,

  // Stripe
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
};

```

### 🗄️ Database Setup & Seeding

You can seed initial data (admin, sellers, products) for testing:
```
npm run seed
```

### 🖥️ Run Locally

```
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start

```

## 📡 API Overview

This section provides a **high-level summary of main endpoints**.  
For complete API documentation, provide a **Postman collection**.

**Base URL:** `/api/v1`

> 🔑 **Authentication:** Use `Authorization: <accessToken>` header for all protected routes.

---

## 🔑 Authentication APIs

| Endpoint                 | Method   | Description                                           |
| ------------------------ | -------- | ----------------------------------------------------- |
| `/auth/login`            | **POST** | Authenticate user and return access & refresh tokens  |
| `/auth/change-password`  | **POST** | Change the password of the logged-in user             |
| `/auth/refresh-token`    | **POST** | Generate a new access token using a refresh token     |
| `/auth/forget-password`  | **POST** | Send password reset link to user’s email              |
| `/auth/reset-password`   | **POST** | Reset password using a valid token                    |
| `/auth/send-verification`| **POST** | Send email verification link to user                  |
| `/auth/verify-email`     | **GET**  | Verify user’s email using verification token          |
| `/auth/resend-verification` | **POST** | Resend verification email if not verified             |

### ⚡ Notes

* Access token is short-lived.  
* Use refresh token to reissue access token.  
* All protected endpoints require `Authorization:<token>` header.

## 📊 Audit Logs API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/audit-logs` | **GET** | Fetch all audit logs |
| `/audit-logs/:id` | **GET** | Fetch details of a specific audit log by ID |

---

## 🛒 Cart API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/cart/add-to-cart` | **POST** | Add a product to the user’s cart. Requires validation of product & quantity. |
| `/cart` | **GET** | Get the authenticated user’s cart with all items. |
| `/cart/:cartId` | **PATCH** | Update the quantity of a specific cart item. Validation ensures positive integer values. |
| `/cart/:cartId` | **DELETE** | Remove a specific item from the user’s cart. |


### ⚡ Notes

* All routes are **protected** and require `Authorization:<token>`.  
* Input validation is handled via **Zod/Yup schemas** in `CartValidation`.  
* Business logic is isolated in `CartController` and `CartService` layers.  
* Follows **RESTful API best practices** with proper HTTP status codes.  
* Consistent error handling via centralized error middleware.  

---

## 🗂 Category API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/category/create-category` | **POST** | Create a new category. Requires validation & admin/superAdmin role. |
| `/category` | **GET** | Get all categories (for admin, customer, seller). |
| `/category/active` | **GET** | Fetch only active categories. |
| `/category/tree` | **GET** | Build and fetch the hierarchical category tree. |
| `/category/:id` | **GET** | Get details of a single category by ID (admin/superAdmin only). |
| `/category/:id/child` | **GET** | Fetch child categories under a parent category. |
| `/category/:id` | **PATCH** | Update details of a single category by ID. |
| `/category/:id/status` | **PATCH** | Toggle the active/inactive status of a category. |
| `/category/:id` | **DELETE** | Delete a category by ID. |


## 🎟️ Coupon API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/coupon/create-coupon` | **POST** | Create a new coupon (Admin/Seller only). Validates coupon details before saving. |
| `/coupon/apply` | **POST** | Apply a coupon code to the current cart/order. Validates code and conditions. |
| `/coupon` | **GET** | Retrieve all available coupons. Supports filters and pagination if implemented. |
| `/coupon/active` | **GET** | Fetch only active (valid) coupons. Useful for checkout flow. |
| `/coupon/:couponId` | **PATCH** | Update an existing coupon by ID. Validation ensures safe update. |
| `/coupon/:couponId` | **DELETE** | Delete a specific coupon by ID (soft/hard delete depending on implementation). |

## 🎯 Product Discount API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/discount/create-discount` | **POST** | Create a new discount for a product. Requires validation and seller role. |
| `/discount/top-discount` | **GET** | Fetch top discounted products. |
| `/discount/:discountId` | **PATCH** | Update an existing discount by ID. |
| `/discount/:discountId` | **DELETE** | Delete a discount by ID. |
| `/discount` | **GET** | Get all discounts. Supports filtering and pagination if implemented. |
| `/discount/:discountId` | **GET** | Get details of a specific discount by ID. |
| `/discount/:productId/product` | **GET** | Get all discounts applied to a specific product. |
| `/discount/:discountId/status` | **PATCH** | Update the active/inactive status of a discount. |
| `/discount/:productId/sync` | **GET** | Sync product price with active discount for a given product. |


## 🔔 Notification API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/notifications` | **GET** | Fetch all notifications of the authenticated user. |
| `/notifications/:notificationId` | **PATCH** | Mark a specific notification as read. |
| `/notifications/mark/all-read` | **PATCH** | Mark all notifications of the user as read. |
| `/notifications/:notificationId` | **DELETE** | Delete a specific notification. |
| `/notifications` | **DELETE** | Prune (remove) old notifications in bulk. |


## 📦 Order API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/orders/place-order` | **POST** | Place a new order. Requires authentication and validation of order details. |
| `/orders/payment/stripe` | **POST** | Initiate a Stripe payment for an order. Validates payment details before processing. |
| `/orders/webhook/payment` | **POST** | Stripe webhook endpoint to confirm payment. Should be secured and verified. |
| `/orders/:orderId/ship` | **POST** | Mark an order as **shipped**. Accessible only by sellers. Requires validation of shipment details. |
| `/orders/:orderId/deliver` | **POST** | Mark an order as **delivered**. Can be performed by authenticated roles (admin, seller, customer). |
| `/orders/:invoiceId/cancel` | **POST** | Cancel an order. Only the customer who placed the order can cancel. |


## 🛍️ Product API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/products/create-product/:shopId` | **POST** | Create a new product in a shop. Accepts multiple images (`files`) and validated payload. |
| `/products` | **GET** | Fetch all products. Supports filtering, search, and pagination. |
| `/products/:productId` | **GET** | Get details of a single product by ID. |
| `/products/:shopId/shop` | **GET** | Fetch all products belonging to a specific shop. |
| `/products/:productId` | **PUT** | Update a product (with image re-upload if provided). Payload validated before saving. |
| `/products/:productId` | **PATCH** | Restore a previously soft-deleted product. |
| `/products/:productId/stock` | **PATCH** | Update stock quantity of a product. Validates positive integer stock values. |
| `/products/:productId/status` | **PATCH** | Toggle the availability status (active/inactive) of a product. |
| `/products/:productId/features` | **PATCH** | Toggle product featured flag (mark/unmark as featured). |
| `/products/:productId` | **DELETE** | Soft delete a product (kept in DB but hidden from customers). |


## ⭐ Review API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/reviews/create-review` | **POST** | Create a new review for a product. Supports multiple file uploads (max 10). Requires validation. |
| `/reviews/:productId` | **GET** | Fetch all reviews of a specific product by its ID. |
| `/reviews/:reviewId/review` | **GET** | Fetch details of a single review by its ID. |
| `/reviews/:productId/reviews` | **GET** | Get aggregated product review details (average rating, total reviews, etc.). |
| `/reviews/:reviewId` | **PUT** | Update an existing review. Supports multiple file uploads (max 10). Requires validation. |
| `/reviews/:reviewId` | **DELETE** | Delete a specific review by its ID. |


## 🏬 Seller Profile API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/seller-profile/apply-for-seller` | **POST** | Apply to become a seller (only for customers). Requires validation of shop & business details. |
| `/seller-profile/reapply` | **POST** | Reapply if the previous seller request was rejected. |
| `/seller-profile/me` | **PATCH** | Update own seller profile (only for sellers). Validation ensures correct data structure. |
| `/seller-profile/:sellerId/status` | **PATCH** | Update seller status (approve/reject). Only for admins & superAdmins. |
| `/seller-profile` | **GET** | Get all seller profiles. Only accessible by admins & superAdmins. |
| `/seller-profile/my-profile` | **GET** | Fetch authenticated seller’s own profile. |
| `/seller-profile/my-profile` | **DELETE** | Delete own seller profile (seller, admin, or superAdmin). |


## 🏬 Shop API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/shop/create-shop` | **POST** | Create a new shop (Seller only). Validates request body before saving. |
| `/shop/:shopId` | **PATCH** | Update an existing shop owned by the seller. Requires validation. |
| `/shop/:shopId/verify` | **PATCH** | Verify a shop (Admin / SuperAdmin only). Ensures shop legitimacy. |
| `/shop/:shopId` | **DELETE** | Soft delete a shop. Can be performed by Seller, Admin, or SuperAdmin. |
| `/shop` | **GET** | Fetch all shops (Admin / SuperAdmin only). Supports pagination & filtering. |
| `/shop/owner` | **GET** | Get the authenticated seller’s own shop details. |


## 👤 User API

| Endpoint |   Method   | Description |
|----------|:----------:|-------------|
| `/users/create-user` | **POST** | Create a new user. Supports file upload (profile image) via `file` field. Request body passed as JSON in `data`. |
| `/users` | **GET** | Fetch all users (Admin & SuperAdmin only). |
| `/users/get-me` | **GET** | Get profile details of the currently authenticated user. |
| `/users/:id` | **GET** | Fetch details of a single user by ID (Admin & SuperAdmin only). |
| `/users/my-profile` | **PATCH** | Update the authenticated user’s own profile. Requires validation. |
| `/users/:id` | **PATCH** | Update a specific user’s profile by ID (Admin, SuperAdmin, Seller, Customer). |


## 🧪 Testing

```bash
npm run test
```

* Unit testing with **Jest**
* Integration testing with **Supertest**

---

## 🚢 CI/CD & Deployment

* **Dockerized setup** for containerized deployment
* **GitHub Actions** for automated CI/CD pipelines
* Deployable to **AWS**, **Heroku**, **DigitalOcean**, or **Vercel**

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!  
Feel free to fork the repo and submit a pull request.

---

## 🎯 Project Highlights

This backend is **production-ready** and **portfolio-grade**:

* ✅ Real-world e-commerce features
* ✅ Scalable & secure architecture
* ✅ Clean modular folder structure
* ✅ Optimized for performance & maintainability

---

## ❓ Troubleshooting & FAQ

* **MongoDB not connecting?** → Check `.env` config & whitelist IPs.
* **JWT expiring too quickly?** → Update `JWT_ACCESS_EXPIRES_IN` in `.env`.
* **Seeder not working?** → Ensure MongoDB is running before executing seed scripts.

---

## 👨‍💻 Author
- [Mohammad Mehedi Hasan](https://github.com/mahedy766584)
- LinkedIn: [[Mohammad Mehedi Hasan](https://linkedin.com/in/mohammad-mehedi-hasan-364b2432b)]

## 📜 License

This project is licensed under the **MIT License**.
