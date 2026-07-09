export const MILES_TO_KILOMETERS = 1.60934
export const MAX_ROUTE_DISTANCE_KILOMETERS = 16093

export function milesToKilometers(value) {
  return Math.round((Number(value) || 0) * MILES_TO_KILOMETERS)
}

export function kilometersToMiles(value) {
  return Math.round(((Number(value) || 0) / MILES_TO_KILOMETERS) * 100) / 100
}

export function formatKilometers(value) {
  return `${milesToKilometers(value).toLocaleString()} km`
}
