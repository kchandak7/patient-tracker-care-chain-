import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route
        path="/login"
        element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />}
      />

      {/* Placeholder dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          authUser ? (
            <div className="p-6 text-lg">
              Logged in as <b>{authUser.role}</b>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;