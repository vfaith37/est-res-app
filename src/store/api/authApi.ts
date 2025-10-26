import { api } from "./apiSlice";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "security" | "home_head" | "family_member" | "domestic_staff";
  unit: string;
  avatar?: string;
  homeHeadId?: string; // For family members and domestic staff
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<User, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/auth/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
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
    }),

    resetPassword: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
