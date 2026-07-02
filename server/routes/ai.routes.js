import express from 'express'
import { validate } from '../middleware/validate.js'
import { assistantQuestionSchema } from '../schemas/ai.schema.js'
import { isAnthropicConfigured, askLogisticsAssistant } from '../services/anthropic.service.js'
import { buildAnalytics } from '../services/analytics.service.js'

const router = express.Router()

router.get('/status', (req, res) => {
  void req
  res.json({ assistantConfigured: isAnthropicConfigured() })
})

router.post('/assistant', validate(assistantQuestionSchema), async (req, res, next) => {
  try {
    const analytics = await buildAnalytics(req.user.uid)
    const result = await askLogisticsAssistant({
      question: req.body.question,
      analytics,
    })

    res.json({
      ...result,
      grounding: {
        invoiceCount: analytics.revenue.invoiceCount,
        fuelLogCount: analytics.fuel.fuelLogCount,
        maintenanceRecordCount: analytics.fleet.maintenanceRecordCount,
        routeCount: analytics.operations.routeCount,
        tripCount: analytics.operations.tripCount,
        customerCount: analytics.operations.customerCount,
        vehicleCount: analytics.fleet.totalVehicles,
        driverCount: analytics.drivers.totalDrivers,
      },
      dataNotes: analytics.dataNotes,
    })
  } catch (error) {
    next(error)
  }
})

export default router
