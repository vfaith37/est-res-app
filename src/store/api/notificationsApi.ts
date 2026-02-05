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
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData: Notification[] = [
            {
                id: '1',
                type: 'announcement',
                title: 'Water Supply interruption',
                message: 'Lorem ipsum dolor sit amet consectetur. Eget com...',
                read: false,
                status: 'new',
                createdAt: new Date().toISOString(), // Today
            },
            {
                id: '2',
                type: 'announcement',
                title: 'Water Supply interruption',
                message: 'Lorem ipsum dolor sit amet consectetur. Eget com...',
                read: false,
                status: 'new',
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                type: 'announcement',
                title: 'Water Supply interruption',
                message: 'Lorem ipsum dolor sit amet consectetur. Eget com...',
                read: true,
                status: 'opened',
                createdAt: new Date().toISOString(),
            },
            {
                id: '4',
                type: 'announcement',
                title: 'Water Supply interruption',
                message: 'Lorem ipsum dolor sit amet consectetur. Eget com...',
                read: true,
                status: 'opened',
                createdAt: new Date().toISOString(),
            },
        ];
        return { data: mockData };
      },
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
