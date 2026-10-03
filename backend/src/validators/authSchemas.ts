import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  role: z
    .enum(["user", "seller"], {
      errorMap: () => ({ message: "Role must be either 'user' or 'seller'" }),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().min(5, "Phone number is too short").max(20).optional(),
  address: z.string().trim().max(300, "Address is too long").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address"),
  portal: z.enum(["customer", "admin"]).optional(),
});

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .trim()
    .min(10, "Invalid reset token format"),
  password: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().optional(),
});
