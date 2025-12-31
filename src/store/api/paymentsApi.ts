import { api } from './apiSlice';

export interface Payment {
  id: string;
  type: 'service_charge' | 'utility' | 'amenity' | 'fine' | 'other';
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceUrl?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: string;
  invoiceId?: string;
  dueId?: string;
}

export interface InitiatePaymentRequest {
  paymentId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], { status?: string; type?: string; limit?: number }>({
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const today = new Date().toISOString();
        const basePayment = {
            id: '1',
            type: 'service_charge' as const,
            description: 'Estate Thrash Due',
            amount: 8000.00,
            dueDate: '1882299292999', // Using Due ID as placeholder or similar? The image has IDs
            // The image shows "Due ID 1882...", "Invoice ID 188..."
            // I'll add extra fields to the Payment interface or just reuse existing ones.
            // Image shows: Due ID, Invoice ID, Date Added
            paidDate: today,
            status: 'pending' as const,
            createdAt: today, 
            invoiceId: '1882299292999',
            dueId: '1882299292999',
        };

        const mockData: Payment[] = [
            { ...basePayment, id: '1', status: 'pending', createdAt: today },
            { ...basePayment, id: '2', status: 'pending', createdAt: today },
            { ...basePayment, id: '3', status: 'pending', createdAt: today }, // Pending Review -> mapped to pending or custom? Image has 'Pending Review' (Orange) vs 'Pending Payment' (Yellow)
            { ...basePayment, id: '4', status: 'paid', createdAt: today },
            { ...basePayment, id: '5', status: 'paid', createdAt: today },
            { ...basePayment, id: '6', status: 'paid', createdAt: today },
            { ...basePayment, id: '7', status: 'cancelled', createdAt: today }, // Denied -> cancelled?
            { ...basePayment, id: '8', status: 'cancelled', createdAt: today },
        ];
        return { data: mockData };
      },
      providesTags: ['Payments'],
    }),

    getPayment: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),

    getPendingPayments: builder.query<Payment[], void>({
      query: () => '/payments?status=pending',
      providesTags: ['Payments'],
    }),

    getPaymentSummary: builder.query<
      { total: number; pending: number; paid: number; overdue: number },
      void
    >({
      query: () => '/payments/summary',
      providesTags: ['Payments'],
    }),

    initiatePayment: builder.mutation<
      { paymentUrl: string; reference: string },
      InitiatePaymentRequest
    >({
      query: (payment) => ({
        url: '/payments/initiate',
        method: 'POST',
        body: payment,
      }),
    }),

    verifyPayment: builder.mutation<Payment, string>({
      query: (reference) => ({
        url: '/payments/verify',
        method: 'POST',
        body: { reference },
      }),
      invalidatesTags: ['Payments'],
    }),

    downloadInvoice: builder.query<Blob, string>({
      query: (id) => ({
        url: `/payments/${id}/invoice`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetPendingPaymentsQuery,
  useGetPaymentSummaryQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useLazyDownloadInvoiceQuery,
} = paymentsApi;