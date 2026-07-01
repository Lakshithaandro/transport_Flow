import express from 'express'
import FuelLog from '../models/FuelLog.js'
import MaintenanceRecord from '../models/MaintenanceRecord.js'

const router = express.Router()

router.get('/summary', async (req, res, next) => {
  try {
    const [fuelLogs, maintenanceRecords] = await Promise.all([
      FuelLog.find({ createdByUid: req.user.uid }),
      MaintenanceRecord.find({ createdByUid: req.user.uid }),
    ])

    const totalFuelCost = fuelLogs.reduce((sum, fuelLog) => sum + fuelLog.fuelCost, 0)
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0)
    const averageMileage = fuelLogs.length
      ? Math.round(fuelLogs.reduce((sum, fuelLog) => sum + fuelLog.odometerReading, 0) / fuelLogs.length)
      : 0
    const vehiclesDueForService = maintenanceRecords.filter((record) => ['Scheduled', 'Overdue'].includes(record.status)).length

    res.json({ totalFuelCost, averageMileage, vehiclesDueForService, totalMaintenanceCost })
  } catch (error) {
    next(error)
  }
})

export default router
