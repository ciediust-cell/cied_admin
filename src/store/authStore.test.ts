import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockStorage {
  clear: () => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
}

function installMockLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));

  const mockStorage: MockStorage = {
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: mockStorage,
    configurable: true,
  });
}

async function loadAuthStore() {
  const module = await import("./authStore");
  return module.useAuthStore;
}

describe("authStore", () => {
  beforeEach(() => {
    vi.resetModules();
    installMockLocalStorage();
  });

  it("hydrates access token from localStorage", async () => {
    installMockLocalStorage({ accessToken: "seed-token" });
    vi.resetModules();

    const useAuthStore = await loadAuthStore();

    expect(useAuthStore.getState().accessToken).toBe("seed-token");
  });

  it("login persists access token in state and localStorage", async () => {
    const useAuthStore = await loadAuthStore();

    useAuthStore.getState().login("next-token");

    expect(useAuthStore.getState().accessToken).toBe("next-token");
    expect(globalThis.localStorage.getItem("accessToken")).toBe("next-token");
  });

  it("setAccessToken updates existing token", async () => {
    const useAuthStore = await loadAuthStore();

    useAuthStore.getState().setAccessToken("refreshed-token");

    expect(useAuthStore.getState().accessToken).toBe("refreshed-token");
    expect(globalThis.localStorage.getItem("accessToken")).toBe(
      "refreshed-token",
    );
  });

  it("logout clears access token from state and localStorage", async () => {
    const useAuthStore = await loadAuthStore();
    useAuthStore.getState().login("active-token");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(globalThis.localStorage.getItem("accessToken")).toBeNull();
  });
});
