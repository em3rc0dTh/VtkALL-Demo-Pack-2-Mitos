import axiosInstance from './axiosInstance'

export interface MercadoPagoQuote {
  bookingId: string
  amount: number
  currency: string
}

export interface MercadoPagoPaymentResponse {
  bookingId: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back' | 'in_mediation' | 'unknown' | 'creating'
  paymentId?: string
  id?: string
  providerId?: string
  amountMinor?: number
  currency?: string
}

export interface MercadoPagoInstrument {
  token: string
  paymentMethodId: string
  installments: number
  issuerId?: string
}

/**
 * Minimal subset of Payment Brick form data that MitoS is allowed to consume.
 * Intentionally no catch-all index signature: browser-only fields such as
 * `amount` must not become part of the backend payment contract accidentally.
 */
export interface MercadoPagoBrickFormData {
  token?: string
  installments?: number
  payment_method_id?: string
  issuer_id?: string
  payer?: {
    email?: string
    identification?: {
      type?: string
      number?: string
    }
  }
}

export const quotePayment = (
  bookingId: string,
  reservationSessionId: string,
): Promise<MercadoPagoQuote> =>
  axiosInstance
    .get(
      `/api/mercadopago/quote/${encodeURIComponent(bookingId)}/${encodeURIComponent(reservationSessionId)}`,
    )
    .then((res) => res.data)

/**
 * Submit only tokenized provider data plus the persisted reservation identity.
 * Browser-computed amount/currency are deliberately excluded: the backend owns
 * pricing and sends transaction_amount to Mercado Pago.
 */
export const createInstrumentPayment = ({
  bookingId,
  reservationSessionId,
  instrument,
  idempotencyKey,
}: {
  bookingId: string
  reservationSessionId: string
  instrument: MercadoPagoInstrument
  idempotencyKey: string
}): Promise<MercadoPagoPaymentResponse> =>
  axiosInstance
    .post(
      '/api/create-mercadopago-payment',
      {
        bookingId,
        reservationSessionId,
        instrument,
      },
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      },
    )
    .then((res) => res.data)

export const createPayment = ({
  bookingId,
  reservationSessionId,
  formData,
  idempotencyKey,
}: {
  bookingId: string
  reservationSessionId: string
  formData: MercadoPagoBrickFormData
  idempotencyKey: string
}): Promise<MercadoPagoPaymentResponse> => {
  if (!formData.token || !formData.payment_method_id) {
    return Promise.reject(new Error('INVALID_PAYMENT_INSTRUMENT'))
  }

  return createInstrumentPayment({
    bookingId,
    reservationSessionId,
    idempotencyKey,
    instrument: {
      token: formData.token,
      paymentMethodId: formData.payment_method_id,
      installments: Number(formData.installments || 1),
      ...(formData.issuer_id ? { issuerId: formData.issuer_id } : {}),
    },
  })
}

export const reconcilePayment = (paymentId: string): Promise<MercadoPagoPaymentResponse> =>
  axiosInstance
    .post(
      `/api/mercadopago/reconcile/${encodeURIComponent(paymentId)}`,
      null,
      { withCredentials: true },
    )
    .then((res) => res.data)
