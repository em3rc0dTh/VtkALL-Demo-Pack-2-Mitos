import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import * as env from '../config/env.config'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'

const client = new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN })
const payment = new Payment(client)

/**
 * Create a Mercado Pago payment.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const createPayment = async (req: Request, res: Response) => {
    try {
        const { body }: { body: bookcarsTypes.CreatePaymentPayload & {
            token?: string
            installments?: number | string
            paymentMethodId?: string
            payment_method_id?: string
            issuerId?: string | number
            issuer_id?: string | number
            transaction_amount?: number | string
            payer?: any
        } } = req

        // Payment Brick uses snake_case while some older/custom integrations use
        // camelCase. Normalize both so the backend is independent of SDK shape.
        const amount = Number(body.amount ?? body.transaction_amount)
        const paymentMethodId = body.paymentMethodId ?? body.payment_method_id
        const issuerId = body.issuerId ?? body.issuer_id
        const token = body.token
        const installments = Number(body.installments || 1)
        const payerEmail = body.payer?.email
        const identification = body.payer?.identification
        const identificationType = identification?.type ?? identification?.docType
        const identificationNumber = identification?.number ?? identification?.docNumber

        if (!amount || !paymentMethodId || !token || !payerEmail) {
            console.error('[MercadoPago.createPayment] Invalid payment payload', {
                hasAmount: Boolean(amount),
                paymentMethodId,
                hasToken: Boolean(token),
                hasPayerEmail: Boolean(payerEmail),
            })
            return res.status(400).json({ error: i18n.t('ERROR') })
        }

        let paymentData: any = {
            transaction_amount: amount,
            description: body.description || 'MITOS Rent a Car',
            payment_method_id: paymentMethodId,
            payer: {
                email: payerEmail,
            },
        }

        if (paymentMethodId === 'yape') {
            paymentData = {
                ...paymentData,
                token,
                installments: 1,
            }
        } else {
            paymentData = {
                ...paymentData,
                token,
                installments,
                payer: {
                    ...paymentData.payer,
                    ...(identificationType && identificationNumber
                        ? {
                            identification: {
                                type: identificationType,
                                number: identificationNumber,
                            },
                        }
                        : {}),
                },
            }

            if (issuerId) {
                paymentData.issuer_id = issuerId
            }
        }

        // Mercado Pago requires idempotency protection for payment creation.
        const data = await payment.create({
            body: paymentData,
            requestOptions: { idempotencyKey: randomUUID() },
        })

        const responseData: any = {
            status: data.status,
            id: data.id,
        }

        if (data.point_of_interaction?.transaction_data) {
            responseData.qr_code_base64 = data.point_of_interaction.transaction_data.qr_code_base64
            responseData.qr_code = data.point_of_interaction.transaction_data.qr_code
        }

        if (data.transaction_details?.external_resource_url) {
            responseData.external_resource_url = data.transaction_details.external_resource_url
        }

        return res.status(201).json(responseData)
    } catch (err) {
        console.error(`[MercadoPago.createPayment] ${i18n.t('ERROR')}`, err)
        return res.status(400).json({ error: i18n.t('ERROR') })
    }
}
