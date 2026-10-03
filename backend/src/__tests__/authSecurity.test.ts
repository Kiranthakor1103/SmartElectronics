import { protect, authorize, verifySeller } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { sellerRepository } from "../repositories/sellerRepository";

jest.mock("../repositories/sellerRepository", () => ({
  sellerRepository: {
    findByUserId: jest.fn(),
  },
}));

describe("Auth Security & RBAC Middleware Enforcement", () => {
  const JWT_SECRET =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    "kt_access_super_secret_key_change_in_production_2026";

  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("protect middleware", () => {
    it("should reject request with 401 when no token is present", async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Not authorized to access this route" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject request with 401 when token is tampered or expired", async () => {
      req.headers.authorization = "Bearer invalid_signature_token";

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Token expired or invalid" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should accept valid Bearer token and attach decoded user to request", async () => {
      const validToken = jwt.sign(
        { id: "user_alice_123", email: "alice@test.com", role: "user" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      req.headers.authorization = `Bearer ${validToken}`;

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({
        id: "user_alice_123",
        email: "alice@test.com",
        role: "user",
      });
    });

    it("should accept valid token passed via HTTP-only cookie", async () => {
      const validCookieToken = jwt.sign(
        { id: "admin_bob_456", email: "admin@test.com", role: "admin" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      req.cookies.accessToken = validCookieToken;

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.role).toBe("admin");
    });
  });

  describe("authorize RBAC middleware", () => {
    it("should allow access when user role matches authorized roles", () => {
      req.user = { id: "admin_1", role: "admin" };
      const middleware = authorize("admin", "superadmin");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject access with 403 when user role is not authorized", () => {
      req.user = { id: "user_regular", role: "user" };
      const middleware = authorize("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User role 'user' is not authorized to access this resource",
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verifySeller KYC Guard middleware", () => {
    it("should automatically allow admin users through without seller check", async () => {
      req.user = { id: "admin_master", role: "admin" };

      await verifySeller(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should reject users who do not have the seller role", async () => {
      req.user = { id: "user_standard", role: "user" };

      await verifySeller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Access denied: Merchant role required" })
      );
    });

    it("should reject sellers whose KYC status is pending review", async () => {
      req.user = { id: "seller_pending_id", role: "seller" };
      (sellerRepository.findByUserId as jest.Mock).mockResolvedValue({
        _id: "seller_doc_1",
        kycStatus: "pending",
      });

      await verifySeller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Access denied: KYC review is pending or rejected",
        })
      );
    });

    it("should allow approved sellers through and attach seller profile", async () => {
      req.user = { id: "seller_approved_id", role: "seller" };
      const approvedProfile = {
        _id: "seller_doc_approved",
        companyName: "ElectroMart Official",
        kycStatus: "approved",
      };
      (sellerRepository.findByUserId as jest.Mock).mockResolvedValue(approvedProfile);

      await verifySeller(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.seller).toEqual(approvedProfile);
    });
  });
});
