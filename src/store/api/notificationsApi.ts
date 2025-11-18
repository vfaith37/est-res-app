import { api } from './apiSlice';

export interface Notification {
  id: string;
  type: 'visitor' | 'maintenance' | 'payment' | 'amenity' | 'emergency' | 'announcement';
  title: string;
  message: string;
  attachment?: string; // URL to attachment file
  data?: any;
  read: boolean;
  status: 'new' | 'opened'; // Status based on read field
  createdAt: string;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      Notification[],
      { unreadOnly?: boolean; limit?: number }
    >({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    markAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    registerPushToken: builder.mutation<void, { token: string; platform: string }>({
      query: (data) => ({
        url: '/notifications/register-device',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useRegisterPushTokenMutation,
} = notificationsApi;