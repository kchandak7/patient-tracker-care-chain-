import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

export const useNurseStore = create((set, get) => ({
  /* ── Profile ── */
  profile: null,
  isLoadingProfile: false,

  /* ── Tasks ── */
  tasks: [],
  isLoadingTasks: false,

  /* ── Patients ── */
  patients: [],
  isLoadingPatients: false,

  error: null,

  // ── Fetch nurse profile (includes doctor info) ──
  fetchProfile: async () => {
    set({ isLoadingProfile: true });
    try {
      const res = await axios.get(`${API}/nurse/profile`);
      set({ profile: res.data, isLoadingProfile: false });
    } catch (err) {
      set({ profile: null, isLoadingProfile: false });
    }
  },

  // ── Fetch all tasks assigned to nurse ──
  fetchTasks: async () => {
    set({ isLoadingTasks: true, error: null });
    try {
      const res = await axios.get(`${API}/nurse/tasks`);
      set({ tasks: res.data, isLoadingTasks: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch tasks",
        isLoadingTasks: false,
      });
    }
  },

  // ── Fetch patients (derived from tasks) ──
  fetchPatients: async () => {
    set({ isLoadingPatients: true, error: null });
    try {
      const res = await axios.get(`${API}/nurse/patients`);
      set({ patients: res.data, isLoadingPatients: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch patients",
        isLoadingPatients: false,
      });
    }
  },

  // ── Fetch tasks for specific patient ──
  fetchPatientTasks: async (patientId) => {
    const res = await axios.get(`${API}/nurse/patients/${patientId}/tasks`);
    return res.data;
  },

  // ── Update task (status, resultValue, image) ──
  updateTask: async (taskId, payload) => {
    const res = await axios.post(`${API}/nurse/tasks/${taskId}`, payload);
    // Update local task list
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, ...res.data } : t
      ),
    }));
    return res.data;
  },

  // ── Toggle patient flag (urgent) ──
  togglePatientFlag: async (patientId) => {
    const res = await axios.put(`${API}/nurse/patients/${patientId}/flag`);
    set((state) => ({
      patients: state.patients.map((p) =>
        p._id === patientId ? { ...p, flagged: res.data.flagged } : p
      ),
    }));
    return res.data;
  },
}));
