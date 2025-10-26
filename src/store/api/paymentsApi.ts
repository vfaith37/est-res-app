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
}

export interface InitiatePaymentRequest {
  paymentId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], { status?: string; type?: string; limit?: number }>({
      query: (params) => ({
        url: '/payments',
        params,
      }),
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