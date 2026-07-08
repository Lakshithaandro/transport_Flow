import { initialCustomers, initialRoutes, initialTrips } from '../../src/data/customerRouteTripData.js'
import { initialDrivers, initialVehicles } from '../../src/data/vehicleDriverData.js'
import FuelLog from '../models/FuelLog.js'
import Invoice from '../models/Invoice.js'
import MaintenanceRecord from '../models/MaintenanceRecord.js'

const DEFAULT_DIESEL_COST = 4.25
const ESTIMATED_MPG = 6.5
const UPCOMING_SERVICE_DAYS = 14

function roundNumber(value, digits = 2) {
  const multiplier = 10 ** digits
  return Math.round((Number(value) || 0) * multiplier) / multiplier
}

function roundCurrency(value) {
  return roundNumber(value, 2)
}

function percent(part, total) {
  return total ? roundNumber((part / total) * 100, 1) : 0
}

function sumBy(records, selector) {
  return records.reduce((sum, record) => sum + (Number(selector(record)) || 0), 0)
}

function daysUntil(value) {
  if (!value) return null
  const target = new Date(value)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function groupBy(records, keySelector) {
  return records.reduce((groups, record) => {
    const key = keySelector(record) || 'Unassigned'
    const current = groups.get(key) || []
    current.push(record)
    groups.set(key, current)
    return groups
  }, new Map())
}

function groupSum(records, keySelector, valueSelector) {
  return records.reduce((groups, record) => {
    const key = keySelector(record) || 'Unassigned'
    const current = groups.get(key) || 0
    groups.set(key, current + (Number(valueSelector(record)) || 0))
    return groups
  }, new Map())
}

function mapGroupToRows(groups, keyName, valueName) {
  return Array.from(groups.entries()).map(([key, value]) => ({
    id: key,
    [keyName]: key,
    [valueName]: roundCurrency(value),
  }))
}

function getDateValue(value) {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getInvoiceAnalytics(invoices) {
  const totalRevenue = roundCurrency(sumBy(invoices, (invoice) => invoice.totalAmount))
  const paidRevenue = roundCurrency(sumBy(invoices, (invoice) => invoice.amountPaid))
  const outstandingBalance = roundCurrency(sumBy(invoices, (invoice) => invoice.balanceDue))
  const paidCount = invoices.filter((invoice) => invoice.paymentStatus === 'Paid').length
  const pendingCount = invoices.filter((invoice) => invoice.paymentStatus === 'Pending').length
  const partialCount = invoices.filter((invoice) => invoice.paymentStatus === 'Partial').length
  const averageInvoiceValue = invoices.length ? roundCurrency(totalRevenue / invoices.length) : 0
  const customerRevenueGroups = groupSum(invoices, (invoice) => invoice.customerName, (invoice) => invoice.totalAmount)
  const customerOutstandingGroups = groupSum(invoices, (invoice) => invoice.customerName, (invoice) => invoice.balanceDue)
  const vehicleRevenueGroups = groupSum(invoices, (invoice) => invoice.vehicleName, (invoice) => invoice.totalAmount)

  return {
    totalRevenue,
    paidRevenue,
    outstandingBalance,
    invoiceCount: invoices.length,
    paidCount,
    pendingCount,
    partialCount,
    averageInvoiceValue,
    collectionRate: percent(paidRevenue, totalRevenue),
    topOutstandingInvoices: invoices
      .filter((invoice) => invoice.balanceDue > 0)
      .sort((a, b) => b.balanceDue - a.balanceDue)
      .slice(0, 8)
      .map((invoice) => ({
        id: String(invoice._id),
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        balanceDue: roundCurrency(invoice.balanceDue),
        paymentStatus: invoice.paymentStatus,
        dueDate: invoice.dueDate,
      })),
    revenueByCustomer: mapGroupToRows(customerRevenueGroups, 'customerName', 'revenue').sort((a, b) => b.revenue - a.revenue),
    outstandingByCustomer: mapGroupToRows(customerOutstandingGroups, 'customerName', 'outstandingBalance').sort((a, b) => b.outstandingBalance - a.outstandingBalance),
    revenueByVehicle: mapGroupToRows(vehicleRevenueGroups, 'vehicleName', 'revenue').sort((a, b) => b.revenue - a.revenue),
  }
}

function getFuelAnalytics(fuelLogs) {
  const totalFuelCost = roundCurrency(sumBy(fuelLogs, (fuelLog) => fuelLog.fuelCost))
  const totalGallons = roundNumber(sumBy(fuelLogs, (fuelLog) => fuelLog.fuelQuantity), 2)
  const averageCostPerGallon = totalGallons ? roundCurrency(totalFuelCost / totalGallons) : 0
  const averageFuelLogCost = fuelLogs.length ? roundCurrency(totalFuelCost / fuelLogs.length) : 0
  const averageGallonsPerLog = fuelLogs.length ? roundNumber(totalGallons / fuelLogs.length, 2) : 0
  const averageOdometer = fuelLogs.length ? Math.round(sumBy(fuelLogs, (fuelLog) => fuelLog.odometerReading) / fuelLogs.length) : 0
  const highCostThreshold = averageFuelLogCost ? averageFuelLogCost * 1.5 : 0
  const highGallonThreshold = averageGallonsPerLog ? averageGallonsPerLog * 1.5 : 0
  const highCostPerGallonThreshold = averageCostPerGallon ? averageCostPerGallon * 1.25 : 0
  const vehicleCostGroups = groupSum(fuelLogs, (fuelLog) => fuelLog.vehicleName, (fuelLog) => fuelLog.fuelCost)
  const vehicleGallonGroups = groupSum(fuelLogs, (fuelLog) => fuelLog.vehicleName, (fuelLog) => fuelLog.fuelQuantity)
  const driverCostGroups = groupSum(fuelLogs, (fuelLog) => fuelLog.driverName, (fuelLog) => fuelLog.fuelCost)
  const fuelLogsByVehicle = groupBy(fuelLogs, (fuelLog) => fuelLog.vehicleName)

  const abnormalUsageAlerts = fuelLogs
    .map((fuelLog) => {
      const costPerGallon = Number(fuelLog.fuelQuantity) ? roundCurrency(fuelLog.fuelCost / fuelLog.fuelQuantity) : 0
      const reasons = []

      if (highCostThreshold && fuelLog.fuelCost > highCostThreshold) reasons.push(`Fuel cost is above the current average log cost of ₹${averageFuelLogCost.toLocaleString('en-IN')}.`)
      if (highGallonThreshold && fuelLog.fuelQuantity > highGallonThreshold) reasons.push(`Gallons are above the current average log quantity of ${averageGallonsPerLog}.`)
      if (highCostPerGallonThreshold && costPerGallon > highCostPerGallonThreshold) reasons.push(`Cost per gallon (₹${costPerGallon.toLocaleString('en-IN')}) is above the current average of ₹${averageCostPerGallon.toLocaleString('en-IN')}.`)

      return {
        id: String(fuelLog._id),
        vehicleName: fuelLog.vehicleName,
        driverName: fuelLog.driverName,
        fuelCost: roundCurrency(fuelLog.fuelCost),
        fuelQuantity: roundNumber(fuelLog.fuelQuantity, 2),
        costPerGallon,
        odometerReading: fuelLog.odometerReading,
        date: fuelLog.date,
        status: reasons.length > 1 ? 'High' : reasons.length ? 'Medium' : 'Low',
        reasons,
        recommendation: 'Review odometer entry, route assignment, station pricing, and possible leakage/theft indicators before making any conclusion.',
      }
    })
    .filter((fuelLog) => fuelLog.reasons.length)
    .sort((a, b) => (b.status === 'High' ? 1 : 0) - (a.status === 'High' ? 1 : 0) || b.fuelCost - a.fuelCost)
    .slice(0, 8)

  const vehicleEfficiency = Array.from(fuelLogsByVehicle.entries()).map(([vehicleName, records]) => {
    const sortedRecords = [...records].sort((a, b) => getDateValue(a.date) - getDateValue(b.date))
    const totalVehicleGallons = sumBy(sortedRecords, (record) => record.fuelQuantity)
    const totalVehicleCost = sumBy(sortedRecords, (record) => record.fuelCost)
    const odometerValues = sortedRecords.map((record) => Number(record.odometerReading)).filter((value) => value > 0)
    const odometerSpan = odometerValues.length > 1 ? Math.max(...odometerValues) - Math.min(...odometerValues) : 0
    const mpg = odometerSpan && totalVehicleGallons ? roundNumber(odometerSpan / totalVehicleGallons, 2) : null
    const costPerMile = odometerSpan && totalVehicleCost ? roundCurrency(totalVehicleCost / odometerSpan) : null

    return {
      id: vehicleName,
      vehicleName,
      fuelCost: roundCurrency(totalVehicleCost),
      gallons: roundNumber(totalVehicleGallons, 2),
      logCount: sortedRecords.length,
      odometerSpan,
      estimatedMpg: mpg,
      costPerMile,
      status: mpg !== null && mpg < ESTIMATED_MPG * 0.75 ? 'High' : totalVehicleCost > totalFuelCost / Math.max(fuelLogsByVehicle.size, 1) ? 'Medium' : 'Low',
      recommendation: mpg !== null && mpg < ESTIMATED_MPG * 0.75
        ? 'Investigate route assignment, idling, tire pressure, maintenance, possible leakage, or data quality issues.'
        : 'Monitor fuel efficiency against route distance and maintenance history.',
    }
  })

  const poorEfficiencyVehicles = vehicleEfficiency
    .sort((a, b) => b.fuelCost - a.fuelCost)
    .slice(0, 5)

  return {
    totalFuelCost,
    totalGallons,
    averageCostPerGallon,
    averageFuelLogCost,
    averageGallonsPerLog,
    averageOdometer,
    fuelLogCount: fuelLogs.length,
    costByVehicle: mapGroupToRows(vehicleCostGroups, 'vehicleName', 'fuelCost').sort((a, b) => b.fuelCost - a.fuelCost),
    gallonsByVehicle: mapGroupToRows(vehicleGallonGroups, 'vehicleName', 'gallons').sort((a, b) => b.gallons - a.gallons),
    fuelCostByDriver: mapGroupToRows(driverCostGroups, 'driverName', 'fuelCost').sort((a, b) => b.fuelCost - a.fuelCost),
    abnormalUsageAlerts,
    poorEfficiencyVehicles,
    vehicleEfficiency,
    highConsumptionVehicles: [...vehicleEfficiency].sort((a, b) => b.gallons - a.gallons).slice(0, 5),
  }
}

function getFleetAnalytics(maintenanceRecords) {
  const totalMaintenanceCost = roundCurrency(sumBy(maintenanceRecords, (record) => record.cost))
  const vehiclesDueForService = maintenanceRecords.filter((record) => ['Scheduled', 'Overdue'].includes(record.status)).length
  const recordsByVehicle = groupBy(maintenanceRecords, (record) => record.vehicleName)
  const maintenanceStatusRows = ['Scheduled', 'In Progress', 'Completed', 'Overdue'].map((status) => ({
    id: status,
    status,
    count: maintenanceRecords.filter((record) => record.status === status).length,
  }))

  const repeatedServiceIssues = Array.from(recordsByVehicle.entries())
    .map(([vehicleName, records]) => ({
      id: vehicleName,
      vehicleName,
      recordCount: records.length,
      serviceTypes: Array.from(new Set(records.map((record) => record.serviceType))).join(', '),
      totalCost: roundCurrency(sumBy(records, (record) => record.cost)),
      openItems: records.filter((record) => ['Scheduled', 'In Progress', 'Overdue'].includes(record.status)).length,
      recommendation: records.length > 1 ? 'Review recurring service categories and preventive maintenance interval.' : 'Continue normal service tracking.',
    }))
    .filter((row) => row.recordCount > 1 || row.openItems > 0)
    .sort((a, b) => b.openItems - a.openItems || b.recordCount - a.recordCount || b.totalCost - a.totalCost)
    .slice(0, 8)

  const healthPredictions = initialVehicles.map((vehicle) => {
    const matchingRecords = maintenanceRecords.filter((record) => record.vehicleName === vehicle.unit || record.vehicleId === vehicle.id)
    const overdueRecord = matchingRecords.find((record) => record.status === 'Overdue')
    const upcomingRecord = matchingRecords.find((record) => {
      const remainingDays = daysUntil(record.nextServiceDate || record.reminderDate)
      return remainingDays !== null && remainingDays >= 0 && remainingDays <= UPCOMING_SERVICE_DAYS
    })
    const highMileage = Number(vehicle.mileage) > 200000
    const repeatedIssues = matchingRecords.length > 1

    let riskLevel = 'Low'
    const reasons = []

    if (overdueRecord) {
      riskLevel = 'High'
      reasons.push(`${overdueRecord.serviceType} is overdue.`)
    }

    if (upcomingRecord) {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium'
      reasons.push(`${upcomingRecord.serviceType} is due soon.`)
    }

    if (vehicle.status === 'Maintenance') {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium'
      reasons.push('Vehicle is currently marked as Maintenance.')
    }

    if (highMileage) {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium'
      reasons.push('High mileage vehicle should be monitored closely.')
    }

    if (repeatedIssues) {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium'
      reasons.push(`${matchingRecords.length} maintenance records exist for this vehicle.`)
    }

    return {
      id: vehicle.id,
      vehicleName: vehicle.unit,
      mileage: vehicle.mileage,
      vehicleStatus: vehicle.status,
      status: riskLevel,
      openMaintenanceRecords: matchingRecords.filter((record) => record.status !== 'Completed').length,
      serviceHistoryCount: matchingRecords.length,
      reasons: reasons.length ? reasons : ['No immediate maintenance risk found in current records.'],
      recommendation: riskLevel === 'High'
        ? 'Prioritize maintenance scheduling before dispatch.'
        : riskLevel === 'Medium'
          ? 'Review upcoming service and inspect before long-haul assignment.'
          : 'Continue normal preventive maintenance monitoring.',
    }
  })

  return {
    totalVehicles: initialVehicles.length,
    availableVehicles: initialVehicles.filter((vehicle) => vehicle.status === 'Available').length,
    assignedVehicles: initialVehicles.filter((vehicle) => vehicle.status === 'Assigned').length,
    maintenanceVehicles: initialVehicles.filter((vehicle) => vehicle.status === 'Maintenance').length,
    vehiclesDueForService,
    totalMaintenanceCost,
    maintenanceRecordCount: maintenanceRecords.length,
    maintenanceStatusRows,
    repeatedServiceIssues,
    healthPredictions,
  }
}

function getDriverAnalytics(fuelLogs) {
  const driverTripCounts = initialDrivers.map((driver) => ({
    id: driver.id,
    driverName: driver.name,
    trips: initialTrips.filter((trip) => trip.driver === driver.name).length,
    status: driver.status,
  }))

  const fuelCostByDriver = mapGroupToRows(groupSum(fuelLogs, (fuelLog) => fuelLog.driverName, (fuelLog) => fuelLog.fuelCost), 'driverName', 'fuelCost')
  const driverPerformance = initialDrivers.map((driver) => {
    const trips = driverTripCounts.find((item) => item.driverName === driver.name)?.trips || 0
    const fuelSpend = fuelCostByDriver.find((item) => item.driverName === driver.name)?.fuelCost || 0
    const status = driver.status === 'Needs Review' ? 'Needs Review' : fuelSpend > 0 && trips === 0 ? 'Medium' : 'Active'

    return {
      id: driver.id,
      driverName: driver.name,
      assignedVehicle: driver.assignedVehicle,
      trips,
      fuelSpend,
      status,
      recommendation: status === 'Needs Review'
        ? 'Review license, assignment, or performance notes before dispatch.'
        : fuelSpend > 0 && trips === 0
          ? 'Fuel activity exists without a matching trip; verify assignment data.'
          : 'No immediate review needed from current records.',
    }
  })

  return {
    totalDrivers: initialDrivers.length,
    availableDrivers: initialDrivers.filter((driver) => driver.status === 'Available').length,
    assignedDrivers: initialDrivers.filter((driver) => driver.status === 'Assigned').length,
    needsReviewDrivers: initialDrivers.filter((driver) => driver.status === 'Needs Review').length,
    driverTripCounts,
    fuelCostByDriver,
    driverPerformance,
  }
}

function getOperationalAnalytics() {
  const scheduledTrips = initialTrips.filter((trip) => trip.status === 'Scheduled').length
  const inTransitTrips = initialTrips.filter((trip) => trip.status === 'In Transit').length
  const delayedTrips = initialTrips.filter((trip) => trip.status === 'Delayed').length
  const completedTrips = initialTrips.filter((trip) => trip.status === 'Completed').length
  const activeRoutes = initialRoutes.filter((route) => route.status === 'Active').length
  const tripsByRoute = initialRoutes.map((route) => ({
    id: route.id,
    routeName: route.name,
    tripCount: initialTrips.filter((trip) => trip.route === route.name).length,
    delayedTrips: initialTrips.filter((trip) => trip.route === route.name && trip.status === 'Delayed').length,
  }))

  return {
    customerCount: initialCustomers.length,
    activeCustomerCount: initialCustomers.filter((customer) => customer.status === 'Active').length,
    routeCount: initialRoutes.length,
    activeRouteCount: activeRoutes,
    tripCount: initialTrips.length,
    scheduledTrips,
    inTransitTrips,
    delayedTrips,
    completedTrips,
    delayRate: percent(delayedTrips, initialTrips.length),
    routeUtilization: percent(activeRoutes, initialRoutes.length),
    tripsByRoute,
    tripStatusRows: ['Scheduled', 'In Transit', 'Delayed', 'Completed'].map((status) => ({
      id: status,
      status,
      count: initialTrips.filter((trip) => trip.status === status).length,
    })),
  }
}

function getRouteOptimization(fuelAnalytics) {
  const averageCostPerGallon = fuelAnalytics.averageCostPerGallon || DEFAULT_DIESEL_COST
  const scoredRoutes = initialRoutes.map((route) => {
    const estimatedGallons = roundNumber(route.distanceMiles / ESTIMATED_MPG, 2)
    const estimatedFuelCost = roundCurrency(estimatedGallons * averageCostPerGallon)
    const efficiencyScore = roundNumber(route.distanceMiles * 0.55 + route.estimatedHours * 45, 2)
    const matchingTrips = initialTrips.filter((trip) => trip.route === route.name)

    return {
      id: route.id,
      routeId: route.id,
      routeName: route.name,
      origin: route.origin,
      destination: route.destination,
      status: route.status,
      distanceMiles: route.distanceMiles,
      estimatedHours: route.estimatedHours,
      estimatedGallons,
      estimatedFuelCost,
      estimatedCostPerMile: route.distanceMiles ? roundCurrency(estimatedFuelCost / route.distanceMiles) : 0,
      efficiencyScore,
      tripCount: matchingTrips.length,
      activeTripStatuses: matchingTrips.map((trip) => trip.status),
      delayedTrips: matchingTrips.filter((trip) => trip.status === 'Delayed').length,
    }
  })

  const fastest = [...scoredRoutes].sort((a, b) => a.estimatedHours - b.estimatedHours)[0]
  const lowestFuelCost = [...scoredRoutes].sort((a, b) => a.estimatedFuelCost - b.estimatedFuelCost)[0]
  const mostEfficient = [...scoredRoutes].sort((a, b) => a.efficiencyScore - b.efficiencyScore)[0]
  const inefficientRoutes = [...scoredRoutes]
    .filter((route) => route.status !== 'Active' || route.delayedTrips > 0 || route.efficiencyScore > mostEfficient.efficiencyScore * 1.5)
    .sort((a, b) => b.delayedTrips - a.delayedTrips || b.efficiencyScore - a.efficiencyScore)

  return {
    assumptions: {
      estimatedMpg: ESTIMATED_MPG,
      averageCostPerGallon,
      note: 'Recommendations use stored route distance and estimated hours, not live traffic, GPS, toll, weather, or map APIs.',
    },
    scoredRoutes,
    inefficientRoutes,
    multiStopOptimization: {
      candidateTrips: initialTrips
        .filter((trip) => ['Scheduled', 'In Transit', 'Delayed'].includes(trip.status))
        .map((trip) => ({
          id: trip.id,
          customer: trip.customer,
          route: trip.route,
          vehicle: trip.vehicle,
          driver: trip.driver,
          scheduledDate: trip.scheduledDate,
          status: trip.status,
        })),
      recommendation: 'Cluster stops by stored route corridor and schedule date. Add stop-level coordinates for true multi-stop sequencing.',
    },
    recommendations: [
      {
        id: 'fastest',
        strategy: 'Fastest',
        status: 'Active',
        ...fastest,
        reasons: ['Lowest stored estimated travel time.'],
      },
      {
        id: 'lowest-fuel-cost',
        strategy: 'Lowest fuel cost',
        status: 'Active',
        ...lowestFuelCost,
        reasons: ['Lowest estimated fuel cost from route miles, estimated MPG, and average fuel price.'],
      },
      {
        id: 'lowest-toll',
        strategy: 'Lowest toll',
        status: 'Needs Data',
        routeId: null,
        routeName: 'Toll data unavailable',
        estimatedFuelCost: null,
        reasons: ['Toll amounts are not currently captured in route records. Add toll data or a map/toll API for this optimization.'],
      },
      {
        id: 'most-efficient',
        strategy: 'Most efficient',
        status: 'Active',
        ...mostEfficient,
        reasons: ['Best weighted score using route distance and estimated time.'],
      },
    ],
  }
}

function getFinancialAnalytics(revenue, fuel, fleet) {
  const estimatedGrossMargin = roundCurrency(revenue.totalRevenue - fuel.totalFuelCost - fleet.totalMaintenanceCost)

  return {
    totalRevenue: revenue.totalRevenue,
    totalFuelCost: fuel.totalFuelCost,
    totalMaintenanceCost: fleet.totalMaintenanceCost,
    estimatedGrossMargin,
    estimatedGrossMarginRate: percent(estimatedGrossMargin, revenue.totalRevenue),
    outstandingBalance: revenue.outstandingBalance,
  }
}

function buildAssistantCapabilities({ revenue, fuel, fleet, drivers, operations, financial, routeOptimization }) {
  return {
    routeOptimization: {
      summary: `${routeOptimization.scoredRoutes.length} routes scored using stored miles, estimated hours, and fuel assumptions.`,
      fastest: routeOptimization.recommendations.find((item) => item.id === 'fastest'),
      lowestFuelCost: routeOptimization.recommendations.find((item) => item.id === 'lowest-fuel-cost'),
      lowestToll: routeOptimization.recommendations.find((item) => item.id === 'lowest-toll'),
      inefficientRoutes: routeOptimization.inefficientRoutes,
      multiStopOptimization: routeOptimization.multiStopOptimization,
      assumptions: routeOptimization.assumptions,
    },
    fuelIntelligence: {
      summary: fuel.abnormalUsageAlerts.length
        ? `${fuel.abnormalUsageAlerts.length} fuel entries show anomaly indicators for human review.`
        : 'No abnormal fuel usage indicators were detected from current fuel logs.',
      abnormalUsageAlerts: fuel.abnormalUsageAlerts,
      highConsumptionVehicles: fuel.highConsumptionVehicles,
      vehicleEfficiency: fuel.vehicleEfficiency,
      fuelCostByDriver: fuel.fuelCostByDriver,
      recommendation: 'Use these indicators to review fuel quantity, cost per gallon, route assignment, odometer entries, and maintenance condition. They do not prove theft or leakage.',
    },
    fleetHealthPrediction: {
      summary: `${fleet.vehiclesDueForService} vehicles have scheduled or overdue maintenance items.`,
      healthPredictions: fleet.healthPredictions,
      maintenanceStatusRows: fleet.maintenanceStatusRows,
      repeatedServiceIssues: fleet.repeatedServiceIssues,
      preventiveMaintenanceRecommendation: 'Prioritize high-risk vehicles before long-haul dispatch and review repeated service categories for preventive maintenance intervals.',
    },
    logisticsAssistant: {
      summary: 'Natural language answers are grounded in current TransportFlow revenue, invoice, fuel, maintenance, route, trip, vehicle, driver, and customer data.',
      revenue,
      financial,
      operations,
      drivers,
      topOutstandingInvoices: revenue.topOutstandingInvoices,
    },
  }
}

export async function buildAnalytics(createdByUid) {
  const [invoices, fuelLogs, maintenanceRecords] = await Promise.all([
    Invoice.find({ createdByUid }).lean(),
    FuelLog.find({ createdByUid }).lean(),
    MaintenanceRecord.find({ createdByUid }).lean(),
  ])

  const revenue = getInvoiceAnalytics(invoices)
  const fuel = getFuelAnalytics(fuelLogs)
  const fleet = getFleetAnalytics(maintenanceRecords)
  const drivers = getDriverAnalytics(fuelLogs)
  const operations = getOperationalAnalytics()
  const financial = getFinancialAnalytics(revenue, fuel, fleet)
  const routeOptimization = getRouteOptimization(fuel)
  const capabilities = buildAssistantCapabilities({ revenue, fuel, fleet, drivers, operations, financial, routeOptimization })

  return {
    generatedAt: new Date().toISOString(),
    revenue,
    fuel,
    fleet,
    drivers,
    operations,
    financial,
    routeOptimization,
    capabilities,
    dataNotes: [
      'Revenue, fuel, and maintenance analytics use authenticated operational records scoped to the signed-in account.',
      'Fleet, driver, customer, route, and trip analytics use TransportFlow workspace records currently available to analytics.',
      'Route optimization uses stored distance and estimated hours with fuel assumptions; no live traffic, GPS, weather, toll, or map API data is available.',
      'Fuel intelligence can flag anomaly indicators only. It cannot confirm fuel theft, leakage, card misuse, location mismatch, or driver intent without sensor, fuel-card, GPS, or inspection data.',
      'Fleet health predictions use service records, vehicle status, and mileage; no live diagnostic codes, tire sensors, or OEM telematics are available.',
    ],
  }
}

export function buildAiInsights(analytics) {
  const financialRisk = analytics.financial.estimatedGrossMargin < 0 ? 'High' : analytics.revenue.collectionRate < 60 ? 'Medium' : 'Low'

  return {
    generatedAt: analytics.generatedAt,
    routeOptimization: analytics.routeOptimization,
    fuelIntelligence: {
      abnormalUsageAlerts: analytics.fuel.abnormalUsageAlerts,
      poorEfficiencyVehicles: analytics.fuel.poorEfficiencyVehicles,
      summary: analytics.fuel.abnormalUsageAlerts.length
        ? `${analytics.fuel.abnormalUsageAlerts.length} fuel entries need review for abnormal usage, pricing, leakage indicators, theft risk indicators, or data quality.`
        : 'No abnormal fuel usage detected from current fuel logs.',
    },
    fleetHealthPrediction: analytics.fleet.healthPredictions,
    operationalRisks: [
      {
        id: 'delays',
        title: 'Delayed trips',
        status: analytics.operations.delayedTrips ? 'Medium' : 'Low',
        value: analytics.operations.delayedTrips,
        recommendation: analytics.operations.delayedTrips
          ? 'Review delayed trips and route assignments before the next dispatch cycle.'
          : 'No delayed trips are currently recorded.',
      },
      {
        id: 'financial-risk',
        title: 'Financial KPI risk',
        status: financialRisk,
        value: `${analytics.financial.estimatedGrossMarginRate}% margin`,
        recommendation: financialRisk === 'High'
          ? 'Fuel and maintenance costs exceed current revenue. Review pricing and cost controls.'
          : financialRisk === 'Medium'
            ? 'Collection rate is below target. Prioritize outstanding invoice follow-up.'
            : 'Financial KPIs are stable from current records.',
      },
    ],
    dataQuality: analytics.dataNotes,
  }
}
