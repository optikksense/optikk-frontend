export type CrossTabSessionEvent = "signed-in" | "signed-out";

const CHANNEL_NAME = "optikk-auth";
const STORAGE_KEY = "optikk.session-event";

type Listener = (event: CrossTabSessionEvent) => void;

interface StoredEvent {
  readonly id: string;
  readonly type: CrossTabSessionEvent;
}

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();

function supportsBroadcastChannel(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

function isSessionEvent(value: unknown): value is CrossTabSessionEvent {
  return value === "signed-in" || value === "signed-out";
}

function notify(event: CrossTabSessionEvent): void {
  for (const listener of listeners) {
    listener(event);
  }
}

function parseStoredEvent(raw: string | null): CrossTabSessionEvent | null {
  if (raw == null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredEvent>;
    return isSessionEvent(parsed.type) ? parsed.type : null;
  } catch {
    return null;
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY) {
    return;
  }
  const sessionEvent = parseStoredEvent(event.newValue);
  if (sessionEvent != null) {
    notify(sessionEvent);
  }
}

function ensureTransport(): void {
  if (typeof window === "undefined") {
    return;
  }
  if (supportsBroadcastChannel()) {
    channel ??= new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isSessionEvent(event.data)) {
        notify(event.data);
      }
    };
    return;
  }
  window.addEventListener("storage", onStorage);
}

function releaseTransport(): void {
  if (listeners.size > 0 || typeof window === "undefined") {
    return;
  }
  channel?.close();
  channel = null;
  window.removeEventListener("storage", onStorage);
}

export function publishSessionEvent(event: CrossTabSessionEvent): void {
  if (typeof window === "undefined") {
    return;
  }
  if (supportsBroadcastChannel()) {
    const publisher = new BroadcastChannel(CHANNEL_NAME);
    publisher.postMessage(event);
    publisher.close();
    return;
  }
  try {
    const stored: StoredEvent = { id: crypto.randomUUID(), type: event };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Cross-tab synchronization is best-effort. The HttpOnly refresh cookie
    // still restores a newly loaded tab when storage is unavailable.
  }
}

export function subscribeToSessionEvents(listener: Listener): () => void {
  listeners.add(listener);
  ensureTransport();
  return () => {
    listeners.delete(listener);
    releaseTransport();
  };
}
