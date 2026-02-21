import { create } from "zustand";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

export const useAdminStore = create((set, get) => ({
  /* ── Doctors ─────────────────────────────────────────── */
  doctors: [],
  isLoadingDoctors: false,

  /* ── Nurses ──────────────────────────────────────────── */
  nurses: [],
  isLoadingNurses: false,

  /* ── Patients ────────────────────────────────────────── */
  patients: [],
  isLoadingPatients: false,

  error: null,

  // ── Fetch Doctors ──
  fetchDoctors: async () => {
    set({ isLoadingDoctors: true, error: null });
    try {
      const res = await axios.get(`${API}/admin/getAllDoctors`);
      set({ doctors: res.data, isLoadingDoctors: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch doctors",
        isLoadingDoctors: false,
      });
    }
  },

  createDoctor: async (payload) => {
    const res = await axios.post(`${API}/admin/createDoctor`, payload);
    return res.data; // { user, doctor, credentials }
  },

  deleteDoctor: async (userId, reassignTo) => {
    await axios.delete(`${API}/admin/deleteDoctor/${userId}`, {
      data: reassignTo ? { reassignTo } : {},
    });
    set({ doctors: get().doctors.filter((d) => d.userId?._id !== userId) });
  },

  // ── Fetch Nurses ──
  fetchNurses: async () => {
    set({ isLoadingNurses: true, error: null });
    try {
      const res = await axios.get(`${API}/admin/getAllNurses`);
      set({ nurses: res.data, isLoadingNurses: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch nurses",
        isLoadingNurses: false,
      });
    }
  },

  createNurse: async (payload) => {
    const res = await axios.post(`${API}/admin/createNurse`, payload);
    return res.data;
  },

  deleteNurse: async (userId) => {
    await axios.delete(`${API}/admin/deleteNurse/${userId}`);
    set({ nurses: get().nurses.filter((n) => n.userId?._id !== userId) });
  },

  // ── Fetch Patients ──
  fetchPatients: async () => {
    set({ isLoadingPatients: true, error: null });
    try {
      const res = await axios.get(`${API}/admin/getAllPatients`);
      set({ patients: res.data, isLoadingPatients: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch patients",
        isLoadingPatients: false,
      });
    }
  },

  createPatient: async (payload) => {
    const res = await axios.post(`${API}/admin/createPatient`, payload);
    return res.data;
  },

  deletePatient: async (id) => {
    await axios.delete(`${API}/admin/deletePatient/${id}`);
    set({ patients: get().patients.filter((p) => p._id !== id) });
  },
}));