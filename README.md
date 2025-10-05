# 🛒 Multi-Seller E-commerce Server

A production-ready, professional Multi-Seller E-commerce Backend built with Node.js, Express, TypeScript and MongoDB + Mongoose. Designed for scalability, security, and real-world operations — includes multi-seller shops, notifications, audit logging, shopping cart, order management, and seller shop management.

## 📌 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Getting Started (Step-by-step)](#getting-started-step-by-step)
  - [Prerequisites](#prerequisites)
  - [Clone & Install](#clone--install)
  - [Environment Variables](#environment-variables)
  - [Database Setup & Seeding](#database-setup--seeding)
  - [Run Locally](#run-locally)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Users & Sellers](#users--sellers)
  - [Products & Categories](#products--categories)
  - [Cart & Orders](#cart--orders)
  - [Notifications & Audit Logs](#notifications--audit-logs)
- [Security & Production Checklist](#security--production-checklist)
- [Performance & Scaling Tips](#performance--scaling-tips)
- [Testing](#testing)
- [CI / CD & Deployment (Docker)](#ci--cd--deployment-docker)
- [Contributing](#contributing)
- [Project Showcase — How to present this to recruiters](#project-showcase--how-to-present-this-to-recruiters)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License](#license)


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
- **Payment-ready model design** — structured to easily integrate payment gateways (Stripe, SSLCommerz, etc.).  

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

