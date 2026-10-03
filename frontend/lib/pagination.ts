export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(
  urlSearchParams: URLSearchParams,
  defaultLimit = 10
): PaginationQuery {
  const pageParam = urlSearchParams.get("page");
  const limitParam = urlSearchParams.get("limit");

  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitParam || String(defaultLimit), 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMetadata(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
