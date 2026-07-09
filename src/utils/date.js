export function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function isBeforeToday(value) {
  if (!value) return false
  return value < todayDateInputValue()
}
