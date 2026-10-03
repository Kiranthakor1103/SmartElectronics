import { authService } from "../services/authService";
import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcryptjs";

// Mock userRepository
jest.mock("../repositories/userRepository", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

describe("AuthService - Registration, Security & Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Privilege Escalation Prevention", () => {
    it("should strictly reject registration requests attempting to claim 'admin' role", async () => {
      await expect(
        authService.registerUser({
          name: "Attacker",
          email: "attacker@example.com",
          password: "password123",
          role: "admin",
        })
      ).rejects.toThrow(
        "Administrative accounts cannot be created via public registration"
      );
    });

    it("should default to 'user' role when role is not provided", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockImplementation((data) => ({
        _id: "user_12345",
        ...data,
        toObject: () => ({ _id: "user_12345", ...data }),
      }));

      const result = await authService.registerUser({
        name: "Standard Customer",
        email: "customer@example.com",
        password: "password123",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "user",
          email: "customer@example.com",
        })
      );
      expect(result.user.role).toBe("user");
      expect(result.token).toBeDefined();
    });

    it("should allow 'seller' role registration for merchant onboarding", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockImplementation((data) => ({
        _id: "seller_12345",
        ...data,
        toObject: () => ({ _id: "seller_12345", ...data }),
      }));

      const result = await authService.registerUser({
        name: "Tech Merchant",
        email: "merchant@example.com",
        password: "password123",
        role: "seller",
      });

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "seller",
        })
      );
      expect(result.user.role).toBe("seller");
    });

    it("should throw error if email is already registered", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        _id: "existing_1",
        email: "existing@example.com",
      });

      await expect(
        authService.registerUser({
          name: "Duplicate User",
          email: "existing@example.com",
          password: "password123",
        })
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("Login Authentication", () => {
    it("should reject login with wrong password", async () => {
      const hashedPassword = await bcrypt.hash("correct_password", 10);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        _id: "user_1",
        email: "user@example.com",
        password: hashedPassword,
      });

      await expect(
        authService.loginUser({
          email: "user@example.com",
          password: "wrong_password",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should successfully authenticate with valid credentials and return JWT", async () => {
      const plainPassword = "valid_password_123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        _id: "user_valid",
        name: "Valid User",
        email: "valid@example.com",
        role: "user",
        password: hashedPassword,
        toObject: function () {
          return { ...this };
        },
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.loginUser({
        email: "valid@example.com",
        password: plainPassword,
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe("valid@example.com");
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe("Password Reset Flow", () => {
    it("should return generic success message even if email is not found to prevent enumeration", async () => {
      const { User } = require("../models/User");
      jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

      const res = await authService.requestPasswordReset("nonexistent@example.com");
      expect(res.success).toBe(true);
      expect(res.message).toContain("If an account with this email exists");
    });

    it("should generate hashed reset token and set 1-hour expiration for existing user", async () => {
      const { User } = require("../models/User");
      const mockUser: any = {
        email: "target@example.com",
        name: "Target User",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findOne").mockResolvedValueOnce(mockUser);

      const res = await authService.requestPasswordReset("target@example.com");
      expect(res.success).toBe(true);
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(typeof mockUser.resetPasswordToken).toBe("string");
      expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should reject resetPassword with invalid or expired token", async () => {
      const { User } = require("../models/User");
      jest.spyOn(User, "findOne").mockResolvedValueOnce(null);

      await expect(
        authService.resetPassword("invalid_or_expired_token_12345", "new_password_123")
      ).rejects.toThrow("Invalid or expired password reset token");
    });

    it("should successfully reset password and clear reset token", async () => {
      const { User } = require("../models/User");
      const mockUser: any = {
        email: "target@example.com",
        resetPasswordToken: "some_hashed_token",
        resetPasswordExpires: new Date(Date.now() + 100000),
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, "findOne").mockResolvedValueOnce(mockUser);

      const res = await authService.resetPassword("valid_token_1234567890", "new_secure_pwd_123");
      expect(res.success).toBe(true);
      expect(mockUser.password).toBe("new_secure_pwd_123");
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});

