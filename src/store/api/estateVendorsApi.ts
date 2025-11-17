import { api } from "./apiSlice";
import { ApiResponse } from "@/utils/apiHelpers";

// ==================== TYPES ====================

export interface EstateVendor {
  vendorid: string;
  name: string;
  fone: string;
  whatsappno: string;
  gender: "Male" | "Female";
  shopname: string;
  shopcategory: string; // "Mini", "Medium", "Large", etc.
  bizregno: string; // Business registration number
  zone: string; // "Main", "Secondary", etc.
  addr: string; // Address
  descr: string; // Description
}

export interface EstateVendorsSummary {
  total_vendor: number;
  inactive_vendor: number;
  active_vendor: number;
  currMth_vendor_knt: number;
  prevMth_vendor_knt: number;
  prevMth_inactive_knt: number;
  prevMth_active_knt: number;
  currMth_inactive_knt: number;
  currMth_active_knt: number;
}

export interface EstateVendorsPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEstateVendorsResponse {
  data: EstateVendor[];
  summary: EstateVendorsSummary;
  pagination: EstateVendorsPagination;
}

// ==================== API ENDPOINTS ====================

export const estateVendorsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEstateVendors: builder.query<GetEstateVendorsResponse, void>({
      query: () => ({
        url: "/estateops/getallestatevendors",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<GetEstateVendorsResponse>) => {
        if (__DEV__) {
          console.log('getEstateVendors response:', JSON.stringify(response, null, 2));
        }

        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to fetch estate vendors");
        }

        if (!response.data) {
          console.error('getEstateVendors: response.data is undefined', response);
          throw new Error("No vendors data in response");
        }

        return response.data;
      },
      transformErrorResponse: (response: any) => {
        if (__DEV__) {
          console.error('getEstateVendors error:', response);
        }
        return {
          status: response.status,
          data: {
            message: response.data?.message || "Failed to fetch estate vendors",
            respCode: response.data?.respCode,
          },
        };
      },
      providesTags: ["EstateVendors"],
    }),
  }),
});

export const { useGetEstateVendorsQuery } = estateVendorsApi;
