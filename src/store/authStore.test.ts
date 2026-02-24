import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadAuthStore() {
  const module = await import("./authStore");
  return module.useAuthStore;
}

describe("authStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("initializes with no access token and auth not ready", async () => {
    const useAuthStore = await loadAuthStore();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthReady).toBe(false);
  });

  it("login stores token in memory and marks auth ready", async () => {
    const useAuthStore = await loadAuthStore();

    useAuthStore.getState().login("next-token");

    expect(useAuthStore.getState().accessToken).toBe("next-token");
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });

  it("setAccessToken updates token and marks auth ready", async () => {
    const useAuthStore = await loadAuthStore();

    useAuthStore.getState().setAccessToken("refreshed-token");

    expect(useAuthStore.getState().accessToken).toBe("refreshed-token");
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });

  it("setAuthReady updates readiness flag", async () => {
    const useAuthStore = await loadAuthStore();

    useAuthStore.getState().setAuthReady(true);
    expect(useAuthStore.getState().isAuthReady).toBe(true);

    useAuthStore.getState().setAuthReady(false);
    expect(useAuthStore.getState().isAuthReady).toBe(false);
  });

  it("logout clears token and keeps auth marked ready", async () => {
    const useAuthStore = await loadAuthStore();
    useAuthStore.getState().setAccessToken("active-token");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthReady).toBe(true);
  });
});
