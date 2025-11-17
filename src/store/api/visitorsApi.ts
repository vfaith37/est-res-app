import { api } from "./apiSlice";
import {
  ApiResponse,
  unwrapApiResponse,
  transformApiError,
} from "@/utils/apiHelpers";

// Backend API response for visitor token
export interface VisitorTokenData {
  tok: string; // Token ID (e.g., "TT1000000051")
  fullName: string;
  address: string;
  phoneno: string;
  email: string;
  visitReason: string;
  arriveDate: string; // ISO date string
  visitorNum: number;
  qr: string; // Base64 QR code image data
  status?: "Active" | "Revoked" | "Expired"; // Status from getresidenttoken
}

// Frontend normalized Visitor type
export interface Visitor {
  id: string; // tok from backend
  name: string; // fullName
  phone: string; // phoneno
  purpose: string; // visitReason
  address?: string;
  email: string;
  visitDate: string; // arriveDate
  visitorNum: number; // Number of visitors
  qrCode: string; // qr base64 data
  status: "Active" | "Revoked" | "Expired";
  residentId: string;

  // Legacy fields for backward compatibility (can be removed later)
  vehicleNumber?: string;
  checkOutDate?: string;
  timeSlot?: string;
  entryToken?: string;
  type?: "guest" | "visitor";
  createdAt?: string;
  residentName?: string;
  createdBy?: string;
}

// Backend API request for creating visitor token
export interface CreateVisitorTokenRequest {
  residentid: string;
  visitFirstname: string;
  visitLastname: string;
  email: string;
  phoneno: string;
  arrivedate: string; // Format: "2025-11-25"
  visitorNum: number;
  visitReason: string;
}

// Frontend create visitor request (user-friendly)
export interface CreateVisitorRequest {
  residentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  arriveDate: string;
  visitorNum: number;
  purpose: string;
}

export interface ValidateVisitorRequest {
  qrCode?: string;
  entryToken?: string;
}

/**
 * Transform backend VisitorTokenData to frontend Visitor format
 */
function transformVisitorToken(
  tokenData: VisitorTokenData,
  residentId: string
): Visitor {
  return {
    id: tokenData.tok,
    name: tokenData.fullName,
    phone: tokenData.phoneno,
    email: tokenData.email,
    purpose: tokenData.visitReason,
    address: tokenData.address,
    visitDate: tokenData.arriveDate,
    visitorNum: tokenData.visitorNum,
    qrCode: tokenData.qr,
    status: tokenData.status || "Active",
    residentId: residentId,
  };
}

/**
 * Transform frontend CreateVisitorRequest to backend CreateVisitorTokenRequest
 */
function transformCreateVisitorRequest(
  request: CreateVisitorRequest
): CreateVisitorTokenRequest {
  return {
    residentid: request.residentId,
    visitFirstname: request.firstName,
    visitLastname: request.lastName,
    email: request.email,
    phoneno: request.phone,
    arrivedate: request.arriveDate,
    visitorNum: request.visitorNum,
    visitReason: request.purpose,
  };
}

export const visitorsApi = api.injectEndpoints({
  overrideExisting: true, // Allow HMR to override endpoints in development
  endpoints: (builder) => ({
    // ✅ Get all visitor tokens for a resident
    getVisitors: builder.query<Visitor[], string>({
      query: (residentId) => ({
        url: `estatemgt/getresidenttoken/${residentId}`,
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<VisitorTokenData[]>,
        meta,
        residentId
      ) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to fetch visitor tokens"
          );
        }
        // Transform backend data to frontend format
        return response.data.map((token) =>
          transformVisitorToken(token, residentId)
        );
      },
      providesTags: ["Visitors"],
    }),

    // ✅ Create new visitor token (generate pass)
    createVisitor: builder.mutation<Visitor, CreateVisitorRequest>({
      query: (visitor) => ({
        url: "resident/addresidenttoken",
        method: "POST",
        body: transformCreateVisitorRequest(visitor),
      }),
      transformResponse: (
        response: ApiResponse<VisitorTokenData>,
        meta,
        request
      ) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to create visitor token"
          );
        }
        // Transform backend response to frontend format
        return transformVisitorToken(response.data, request.residentId);
      },
      invalidatesTags: ["Visitors"],
    }),

    // ✅ Revoke visitor token (change status to "Revoked")
    revokeVisitor: builder.mutation<void, { tokenId: string }>({
      query: ({ tokenId }) => ({
        url: "resident/statustokenchange",
        method: "POST",
        body: {
          tok: tokenId,
          status: "Revoked",
        },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to revoke visitor token");
        }
      },
      invalidatesTags: ["Visitors"],
    }),

    // ❌ NOT YET IMPLEMENTED IN BACKEND - Keeping for future use
    // Uncomment when backend team implements these endpoints

    // getVisitor: builder.query<Visitor, string>({
    //   query: (id) => `/visitors/${id}`,
    //   providesTags: (result, error, id) => [{ type: "Visitors", id }],
    // }),

    // updateVisitorStatus: builder.mutation<
    //   Visitor,
    //   { id: string; status: Visitor["status"] }
    // >({
    //   query: ({ id, status }) => ({
    //     url: `/visitors/${id}/status`,
    //     method: "PATCH",
    //     body: { status },
    //   }),
    //   invalidatesTags: (result, error, { id }) => [
    //     "Visitors",
    //     { type: "Visitors", id },
    //   ],
    // }),

    // checkInVisitor: builder.mutation<Visitor, ValidateVisitorRequest>({
    //   query: (data) => ({
    //     url: "/visitors/check-in",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Visitors"],
    // }),

    // checkOutVisitor: builder.mutation<Visitor, string>({
    //   query: (id) => ({
    //     url: `/visitors/${id}/check-out`,
    //     method: "POST",
    //   }),
    //   invalidatesTags: ["Visitors"],
    // }),

    // shareVisitorPass: builder.mutation<{ shareUrl: string }, string>({
    //   query: (id) => ({
    //     url: `/visitors/${id}/share`,
    //     method: "POST",
    //   }),
    // }),
  }),
});

export const {
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useRevokeVisitorMutation,
  // ❌ Not yet available - backend endpoints not implemented
  // useGetVisitorQuery,
  // useUpdateVisitorStatusMutation,
  // useCheckInVisitorMutation,
  // useCheckOutVisitorMutation,
  // useShareVisitorPassMutation,
} = visitorsApi;
