type KeyStorage = Pick<Storage, "length" | "key" | "removeItem">;

const prefixes = ["nostres-"];

// Removes every NOSTRES key from the given storage and returns how many were removed.
export function clearNostresKeys(storage: KeyStorage): number {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
  return keys.length;
}

export function clearAllNostresData(): number {
  let removed = 0;
  try { removed += clearNostresKeys(window.localStorage); } catch { /* storage unavailable */ }
  try { removed += clearNostresKeys(window.sessionStorage); } catch { /* storage unavailable */ }
  return removed;
}
