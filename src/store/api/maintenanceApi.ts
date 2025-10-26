import { api } from "./apiSlice";

export interface MaintenanceRequest {
  id: string;
  category:
    | "plumbing"
    | "electrical"
    | "cleaning"
    | "carpentry"
    | "hvac"
    | "other";
  title: string;
  description: string;
  images: string[];
  location: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  residentId: string;
  assignedTo?: string;
  estimatedCompletion?: string;
}

export interface CreateMaintenanceRequest {
  category: MaintenanceRequest["category"];
  title: string;
  description: string;
  images?: string[];
  location: string;
  priority: MaintenanceRequest["priority"];
}

export const maintenanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceRequests: builder.query<
      MaintenanceRequest[],
      { status?: string; priority?: string }
    >({
      query: (params) => ({
        url: "/maintenance",
        params,
      }),
      providesTags: ["Maintenance"],
    }),

    getMaintenanceRequest: builder.query<MaintenanceRequest, string>({
      query: (id) => `/maintenance/${id}`,
      providesTags: (result, error, id) => [{ type: "Maintenance", id }],
    }),

    createMaintenanceRequest: builder.mutation<
      MaintenanceRequest,
      CreateMaintenanceRequest
    >({
      query: (request) => ({
        url: "/maintenance",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Maintenance"],
    }),

    updateMaintenanceStatus: builder.mutation<
      MaintenanceRequest,
      { id: string; status: MaintenanceRequest["status"]; notes?: string }
    >({
      query: ({ id, status, notes }) => ({
        url: `/maintenance/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Maintenance",
        { type: "Maintenance", id },
      ],
    }),

    uploadMaintenanceImage: builder.mutation<
      { url: string },
      { file: FormData }
    >({
      query: ({ file }) => ({
        url: "/maintenance/upload",
        method: "POST",
        body: file,
      }),
    }),
  }),
});

export const {
  useGetMaintenanceRequestsQuery,
  useGetMaintenanceRequestQuery,
  useCreateMaintenanceRequestMutation,
  useUpdateMaintenanceStatusMutation,
  useUploadMaintenanceImageMutation,
} = maintenanceApi;
