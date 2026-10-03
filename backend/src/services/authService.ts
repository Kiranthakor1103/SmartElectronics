import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../utils/appError";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/mailer";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  private generateToken(id: string, email: string, role: string): string {
    const jwtSecret =
      process.env.JWT_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      "kt_access_super_secret_key_change_in_production_2026";

    if (process.env.NODE_ENV === "production" && jwtSecret.includes("super_secret_key_change")) {
      console.warn("CRITICAL SECURITY: Default JWT secret is in use in production mode. Set JWT_SECRET in .env.");
    }

    return jwt.sign({ id, email, role }, jwtSecret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
    });
  }

  async registerUser(userData: { name: string; email: string; password?: string; role?: "user" | "seller" | "admin" }) {
    const { name, email, password, role } = userData;

    if (!name || !email) {
      throw new AppError("Name and email are required", 400);
    }

    // Disallow public registration of admin accounts to prevent privilege escalation
    if (role === "admin") {
      throw new AppError("Administrative accounts cannot be created via public registration", 403);
    }

    const assignedRole: "user" | "seller" = role === "seller" ? "seller" : "user";

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Pass plain password to userRepository.create - Mongoose User model pre('save') hook will hash it ONCE automatically.
    const user = await userRepository.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    const token = this.generateToken(user._id.toString(), user.email, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
  }

  async loginUser(credentials: { email: string; password?: string }) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.password) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
  }

  async googleAuth(credential: string) {
    if (!credential) {
      throw new AppError("Google credential token is required", 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError("Invalid Google token payload", 400);
    }

    let user = await userRepository.findByEmail(payload.email);

    if (!user) {
      user = await userRepository.create({
        name: payload.name || "Google User",
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: "user",
      });
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
  }

  async getCurrentUserProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async updateUserProfile(userId: string, data: { name?: string; phone?: string; address?: string }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim();
    if (data.address !== undefined) user.address = data.address.trim();

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async requestPasswordReset(email: string, portal: "customer" | "admin" = "customer") {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Prevent account enumeration by responding with generic success message even if not found
    if (!user) {
      return {
        success: true,
        message: "If an account with this email exists, password reset instructions have been sent.",
      };
    }

    // Generate unhashed 32-byte hex token for the email link
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store SHA-256 hash in database with 1-hour expiration
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Construct destination URL based on portal
    const baseUrl =
      portal === "admin"
        ? process.env.ADMIN_URL || "http://localhost:3001"
        : process.env.FRONTEND_URL || "http://localhost:3000";

    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch branded recovery email
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      portal,
    });

    return {
      success: true,
      message: "Password reset instructions have been dispatched to your email.",
      token: process.env.NODE_ENV === "test" ? rawToken : undefined, // expose token only in test mode for testing assertion
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new AppError("Reset token and new password are required.", 400);
    }

    // Hash the incoming raw token to compare against stored SHA-256
    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid or expired password reset token. Please request a new link.", 400);
    }

    // Set new password (pre('save') hook will hash it automatically)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      success: true,
      message: "Your password has been successfully reset. You can now sign in with your new credentials.",
    };
  }
}

export const authService = new AuthService();
