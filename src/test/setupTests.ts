import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

interface MemoryStorage extends Storage {}

function createMemoryStorage(): MemoryStorage {
  const store = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return store.get(String(key)) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(String(key), String(value));
    },
    removeItem(key: string): void {
      store.delete(String(key));
    },
    clear(): void {
      store.clear();
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  } as MemoryStorage;
}

const localStorageShim = createMemoryStorage();
const sessionStorageShim = createMemoryStorage();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageShim,
});

Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: sessionStorageShim,
});

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageShim,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: sessionStorageShim,
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
