import { api } from "./apiSlice";

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  vehicleNumber?: string;
  visitDate: string;
  checkOutDate?: string;
  timeSlot: string;
  entryToken: string; // For manual entry
  qrCode: string;
  type: "guest" | "visitor"; // guest = single day, visitor = duration
  status:
    | "pending"
    | "approved"
    | "checked-in"
    | "checked-out"
    | "expired"
    | "revoked";
  createdAt: string;
  residentId: string;
  residentName: string;
  createdBy: string; // home_head or family_member
}

export interface CreateVisitorRequest {
  name: string;
  phone: string;
  purpose: string;
  vehicleNumber?: string;
  visitDate: string;
  checkOutDate?: string; // For visitors staying duration
  timeSlot: string;
  type: "guest" | "visitor";
}

export interface ValidateVisitorRequest {
  qrCode?: string;
  entryToken?: string;
}

export const visitorsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVisitors: builder.query<
      Visitor[],
      { status?: string; type?: string; limit?: number }
    >({
      query: ({ status, type, limit = 20 }) => ({
        url: "/visitors",
        params: { status, type, limit },
      }),
      providesTags: ["Visitors"],
    }),

    getVisitor: builder.query<Visitor, string>({
      query: (id) => `/visitors/${id}`,
      providesTags: (result, error, id) => [{ type: "Visitors", id }],
    }),

    createVisitor: builder.mutation<Visitor, CreateVisitorRequest>({
      query: (visitor) => ({
        url: "/visitors",
        method: "POST",
        body: visitor,
      }),
      invalidatesTags: ["Visitors"],
    }),

    updateVisitorStatus: builder.mutation<
      Visitor,
      { id: string; status: Visitor["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/visitors/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Visitors",
        { type: "Visitors", id },
      ],
    }),

    revokeVisitor: builder.mutation<Visitor, string>({
      query: (id) => ({
        url: `/visitors/${id}/revoke`,
        method: "PATCH",
      }),
      invalidatesTags: ["Visitors"],
    }),

    checkInVisitor: builder.mutation<Visitor, ValidateVisitorRequest>({
      query: (data) => ({
        url: "/visitors/check-in",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visitors"],
    }),

    checkOutVisitor: builder.mutation<Visitor, string>({
      query: (id) => ({
        url: `/visitors/${id}/check-out`,
        method: "POST",
      }),
      invalidatesTags: ["Visitors"],
    }),

    shareVisitorPass: builder.mutation<{ shareUrl: string }, string>({
      query: (id) => ({
        url: `/visitors/${id}/share`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetVisitorsQuery,
  useGetVisitorQuery,
  useCreateVisitorMutation,
  useUpdateVisitorStatusMutation,
  useRevokeVisitorMutation,
  useCheckInVisitorMutation,
  useCheckOutVisitorMutation,
  useShareVisitorPassMutation,
} = visitorsApi;
