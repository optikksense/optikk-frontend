/**
 * Safe localStorage wrapper.
 *
 * All reads are guarded with try/catch so corrupted or missing storage
 * never crashes the application.
 */

const isStorageDebugEnabled = import.meta.env.DEV && import.meta.env.MODE !== 'test';

function reportStorageError(action: string, error: unknown): void {
  if (!isStorageDebugEnabled) {
    return;
  }
  console.warn(`[storage] ${action} failed`, error);
}

/**
 * Reads a string from localStorage and returns fallback when absent or inaccessible.
 * @param key
 */
export function safeGet(key: string): string | null;
export function safeGet(key: string, fallback: string): string;
export function safeGet(key: string, fallback: null): string | null;
/**
 *
 * @param key
 * @param fallback
 */
export function safeGet(key: string, fallback: string | null = null): string | null {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch (error: unknown) {
    reportStorageError(`get "${key}"`, error);
    return fallback;
  }
}

/**
 * Writes a string to localStorage.
 * @param key
 * @param value
 */
export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error: unknown) {
    // Writes can fail in private mode or when quota is exceeded.
    reportStorageError(`set "${key}"`, error);
  }
}

/**
 * Removes a key from localStorage.
 * @param key
 */
export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error: unknown) {
    reportStorageError(`remove "${key}"`, error);
  }
}

/**
 * Reads a JSON value from localStorage and returns fallback when parsing fails.
 * @param key
 */
export function safeGetJSON<T>(key: string): T | null;
export function safeGetJSON<T>(key: string, fallback: T): T;
export function safeGetJSON<T>(key: string, fallback: T | null): T | null;
/**
 *
 * @param key
 * @param fallback
 */
export function safeGetJSON<T>(key: string, fallback: T | null = null): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch (error: unknown) {
    reportStorageError(`get JSON "${key}"`, error);
    return fallback;
  }
}

/**
 * Serializes and writes JSON to localStorage.
 * @param key
 * @param value
 */
export function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error: unknown) {
    reportStorageError(`set JSON "${key}"`, error);
  }
}
