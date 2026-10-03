import { Router } from "express";
import {
  register,
  login,
  logout,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authSchemas";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.get("/me", protect as any, getMe);
router.put("/profile", protect as any, validateBody(updateProfileSchema), updateProfile);

router.post("/forgot-password", authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authRateLimiter, validateBody(resetPasswordSchema), resetPassword);

export default router;

