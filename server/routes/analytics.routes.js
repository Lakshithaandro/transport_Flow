import express from 'express'
import { buildAiInsights, buildAnalytics } from '../services/analytics.service.js'

const router = express.Router()

router.get('/reports', async (req, res, next) => {
  try {
    const analytics = await buildAnalytics(req.user.uid)
    res.json(analytics)
  } catch (error) {
    next(error)
  }
})

router.get('/route-optimization', async (req, res, next) => {
  try {
    const analytics = await buildAnalytics(req.user.uid)
    res.json(analytics.routeOptimization)
  } catch (error) {
    next(error)
  }
})

router.get('/ai-insights', async (req, res, next) => {
  try {
    const analytics = await buildAnalytics(req.user.uid)
    res.json(buildAiInsights(analytics))
  } catch (error) {
    next(error)
  }
})

export default router
