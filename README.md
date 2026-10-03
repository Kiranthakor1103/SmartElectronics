# SmartElectronics — Multi-Vendor E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **SmartElectronics** is a high-performance, enterprise-grade full-stack MERN e-commerce application built with Next.js 16 (App Router), Node.js / Express, TypeScript, MongoDB, and Redis caching. It features a responsive customer storefront, a real-time admin management portal, role-based access control, cart & checkout workflows, and multi-container Docker orchestration.

---

## 🌿 Repository Branching Structure

This project follows a decoupled multi-service branching model:

| Branch | Description | Included Services |
|---|---|---|
| **`main`** | Production-ready stable release | Complete codebase (`backend`, `frontend`, `admin`) |
| **`development`** | Active integration branch | All merged services tested together |
| **`devkiran-backend`** | Isolated backend development | Core REST API service (`backend/`) |
| **`devkiran-frontend`** | Isolated customer storefront | Customer web portal (`frontend/`) |
| **`devkiran-admin`** | Isolated admin console | Enterprise management dashboard (`admin/`) |

---

## 🏛️ System Architecture

The project is structured into three decoupled, independent services:

```
SmartElectronics/
├── backend/               # Core Node.js / Express REST API (Port 5000)
│   ├── src/
│   │   ├── config/        # MongoDB & Redis client configurations
│   │   ├── controllers/   # Route controllers (HTTP request/response)
│   │   ├── middleware/    # Auth, RBAC, rate limiting, caching, error handler
│   │   ├── models/        # Mongoose database schemas & models
│   │   ├── repositories/  # Data access layer (repository pattern)
│   │   ├── routes/        # Express API routing definitions
│   │   ├── services/      # Core business logic (orders, coupons, checkout, stock)
│   │   ├── utils/         # Helpers (mailer, stockManager, appError, apiResponse)
│   │   ├── validators/    # Joi request validation schemas
│   │   ├── server.ts      # Express server entrypoint
│   │   └── __tests__/     # Jest test suites
│   ├── Dockerfile         # Production container definition
│   └── package.json
│
├── frontend/              # Customer Storefront — Next.js 16 (Port 3000)
│   ├── app/               # App Router pages (catalog, cart, checkout, profile)
│   ├── components/        # Reusable UI components & layouts
│   ├── lib/               # Redux Toolkit store, auth helpers, constants
│   ├── services/          # Client-side API service connectors
│   ├── Dockerfile         # Production container definition
│   └── package.json
│
├── admin/                 # Enterprise Management Console — Next.js 16 (Port 3001)
│   ├── app/               # Admin App Router pages (catalog, orders, coupons, users)
│   │   ├── components/    # AdminAuthGuard, AdminSidebar, UI widgets
│   │   ├── lib/           # ApiClient (zero-cache), admin authService
│   │   └── products/      # Real-time stock & catalog management
│   ├── Dockerfile         # Production container definition
│   └── package.json
│
├── docker-compose.yml     # Complete multi-container orchestration
└── .gitignore             # Repository root ignore rules
```

---

## 🚀 Port & Service Allocation

| Service | Technology | Port | URL |
|---|---|:---:|---|
| **Customer Storefront** | Next.js 16 App Router | `3000` | [http://localhost:3000](http://localhost:3000) |
| **Admin Console** | Next.js 16 App Router | `3001` | [http://localhost:3001](http://localhost:3001) |
| **REST API Backend** | Express.js & TypeScript | `5000` | [http://localhost:5000/api](http://localhost:5000/api) |
| **Database** | MongoDB 7.0 | `27017` | `mongodb://localhost:27017/smartelectronic` |
| **Cache Store** | Redis 7.0 Alpine | `6379` | `redis://localhost:6379` |

---

## 🔑 Default Credentials

- **Admin Portal**: `http://localhost:3001/login`
  - **Email**: `admin@smartelectronic.com`
  - **Password**: `admin123`
- **Customer Support Inbox**: `supportsmatel23@yopmail.com` (Direct SMTP routing)

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js**: `v20.x` or higher
- **MongoDB**: Running locally or via MongoDB Atlas
- **Redis**: Running locally or via Docker

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```

### 2. Start Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

### 3. Start Customer Storefront
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

To launch the full-stack system with MongoDB and Redis using Docker Compose:

```bash
docker-compose up --build -d
```

To stop all running containers:
```bash
docker-compose down
```

---

## 📄 License
This project is licensed under the MIT License.
