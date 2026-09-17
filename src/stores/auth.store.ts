import { create } from "zustand";
import { storage } from "@/lib/storage";
import type { User } from "@/api/types/auth.types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token: string, user: User) => {
    await storage.setItem("token", token);
    await storage.setItem("user", JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updatedUser: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...updatedUser };
    storage.setItem("user", JSON.stringify(merged));
    set({ user: merged });
  },

  logout: async () => {
    await storage.removeItem("token");
    await storage.removeItem("user");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    try {
      const token = await storage.getItem("token");
      const userStr = await storage.getItem("user");
      let user: User | null = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch {
          user = null;
        }
      }

      if (token && user) {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Granular selectors to minimize re-renders
export const selectToken = (state: AuthState) => state.token;
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuth = (state: AuthState) => state.isAuthenticated;
export const selectAuthLoading = (state: AuthState) => state.isLoading;
