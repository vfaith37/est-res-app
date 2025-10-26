import { api } from "./apiSlice";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  dateOfBirth?: string;
  avatar?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface DomesticStaff {
  id: string;
  name: string;
  phone: string;
  role: string; // Cook, Cleaner, Driver, etc.
  idNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  startDate: string;
  endDate?: string;
  status: "active" | "inactive";
  photo?: string;
  createdAt: string;
}

export interface CreateFamilyMemberRequest {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  dateOfBirth?: string;
}

export interface CreateDomesticStaffRequest {
  name: string;
  phone: string;
  role: string;
  idNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  startDate: string;
  photo?: string;
}

export const householdApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Family Members
    getFamilyMembers: builder.query<FamilyMember[], void>({
      query: () => "/household/family-members",
      providesTags: ["FamilyMembers"],
    }),

    getFamilyMember: builder.query<FamilyMember, string>({
      query: (id) => `/household/family-members/${id}`,
      providesTags: (result, error, id) => [{ type: "FamilyMembers", id }],
    }),

    createFamilyMember: builder.mutation<
      FamilyMember,
      CreateFamilyMemberRequest
    >({
      query: (member) => ({
        url: "/household/family-members",
        method: "POST",
        body: member,
      }),
      invalidatesTags: ["FamilyMembers"],
    }),

    updateFamilyMember: builder.mutation<
      FamilyMember,
      { id: string; data: Partial<CreateFamilyMemberRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/household/family-members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "FamilyMembers",
        { type: "FamilyMembers", id },
      ],
    }),

    deleteFamilyMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/household/family-members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FamilyMembers"],
    }),

    // Domestic Staff
    getDomesticStaff: builder.query<DomesticStaff[], { status?: string }>({
      query: (params) => ({
        url: "/household/domestic-staff",
        params,
      }),
      providesTags: ["DomesticStaff"],
    }),

    getDomesticStaffMember: builder.query<DomesticStaff, string>({
      query: (id) => `/household/domestic-staff/${id}`,
      providesTags: (result, error, id) => [{ type: "DomesticStaff", id }],
    }),

    createDomesticStaff: builder.mutation<
      DomesticStaff,
      CreateDomesticStaffRequest
    >({
      query: (staff) => ({
        url: "/household/domestic-staff",
        method: "POST",
        body: staff,
      }),
      invalidatesTags: ["DomesticStaff"],
    }),

    updateDomesticStaff: builder.mutation<
      DomesticStaff,
      { id: string; data: Partial<CreateDomesticStaffRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/household/domestic-staff/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "DomesticStaff",
        { type: "DomesticStaff", id },
      ],
    }),

    updateStaffStatus: builder.mutation<
      DomesticStaff,
      { id: string; status: "active" | "inactive" }
    >({
      query: ({ id, status }) => ({
        url: `/household/domestic-staff/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "DomesticStaff",
        { type: "DomesticStaff", id },
      ],
    }),

    deleteDomesticStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: `/household/domestic-staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DomesticStaff"],
    }),
  }),
});

export const {
  useGetFamilyMembersQuery,
  useGetFamilyMemberQuery,
  useCreateFamilyMemberMutation,
  useUpdateFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
  useGetDomesticStaffQuery,
  useGetDomesticStaffMemberQuery,
  useCreateDomesticStaffMutation,
  useUpdateDomesticStaffMutation,
  useUpdateStaffStatusMutation,
  useDeleteDomesticStaffMutation,
} = householdApi;
