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
  residentId: string;
  firstName: string;
  othernames?: string;
  surname: string;
  gender: 'Male' | 'Female' | 'Other';
  DoB: string; // YYYY-MM-DD
  phoneNo: string;
  email: string;
  relationship: string;
  physicalAddr?: string;
  photo?: string | null; // URI
  // Employment Information
  employmentStatus: 'Employed' | 'Unemployed' | 'Self-employed' | 'Student' | 'Retired';
  jobTitle?: string;
  employerName?: string;
}

export interface CreateDomesticStaffRequest {
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dateOfBirth?: string; // Optional to handle null dates
  phone: string;
  email: string;
  photo?: string | null; // URI or base64, can be null
  // Employment Information
  role: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
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
          status: m.familyStatus?.toLowerCase() === "active" ? "active" : "inactive",
          createdAt: new Date().toISOString(),
          avatar: m.photofilename ? m.photofilename : undefined,
          // Store raw data for editing
          rawData: m
        }));
      },
      providesTags: ["FamilyMembers"],
    }),

    getFamilyMember: builder.query<FamilyMember, string>({
      query: (id) => `/household/family-members/${id}`,
      providesTags: (result, error, id) => [{ type: "FamilyMembers", id }],
    }),

    createFamilyMember: builder.mutation<void, CreateFamilyMemberRequest>({
      query: (data) => {
        const formData = new FormData();
        
        // Append all text fields to 'body'
        const body = {
            residentId: data.residentId,
            firstName: data.firstName,
            othernames: data.othernames || '',
            surname: data.surname,
            DoB: data.DoB,
            phoneNo: data.phoneNo,
            email: data.email,
            physicalAddr: data.physicalAddr || '',
            gender: data.gender,
            relationship: data.relationship,
            employmentStatus: data.employmentStatus,
            jobTitle: data.jobTitle || '',
            employerName: data.employerName || '',
        };
        
        formData.append('body', JSON.stringify(body));

        // Append file if exists
        if (data.photo) {
            const filename = data.photo.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            
            // @ts-ignore: React Native FormData
            formData.append('file', { uri: data.photo, name: filename, type });
        }

        return {
          url: "/residenthead/addfamilymembers",
          method: "POST",
          body: formData,
          headers: {
             'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: ["FamilyMembers"],
    }),

    updateFamilyMember: builder.mutation<void, { id: string; data: Partial<CreateFamilyMemberRequest> }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Append all text fields to 'body'
        // Ideally we should merge with existing data, but for now we send what we have
        // The backend likely expects the full object or partial updates? Assuming partial allowed or full object passed.
        // Based on "editfamilymembers", usually requires ID + fields.
        
        const body: any = {
           familymemberId: id, // Important for update
           ...data
        };
        
        // Transform keys if needed for edit (assuming same payload structure as add but with ID)
         const mappedBody = {
            familymemberId: id,
            residentId: data.residentId,
            firstName: data.firstName,
            othernames: data.othernames || '',
            surname: data.surname,
            DoB: data.DoB,
            phoneNo: data.phoneNo,
            email: data.email,
            physicalAddr: data.physicalAddr || '',
            gender: data.gender,
            relationship: data.relationship,
            employmentStatus: data.employmentStatus,
            jobTitle: data.jobTitle || '',
            employerName: data.employerName || '',
        };

        formData.append('body', JSON.stringify(mappedBody));

        if (data.photo) {
            const filename = data.photo.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            
            // @ts-ignore: React Native FormData
            formData.append('file', { uri: data.photo, name: filename, type });
        }

        return {
          url: "/residenthead/editfamilymembers",
          method: "PUT", // Or POST/PATCH depending on backend, usually PUT for edit
          body: formData,
          headers: {
             'Content-Type': 'multipart/form-data',
          },
        };
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
            phone: s.fone || s.phoneNo || '',
            role: s.staffRole || s.role || 'Staff',
            idNumber: s.idNumber || '', // specific field might need check
            address: s.address || '',
            emergencyContact: s.emergencyContact || '',
            emergencyPhone: s.emergencyPhone || '',
            startDate: s.startDate || new Date().toISOString(),
            status: s.status?.toLowerCase() === 'active' ? 'active' : 'inactive', // or map from specific field
            photo: s.photofilename || undefined,
            createdAt: new Date().toISOString(),
            rawData: s
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
      query: (staff) => ({
        url: "/residenthead/adddomesticstaff",
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
        url: `/residenthead/editdomesticstaff/${id}`,
        method: "PUT",
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
