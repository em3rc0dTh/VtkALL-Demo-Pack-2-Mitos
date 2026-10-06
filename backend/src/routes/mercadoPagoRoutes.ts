import express from 'express'
import routeNames from '../config/mercadoPagoRoutes.config'
import authJwt from '../middlewares/authJwt'
import * as mercadoPagoController from '../controllers/mercadoPagoController'

const routes = express.Router()

routes.route(routeNames.quotePayment).get(mercadoPagoController.quotePayment)
routes.route(routeNames.createPayment).post(mercadoPagoController.createPayment)
routes.route(routeNames.getPayment).get(mercadoPagoController.getPayment)
routes.route(routeNames.webhook).post(mercadoPagoController.webhook)
routes.route(routeNames.reconcilePayment).post(authJwt.verifyBackofficeToken, mercadoPagoController.reconcilePayment)

export default routes
