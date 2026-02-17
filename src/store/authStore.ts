import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  login: (accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("accessToken"),

  login: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ accessToken });
  },

  setAccessToken: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ accessToken });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ accessToken: null });
  },
}));
