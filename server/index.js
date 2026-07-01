import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDb } from './config/db.js'
import { requireAuth } from './middleware/auth.js'
import aiRouter from './routes/ai.routes.js'
import analyticsRouter from './routes/analytics.routes.js'
import fuelLogsRouter from './routes/fuelLogs.routes.js'
import invoicesRouter from './routes/invoices.routes.js'
import maintenanceRouter from './routes/maintenance.routes.js'
import summaryRouter from './routes/summary.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

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

app.use('/api/fuel-logs', requireAuth, fuelLogsRouter)
app.use('/api/maintenance', requireAuth, maintenanceRouter)
app.use('/api/fuel-maintenance', requireAuth, summaryRouter)
app.use('/api/invoices', requireAuth, invoicesRouter)
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/ai', requireAuth, aiRouter)

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
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start server', error)
    process.exit(1)
  })
