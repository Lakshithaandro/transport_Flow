export function todayDateInputValue() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export function isBeforeToday(dateValue) {
  return Boolean(dateValue) && dateValue < todayDateInputValue()
}

export function isAfterDate(startDateValue, endDateValue) {
  return Boolean(startDateValue && endDateValue) && startDateValue > endDateValue
}
