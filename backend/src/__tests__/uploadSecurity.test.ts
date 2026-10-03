import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import uploadRoutes from "../routes/uploadRoutes";
import { errorHandler } from "../middleware/errorHandler";

const JWT_SECRET = process.env.JWT_SECRET || "kt_access_super_secret_key_change_in_production_2026";

const app = express();
app.use(express.json());
app.use("/api/upload", uploadRoutes);
app.use(errorHandler);

describe("Upload Route Security & RBAC Enforcement", () => {
  it("should reject unauthenticated upload attempt with 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/upload")
      .attach("image", Buffer.from("dummy image content"), "test.png");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject regular customer (role: user) attempting to upload with 403 Forbidden", async () => {
    const userToken = jwt.sign(
      { id: "user123", email: "user@example.com", role: "user" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("image", Buffer.from("dummy image content"), "test.png");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should allow admin (role: admin) to upload valid image", async () => {
    const adminToken = jwt.sign(
      { id: "admin123", email: "admin@smartelectronics.com", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("image", Buffer.from("fake png file content"), {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toMatch(/^\/uploads\/product-/);
  });
});
