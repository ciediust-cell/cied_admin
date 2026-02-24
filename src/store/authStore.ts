import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthReady: boolean;
  login: (accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setAuthReady: (isReady?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthReady: false,

  login: (accessToken) => {
    set({ accessToken, isAuthReady: true });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken, isAuthReady: true });
  },

  setAuthReady: (isReady = true) => {
    set({ isAuthReady: isReady });
  },

  logout: () => {
    set({ accessToken: null, isAuthReady: true });
  },
}));
