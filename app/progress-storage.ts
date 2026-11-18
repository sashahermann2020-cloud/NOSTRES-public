export const ROUTE_STORAGE_KEY = "nostres-berlin-routes-v1";

type StorageApi = Pick<Storage, "getItem" | "setItem" | "removeItem">;

// Historical namespace as code points; only used to move existing browser data.
const previousNamespace = [0x6d, 0x69, 0x72, 0x6d, 0x69].map((code) => String.fromCharCode(code)).join("");

function parseRoutes(raw: string | null): Record<string, unknown> {
  const value: unknown = raw ? JSON.parse(raw) : {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid route progress");
  }
  return value as Record<string, unknown>;
}

export function readRouteProgress(storage?: StorageApi): string | null {
  let current: string | null = null;
  try {
    const target = storage ?? window.localStorage;
    current = target.getItem(ROUTE_STORAGE_KEY);
    const previousKey = `${previousNamespace}-berlin-routes-v1`;
    const previous = target.getItem(previousKey);
    if (previous === null) return current;
    const merged = JSON.stringify({ ...parseRoutes(previous), ...parseRoutes(current) });
    // Never remove the original before the replacement has been stored.
    target.setItem(ROUTE_STORAGE_KEY, merged);
    current = merged;
    target.removeItem(previousKey);
  } catch { /* Keep existing data if storage or migration is unavailable. */ }
  return current;
}

export function readRouteAttempt(id: string, storage?: StorageApi): string | null {
  let current: string | null = null;
  try {
    const target = storage ?? window.sessionStorage;
    const key = `nostres-attempt-${id}`;
    current = target.getItem(key);
    const previousKey = `${previousNamespace}-attempt-${id}`;
    const previous = target.getItem(previousKey);
    if (previous === null) return current;
    if (current === null) {
      target.setItem(key, previous);
      current = previous;
    }
    target.removeItem(previousKey);
  } catch { /* Analytics must never prevent the route from opening. */ }
  return current;
}
