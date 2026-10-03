import express from "express";
import request from "supertest";
import { authRateLimiter } from "../middleware/rateLimiter";

describe("Rate Limiter Middleware Enforcement", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post("/test-login", authRateLimiter, (req, res) => {
      res.status(200).json({ success: true, message: "Authorized" });
    });
  });

  it("should allow requests within rate limit threshold and set RateLimit headers", async () => {
    const res = await request(app).post("/test-login");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["ratelimit-limit"]).toBeDefined();
  });
});
