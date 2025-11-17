import { api } from "./apiSlice";
import {
  ApiResponse,
  unwrapApiResponse,
  transformApiError,
} from "@/utils/apiHelpers";

// ==================== TYPES ====================

export interface Role {
  id: number;
  mnuName: string;
  path: string;
}

export interface CompanyDetails {
  coyname: string;
  coysite: string;
  coycity: string;
}

export interface LoginResponseData {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  corpname: string | null;
  phonenumber: string;
  fullname: string;
  roles: Role[];
  residentId: string;
  lastLogin: string;
  companyid: string;
  coyname: string;
  lastModifiedBy: string | null;
  coyDetails: CompanyDetails;
  access_token: string;
  refresh_token: string;
  account_type: string; // "Resident", "Security", "Admin", etc.
}

// Normalized User type for the app
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "security" | "home_head" | "family_member" | "admin";
  unit: string; // residentId
  avatar?: string;
  homeHeadId?: string;
  // Additional fields from API
  firstname: string;
  lastname: string;
  middlename?: string;
  fullname: string;
  companyId: string;
  companyName: string;
  residentId: string;
  accountType: string;
  roles: Role[];
  companyDetails: CompanyDetails;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Map account_type from API to app role
 */
function mapAccountTypeToRole(accountType: string): User["role"] {
  const type = accountType.toLowerCase();

  // Map based on account type or roles
  if (type === "security" || type === "guard") {
    return "security";
  }

  if (type === "admin" || type === "administrator") {
    return "admin";
  }

  if (type === "resident" || type === "home_head" || type === "homeowner") {
    return "home_head";
  }

  if (type === "family" || type === "family_member") {
    return "family_member";
  }

  // Default to home_head for residents
  return "home_head";
}

/**
 * Transform API response to normalized User object
 */
function transformLoginResponse(apiData: LoginResponseData): LoginResponse {
  const role = mapAccountTypeToRole(apiData.account_type);

  const user: User = {
    id: apiData.id,
    name: apiData.fullname,
    email: apiData.email,
    phone: apiData.phonenumber,
    role: role,
    unit: apiData.residentId,
    // Additional fields
    firstname: apiData.firstname,
    lastname: apiData.lastname,
    middlename: apiData.middlename || undefined,
    fullname: apiData.fullname,
    companyId: apiData.companyid,
    companyName: apiData.coyname,
    residentId: apiData.residentId,
    accountType: apiData.account_type,
    roles: apiData.roles,
    companyDetails: apiData.coyDetails,
  };

  return {
    user,
    token: apiData.access_token,
    refreshToken: apiData.refresh_token,
  };
}

// ==================== API ENDPOINTS ====================

export const authApi = api.injectEndpoints({
  overrideExisting: true, // Allow HMR to override endpoints in development
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<LoginResponseData>) => {
        // Check if login was successful
        if (response.respCode !== "00") {
          throw new Error(response.message || "Login failed");
        }

        // Transform the API response to our app format
        return transformLoginResponse(response.data);
      },
      transformErrorResponse: (response: any) => {
        // Handle API error response
        return {
          status: response.status,
          data: {
            message:
              response.data?.message || "Login failed. Please try again.",
            respCode: response.data?.respCode,
          },
        };
      },
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<User, void>({
      query: () => "/auth/profile",
      transformResponse: (response: ApiResponse<LoginResponseData>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to fetch profile");
        }
        return transformLoginResponse(response.data).user;
      },
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiResponse<LoginResponseData>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to update profile");
        }
        return transformLoginResponse(response.data).user;
      },
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      { token: string; refreshToken: string },
      string
    >({
      query: (refreshToken) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body: { refresh_token: refreshToken },
      }),
      transformResponse: (
        response: ApiResponse<{ access_token: string; refresh_token: string }>
      ) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to refresh token");
        }
        return {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      },
    }),

    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to change password");
        }
      },
    }),

    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to send reset email");
        }
      },
    }),

    verifyOTP: builder.mutation<void, { email: string; otp: string }>({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Invalid OTP code");
        }
      },
    }),

    resendOTP: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to resend OTP");
        }
      },
    }),

    confirmResetPassword: builder.mutation<
      void,
      { email: string; otp: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to reset password");
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<any>) => {
        // Logout might return error even on success, so don't throw
        if (__DEV__) {
          console.log("Logout response:", response.message);
        }
      },
      // Always invalidate cache on logout
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useConfirmResetPasswordMutation,
  useLogoutMutation,
} = authApi;
