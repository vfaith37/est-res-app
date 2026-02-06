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
  visitorfullName: string;
  email: string;
  phoneno: string;
  visitReason: string;
  arriveDate: string; // ISO date string
  departureDate?: string; // ISO date string - Only for guests
  visitorNum: number;
  status: "Un-Used" | "Used" | "In-Use" | "Revoked" | "Expired";
  createdat: string; // ISO date string
  assigneddays: any[]; // Array of assigned days
  qrcode?: string; // Base64 QR code image data (from create response)
  qr?: string; // Base64 QR code image data (from create response)
  address?: string; // Address (from create response)
  // New API fields
  gender?: string;
  tokenType?: string;
  visitorMainCategory?: string;
  visitorRelationship?: string;
  eventTitle?: string;
  durationnStartDate?: string | null;
  durationEndDate?: string | null;
  signinby?: string | null;
  signintime?: string | null;
  signingate?: string | null;
  signoutby?: string | null;
  signouttime?: string | null;
  signoutgate?: string | null;
  additionnote?: string | null;
  revokedAt?: string | null;
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

export interface VisitorStats {
  total: number;
  unused: number;
  used: number;
  inUse: number;
  revoked: number;
  expired: number;
}

export interface GetVisitorsResponse {
  visitors: Visitor[];
  stats: VisitorStats;
}

// Frontend normalized Visitor type
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
  // Extended details
  gender?: string;
  tokenType?: string;
  mainCategory?: string;
  relationship?: string;
  eventTitle?: string;
  durationStartDate?: string;
  durationEndDate?: string;
  signInBy?: string;
  signInTime?: string;
  signInGate?: string;
  signOutBy?: string;
  signOutTime?: string;
  signOutGate?: string;
  additionalNote?: string | null;
  revokedAt?: string | null;
}

// Backend API request for creating visitor token
export interface CreateVisitorTokenRequest {
  residentid: string; // Required
  visitFirstname?: string; // Optional for Event
  visitLastname?: string; // Optional for Event
  email?: string; // Optional for Event
  phoneno?: string; // Optional for Event
  arrivedate?: string; // Optional for Event? No, Event usually has durationnStartDate
  visitorNum?: number; // Optional?
  visitReason?: string; // Optional?
  tokenType: "One-Off" | "Re-Usable";
  visitorMainCategory:
    | "Casual"
    | "Event"
    | "Casual Guest"
    | "Event Guest"
    | "Visitor";
  visitorRelationship?: string;
  gender?: string;
  additionnote?: string;
  durationnStartDate?: string;
  durationEndDate?: string;
  eventTitle?: string;
  eventVisitors?: any[];
}

// Frontend create visitor request (user-friendly)
export interface CreateVisitorRequest {
  residentId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  arriveDate?: string;
  departureDate?: string;
  visitorNum?: number;
  purpose?: string;
  tokenType: "One-Off" | "Re-Usable";
  visitorMainCategory?:
    | "Casual"
    | "Event"
    | "Casual Guest"
    | "Event Guest"
    | "Visitor";
  visitorRelationship?: string;
  gender?: string;
  additionnote?: string;
  durationnStartDate?: string;
  durationEndDate?: string;
  eventTitle?: string;
  eventVisitors?: {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phone: string;
  }[];
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
    name: tokenData.visitorfullName,
    phone: tokenData.phoneno,
    email: tokenData.email,
    purpose: tokenData.visitReason,
    address: tokenData.address,
    visitDate: tokenData.arriveDate,
    departureDate: tokenData.departureDate,
    visitorNum: tokenData.visitorNum,
    qrCode: tokenData.qrcode,
    status: tokenData.status,
    residentId: tokenData.residentid,
    type: type,
    createdAt: tokenData.createdat,
    companyId: tokenData.coyid,
    assignedDays: tokenData.assigneddays,
    // Extended fields
    gender: tokenData.gender,
    tokenType: tokenData.tokenType,
    mainCategory: tokenData.visitorMainCategory,
    relationship: tokenData.visitorRelationship,
    eventTitle: tokenData.eventTitle,
    durationStartDate: tokenData.durationnStartDate || undefined,
    durationEndDate: tokenData.durationEndDate || undefined,
    signInBy: tokenData.signinby || undefined,
    signInTime: tokenData.signintime || undefined,
    signInGate: tokenData.signingate || undefined,
    signOutBy: tokenData.signoutby || undefined,
    signOutTime: tokenData.signouttime || undefined,
    signOutGate: tokenData.signoutgate || undefined,
    additionalNote: tokenData.additionnote || undefined,
    revokedAt: tokenData.revokedAt || undefined,
  };
}

