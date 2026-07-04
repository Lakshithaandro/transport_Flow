export function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function isTodayOrFuture(date) {
  if (!date) return true
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value >= startOfToday()
}

export function hasChronologicalDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true
  return new Date(endDate) >= new Date(startDate)
}
