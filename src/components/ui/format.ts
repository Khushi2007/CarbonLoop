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

/** Date + time straight from the wire ISO string (labeled UTC, since no local-timezone conversion is done). */
export function formatDateTime(isoDateTime: string): string {
  const [date, time] = isoDateTime.split("T");
  return `${date} ${time.slice(0, 5)} UTC`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`;
}
