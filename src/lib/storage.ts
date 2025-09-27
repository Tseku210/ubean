/**
 * Safe localStorage utility.
 * Works only in the browser — in SSR it no-ops.
 */
export const storage = {
  get<T = string>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`storage.get: failed to parse key "${key}"`, e);
      return null;
    }
  },

  set<T = unknown>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`storage.set: failed to set key "${key}"`, e);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`storage.remove: failed to remove key "${key}"`, e);
    }
  },

  has(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },
};
