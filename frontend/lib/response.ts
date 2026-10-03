import { NextResponse } from "next/server";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** { success: true, statusCode, message, data } */
export function sendSuccess<T>(
  data: T,
  message = "Success",
  statusCode = 200
): NextResponse {
  return NextResponse.json(
    { success: true, statusCode, message, data },
    { status: statusCode }
  );
}

/** { success: true, statusCode, message, data, pagination } */
export function sendPaginated<T>(
  data: T,
  pagination: PaginationMeta,
  message = "Success",
  statusCode = 200
): NextResponse {
  return NextResponse.json(
    { success: true, statusCode, message, data, pagination },
    { status: statusCode }
  );
}

/** { success: false, statusCode, message, errors? } */
export function sendError(
  message: string,
  statusCode = 400,
  errors?: Array<{ field?: string; message: string }>
): NextResponse {
  return NextResponse.json(
    { success: false, statusCode, message, ...(errors ? { errors } : {}) },
    { status: statusCode }
  );
}
