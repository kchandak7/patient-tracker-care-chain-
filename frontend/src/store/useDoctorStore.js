import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

export const useDoctorStore = create((set, get) => ({
  /* ── Patients ── */
  patients: [],
  isLoadingPatients: false,

  /* ── Tasks ── */
  tasks: [],
  isLoadingTasks: false,

  /* ── Appointments (today) ── */
  appointments: [],
  isLoadingAppointments: false,

  /* ── Nurses (for task assignment) ── */
  nurses: [],
  isLoadingNurses: false,

  error: null,

  // ── Fetch my patients ──
  fetchPatients: async () => {
    set({ isLoadingPatients: true, error: null });
    try {
      const res = await axios.get(`${API}/doctor/patients`);
      set({ patients: res.data, isLoadingPatients: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch patients",
        isLoadingPatients: false,
      });
    }
  },

  // ── Fetch single patient ──
  fetchPatientById: async (id) => {
    const res = await axios.get(`${API}/doctor/patients/${id}`);
    return res.data;
  },

  // ── Fetch today's appointments ──
  fetchAppointments: async () => {
    set({ isLoadingAppointments: true, error: null });
    try {
      const res = await axios.get(`${API}/doctor/appointments`);
      set({ appointments: res.data, isLoadingAppointments: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch appointments",
        isLoadingAppointments: false,
      });
    }
  },

  // ── Fetch all tasks ──
  fetchTasks: async () => {
    set({ isLoadingTasks: true, error: null });
    try {
      const res = await axios.get(`${API}/doctor/tasks`);
      set({ tasks: res.data, isLoadingTasks: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch tasks",
        isLoadingTasks: false,
      });
    }
  },

  // ── Fetch tasks for a specific patient ──
  fetchPatientTasks: async (patientId) => {
    const res = await axios.get(`${API}/doctor/patients/${patientId}/tasks`);
    return res.data;
  },

  // ── Create a task ──
  createTask: async (payload) => {
    const res = await axios.post(`${API}/doctor/tasks`, payload);
    // Refresh tasks list
    get().fetchTasks();
    return res.data;
  },

  // ── Get prescription ──
  fetchPrescription: async (patientId) => {
    const res = await axios.get(
      `${API}/doctor/patients/${patientId}/prescription`
    );
    return res.data;
  },

  // ── Update patient diagnosis ──
  updateDiagnosis: async (patientId, diagnosis) => {
    const res = await axios.put(`${API}/doctor/patients/${patientId}/diagnosis`, { diagnosis });
    // Update local patients list
    set((state) => ({
      patients: state.patients.map((p) =>
        p._id === patientId ? { ...p, diagnosis } : p
      ),
    }));
    return res.data;
  },

  // ── Fetch my nurses (for task assignment dropdown) ──
  fetchNurses: async () => {
    set({ isLoadingNurses: true });
    try {
      const res = await axios.get(`${API}/doctor/nurses`);
      set({ nurses: res.data, isLoadingNurses: false });
    } catch {
      set({ nurses: [], isLoadingNurses: false });
    }
  },
}));
