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
      </Route>
    </Routes>
    </>
  );
}

export default App;