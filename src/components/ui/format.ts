export function formatTonnes(quantityTonnes: number): string {
  return `${quantityTonnes.toLocaleString(undefined, { maximumFractionDigits: 1 })} t`;
}

export function formatKm(distanceKm: number): string {
  return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/** Takes the date portion straight from the wire ISO string — avoids a Date-parse timezone shift. */
export function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}
