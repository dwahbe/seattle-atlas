/**
 * Shared display formatters.
 */

/**
 * Format acres with unit suffix. Handles very small (< 0.1 ac), fractional,
 * and large values with a rounded integer above 100.
 */
export function formatAcres(acres: number): string {
  if (acres < 0.1) return '< 0.1 ac';
  if (acres < 1) return `${acres.toFixed(1)} ac`;
  if (acres < 100) return `${acres.toFixed(1)} acres`;
  return `${Math.round(acres).toLocaleString()} acres`;
}
