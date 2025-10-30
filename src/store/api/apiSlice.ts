import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "../index";
import Constants from "expo-constants";
import { encryptPayload, requiresEncryption } from "@/utils/encryption";
import { ENCRYPTION_CONFIG } from "@/config/encryption.config";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "https://api.yourestate.com";

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

  // Check if encryption is needed
  let modifiedArgs: string | FetchArgs = args;

  if (typeof args === "object" && args.body) {
    const method = (args.method || "GET").toUpperCase();

    if (requiresEncryption(method) && ENCRYPTION_CONFIG.ENABLED) {
      try {
        console.log(`🚀 Encrypting ${method} request to:`, args.url);

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

        console.log("✅ Request encrypted successfully");
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
    } else if (requiresEncryption(method) && !ENCRYPTION_CONFIG.ENABLED) {
      console.log(
        `⚠️ ${method} request to:`,
        args.url,
        "(encryption DISABLED)"
      );
    } else {
      console.log(
        `📤 ${method} request to:`,
        args.url,
        "(no encryption required)"
      );
    }
  }

  // Execute the query
  return baseQuery(modifiedArgs, api, extraOptions);
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

// ==================== API SLICE ====================
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithEncryption,
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
  ],
  endpoints: () => ({}),
});
