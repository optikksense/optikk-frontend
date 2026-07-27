// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  type CrossTabSessionEvent,
  publishSessionEvent,
  subscribeToSessionEvents,
} from "./sessionEvents";

class FakeBroadcastChannel {
  static readonly instances = new Set<FakeBroadcastChannel>();

  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;

  constructor(readonly name: string) {
    FakeBroadcastChannel.instances.add(this);
  }

  postMessage(data: CrossTabSessionEvent): void {
    for (const channel of FakeBroadcastChannel.instances) {
      if (channel !== this && channel.name === this.name) {
        channel.onmessage?.(new MessageEvent("message", { data }));
      }
    }
  }

  close(): void {
    FakeBroadcastChannel.instances.delete(this);
  }
}

beforeEach(() => {
  FakeBroadcastChannel.instances.clear();
  vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cross-tab session events", () => {
  it("delivers a sign-in event to another tab subscriber", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionEvents(listener);

    publishSessionEvent("signed-in");

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith("signed-in");
    unsubscribe();
  });

  it("stops delivery after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionEvents(listener);
    unsubscribe();

    publishSessionEvent("signed-out");

    expect(listener).not.toHaveBeenCalled();
  });
});
