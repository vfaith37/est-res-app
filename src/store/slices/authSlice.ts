import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CompanyDetails, Role } from "../api/authApi";

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

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  rememberMe: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
        rememberMe?: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.rememberMe = action.payload.rememberMe || false;
    },

    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      // Keep rememberMe preference for next login
    },

    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
  },
});

export const {
  setCredentials,
  updateTokens,
  updateUser,
  logout,
  setRememberMe,
} = authSlice.actions;

export default authSlice.reducer;

