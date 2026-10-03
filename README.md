# SmartElectronics — Multi-Vendor E-Commerce Platform

SmartElectronics is a high-performance, enterprise-grade e-commerce application built with Next.js 16 (App Router), Node.js / Express, TypeScript, MongoDB, and Redis.

---

## 🏛️ System Architecture

The project is organized into three decoupled services:

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

## ⚡ Quick Start (Development)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Admin Console
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

Run the entire stack with a single command:
```bash
docker-compose up --build -d
```
