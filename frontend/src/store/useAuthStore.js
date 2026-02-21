import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE = "http://localhost:3000/api"; 

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      set({ authUser: res.data, isCheckingAuth: false });
    } catch (err) {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  login: async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });

    set({ authUser: res.data });
  },

  logout: async () => {
    await axios.post(`${API_BASE}/auth/logout`);
    set({ authUser: null });
  },
}));