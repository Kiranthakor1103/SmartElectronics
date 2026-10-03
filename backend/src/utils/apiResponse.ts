import { Response } from "express";

export interface PaginationInfo {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationInfo,
    message = "Data fetched successfully",
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      count: data.length,
      pagination,
      data,
      products: data, // Backward compatibility for legacy clients
    });
  }

  static error(res: Response, message: string, statusCode = 500, errors: any = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
