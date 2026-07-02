import express from 'express'
import { initialDrivers, initialVehicles } from '../../../src/data/vehicleDriverData.js'
import AdminActivity from '../../models/AdminActivity.js'
import Shipment from '../../models/Shipment.js'
import User from '../../models/User.js'

const router = express.Router()

function monthKey(value) {
  const date = value ? new Date(value) : new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

router.get('/', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalShipments,
      activeShipments,
      deliveredShipments,
      pendingShipments,
      shipmentStatusRows,
      monthlyShipmentRows,
      recentActivities,
      recentShipments,
    ] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: 'In Transit' }),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Pending' }),
      Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Shipment.find().sort({ createdAt: 1 }).select('createdAt status').lean(),
      AdminActivity.find().sort({ createdAt: -1 }).limit(8).lean(),
      Shipment.find().sort({ createdAt: -1 }).limit(8).lean(),
    ])

    const monthlyShipmentMap = monthlyShipmentRows.reduce((result, shipment) => {
      const key = monthKey(shipment.createdAt)
      result.set(key, (result.get(key) || 0) + 1)
      return result
    }, new Map())

    res.json({
      stats: {
        totalUsers,
        totalShipments,
        activeShipments,
        deliveredShipments,
        pendingShipments,
        totalDrivers: initialDrivers.length,
        totalVehicles: initialVehicles.length,
      },
      shipmentStatusChart: shipmentStatusRows.map((row) => ({ status: row._id, count: row.count })),
      monthlyShipmentTrends: Array.from(monthlyShipmentMap.entries()).map(([month, count]) => ({ month, count })),
      recentActivities,
      recentShipments,
      quickActions: [
        { label: 'Manage Users', to: '/admin/users' },
        { label: 'Review Shipments', to: '/admin/shipments' },
        { label: 'View Activity', to: '/admin/activity' },
      ],
    })
  } catch (error) {
    next(error)
  }
})

export default router
