// Great-circle distance (Haversine). Used server-side to compute distance from the
// reference city to each supplier. See docs/business-rules.md §2.

export interface GeoPoint {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371
const toRad = (deg: number): number => (deg * Math.PI) / 180

/** Distance in kilometers between two points, rounded to the nearest km. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h)))
}
