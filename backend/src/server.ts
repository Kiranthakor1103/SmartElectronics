import express from "express";
import dotenv from "dotenv";

// Load Environment Variables immediately before importing any modules that rely on them
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import compression from "compression";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes";

// Initialize Database Connection
connectDB();

const app = express();

// High-Performance Response Compression (Gzip / Brotli)
app.use(compression());

// Enterprise Security Headers (Allow cross-origin resource sharing & iframe embedding when needed)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Serve static uploaded files with 7-day browser caching headers
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    maxAge: "7d",
    immutable: true,
  })
);

// Body Parsers (with rawBody retention for Stripe webhook signature verification)
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      if (req.originalUrl && req.originalUrl.startsWith("/api/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Sanitize MongoDB Queries against Injection Attacks
app.use(mongoSanitize());

// CORS Settings with full LAN & Multi-Device Support
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Check if origin matches LAN IP addresses (10.x.x.x, 192.168.x.x, 172.16-31.x.x, localhost)
      const isLanOrLocal = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
        origin
      );

      if (
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.includes(origin) ||
        isLanOrLocal
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Request origin: ${origin}`);
      return callback(new Error(`CORS policy violation: Origin ${origin} blocked`));
    },
    credentials: true,
  })
);

// Trust reverse proxy headers (e.g. Next.js rewrites, Nginx, Cloudflare)
app.set("trust proxy", 1);

// Global Public API Rate Limiter
import { publicApiLimiter } from "./middleware/rateLimiter";
app.use("/api", publicApiLimiter);

// Mount Centralized Master Routes
app.use("/api", apiRoutes);

// Fallback Unmatched Route Handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Node.js Express Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err: any) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
