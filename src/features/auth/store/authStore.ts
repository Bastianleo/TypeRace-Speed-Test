"use client";
import { create } from "zustand";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  country: string;
  level: number;
  xp: number;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isModalOpen: boolean;
  // Actions
  openModal: () => void;
  closeModal: () => void;
  checkSession: () => Promise<void>;
  login: (username: string, email: string, country: string, password?: string, action?: "login" | "register") => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isModalOpen: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user ?? null });
      }
    } catch (_) {
      // ignore network errors
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, email, country, password, action = "login") => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, country, password, action }),
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data.user, isModalOpen: false });
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login gagal" };
      }
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, error: "Terjadi kesalahan koneksi" };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
