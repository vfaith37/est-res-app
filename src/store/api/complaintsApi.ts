import { api } from "./apiSlice";
import { ApiResponse } from "@/utils/apiHelpers";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'noise' | 'security' | 'cleanliness' | 'other';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  residentName?: string;
  residentAddress?: string;
}

export interface ComplaintsSummary {
  total: number;
  resolved: number;
  in_progress: number;
  pending: number;
}

export interface GetComplaintsResponse {
  data: Complaint[];
  summary: ComplaintsSummary;
}

// Mock Data
const MOCK_COMPLAINTS: Complaint[] = [
    {
      id: '1',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'in_progress',
      createdAt: new Date().toISOString(), // Today
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'resolved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'resolved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'resolved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'resolved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Light Spoilt',
      description: 'Street light near Block A not working for 3 days',
      category: 'maintenance',
      status: 'pending', // Unresolved?
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
];

export const complaintsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getComplaints: builder.query<GetComplaintsResponse, void>({
      queryFn: async () => {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          data: {
             data: MOCK_COMPLAINTS,
             summary: {
                 total: 400, // Mocked from image
                 resolved: 4,
                 in_progress: 0,
                 pending: 396
             }
          }
        };
      },
      providesTags: ["Complaints"],
    }),
  }),
});

export const { useGetComplaintsQuery } = complaintsApi;

