import express from 'express'
import activityRouter from './activity.routes.js'
import dashboardRouter from './dashboard.routes.js'
import shipmentsRouter from './shipments.routes.js'
import usersRouter from './users.routes.js'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'transportflow-admin-api' })
})

router.use('/dashboard', dashboardRouter)
router.use('/users', usersRouter)
router.use('/shipments', shipmentsRouter)
router.use('/activity', activityRouter)

export default router
