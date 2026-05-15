// Safe localStorage access. getItem/setItem throw in private-mode Safari,
// when storage is disabled, or on quota errors — every caller treats a
// failure as "no value" / "could not persist" rather than crashing.

export function getStoredItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStoredItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable — best effort only
  }
}
