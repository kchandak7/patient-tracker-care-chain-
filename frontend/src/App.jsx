import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import LoadingSpinner from "./components/LoadingSpinner";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";

import AdminLayout from "./admin/layout/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminDoctors from "./admin/pages/AdminDoctors";
import AdminNurses from "./admin/pages/AdminNurses";
import AdminPatients from "./admin/pages/AdminPatients";
import AdminBilling from "./admin/pages/AdminBilling";

import DoctorLayout from "./doctor/layout/DoctorLayout";
import DoctorDashboard from "./doctor/pages/DoctorDashboard";
import DoctorPatients from "./doctor/pages/DoctorPatients";
import DoctorTasks from "./doctor/pages/DoctorTasks";
import DoctorAppointments from "./doctor/pages/DoctorAppointments";

import NurseLayout from "./nurse/layout/NurseLayout";
import NurseDashboard from "./nurse/pages/NurseDashboard";
import NurseTasks from "./nurse/pages/NurseTasks";
import NursePatients from "./nurse/pages/NursePatients";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a2b4a",
            color: "#fff",
            fontSize: "13px",
            borderRadius: "8px",
            padding: "10px 16px",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : authUser.role === "ADMIN" ? (
              <Navigate to="/admin" />
            ) : authUser.role === "DOCTOR" ? (
              <Navigate to="/doctor" />
            ) : authUser.role === "NURSE" ? (
              <Navigate to="/nurse" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ADMIN (NESTED ROUTES) */}
        <Route
          path="/admin"
          element={
            authUser?.role === "ADMIN" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="nurses" element={<AdminNurses />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>

        {/* DOCTOR (NESTED ROUTES) */}
        <Route
          path="/doctor"
          element={
            authUser?.role === "DOCTOR" ? (
              <DoctorLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="tasks" element={<DoctorTasks />} />
          <Route path="appointments" element={<DoctorAppointments />} />
        </Route>

        {/* NURSE (NESTED ROUTES) */}
        <Route
          path="/nurse"
          element={
            authUser?.role === "NURSE" ? (
              <NurseLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<NurseDashboard />} />
          <Route path="tasks" element={<NurseTasks />} />
          <Route path="patients" element={<NursePatients />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;