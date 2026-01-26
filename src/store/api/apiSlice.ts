import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "../index";
import Constants from "expo-constants";
import {
  encryptPayload,
  requiresEncryption,
  generateSecretHash,
} from "@/utils/encryption";
import { ENCRYPTION_CONFIG } from "@/config/encryption.config";
import { updateTokens, logout } from "../slices/authSlice";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "https://romakop.com.ng/api";

// Simple mutex to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// ==================== CUSTOM BASE QUERY WITH ENCRYPTION ====================
const baseQueryWithEncryption = (async (args, api, extraOptions) => {
  // Create base query with authentication
  const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  });

  // Check if encryption/hash is needed
  let modifiedArgs: string | FetchArgs = args;

  if (typeof args === "object") {
    const method = (args.method || "GET").toUpperCase();

    // Handle POST/PUT requests with body (encrypt + hash)
    if (
      args.body &&
      requiresEncryption(method) &&
      ENCRYPTION_CONFIG.ENABLED &&
      !(args.body instanceof FormData)
    ) {
      try {
        // console.log(`🚀 Encrypting ${method} request to:`, args.url);

        // Parse body if it's a string
        const bodyData =
          typeof args.body === "string" ? JSON.parse(args.body) : args.body;

        // Encrypt the payload
        const { encryptedPayload, hash } = await encryptPayload(bodyData);

        // Get existing headers
        const existingHeaders =
          typeof args.headers === "object" ? args.headers : {};

        // Create new headers
        const newHeaders = new Headers(existingHeaders as HeadersInit);
        newHeaders.set("X-Payload-Hash", hash);

        // Modify args with encrypted payload
        modifiedArgs = {
          ...args,
          body: encryptedPayload,
          headers: newHeaders,
        };

        // console.log("✅ Request encrypted successfully");
      } catch (error) {
        console.error("❌ Encryption failed:", error);
        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "Failed to encrypt request",
            data: error,
          } as FetchBaseQueryError,
        };
      }
    }
    // Handle GET requests (hash only, no encryption)
    else if (!args.body && ENCRYPTION_CONFIG.ENABLED) {
      try {
        // console.log(`🔑 Adding hash to ${method} request:`, args.url);

        // Generate secret-only hash for GET requests
        const hash = await generateSecretHash();

        // Get existing headers
        const existingHeaders =
          typeof args.headers === "object" ? args.headers : {};

        // Create new headers
        const newHeaders = new Headers(existingHeaders as HeadersInit);
        newHeaders.set("X-Payload-Hash", hash);

        // Modify args with hash header
        modifiedArgs = {
          ...args,
          headers: newHeaders,
        };

        // console.log("✅ Hash added to GET request");
      } catch (error) {
        console.error("❌ Hash generation failed:", error);
        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "Failed to generate hash",
            data: error,
          } as FetchBaseQueryError,
        };
      }
    } else if (!ENCRYPTION_CONFIG.ENABLED) {
      // console.log(
      //   `⚠️ ${method} request to:`,
      //   args.url,
      //   "(encryption/hash DISABLED)"
      // );
    }
  }

  // Execute the query
  return baseQuery(modifiedArgs, api, extraOptions);
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if an error is a JWT expired error
 */
function isJwtExpiredError(error: any): boolean {
  if (!error) return false;

  // Check for various JWT expired error patterns
  const errorData = error.data;
  if (errorData) {
    // Pattern 1: {"data": {"err": {"message": "jwt expired"}}}
    if (errorData.err?.message === "jwt expired") return true;
    if (errorData.err?.name === "TokenExpiredError") return true;

    // Pattern 2: {"data": {"message": "jwt expired"}}
    if (errorData.message === "jwt expired") return true;

    // Pattern 3: Direct message
    if (typeof errorData === "string" && errorData.includes("jwt expired"))
      return true;
  }

  // Check error message
  const message = error.message || error.error;
  if (typeof message === "string" && message.includes("jwt expired"))
    return true;

  return false;
}

/**
 * Base query with automatic token refresh on JWT expiration
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Try the initial request
  let result = await baseQueryWithEncryption(args, api, extraOptions);

  // Check if we got a JWT expired error
  if (
    result.error &&
    (result.error.status === 401 ||
      result.error.status === 500 ||
      result.error.status === 403) &&
    isJwtExpiredError(result.error)
  ) {
    if (__DEV__) {
      // console.log("🔄 JWT expired, attempting token refresh...");
    }

    // If already refreshing, wait for the existing refresh to complete
    if (isRefreshing && refreshPromise) {
      try {
        await refreshPromise;
        // Retry the original request with new token
        result = await baseQueryWithEncryption(args, api, extraOptions);
        return result;
      } catch (error) {
        // Refresh failed, logout
        if (__DEV__) {
          console.error("❌ Token refresh failed, logging out");
        }
        api.dispatch(logout());
        return result;
      }
    }

    // Start new refresh
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const state = api.getState() as RootState;
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Create a simple fetch request for token refresh
        const refreshBaseQuery = fetchBaseQuery({
          baseUrl: API_URL,
        });

        // Call refresh token endpoint
        const refreshResult = await refreshBaseQuery(
          {
            url: "/token/refresh",
            method: "POST",
            body: { refresh_token: refreshToken },
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const data = refreshResult.data as any;

          // Check if refresh was successful
          if (data.respCode === "00" && data.data) {
            const newToken = data.data.access_token;
            const newRefreshToken = data.data.refresh_token;

            if (__DEV__) {
              console.log("✅ Token refreshed successfully");
            }

            // Update tokens in state
            api.dispatch(
              updateTokens({
                token: newToken,
                refreshToken: newRefreshToken,
              }),
            );

            return { success: true };
          } else {
            throw new Error(data.message || "Token refresh failed");
          }
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (error) {
        if (__DEV__) {
          console.error("❌ Token refresh error:", error);
        }
        // Logout on refresh failure
        api.dispatch(logout());
        throw error;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    try {
      await refreshPromise;
      // Retry the original request with new token
      result = await baseQueryWithEncryption(args, api, extraOptions);
    } catch (error) {
      // Refresh failed, already logged out
      if (__DEV__) {
        console.error("❌ Failed to refresh token and retry request");
      }
    }
  }

  return result;
};

// ==================== API SLICE ====================
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Visitors",
    "Maintenance",
    "Payments",
    "Amenities",
    "Bookings",
    "Notifications",
    "User",
    "FamilyMembers",
    "DomesticStaff",
    "Emergencies",
    "Resident",
    "EstateVendors",
    "Complaints",
  ],
  endpoints: () => ({}),
});
