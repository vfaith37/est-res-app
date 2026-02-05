import { api } from './apiSlice';

export interface Amenity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'sports' | 'recreation' | 'facility';
  capacity: number;
  bookingFee: number;
  availableSlots: string[];
  rules: string[];
}

export interface Booking {
  id: string;
  amenityId: string;
  amenityName: string;
  date: string;
  timeSlot: string;
  duration: number;
  fee: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  qrCode: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  amenityId: string;
  date: string;
  timeSlot: string;
  duration: number;
}

export const amenitiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAmenities: builder.query<Amenity[], { category?: string }>({
      query: (params) => ({
        url: '/amenities',
        params,
      }),
      providesTags: ['Amenities'],
    }),

    getAmenity: builder.query<Amenity, string>({
      query: (id) => `/amenities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Amenities', id }],
    }),

    getAvailableSlots: builder.query<string[], { amenityId: string; date: string }>({
      query: ({ amenityId, date }) => ({
        url: `/amenities/${amenityId}/available-slots`,
        params: { date },
      }),
    }),

    getMyBookings: builder.query<Booking[], { status?: string; upcoming?: boolean }>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Bookings'],
    }),

    getBooking: builder.query<Booking, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Bookings', id }],
    }),

    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (booking) => ({
        url: '/bookings',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Bookings', 'Amenities'],
    }),

    cancelBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings', 'Amenities'],
    }),

    checkInBooking: builder.mutation<Booking, string>({
      query: (qrCode) => ({
        url: '/bookings/check-in',
        method: 'POST',
        body: { qrCode },
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useGetAmenitiesQuery,
  useGetAmenityQuery,
  useGetAvailableSlotsQuery,
  useGetMyBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useCheckInBookingMutation,
} = amenitiesApi;
