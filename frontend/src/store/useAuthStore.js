import { create } from "zustand";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  loginError: null,

  // 🔹 LOGIN
  login: async (email, password) => {
    set({ isLoggingIn: true, loginError: null });
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      set({ authUser: res.data, isLoggingIn: false });
    } catch (err) {
      set({
        isLoggingIn: false,
        loginError: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  },

  // 🔹 CHECK AUTH (THIS FIXES REFRESH)
  checkAuth: async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      set({ authUser: res.data, isCheckingAuth: false });
    } catch {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  // 🔹 LOGOUT (safe even if API fails)
  logout: async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      set({ authUser: null });
    }
  },
}));