/**
 * Transform frontend CreateVisitorRequest to backend CreateVisitorTokenRequest
 */
function transformCreateVisitorRequest(
  request: CreateVisitorRequest,
): CreateVisitorTokenRequest {
  const baseRequest: any = {
    residentid: request.residentId,
    visitFirstname: request.firstName,
    visitLastname: request.lastName,
    email: request.email,
    phoneno: request.phone,
    arrivedate: request.arriveDate,
    visitorNum: request.visitorNum,
    visitReason: request.purpose,
    tokenType: request.tokenType,
  };

  // Case 1: One-Off (Casual Guest -> Visitor)
  if (
    request.tokenType === "One-Off" &&
    request.visitorMainCategory === "Visitor"
  ) {
    return {
      ...baseRequest,
      visitorMainCategory: "Visitor",
      gender: request.gender || "Male",
      visitorRelationship: "",
      additionnote: "",
      durationnStartDate: "",
      durationEndDate: "",
      eventTitle: "",
      eventVisitors: [],
    };
  }

  // Case 2: Re-Usable (Visitor)
  if (
    request.tokenType === "Re-Usable" &&
    request.visitorMainCategory === "Visitor"
  ) {
    return {
      ...baseRequest,
      visitorMainCategory: "Visitor",
      visitorRelationship: request.visitorRelationship,
      additionnote: request.additionnote,
      durationnStartDate: request.durationnStartDate,
      durationEndDate: request.durationEndDate,
      gender: request.gender,
      eventTitle: "",
      eventVisitors: [],
    };
  }

  // Case 3: Event Guest
  if (request.visitorMainCategory === "Event Guest") {
    return {
      residentid: request.residentId,
      tokenType: "One-Off",
      visitorMainCategory: "Event Guest",
      eventTitle: request.eventTitle,
      visitorNum: request.visitorNum,
      additionnote: request.additionnote,
      durationnStartDate: request.durationnStartDate,
      durationEndDate: request.durationEndDate,
      eventVisitors:
        request.eventVisitors?.map((g) => ({
          visitorName: `${g.firstName} ${g.lastName}`,
          gender: g.gender,
          fone: g.phone,
          email: g.email,
        })) || [],
      // Ensure other fields are present as empty if strictly required by "all payloads" rule,
      // but user specifically excluded firstName etc. previously.
      // Assuming "excluded" refers to the optional fields we were tossing around.
      visitorRelationship: "",
      gender: "",
    };
  }

  // Case 4: Casual Guest
  if (request.visitorMainCategory === "Casual Guest") {
    const payload: any = {
      ...baseRequest,
      visitorMainCategory: "Casual Guest",
      visitorRelationship: request.visitorRelationship,
      additionnote: request.additionnote,
      durationnStartDate: request.durationnStartDate,
      durationEndDate: request.durationEndDate,
      gender: request.gender,
      eventTitle: request.eventTitle,
      eventVisitors: [],
    };
    return payload;
  }
  return baseRequest;
}

