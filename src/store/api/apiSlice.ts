import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../index";
import Constants from "expo-constants";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "https://api.yourestate.com";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
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
