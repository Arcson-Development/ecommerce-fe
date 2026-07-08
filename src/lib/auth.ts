import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";

export interface User {
  id: string;
  username: string;
  email: string | null;
  phone: string;
  role: "BUYER" | "MITRA" | "ADMIN";
  nickname: string | null;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { loginKey: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (credentials) => {
        const res = await api.post("/auth/login", {
          username: credentials.loginKey,
          password: credentials.password,
        });
        set({ token: res.access_token, user: res.user, isAuthenticated: true });
      },
      register: async (data) => {
        const res = await api.post("/auth/register", data);
        set({ token: res.access_token, user: res.user, isAuthenticated: true });
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      fetchProfile: async () => {
        if (!get().token) return;
        try {
          const user = await api.get("/users/profile");
          set({ user });
        } catch (e) {
          get().logout();
        }
      },
    }),
    {
      name: "pasarjaya-auth",
    }
  )
);
