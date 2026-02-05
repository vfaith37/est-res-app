import { api } from "./apiSlice";
import { encryptPayload } from "@/utils/encryption";

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
  residentId: string;
  firstName: string;
  othernames?: string;
  surname: string;
  gender: "Male" | "Female" | "Other";
  DoB: string; // YYYY-MM-DD
  phoneNo: string;
  email: string;
  relationship: string;
  physicalAddr?: string;
  photo?: string | null; // URI
  // Employment Information
  employmentStatus:
    | "Employed"
    | "Unemployed"
    | "Self-employed"
    | "Student"
    | "Retired";
  jobTitle?: string;
  employerName?: string;
}

export interface CreateDomesticStaffRequest {
  residentId: string;
  firstName: string;
  lastName: string;
  othernames?: string;
  gender: "Male" | "Female";
  dateOfBirth?: string; // Optional to handle null dates
  phone: string;
  email: string;
  photo?: string | null; // URI or base64, can be null
  // Employment Information
  role: string;
  employmentType: "Live-In" | "Live-Out";
  workDays?: string[]; // Array of day names
  startDate?: string; // Optional to handle null dates
}

export const householdApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Family Members
    getFamilyMembers: builder.query<FamilyMember[], void>({
      query: () => ({
        url: "estatemgt/getallfamilymembers",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (response.respCode !== "00") {
          throw new Error(response.message || "Failed to fetch family members");
        }
        // Backend returns data.data array
        const members = response.data?.data || [];
        return members.map((m: any) => ({
          id: m.familymemberId, // Use familialID
          name: `${m.firstname} ${m.surname}`,
          email: m.email,
          phone: m.fone,
          relationship: m.relationship,
          status:
            m.familyStatus?.toLowerCase() === "active" ? "active" : "inactive",
          createdAt: new Date().toISOString(),
          avatar: m.photofilename ? m.photofilename : undefined,
          // Store raw data for editing
          rawData: m,
        }));
      },
      providesTags: ["FamilyMembers"],
    }),

    getFamilyMember: builder.query<FamilyMember, string>({
      query: (id) => `/household/family-members/${id}`,
      providesTags: (result, error, id) => [{ type: "FamilyMembers", id }],
    }),

    createFamilyMember: builder.mutation<void, CreateFamilyMemberRequest>({
      queryFn: async (data, _queryApi, _extraOptions, baseQuery) => {
        try {
          const body = {
            residentId: data.residentId,
            firstName: data.firstName,
            othernames: data.othernames || "",
            surname: data.surname,
            DoB: data.DoB,
            phoneNo: data.phoneNo,
            email: data.email,
            physicalAddr: data.physicalAddr || "",
            gender: data.gender,
            relationship: data.relationship,
            employmentStatus: data.employmentStatus,
            jobTitle: data.jobTitle || "",
            employerName: data.employerName || "",
          };

          const { encryptedPayload, hash } = await encryptPayload(body);

          const formData = new FormData();
          formData.append("body", encryptedPayload);

          if (data.photo) {
            const filename = data.photo.split("/").pop() || "photo.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            // @ts-ignore
            formData.append("file", { uri: data.photo, name: filename, type });
          }

          const result = await baseQuery({
            url: "/residenthead/addfamilymembers",
            method: "POST",
            body: formData,
            headers: { "X-Payload-Hash": hash },
          });

          if (result.error) return { error: result.error as any };
          return { data: result.data as void };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } };
        }
      },
      invalidatesTags: ["FamilyMembers"],
    }),

    updateFamilyMember: builder.mutation<
      void,
      { id: string; data: Partial<CreateFamilyMemberRequest> }
    >({
      queryFn: async ({ id, data }, _queryApi, _extraOptions, baseQuery) => {
        try {
          const body = {
            familymemberId: id,
            residentId: data.residentId,
            firstName: data.firstName,
            othernames: data.othernames || "",
            surname: data.surname,
            DoB: data.DoB,
            phoneNo: data.phoneNo,
            email: data.email,
            physicalAddr: data.physicalAddr || "",
            gender: data.gender,
            relationship: data.relationship,
            employmentStatus: data.employmentStatus,
            jobTitle: data.jobTitle || "",
            employerName: data.employerName || "",
          };

          const { encryptedPayload, hash } = await encryptPayload(body);

          const formData = new FormData();
          formData.append("body", encryptedPayload);

          if (data.photo) {
            const filename = data.photo.split("/").pop() || "photo.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            // @ts-ignore
            formData.append("file", { uri: data.photo, name: filename, type });
          }

          const result = await baseQuery({
            url: "/residenthead/editfamilymembers",
            method: "PUT",
            body: formData,
            headers: { "X-Payload-Hash": hash },
          });

          if (result.error) return { error: result.error as any };
          return { data: result.data as void };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } };
        }
      },
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
    getDomesticStaff: builder.query<DomesticStaff[], void>({
      query: () => ({
        url: "residenthead/getdomesticstafflist",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (response.respCode !== "00") {
          // Backend might return different codes, but assuming 00 is success like family
          // If array is empty/null, handle gracefully
        }
        const staff = response.data || []; // Adjust based on actual structure, maybe response.data.data

        return staff.map((s: any) => ({
          id: s.staffId || s.id,
          name: `${s.firstname} ${s.surname}`,
          phone: s.fone || s.phoneNo || "",
          role: s.staffRole || s.role || "Staff",
          idNumber: s.idNumber || "", // specific field might need check
          address: s.address || "",
          emergencyContact: s.emergencyContact || "",
          emergencyPhone: s.emergencyPhone || "",
          startDate: s.startDate || new Date().toISOString(),
          status: s.status?.toLowerCase() === "active" ? "active" : "inactive", // or map from specific field
          photo: s.photofilename || undefined,
          createdAt: new Date().toISOString(),
          rawData: s,
        }));
      },
      providesTags: ["DomesticStaff"],
    }),

    getDomesticStaffMember: builder.query<DomesticStaff, string>({
      query: (id) => `/residenthead/getdomesticstafflist/${id}`,
      providesTags: (result, error, id) => [{ type: "DomesticStaff", id }],
    }),

    createDomesticStaff: builder.mutation<
      DomesticStaff,
      CreateDomesticStaffRequest
    >({
      queryFn: async (staff, _queryApi, _extraOptions, baseQuery) => {
        try {
          const days = staff.workDays || [];
          // Construct body (all fields except photo are in staff)
          const body = {
            residentId: staff.residentId,
            firstname: staff.firstName,
            surname: staff.lastName,
            othername: staff.othernames || "",
            gender: staff.gender,
            DoB: staff.dateOfBirth,
            fone: staff.phone,
            email: staff.email,
            empRole: staff.role,
            empType: staff.employmentType, // 'Live-In' | 'Live-Out'
            empStartDate: staff.startDate,

            // Work Time Logic
            workTime: "Custom_Days", // Defaulting to Custom_Days to specify exact days
            cMonday: days.includes("Monday"),
            cTuesday: days.includes("Tuesday"),
            cWednesday: days.includes("Wednesday"),
            cThursday: days.includes("Thursday"),
            cFriday: days.includes("Friday"),
            cSaturday: days.includes("Saturday"),
            cSunday: days.includes("Sunday"),
          };

          const { encryptedPayload, hash } = await encryptPayload(body);

          const formData = new FormData();
          formData.append("body", encryptedPayload);

          if (staff.photo) {
            const filename = staff.photo.split("/").pop() || "photo.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            // @ts-ignore
            formData.append("file", { uri: staff.photo, name: filename, type });
          }

          const result = await baseQuery({
            url: "/residenthead/adddomesticstaff",
            method: "POST",
            body: formData,
            headers: { "X-Payload-Hash": hash },
          });

          if (result.error) return { error: result.error as any };
          return { data: result.data as DomesticStaff };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } };
        }
      },
      invalidatesTags: ["DomesticStaff"],
    }),

    updateDomesticStaff: builder.mutation<
      DomesticStaff,
      { id: string; data: Partial<CreateDomesticStaffRequest> }
    >({
      queryFn: async ({ id, data }, _queryApi, _extraOptions, baseQuery) => {
        try {
          const days = data.workDays || [];
          // Map keys for update - assuming similar structure to create but with staffId
          // Note: Update payload might need to be partial, but usually replacing full object or specific fields.
          // Using the same structure as create for now.

          const body = {
            staffId: id,
            residentId: data.residentId,
            firstname: data.firstName,
            surname: data.lastName,
            othername: data.othernames || "",
            gender: data.gender,
            DoB: data.dateOfBirth,
            fone: data.phone,
            email: data.email,
            empRole: data.role,
            empType: data.employmentType,
            empStartDate: data.startDate,

            workTime: "Custom_Days",
            cMonday: days.includes("Monday"),
            cTuesday: days.includes("Tuesday"),
            cWednesday: days.includes("Wednesday"),
            cThursday: days.includes("Thursday"),
            cFriday: days.includes("Friday"),
            cSaturday: days.includes("Saturday"),
            cSunday: days.includes("Sunday"),
          };

          const { encryptedPayload, hash } = await encryptPayload(body);

          const formData = new FormData();
          formData.append("body", encryptedPayload);

          if (data.photo) {
            const filename = data.photo.split("/").pop() || "photo.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";
            // @ts-ignore
            formData.append("file", { uri: data.photo, name: filename, type });
          }

          const result = await baseQuery({
            url: `/residenthead/editdomesticstaff/${id}`,
            method: "PUT",
            body: formData,
            headers: { "X-Payload-Hash": hash },
          });

          if (result.error) return { error: result.error as any };
          return { data: result.data as DomesticStaff };
        } catch (e: any) {
          return { error: { status: "CUSTOM_ERROR", error: e.message } };
        }
      },
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
        url: `/residenthead/editdomesticstaff/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "DomesticStaff",
        { type: "DomesticStaff", id },
      ],
    }),

    deleteDomesticStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: `/residenthead/editdomesticstaff/${id}`,
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