export const visitorsApi = api.injectEndpoints({
  overrideExisting: true, // Allow HMR to override endpoints in development
  endpoints: (builder) => ({
    // âœ… Get all visitor tokens for a resident
    getVisitors: builder.query<
      GetVisitorsResponse,
      { residentId: string; status?: string }
    >({
      query: ({ residentId, status }) => ({
        url: `resident/getallresidenttoken`,
        method: "GET",
        params: {
          residentid: residentId,
          status,
        },
      }),
      transformResponse: (response: ApiResponse<GetResidentTokensResponse>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to fetch visitor tokens");
        }
        // Response has nested structure: data.data[]
        const tokens = response.data.data || [];
        const summary = response.data.summary || {
          total_tokens: 0,
          unUsed_token: 0,
          used_token: 0,
          inUsed_token: 0,
          revoked_token: 0,
          expired_token: 0,
        };

        return {
          visitors: tokens.map((token) => transformVisitorToken(token)),
          stats: {
            total: summary.total_tokens,
            unused: summary.unUsed_token,
            used: summary.used_token,
            inUse: summary.inUsed_token,
            revoked: summary.revoked_token,
            expired: summary.expired_token,
          },
        };
      },
      providesTags: ["Visitors"],
    }),

    // âœ… Get guest category list
    getGuestCategoryList: builder.query<{ name: string }[], void>({
      query: () => ({
        url: "resident/getguestcategorylist",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<{ name: string }[]>) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to fetch guest categories",
          );
        }
        return response.data;
      },
    }),

    // âœ… Get Resident Details
    getResident: builder.query<any, string>({
      query: (residentId) => ({
        url: `resident/getresident/${residentId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to fetch resident details",
          );
        }
        return response.data;
      },
    }),

    // âœ… Get Single Visitor Details
    getVisitorById: builder.query<Visitor, string>({
      query: (visitorId) => ({
        url: `estatemgt/getresidenttokenbyid/${visitorId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<VisitorTokenData>) => {
        if (response.respCode !== "00") {
          throw new Error(
            response.message || "Failed to fetch visitor details",
          );
        }
        return transformVisitorToken(response.data);
      },
      providesTags: (_result, _error, id) => [{ type: "Visitors", id }],
    }),

    // âœ… Create new visitor token (generate pass)
    createVisitor: builder.mutation<Visitor, CreateVisitorRequest>({
      query: (visitor) => ({
        url: "resident/addresidenttoken",
        method: "POST",
        body: transformCreateVisitorRequest(visitor),
      }),
      transformResponse: (
        response: ApiResponse<VisitorTokenData>,
        meta,
        request,
      ) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to create visitor token");
        }
        // Create response may not have all fields, fill in defaults
        const tokenData: VisitorTokenData = {
          ...response.data,
          id: response.data.id || "",
          coyid: response.data.coyid || "",
          residentid: response.data.residentid || request.residentId,
          status: response.data.status || "Un-Used",
          qrcode: response.data.qr,
          createdat: response.data.createdat || new Date().toISOString(),
          assigneddays: response.data.assigneddays || [],
        };

        // Transform backend response to frontend format
        return transformVisitorToken(tokenData);
      },
      invalidatesTags: ["Visitors"],
    }),

    // âœ… Change visitor token status
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

    // âœ… Revoke visitor token (convenience wrapper)
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

    // âœ… Edit visitor token
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

    // âœ… Validate visitor token (for security check-in)
    validateVisitorToken: builder.mutation<Visitor, { token: string }>({
      query: ({ token }) => ({
        url: "estatemgt/validatetoken",
        method: "POST",
        body: { tok: token },
      }),
      transformResponse: (response: ApiResponse<VisitorTokenData>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Invalid visitor token");
        }
        return transformVisitorToken(response.data);
      },
    }),

    // âœ… Check in visitor (change status to "In-Use")
    checkInVisitor: builder.mutation<void, { tokenId: string }>({
      query: ({ tokenId }) => ({
        url: "resident/statustokenchange",
        method: "POST",
        body: {
          tok: tokenId,
          status: "In-Use",
        },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to check in visitor");
        }
      },
      invalidatesTags: ["Visitors"],
    }),

    // âœ… Check out visitor (change status to "Used")
    checkOutVisitor: builder.mutation<void, { tokenId: string }>({
      query: ({ tokenId }) => ({
        url: "resident/statustokenchange",
        method: "POST",
        body: {
          tok: tokenId,
          status: "Used",
        },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to check out visitor");
        }
      },
      invalidatesTags: ["Visitors"],
    }),

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
  useGetGuestCategoryListQuery,
  useGetResidentQuery,
  useGetVisitorByIdQuery,
  useCreateVisitorMutation,
  useChangeVisitorStatusMutation,
  useRevokeVisitorMutation,
  useEditVisitorMutation,
  useValidateVisitorTokenMutation,
  useCheckInVisitorMutation,
  useCheckOutVisitorMutation,
} = visitorsApi;
