import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Zod validation error
  if (err.name === "ZodError" || (err as any).issues) {
    statusCode = 400;
    message = "Request validation error";
    const errors = ((err as any).errors || (err as any).issues || []).map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const key = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${key}. Please use another value!`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ");
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with id of ${(err as any).value}`;
  }

  // Sanitize internal server errors in production to avoid database or system leaks
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected internal server error occurred. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
