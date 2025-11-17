import { api } from "./apiSlice";
import {
  ApiResponse,
  unwrapApiResponse,
  transformApiError,
} from "@/utils/apiHelpers";

// Backend API response for visitor token
export interface VisitorTokenData {
  id: string; // UUID
  coyid: string; // Company ID
  residentid: string;
  tok: string; // Token ID (e.g., "TT1000000051")
  fullName: string;
  email: string;
  phoneno: string;
  visitReason: string;
  arriveDate: string; // ISO date string
  departureDate?: string; // ISO date string - Only for guests
  visitorNum: number;
  status: "Un-Used" | "Used" | "In-Use" | "Revoked" | "Expired";
  createdat: string; // ISO date string
  assigneddays: any[]; // Array of assigned days
  qr?: string; // Base64 QR code image data (from create response)
  address?: string; // Address (from create response)
}

// Backend response structure for getresidenttoken
export interface GetResidentTokensResponse {
  data: VisitorTokenData[];
  summary?: {
    total_tokens: number;
    unUsed_token: number;
    used_token: number;
    inUsed_token: number;
    revoked_token: number;
    expired_token: number;
  };
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Frontend normalized Visitor type
export interface Visitor {
  id: string; // tok from backend
  uuid: string; // id (UUID) from backend
  name: string; // fullName
  phone: string; // phoneno
  purpose: string; // visitReason
  address?: string;
  email: string;
  visitDate: string; // arriveDate
  departureDate?: string; // departureDate - Only for guests
  visitorNum: number; // Number of visitors
  qrCode?: string; // qr base64 data (only from create response)
  status: "Un-Used" | "Used" | "In-Use" | "Revoked" | "Expired";
  residentId: string; // residentid
  type: "guest" | "visitor"; // guest = has departure date, visitor = day visit only
  createdAt: string; // createdat
  companyId: string; // coyid
  assignedDays: any[]; // assigneddays
}

// Backend API request for creating visitor token
export interface CreateVisitorTokenRequest {
  residentid: string;
  visitFirstname: string;
  visitLastname: string;
  email: string;
  phoneno: string;
  arrivedate: string; // Format: "2025-11-25"
  departuredate?: string; // Format: "2025-11-27" - Only for guests (overnight stays)
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
  departureDate?: string; // Only for guests (type: "guest")
  visitorNum: number;
  purpose: string;
  type: "guest" | "visitor"; // guest = has departure date, visitor = day visit only
}

export interface ValidateVisitorRequest {
  qrCode?: string;
  entryToken?: string;
}

/**
 * Transform backend VisitorTokenData to frontend Visitor format
 */
function transformVisitorToken(tokenData: VisitorTokenData): Visitor {
  // Determine type based on whether departure date exists
  const type = tokenData.departureDate ? "guest" : "visitor";

  return {
    id: tokenData.tok,
    uuid: tokenData.id,
    name: tokenData.fullName,
    phone: tokenData.phoneno,
    email: tokenData.email,
    purpose: tokenData.visitReason,
    address: tokenData.address,
    visitDate: tokenData.arriveDate,
    departureDate: tokenData.departureDate,
    visitorNum: tokenData.visitorNum,
    qrCode: tokenData.qr,
    status: tokenData.status,
    residentId: tokenData.residentid,
    type: type,
    createdAt: tokenData.createdat,
    companyId: tokenData.coyid,
    assignedDays: tokenData.assigneddays,
  };
}

/**
 * Transform frontend CreateVisitorRequest to backend CreateVisitorTokenRequest
 */
function transformCreateVisitorRequest(
  request: CreateVisitorRequest
): CreateVisitorTokenRequest {
  const baseRequest = {
    residentid: request.residentId,
    visitFirstname: request.firstName,
    visitLastname: request.lastName,
    email: request.email,
    phoneno: request.phone,
    arrivedate: request.arriveDate,
    visitorNum: request.visitorNum,
    visitReason: request.purpose,
  };

  // Add departuredate only for guests (overnight stays)
  if (request.type === "guest" && request.departureDate) {
    return {
      ...baseRequest,
      departuredate: request.departureDate,
    };
  }

  return baseRequest;
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
        response: ApiResponse<GetResidentTokensResponse>
      ) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to fetch visitor tokens"
          );
        }
        // Response has nested structure: data.data[]
        const tokens = response.data.data || [];

        // Transform backend data to frontend format
        return tokens.map((token) => transformVisitorToken(token));
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
        // Create response may not have all fields, fill in defaults
        const tokenData: VisitorTokenData = {
          ...response.data,
          id: response.data.id || "",
          coyid: response.data.coyid || "",
          residentid: response.data.residentid || request.residentId,
          status: response.data.status || "Un-Used",
          createdat: response.data.createdat || new Date().toISOString(),
          assigneddays: response.data.assigneddays || [],
        };

        // Transform backend response to frontend format
        return transformVisitorToken(tokenData);
      },
      invalidatesTags: ["Visitors"],
    }),

    // ✅ Change visitor token status
    changeVisitorStatus: builder.mutation<
      void,
      {
        tokenId: string;
        status: "In-Use" | "Used" | "Un-Used" | "Revoked" | "Expired";
      }
    >({
      query: ({ tokenId, status }) => ({
        url: "resident/statustokenchange",
        method: "POST",
        body: {
          tok: tokenId,
          status: status,
        },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to change token status");
        }
      },
      invalidatesTags: ["Visitors"],
    }),

    // ✅ Revoke visitor token (convenience wrapper)
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

    // ✅ Edit visitor token
    editVisitor: builder.mutation<
      Visitor,
      { tokenId: string; updates: Partial<CreateVisitorTokenRequest> }
    >({
      query: ({ tokenId, updates }) => ({
        url: "resident/editresidenttoken",
        method: "POST",
        body: {
          tok: tokenId,
          ...updates,
        },
      }),
      transformResponse: (response: ApiResponse<VisitorTokenData>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to edit visitor token");
        }
        return transformVisitorToken(response.data);
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
  useChangeVisitorStatusMutation,
  useRevokeVisitorMutation,
  useEditVisitorMutation,
  // ❌ Not yet available - backend endpoints not implemented
  // useGetVisitorQuery,
  // useCheckInVisitorMutation,
  // useCheckOutVisitorMutation,
  // useShareVisitorPassMutation,
} = visitorsApi;
