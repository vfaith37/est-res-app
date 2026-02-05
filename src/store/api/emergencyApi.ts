import { api } from "./apiSlice";

export interface Emergency {
  id: string;
  type: "fire" | "medical" | "security" | "other";
  title: string;
  description: string;
  location: string;
  priority: "high" | "critical";
  status: "active" | "responded" | "resolved";
  images?: string[];
  reportedBy: string;
  reportedByName: string;
  createdAt: string;
  updatedAt: string;
  respondedBy?: string;
  resolvedAt?: string;
}

export interface CreateEmergencyRequest {
  type: Emergency["type"];
  title: string;
  description: string;
  location: string;
  images?: string[];
}

export const emergencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmergencies: builder.query<Emergency[], { status?: string }>({
      query: (params) => ({
        url: "/emergencies",
        params,
      }),
      providesTags: ["Emergencies"],
    }),

    getEmergency: builder.query<Emergency, string>({
      query: (id) => `/emergencies/${id}`,
      providesTags: (result, error, id) => [{ type: "Emergencies", id }],
    }),

    createEmergency: builder.mutation<Emergency, CreateEmergencyRequest>({
      query: (emergency) => ({
        url: "/emergencies",
        method: "POST",
        body: emergency,
      }),
      invalidatesTags: ["Emergencies"],
    }),

    updateEmergencyStatus: builder.mutation<
      Emergency,
      { id: string; status: Emergency["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/emergencies/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Emergencies",
        { type: "Emergencies", id },
      ],
    }),

    respondToEmergency: builder.mutation<Emergency, string>({
      query: (id) => ({
        url: `/emergencies/${id}/respond`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        "Emergencies",
        { type: "Emergencies", id },
      ],
    }),
  }),
});

export const {
  useGetEmergenciesQuery,
  useGetEmergencyQuery,
  useCreateEmergencyMutation,
  useUpdateEmergencyStatusMutation,
  useRespondToEmergencyMutation,
} = emergencyApi;

