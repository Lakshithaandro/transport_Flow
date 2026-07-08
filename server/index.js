import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDb } from './config/db.js'
import { authenticateUser, authorizeAdmin, requireAuth } from './middleware/auth.js'
import { adminRateLimiter } from './middleware/rateLimit.js'
import adminRouter from './routes/admin/index.js'
import aiRouter from './routes/ai.routes.js'
import analyticsRouter from './routes/analytics.routes.js'
import authRouter from './routes/auth.routes.js'
import customersRouter from './routes/customers.routes.js'
import driversRouter from './routes/drivers.routes.js'
import fuelLogsRouter from './routes/fuelLogs.routes.js'
import invoicesRouter from './routes/invoices.routes.js'
import maintenanceRouter from './routes/maintenance.routes.js'
import routesRouter from './routes/routes.routes.js'
import summaryRouter from './routes/summary.routes.js'
import tripsRouter from './routes/trips.routes.js'
import vehiclesRouter from './routes/vehicles.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
.split(',')
.map((origin) => origin.trim())
.filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/api/health', (req, res) => {
res.json({ status: 'ok', service: 'transportflow-fuel-maintenance-api' })
})

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRateLimiter, authenticateUser, authorizeAdmin, adminRouter)
app.use('/api/vehicles', requireAuth, vehiclesRouter)
app.use('/api/drivers', requireAuth, driversRouter)
app.use('/api/customers', requireAuth, customersRouter)
app.use('/api/routes', requireAuth, routesRouter)
app.use('/api/trips', requireAuth, tripsRouter)
app.use('/api/fuel-logs', requireAuth, fuelLogsRouter)
app.use('/api/maintenance', requireAuth, maintenanceRouter)
app.use('/api/fuel-maintenance', requireAuth, summaryRouter)
app.use('/api/invoices', requireAuth, invoicesRouter)
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/ai', requireAuth, authorizeAdmin, aiRouter)

app.use((req, res) => {
res.status(404).json({ message: 'API route not found' })
})

app.use((error, req, res, next) => {
void next
console.error(error)
res.status(error.status || 500).json({ message: error.message || 'Server error' })
})

connectDb()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`)
})
    })
  ((error) => {
    console.error('Failed to connect database', error)
    process.exit(1)
  })