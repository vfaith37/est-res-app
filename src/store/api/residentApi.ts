import { api } from "./apiSlice";
import { ApiResponse } from "@/utils/apiHelpers";

// ==================== TYPES ====================

export interface ResidentData {
  coyid: string;
  coyname: string;
  residentid: string;
  firstname: string;
  lastname: string;
  middlename: string;
  phone: string;
  email: string;
  whatsappfone: string;
  dob: string; // ISO date string
  gender: "Male" | "Female";
  maritalstatus: "Single" | "Married" | "Divorced" | "Widowed";
  estateaddr: string; // Current residential address
  formeraddr: string; // Former address
  workplacename: string;
  workplacepost: string; // Post at workplace
  workplaceaddr: string; // Workplace address
  photofilename: string;
  photomimetype: string;
  signedUrl: string; // Profile photo URL
}

export interface EditResidentRequest {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  phone?: string;
  email?: string;
  whatsappfone?: string;
  dob?: string;
  gender?: "Male" | "Female";
  maritalstatus?: "Single" | "Married" | "Divorced" | "Widowed";
  workplacename?: string;
  workplacepost?: string;
  workplaceaddr?: string;
  // Photo update fields (if needed)
  photofilename?: string;
  photomimetype?: string;
}

// ==================== API ENDPOINTS ====================

export const residentApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getResident: builder.query<ResidentData, string>({
      query: (residentId) => ({
        url: `/resident/getresident/${residentId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<ResidentData>) => {
        if (__DEV__) {
          console.log('getResident response:', JSON.stringify(response, null, 2));
        }

        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to fetch resident data");
        }

        if (!response.data) {
          console.error('getResident: response.data is undefined', response);
          throw new Error("No resident data in response");
        }

        return response.data;
      },
      transformErrorResponse: (response: any) => {
        if (__DEV__) {
          console.error('getResident error:', response);
        }
        return {
          status: response.status,
          data: {
            message: response.data?.message || "Failed to fetch resident data",
            respCode: response.data?.respCode,
          },
        };
      },
      providesTags: (result, error, residentId) => [
        { type: "Resident", id: residentId },
      ],
    }),

    editResident: builder.mutation<
      ResidentData,
      { residentId: string; data: EditResidentRequest }
    >({
      query: ({ residentId, data }) => ({
        url: "/resident/editresident",
        method: "PUT",
        body: {
          residentid: residentId,
          ...data,
        },
      }),
      transformResponse: (response: ApiResponse<ResidentData>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to update resident data");
        }
        return response.data;
      },
      invalidatesTags: (result, error, { residentId }) => [
        { type: "Resident", id: residentId },
        "User", // Also invalidate user data to update profile
      ],
    }),
  }),
});

export const { useGetResidentQuery, useEditResidentMutation } = residentApi;
