// @utils/apiHelpers.ts

/**
 * Standard API response structure from backend
 */
export interface ApiResponse<T> {
  respCode: string;
  message: string;
  data: T;
  description: {
    status: number;
    description: string;
    code: string;
    range: string;
  };
}

/**
 * Check if API response is successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return response.respCode === "00" || response.description?.status === 200;
}

/**
 * Extract data from API response or throw error
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!isSuccessResponse(response)) {
    throw new Error(response.message || "API request failed");
  }
  return response.data;
}

/**
 * Transform error response to user-friendly message
 */
export function getErrorMessage(error: any): string {
  // Check for API error response
  if (error?.data?.message) {
    return error.data.message;
  }

  // Check for network errors
  if (error?.status === "FETCH_ERROR") {
    return "Network error. Please check your connection.";
  }

  // Check for HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Session expired. Please login again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 422:
        return "Validation error. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
      case 502:
      case 503:
        return "Server error. Please try again later.";
      default:
        return "An unexpected error occurred.";
    }
  }

  // Generic error message
  if (error?.message) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Response codes mapping
 */
export const RESPONSE_CODES = {
  SUCCESS: "00",
  INVALID_CREDENTIALS: "01",
  USER_NOT_FOUND: "02",
  USER_INACTIVE: "03",
  VALIDATION_ERROR: "04",
  SERVER_ERROR: "99",
} as const;

/**
 * Check specific response code
 */
export function hasResponseCode(
  response: ApiResponse<any>,
  code: string
): boolean {
  return response.respCode === code;
}

/**
 * Transform API error for RTK Query
 */
export function transformApiError(error: any) {
  return {
    status: error.status || 500,
    data: {
      message: getErrorMessage(error),
      respCode: error?.data?.respCode,
      code: error?.data?.description?.code,
    },
  };
}
